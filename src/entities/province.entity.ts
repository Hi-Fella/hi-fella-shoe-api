import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Country } from './country.entity';
import { City } from './city.entity';

@Entity('hf_province')
export class Province {
  @PrimaryGeneratedColumn({ type: 'int4' })
  id_province: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name_province: string;

  @ManyToOne(() => Country, (country) => country.provinces)
  @JoinColumn({ name: 'country_id' })
  country: Country;

  @Column({ type: 'int', nullable: true })
  country_id: number;

  @Column({ type: 'varchar', length: 30, nullable: true })
  nama_provinsi: string;

  @Column({ type: 'boolean', nullable: true })
  status: boolean;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updated_at: Date;

  @OneToMany(() => City, (city) => city.province)
  cities: City[];
}
