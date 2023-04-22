// https://pietrzakadrian.com/blog/virtual-column-solutions-for-typeorm
import * as lodash from 'lodash'
import { BaseEntity, OptimisticLockCanNotBeUsedError, OptimisticLockVersionMismatchError, SelectQueryBuilder } from 'typeorm'
import { JoinAttribute } from 'typeorm/query-builder/JoinAttribute'
import { JOIN_CONDITION, TJoinConditionParams, TVirtualSelectAndMapColumnParams, VIRTUAL_SELECT_AND_MAP_COLUMN } from './Decorators'
declare module 'typeorm' {
  interface SelectQueryBuilder<Entity> {
    getMany(this: SelectQueryBuilder<Entity>): Promise<Entity[]>
    getOne(this: SelectQueryBuilder<Entity>): Promise<Entity | null>
    getManyAndCount(this: SelectQueryBuilder<Entity>): Promise<[Entity[], number]>
  }
}

const mapValuesToVirtualColumns = (entity: Object, aliasTree: Object, rawValues: Object, relationPath = []) => {
  if (entity instanceof BaseEntity) {
    const metaInfo = Reflect.getMetadata(VIRTUAL_SELECT_AND_MAP_COLUMN, entity) ?? {}
    const entityAlias = lodash.get(aliasTree, [...relationPath, '_alias'])
    for (const [propertyKey, params] of Object.entries<TVirtualSelectAndMapColumnParams>(metaInfo)) {
      let targetValue = lodash.get(rawValues, entityAlias + '_' + propertyKey)
      if (targetValue) {
        if (typeof params.transformValue === 'function') {
          targetValue = params.transformValue(targetValue)
        }
        entity[propertyKey] = targetValue
      }
    }
  }
  for (const [key, value] of Object.entries(entity)) {
    if (Array.isArray(value)) {
      value.forEach((e) => {
        if (e instanceof BaseEntity) {
          mapValuesToVirtualColumns(value, aliasTree, rawValues, [...relationPath, key])
        }
      })
    } else {
      if (value instanceof BaseEntity) {
        mapValuesToVirtualColumns(value, aliasTree, rawValues, [...relationPath, key])
      }
    }
  }
}

SelectQueryBuilder.prototype.getMany = async function () {
  if (this.expressionMap.lockMode === 'optimistic') {
    throw new OptimisticLockCanNotBeUsedError()
  }

  // @JoinCondition()
  for (const joinAttribute of this.expressionMap.joinAttributes as JoinAttribute[]) {
    const FromEntity = joinAttribute.relation?.entityMetadata?.target as typeof Function
    const ToEntity = joinAttribute.relation?.inverseEntityMetadata?.target as typeof Function
    if (typeof FromEntity === 'function' && typeof ToEntity === 'function' && joinAttribute.alias.type === 'join') {
      const fromEntityJoinConditionMetaData = Reflect.getMetadata(JOIN_CONDITION, new FromEntity()) ?? {}
      if (typeof joinAttribute.entityOrProperty === 'string' && typeof joinAttribute.alias.name === 'string') {
        for (const [columnName, metaData] of Object.entries<TJoinConditionParams>(fromEntityJoinConditionMetaData)) {
          if (metaData.fromEntity === FromEntity.name && metaData.toEntity === ToEntity.name) {
            const condition = metaData.generateConditionFn({ fromEntityAlias: joinAttribute.entityOrProperty as string, toEntityAlias: joinAttribute.alias.name })
            joinAttribute.condition = condition
          }
        }
      }
    }
  }

  const { entities, raw } = await this.getRawAndEntities()
  // @VirtualSelectAndMapColumn()
  const items = entities.map((entity: Object, index: number) => {
    const item = raw[index]
    mapValuesToVirtualColumns(entity, lodash.cloneDeep(this.aliasTree), item)
    return entity
  })

  return [...items]
}

SelectQueryBuilder.prototype.getOne = async function () {
  // @JoinCondition()
  for (const joinAttribute of this.expressionMap.joinAttributes as JoinAttribute[]) {
    const FromEntity = joinAttribute.relation?.entityMetadata?.target as typeof Function
    const ToEntity = joinAttribute.relation?.inverseEntityMetadata?.target as typeof Function
    if (typeof FromEntity === 'function' && typeof ToEntity === 'function' && joinAttribute.alias.type === 'join') {
      const fromEntityJoinConditionMetaData = Reflect.getMetadata(JOIN_CONDITION, new FromEntity()) ?? {}
      if (typeof joinAttribute.entityOrProperty === 'string' && typeof joinAttribute.alias.name === 'string') {
        for (const [columnName, metaData] of Object.entries<TJoinConditionParams>(fromEntityJoinConditionMetaData)) {
          if (metaData.fromEntity === FromEntity.name && metaData.toEntity === ToEntity.name) {
            const condition = metaData.generateConditionFn({ fromEntityAlias: joinAttribute.entityOrProperty as string, toEntityAlias: joinAttribute.alias.name })
            joinAttribute.condition = condition
          }
        }
      }
    }
  }

  const { entities, raw } = await this.getRawAndEntities()

  if (entities[0] && this.expressionMap.lockMode === 'optimistic' && this.expressionMap.lockVersion) {
    const metadata = this.expressionMap.mainAlias!.metadata

    if (this.expressionMap.lockVersion instanceof Date) {
      const actualVersion = metadata.updateDateColumn!.getEntityValue(entities[0]) // what if columns arent set?
      if (actualVersion.getTime() !== this.expressionMap.lockVersion.getTime())
        throw new OptimisticLockVersionMismatchError(metadata.name, this.expressionMap.lockVersion, actualVersion)
    } else {
      const actualVersion = metadata.versionColumn!.getEntityValue(entities[0]) // what if columns arent set?
      if (actualVersion !== this.expressionMap.lockVersion) throw new OptimisticLockVersionMismatchError(metadata.name, this.expressionMap.lockVersion, actualVersion)
    }
  }

  if (entities[0] === undefined) {
    return null
  }

  mapValuesToVirtualColumns(entities[0], lodash.cloneDeep(this.aliasTree), raw[0])

  return entities[0]
}

SelectQueryBuilder.prototype.getManyAndCount = async function () {
  if (this.expressionMap.lockMode === 'optimistic') {
    throw new OptimisticLockCanNotBeUsedError()
  }

  const queryRunner = this.obtainQueryRunner()
  let transactionStartedByUs: boolean = false
  try {
    // start transaction if it was enabled
    if (this.expressionMap.useTransaction === true && queryRunner.isTransactionActive === false) {
      await queryRunner.startTransaction()
      transactionStartedByUs = true
    }

    this.expressionMap.queryEntity = true
    const { entities, raw } = await this.executeEntitiesAndRawResults(queryRunner)
    this.expressionMap.queryEntity = false
    const cacheId = this.expressionMap.cacheId
    // Creates a new cacheId for the count query, or it will retreive the above query results
    // and count will return 0.
    this.expressionMap.cacheId = cacheId ? `${cacheId}-count` : cacheId
    const count = await this.executeCountQuery(queryRunner)

    const items = entities.map((entity, index) => {
      const item = raw[index]
      mapValuesToVirtualColumns(entity, lodash.cloneDeep(this.aliasTree), item)
      return entity
    })

    const results: [any[], number] = [items, count]

    // close transaction if we started it
    if (transactionStartedByUs) {
      await queryRunner.commitTransaction()
    }

    return results
  } catch (error) {
    // rollback transaction if we started it
    if (transactionStartedByUs) {
      try {
        await queryRunner.rollbackTransaction()
      } catch (rollbackError) {}
    }
    throw error
  } finally {
    if (queryRunner !== this.queryRunner)
      // means we created our own query runner
      await queryRunner.release()
  }
}
