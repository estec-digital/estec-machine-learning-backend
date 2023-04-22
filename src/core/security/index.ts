import * as lodash from 'lodash'
import { BaseEntity } from 'typeorm'
import { CONST_NO_PERMISSION } from '~shared/constants'

export function checkUserHasPermissionToGetEntity(params: { data: any; ownerKey: string | number; userId: string | number }) {
  if (params.data instanceof BaseEntity) {
    const entityOwnerId = String(lodash.get(params.data, params.ownerKey))
    const loggedInUserId = String(params.userId)

    const condition1 = entityOwnerId && loggedInUserId
    const condition2 = entityOwnerId === loggedInUserId

    if (!(condition1 && condition2)) {
      throw new Error(CONST_NO_PERMISSION)
    }
  } else if (Array.isArray(params.data)) {
    for (const _entity of params.data) {
      const entityOwnerId = String(lodash.get(_entity, params.ownerKey))
      const loggedInUserId = String(params.userId)

      const condition1 = entityOwnerId && loggedInUserId
      const condition2 = entityOwnerId === loggedInUserId

      if (!(condition1 && condition2)) {
        throw new Error(CONST_NO_PERMISSION)
      }
    }
  }
}
