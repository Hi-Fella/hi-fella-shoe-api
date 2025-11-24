import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { City } from './city.entity';
import { Country } from './country.entity';

@Entity('hf_province')
export class Province {
  @PrimaryColumn({
    type: 'int4',
    transformer: {
      to: (value: string) => (!!value ? parseInt(value) : value),
      from: (value: number) => (!!value ? value.toString() : value),
    },
  })
  id_province: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name_province: string;

  @ManyToOne(() => Country, (country) => country.provinces)
  @JoinColumn({ name: 'country_id' })
  country: Country;

  @Column({
    type: 'int',
    nullable: true,
    transformer: {
      to: (value: string) => (!!value ? parseInt(value) : value),
      from: (value: number) => (!!value ? value.toString() : value),
    },
  })
  country_id: string;

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
