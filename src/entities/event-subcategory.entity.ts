import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { EventCategory } from './event-category.entity';
import { Events } from './event.entity';

@Entity('hf_event_subcategories')
export class EventSubCategory {
  @PrimaryColumn({ type: 'bigint', default: () => 'id_generator()' })
  id_event_subcategory: string;

  @Column({ type: 'bigint' })
  event_category_id: string;

  @ManyToOne(() => EventCategory, (category) => category.subcategories)
  @JoinColumn({ name: 'event_category_id' })
  category: EventCategory;

  @OneToMany(() => Events, (event) => event.subcategory)
  events: Events[];

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', nullable: true })
  slug: string;

  @CreateDateColumn()
  created_at: Date;
}
