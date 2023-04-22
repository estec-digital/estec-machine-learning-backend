import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { KBaseEntity } from '~db/KBaseEntity'
import { Label } from '../Label'

@Entity('data') // Table name
export class Data extends KBaseEntity {
  @PrimaryGeneratedColumn()
  id: string

  @Column({ type: 'timestamp', unique: true })
  datetime: Date

  @Column({ type: 'double' })
  pyrometer: number

  @Column({ type: 'double' })
  nOx_GA01: number

  @Column({ type: 'double' })
  oxi_GA01: number

  @Column({ type: 'double' })
  kiln_inlet_temp: number

  // Foreign keys
  @Column({ type: 'int' })
  labelId: number

  // Expand field
  @ManyToOne(() => Label)
  @JoinColumn({ name: 'labelId' })
  Label: Label
}
