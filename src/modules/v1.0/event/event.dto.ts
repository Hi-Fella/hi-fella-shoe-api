import { PaginationDto, PaginationResponse } from '@/app.dto';
import { IsStringNumeric } from '@/common/decorators/validator/is-string-numeric.decorator';
import { EventStatus } from '@/entities/event.entity';
import { IsIn, IsOptional, IsString } from 'class-validator';

export enum EventTimeFilter {
  day = 'day',
  week = 'week',
  month = 'month',
  year = 'year',
}

export enum EventStatusFilter {
  upcoming = 'upcoming',
  ongoing = 'ongoing',
}

export interface EventData {
  id: string;
  name: string;
  image: string;
  price: string;
  date: string;
  status: EventStatus;
  organizer: {
    name: string;
    image: string;
  };
}

export class GetEventsDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsStringNumeric()
  category_id?: string;

  @IsOptional()
  @IsString()
  @IsIn(Object.values(EventStatusFilter))
  status?: EventStatusFilter;

  @IsOptional()
  @IsString()
  @IsIn(Object.values(EventTimeFilter))
  time?: EventTimeFilter;
}

export type GetEventsResponse = PaginationResponse<EventData[]>;
