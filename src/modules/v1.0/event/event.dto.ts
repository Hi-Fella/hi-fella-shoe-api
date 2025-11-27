import { PaginationDto, PaginationResponse } from '@/app.dto';
import { IsStringNumeric } from '@/common/decorators/validator/is-string-numeric.decorator';
import { TransformEmptyToUndefined } from '@/common/decorators/validator/transform-empty-to-undefined';
import { EventStatus } from '@/entities/event.entity';
import { Transform } from 'class-transformer';
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
  image: string | null;
  price: string;
  date: string;
  status: EventStatus;
  organizer: {
    name: string;
    image: string | null;
  };
}

export class GetEventsDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => {
    // If it's already an array, return as is
    if (Array.isArray(value)) {
      return value;
    }
    // If it's a string, split by comma to support multiple categories
    if (typeof value === 'string' && value.includes(',')) {
      return value.split(',').map((item) => item.trim());
    }
    // Otherwise return the original value
    return value;
  })
  category?: string | string[];

  @IsOptional()
  @IsString()
  @IsIn(Object.values(EventStatusFilter))
  @TransformEmptyToUndefined()
  status?: EventStatusFilter;

  @IsOptional()
  @IsString()
  @IsIn(Object.values(EventTimeFilter))
  @TransformEmptyToUndefined()
  time?: EventTimeFilter;
}

export type GetEventsResponse = PaginationResponse<EventData[]>;

export interface EventCategoryData {
  id: string;
  name: string;
  slug: string;
}

export class GetEventCategoriesDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;
}

export type GetEventCategoriesResponse = PaginationResponse<
  EventCategoryData[]
>;

export interface EventSubCategoryData {
  id: string;
  name: string;
  slug: string;
}

export class GetEventSubCategoriesDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  category?: string;
}

export type GetEventSubCategoriesResponse = PaginationResponse<
  EventCategoryData[]
>;

export class GetEventDetailDto {
  @IsStringNumeric()
  id_event: string;
}

export interface EventTicketData {
  id: string;
  name: string;
  description: string;
  is_available: boolean;
  price: string;
}

export interface GetEventDetailResponse {
  id: string;
  name: string;
  image: string | null;
  description: string;
  status: string;
  time: {
    start: string; // ISO String
    end: string; // ISO String
    long: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  organizer: {
    id: string;
    name: string;
    image: string | null;
  };
  tickets: EventTicketData[];
}
