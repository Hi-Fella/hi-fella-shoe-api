import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Province } from './province.entity';
import { User } from './user.entity';

@Entity('hf_city')
export class City {
  @PrimaryGeneratedColumn({ type: 'int4' })
  id_city: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name_city: string;

  @ManyToOne(() => Province, (province) => province.cities)
  @JoinColumn({ name: 'province_id' })
  province: Province;

  @Column({ type: 'int', nullable: true })
  province_id: number;

  @Column({ type: 'boolean', default: true, nullable: true })
  status: boolean;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updated_at: Date;

  @OneToMany(() => User, (user) => user.city)
  users: User[];
}
