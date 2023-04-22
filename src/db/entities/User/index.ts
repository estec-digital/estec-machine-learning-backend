import { AfterLoad, Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { KBaseEntity } from '~db/KBaseEntity'

@Entity('user') // Table name
export class User extends KBaseEntity {
  @PrimaryGeneratedColumn()
  id: string

  @Column({ type: 'varchar', length: 64, unique: true })
  username: string

  @Column({ type: 'varchar', length: 64, select: false })
  password: string

  @Column({ type: 'varchar', length: 64, default: 'User-FirstName' })
  firstName: string

  @Column({ type: 'varchar', length: 64, default: 'User-LastName' })
  lastName: string

  @Column({ type: 'varchar', default: '' })
  email: string

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date

  // Virtual field
  public fullName: string

  // Listener
  @AfterLoad()
  afterLoad() {
    if (this.firstName && this.lastName) {
      this.fullName = this.firstName + ' ' + this.lastName
    }
  }
}
