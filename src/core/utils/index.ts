import { every, has, partial } from 'lodash'
import { ColumnType, SelectQueryBuilder } from 'typeorm'

/* istanbul ignore next */
export function debug_IsShowDBConnectionServiceLogs() {
  return process.env.DEBUG__IS_SHOW_DB_CONNECTION_SERVICE_LOGS
}

/* istanbul ignore next */
export function debug_IsShowAuthServiceLogs() {
  return process.env.DEBUG__IS_SHOW_AUTH_SERVICE_LOGS
}

export function hasAllKeys(obj: object, keys: string[]) {
  return every(keys, partial(has, obj))
}

export function filterAllRequiredKeysInObject(obj: object, keys: string[]): { existingKeys: string[]; missingKeys: string[] } {
  const existingKeys = []
  const missingKeys = []
  for (const requiredKey of keys) {
    if (Object.keys(obj ?? {}).includes(requiredKey)) {
      existingKeys.push(requiredKey)
    } else {
      missingKeys.push(requiredKey)
    }
  }
  return { existingKeys, missingKeys }
}

/* istanbul ignore next */
export function getColumnType(initialType: ColumnType): ColumnType {
  if (process.env.IS_TESTING === 'true') {
    switch (initialType) {
      case 'char': {
        return 'varchar'
      }
      case 'timestamp': {
        return 'datetime'
      }
    }
  }
  return initialType
}

export function customWhereFullName(queryBuilder: SelectQueryBuilder<any>, entityAlias: string, whereValue: string) {
  /* istanbul ignore else */
  if (process.env.IS_TESTING === 'true') {
    // Testing
    const fullName_firstNameLastName: string = `(${entityAlias}.FirstName || ' ' || ${entityAlias}.LastName)`
    const fullName_lastNameFirstName: string = `(${entityAlias}.LastName || ' ' || ${entityAlias}.FirstName)`
    const query = `( (${fullName_firstNameLastName} LIKE '%${whereValue}%') OR (${fullName_lastNameFirstName} LIKE '%${whereValue}%') )`
    queryBuilder.andWhere(query)
  } else {
    const fullName_firstNameLastName: string = `CONCAT(${entityAlias}.FirstName, ' ', ${entityAlias}.LastName)`
    const fullName_lastNameFirstName: string = `CONCAT(${entityAlias}.LastName, ' ', ${entityAlias}.FirstName)`
    const query = `( (${fullName_firstNameLastName} LIKE '%${whereValue}%') OR (${fullName_lastNameFirstName} LIKE '%${whereValue}%') )`
    queryBuilder.andWhere(query)
  }
}

export function generateResourceName(name: string) {
  return `${process.env.SERVICE}-${process.env.STAGE}-${name}`
}

export function generateServerlessResourceName(name: string) {
  return '${self:service}-${self:provider.stage}-' + name
}
