import {
  Entity,
  Column,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { Province } from './province.entity';
import { User } from './user.entity';

@Entity('hf_city')
export class City {
  @PrimaryColumn({
    type: 'int4',
    transformer: {
      to: (value: string) => (!!value ? parseInt(value) : value),
      from: (value: number) => (!!value ? value.toString() : value),
    },
  })
  id_city: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name_city: string;

  @ManyToOne(() => Province, (province) => province.cities)
  @JoinColumn({ name: 'province_id' })
  province: Province;

  @Column({
    type: 'int',
    nullable: true,
    transformer: {
      to: (value: string) => (!!value ? parseInt(value) : value),
      from: (value: number) => (!!value ? value.toString() : value),
    },
  })
  province_id: string;

  @Column({ type: 'boolean', default: true, nullable: true })
  status: boolean;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updated_at: Date;

  @OneToMany(() => User, (user) => user.city)
  users: User[];
}
