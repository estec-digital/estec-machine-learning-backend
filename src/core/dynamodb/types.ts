import * as dynamoose from 'dynamoose'
import { IndexType } from 'dynamoose/dist/Schema'

export type MESchemaDefinition = ConstructorParameters<typeof dynamoose.Schema>[0]
export type MESchemaSettings = ConstructorParameters<typeof dynamoose.Schema>[1]
export type MEIndexDefinition = {
  /**
   * The name of the index.
   * @default `${attribute}${type == "global" ? "GlobalIndex" : "LocalIndex"}`
   */
  name?: string
  /**
   * If the index should be a global index or local index. Attribute will be the hashKey for the index.
   * @default "global"
   */
  type?: IndexType | keyof typeof IndexType
  /**
   * The range key attribute name for a global secondary index.
   */
  rangeKey?: string
  /**
   * Sets the attributes to be projected for the index. `true` projects all attributes, `false` projects only the key attributes, and an array of strings projects the attributes listed.
   * @default true
   */
  project?: boolean | string[]
  /**
   * Sets the throughput for the global secondary index.
   * @default undefined
   */
  throughput?:
    | 'ON_DEMAND'
    | number
    | {
        read: number
        write: number
      }
}

export interface IBillingPayPerRequests {
  mode: 'PAY_PER_REQUEST'
}

export interface IBillingProvisioned {
  mode: 'PROVISIONED'
  ReadCapacityUnits: number
  WriteCapacityUnits: number
}

export interface IStreamSpecification {
  streamViewType: 'NEW_IMAGE' | 'OLD_IMAGE' | 'NEW_AND_OLD_IMAGES' | 'KEYS_ONLY'
}

interface IIndexProjection__All<T> {
  projectionType: 'ALL'
}

interface IIndexProjection__KeysOnly<T> {
  projectionType: 'KEYS_ONLY'
}

interface IIndexProjection__Include<T> {
  projectionType: 'INCLUDE'
  nonKeyAttributes: (keyof T)[]
}

export interface ISecondaryIndex<TableInterface, EnumIndexes> {
  indexName: EnumIndexes
  keySchema: {
    attributeName: keyof TableInterface
    keyType: 'HASH' | 'RANGE'
  }[]
  projection: IIndexProjection__All<TableInterface> | IIndexProjection__KeysOnly<TableInterface> | IIndexProjection__Include<TableInterface>
  billing?: IBillingPayPerRequests | IBillingProvisioned
}

export interface IMiddlewares<T> {
  beforeSave?: (obj: T) => void | Promise<void>
  afterSave?: (obj: T) => void | Promise<void>
}
