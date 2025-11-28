import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { EventSubCategory } from './event-subcategory.entity';
import { Events } from './event.entity';

@Entity('hf_event_categories')
export class EventCategory {
  @PrimaryColumn({ type: 'bigint', default: () => 'id_generator()' })
  id_event_category: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', nullable: true })
  slug: string;

  @OneToMany(() => EventSubCategory, (subcategory) => subcategory.category)
  subcategories: EventSubCategory[];

  @OneToMany(() => Events, (event) => event.category)
  events: Events[];

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
