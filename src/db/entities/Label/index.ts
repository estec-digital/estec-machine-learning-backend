import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { KBaseEntity } from '~db/KBaseEntity'

@Entity('label') // Table name
export class Label extends KBaseEntity {
  @PrimaryGeneratedColumn()
  id: string

  @Column({ type: 'text' })
  status: string

  @Column({ type: 'text' })
  description: string
}
