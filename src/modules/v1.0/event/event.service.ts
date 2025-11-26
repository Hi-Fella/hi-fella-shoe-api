import { PaginationUtil } from '@/common/utils/pagination.util';
import { Events } from '@/entities/event.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  EventStatusFilter,
  EventTimeFilter,
  GetEventsResponse,
} from './event.dto';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Events, 'pg')
    private readonly eventRepository: Repository<Events>,
  ) {}

  async getEvents(params: {
    page?: number;
    limit?: number;
    search?: string;
    category_id?: string;
    status?: EventStatusFilter;
    time?: EventTimeFilter;
  }): Promise<GetEventsResponse> {
    const { search, category_id, status, time } = params;

    const queryBuilder = this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.category', 'category')
      .leftJoinAndSelect('event.subcategory', 'subcategory')
      .leftJoinAndSelect('event.tickets', 'tickets')
      .leftJoinAndSelect('event.user_creator', 'user_creator');

    // Apply filters
    if (search) {
      queryBuilder.andWhere('event.name_event ILIKE :search', {
        search: `%${search}%`,
      });
    }

    if (category_id) {
      queryBuilder.andWhere('event.id_event_category = :category_id', {
        category_id,
      });
    }

    // Apply status filter
    if (status) {
      const now = new Date();
      switch (status) {
        case EventStatusFilter.upcoming:
          queryBuilder.andWhere('event.start_date > :now', { now });
          break;
        case EventStatusFilter.ongoing:
          queryBuilder
            .andWhere('event.start_date <= :now', { now })
            .andWhere('event.end_date >= :now', { now });
          break;
      }
    }

    // Apply time filter
    if (time) {
      const now = new Date();
      let startDate: Date;
      let endDate: Date;

      switch (time) {
        case EventTimeFilter.day:
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
          );
          endDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 1,
          );
          break;
        case EventTimeFilter.week:
          const dayOfWeek = now.getDay();
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - dayOfWeek,
          );
          endDate = new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate() + 7,
          );
          break;
        case EventTimeFilter.month:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          break;
        case EventTimeFilter.year:
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date(now.getFullYear() + 1, 0, 1);
          break;
      }

      queryBuilder.andWhere('event.start_date >= :startDate', { startDate });
      queryBuilder.andWhere('event.start_date < :endDate', { endDate });
    }

    queryBuilder.orderBy('event.start_date', 'ASC');

    const { data, total, page, total_pages } = await PaginationUtil.paginate(
      queryBuilder,
      params,
    );

    const formattedData: GetEventsResponse['data'] = await Promise.all(
      data.map(async (event) => {
        // Get the minimum ticket price
        const minPrice =
          event.tickets && event.tickets.length > 0
            ? Math.min(...event.tickets.map((ticket) => Number(ticket.price)))
            : 0;

        return {
          id: event.id_event,
          name: event.name_event,
          image: await assetStorage(event.thumbnail_url || ''),
          price: `${minPrice}`,
          date: event.start_date.toISOString(),
          status: event.status,
          organizer: {
            name: event.user_creator?.name || '',
            image: await assetStorage(event.user_creator?.profile_image || ''),
          },
        };
      }),
    );

    return {
      data: formattedData,
      total,
      page,
      total_pages,
    };
  }
}
