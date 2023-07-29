import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import * as dynamoose from 'dynamoose'
import { Item } from 'dynamoose/dist/Item'
import * as lodash from 'lodash'
import { MEArrayElement } from '~core/types/helper'
import { generateResourceName, generateServerlessResourceName } from '~core/utils'
import * as Types from './types'

export class MEDynamoDBTable<TableInterface, EnumIndexes = any> {
  constructor(
    private props: {
      identifier: string
      schema: {
        definition: Types.MESchemaDefinition
        settings?: Types.MESchemaSettings
      }
      billing?: Types.IBillingPayPerRequests | Types.IBillingProvisioned
      stream?: Types.IStreamSpecification
      localSecondaryIndexes?: Types.ISecondaryIndex<TableInterface, EnumIndexes>[]
      globalSecondaryIndexes?: Types.ISecondaryIndex<TableInterface, EnumIndexes>[]
      middlewares?: Types.IMiddlewares<TableInterface & Item>
    },
  ) {}

  public get model() {
    const _model = dynamoose.model<TableInterface & Item>(this.name, this.dynamooseSchema)

    // Before and After save()
    const originalSave = _model.prototype.save
    const { beforeSave, afterSave } = this.props.middlewares ?? {}
    _model.prototype.save = async function () {
      if (typeof beforeSave === 'function') {
        await beforeSave(this)
      }
      await originalSave.call(this)
      if (typeof afterSave === 'function') {
        await afterSave(this)
      }
    }
    return _model
  }

  public get name() {
    return generateResourceName(this.props.identifier)
  }

  private get dynamooseSchema() {
    const { schema, localSecondaryIndexes, globalSecondaryIndexes } = this.props
    const schemaDefinition = lodash.cloneDeep(schema.definition)

    if (Array.isArray(localSecondaryIndexes) && localSecondaryIndexes.length > 0) {
      for (const lsi of localSecondaryIndexes) {
        for (const keySchema of lsi.keySchema) {
          if (keySchema.keyType === 'RANGE') {
            const indexDefinition: Types.MEIndexDefinition = {
              name: String(lsi.indexName),
              type: 'local',
              rangeKey: String(keySchema.attributeName),
            }
            schemaDefinition[keySchema.attributeName]['index'] = indexDefinition
          }
        }
      }
    }
    if (Array.isArray(globalSecondaryIndexes) && globalSecondaryIndexes.length > 0) {
      for (const gsi of globalSecondaryIndexes) {
        for (const keySchema of gsi.keySchema) {
          if (keySchema.keyType === 'RANGE') {
            const indexDefinition: Types.MEIndexDefinition = {
              name: String(gsi.indexName),
              type: 'global',
            }
            schemaDefinition[keySchema.attributeName]['index'] = indexDefinition
          }
        }
      }
    }
    return new dynamoose.Schema(schemaDefinition, schema.settings)
  }

  public get serverlessResourceInfo() {
    const hashKey = this.dynamooseSchema.hashKey // PartitionKey
    const rangeKey = this.dynamooseSchema.rangeKey // SortKey
    const attributeDefinitions: DynamoDB.AttributeDefinition[] = []
    const keySchema: DynamoDB.KeySchemaElement[] = []
    const { billing, stream, localSecondaryIndexes, globalSecondaryIndexes } = this.props

    const insertToAttributeDefinitions = (newDef: MEArrayElement<typeof attributeDefinitions>) => {
      if (attributeDefinitions.findIndex((def) => def.AttributeName === newDef.AttributeName) === -1) {
        attributeDefinitions.push(newDef)
      }
    }

    const insertToKeySchema = (newKeySchema: MEArrayElement<typeof keySchema>) => {
      if (keySchema.findIndex((keySchema) => keySchema.AttributeName === newKeySchema.AttributeName) === -1) {
        keySchema.push(newKeySchema)
      }
    }

    if (hashKey) {
      insertToAttributeDefinitions({ AttributeName: hashKey, AttributeType: this.dynamooseSchema.getAttributeType(hashKey) as string })
      insertToKeySchema({ AttributeName: hashKey, KeyType: 'HASH' })
    }
    if (rangeKey) {
      insertToAttributeDefinitions({ AttributeName: rangeKey, AttributeType: this.dynamooseSchema.getAttributeType(rangeKey) as string })
      insertToKeySchema({ AttributeName: rangeKey, KeyType: 'RANGE' })
    }

    const resourceInfo = {
      Type: 'AWS::DynamoDB::Table',
      Properties: {
        TableName: generateServerlessResourceName(this.props.identifier),
        AttributeDefinitions: attributeDefinitions,
        KeySchema: keySchema,
      },
    }

    if (billing) {
      switch (billing.mode) {
        case 'PAY_PER_REQUEST': {
          resourceInfo.Properties['BillingMode'] = billing.mode
          break
        }
        case 'PROVISIONED': {
          resourceInfo.Properties['ProvisionedThroughput'] = {
            ReadCapacityUnits: billing.ReadCapacityUnits,
            WriteCapacityUnits: billing.WriteCapacityUnits,
          }
          break
        }
      }
    }

    if (stream) {
      resourceInfo.Properties['StreamSpecification'] = {
        StreamViewType: stream.streamViewType,
      }
    }

    const generateIndexInfo = (indexParams: Types.ISecondaryIndex<TableInterface, EnumIndexes>) => {
      const index = {
        IndexName: indexParams.indexName,
        KeySchema: indexParams.keySchema.map((schema) => ({
          AttributeName: schema.attributeName,
          KeyType: schema.keyType,
        })),
        Projection: {
          ProjectionType: indexParams.projection.projectionType,
        },
      }

      if (indexParams.projection.projectionType === 'INCLUDE') {
        index.Projection['NonKeyAttributes'] = indexParams.projection.nonKeyAttributes ?? []
      }

      if (indexParams.billing) {
        switch (indexParams.billing.mode) {
          case 'PAY_PER_REQUEST': {
            index['BillingMode'] = indexParams.billing.mode
            break
          }
          case 'PROVISIONED': {
            index['ProvisionedThroughput'] = {
              ReadCapacityUnits: indexParams.billing.ReadCapacityUnits,
              WriteCapacityUnits: indexParams.billing.WriteCapacityUnits,
            }
            break
          }
        }
      }
      return index
    }

    if (Array.isArray(localSecondaryIndexes) && localSecondaryIndexes.length > 0) {
      for (const lsi of localSecondaryIndexes) {
        for (const keySchema of lsi.keySchema) {
          insertToAttributeDefinitions({
            AttributeName: String(keySchema.attributeName),
            AttributeType: this.dynamooseSchema.getAttributeType(String(keySchema.attributeName)) as string,
          })
        }
      }

      resourceInfo.Properties['LocalSecondaryIndexes'] = localSecondaryIndexes.map((indexParams) => generateIndexInfo(indexParams))
    }

    if (Array.isArray(globalSecondaryIndexes) && globalSecondaryIndexes.length > 0) {
      for (const gsi of globalSecondaryIndexes) {
        for (const keySchema of gsi.keySchema) {
          insertToAttributeDefinitions({
            AttributeName: String(keySchema.attributeName),
            AttributeType: this.dynamooseSchema.getAttributeType(String(keySchema.attributeName)) as string,
          })
        }
      }

      resourceInfo.Properties['GlobalSecondaryIndexes'] = globalSecondaryIndexes.map((indexParams) => generateIndexInfo(indexParams))
    }

    return resourceInfo
  }
}
