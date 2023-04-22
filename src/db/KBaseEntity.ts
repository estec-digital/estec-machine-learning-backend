import { BaseEntity, BeforeUpdate } from 'typeorm'

export class KBaseEntity extends BaseEntity {
  // @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  // createdAt: Date

  // @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  // updatedAt: Date

  @BeforeUpdate()
  updateUpdatedAt() {
    // this.updatedAt = undefined
  }
}
