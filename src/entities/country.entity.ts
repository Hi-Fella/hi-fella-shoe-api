import {
  Entity,
  Column,
  UpdateDateColumn,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { Province } from './province.entity';

@Entity('hf_country')
export class Country {
  @PrimaryColumn({ type: 'bigint' })
  id_country: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name_country: string;

  @Column({ type: 'varchar', length: 5, nullable: true })
  country_code: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone_code: string;

  @Column({ type: 'boolean', default: true, nullable: true })
  status: boolean;

  @Column({ type: 'varchar', nullable: true })
  flag: string;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  @OneToMany(() => Province, (province) => province.country)
  provinces: Province[];
}
