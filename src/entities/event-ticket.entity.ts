import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Events } from './event.entity';

@Entity('hf_event_tickets')
export class EventTicket {
  @PrimaryColumn({ type: 'bigint', default: () => 'id_generator()' })
  id_ticket: string;

  @Column({ type: 'bigint' })
  id_event: string;

  @Column({ type: 'text' })
  name_ticket: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'bigint' })
  price: bigint;

  @Column({ type: 'bigint' })
  inventory_total: bigint;

  @Column({ type: 'bigint', default: 0 })
  inventory_sold: bigint;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Events, (event) => event.tickets)
  @JoinColumn({ name: 'id_event' })
  event: Events;
}
