import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('hf_user_login_history')
export class UserLoginHistory {
  @PrimaryColumn({ type: 'bigint', default: () => 'id_generator()' })
  id_user_login_history: string;

  @ManyToOne(() => User, (user) => user.loginHistories)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'bigint', nullable: true })
  user_id: string;

  @Column({ type: 'int4', nullable: true })
  city_id: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  ip_address: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  isp_provider: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  browser: string;

  @Column({ type: 'text', nullable: true })
  device_info: string;

  @Column({ type: 'varchar', length: 60, nullable: true })
  city_name: string;

  @Column({ type: 'varchar', length: 80, nullable: true })
  token: string;

  @Column({ type: 'timestamp', nullable: true })
  logout_at: Date;

  @Column({ type: 'varchar', length: 10, nullable: true })
  session_status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
