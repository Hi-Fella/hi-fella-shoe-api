import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { City } from './city.entity';
import { UserLoginHistory } from './user-login-history.entity';

@Entity('hf_users')
export class User {
  @PrimaryColumn({ type: 'bigint', default: () => 'id_generator()' })
  id_user: string;

  @Column({ type: 'varchar', length: 80, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  password: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  name: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  phone_code: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  gender: string;

  @Column({ type: 'timestamp', nullable: true })
  birthdate: Date;

  @ManyToOne(() => City, (city) => city.users)
  @JoinColumn({ name: 'city_id' })
  city: City;

  @Column({
    type: 'int4',
    nullable: true,
    transformer: {
      to: (value: string) => (!!value ? parseInt(value) : value),
      from: (value: number) => (!!value ? value.toString() : value),
    },
  })
  city_id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  profile_image: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  banner_image: string;

  @Column({ type: 'boolean', default: true, nullable: true })
  account_status: boolean;

  @Column({ type: 'varchar', length: 80, nullable: true })
  token_socket: string;

  @Column({ type: 'varchar', length: 80, nullable: true })
  token_bearer: string;

  @Column({ type: 'timestamp', precision: 0, nullable: true })
  last_login: Date;

  @Column({ type: 'timestamp', precision: 0, nullable: true })
  email_verified_at: Date;

  @Column({ type: 'int', nullable: true })
  registration_step: number;

  @Column({ type: 'varchar', nullable: true })
  registration_type: 'manual' | 'google';

  @Column({ type: 'timestamp', nullable: true })
  finish_registration_at: Date;

  @Column({ type: 'text', nullable: true })
  about: string;

  @Column({ type: 'varchar', nullable: true })
  google_id: string;

  @Column({ type: 'varchar', nullable: true })
  utm_id: string;

  @Column({ type: 'varchar', nullable: true })
  utm_source: string;

  @Column({ type: 'varchar', nullable: true })
  utm_medium: string;

  @Column({ type: 'varchar', nullable: true })
  utm_campaign: string;

  @Column({ type: 'varchar', nullable: true })
  utm_term: string;

  @Column({ type: 'varchar', nullable: true })
  utm_content: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @OneToMany(() => UserLoginHistory, (loginHistory) => loginHistory.user)
  loginHistories: UserLoginHistory[];
}
