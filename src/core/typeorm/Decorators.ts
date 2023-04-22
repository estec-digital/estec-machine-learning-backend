import 'reflect-metadata'

// @VirtualSelectAndMapColumn()
export const VIRTUAL_SELECT_AND_MAP_COLUMN = Symbol('VIRTUAL_SELECT_AND_MAP_COLUMN')
export type TVirtualSelectAndMapColumnParams = {
  transformValue?: (value: string) => any
}
export function VirtualSelectAndMapColumn(params: TVirtualSelectAndMapColumnParams = {}): PropertyDecorator {
  return (target, propertyKey) => {
    const metaInfo = Reflect.getMetadata(VIRTUAL_SELECT_AND_MAP_COLUMN, target) || {}
    metaInfo[propertyKey] = params
    Reflect.defineMetadata(VIRTUAL_SELECT_AND_MAP_COLUMN, metaInfo, target)
  }
}

// @JoinCondition()
export const JOIN_CONDITION = Symbol('JOIN_CONDITION')
export type TJoinConditionParams = {
  fromEntity: string
  toEntity: string
  generateConditionFn: (generateConditionFn: { fromEntityAlias: string; toEntityAlias: string }) => string
}
export function JoinCondition(params: TJoinConditionParams): PropertyDecorator {
  return (target, propertyKey) => {
    const metaInfo = Reflect.getMetadata(JOIN_CONDITION, target) || {}
    metaInfo[propertyKey] = params
    Reflect.defineMetadata(JOIN_CONDITION, metaInfo, target)
  }
}
