import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EventCategory } from './event-category.entity';
import { EventSubCategory } from './event-subcategory.entity';
import { EventTicket } from './event-ticket.entity';
import { User } from './user.entity';

export enum EventDuration {
  '1h' = '1h',
  '2h' = '2h',
}

export enum EventStatus {
  upcoming = 'upcoming',
  ongoing = 'ongoing',
  cancelled = 'cancelled',
  finished = 'finished',
}

Object.values(EventStatus);

@Entity('hf_events')
export class Events {
  @PrimaryColumn({ type: 'bigint', default: () => 'id_generator()' })
  id_event: string;

  @Column({ type: 'bigint' })
  user_creator_id: string;

  @ManyToOne(() => User, (user) => user.events)
  @JoinColumn({ name: 'user_creator_id' })
  user_creator: User;

  @Column({ type: 'text' })
  name_event: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'bigint' })
  event_category_id: string;

  @ManyToOne(() => EventCategory, (category) => category.events)
  @JoinColumn({ name: 'event_category_id' })
  category: EventCategory;

  @Column({ type: 'bigint', nullable: true })
  event_subcategory_id: string;

  @ManyToOne(() => EventSubCategory, (subcategory) => subcategory.events)
  @JoinColumn({ name: 'event_subcategory_id' })
  subcategory: EventSubCategory;

  @Column({ type: 'text', nullable: true })
  thumbnail_url: string;

  @Column({ type: 'jsonb', nullable: true })
  thumbnail_meta: any;

  @Column({ type: 'timestamp' })
  start_date: Date;

  @Column({ type: 'timestamp' })
  end_date: Date;

  @Column({ type: 'enum', enum: Object.values(EventDuration) })
  duration: EventDuration;

  @Column({ type: 'enum', enum: Object.values(EventStatus) })
  status: EventStatus;

  @Column({ type: 'bigint', nullable: true })
  total_ticket_sold: bigint;

  @Column({ type: 'bigint', nullable: true })
  total_revenue: bigint;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => EventTicket, (ticket) => ticket.event)
  tickets: EventTicket[];
}
