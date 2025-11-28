import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { Events } from '@/entities/event.entity';
import { EventCategory } from '@/entities/event-category.entity';
import { EventSubCategory } from '@/entities/event-subcategory.entity';
import { User } from '@/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [Events, EventCategory, EventSubCategory, User],
      'pg',
    ),
  ],
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService],
})
export class EventModule {}
