import { PaginationUtil } from '@/common/utils/pagination.util';
import { Events } from '@/entities/event.entity';
import { EventCategory } from '@/entities/event-category.entity';
import { EventSubCategory } from '@/entities/event-subcategory.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  EventStatusFilter,
  EventTimeFilter,
  GetEventsResponse,
  GetEventCategoriesResponse,
  GetEventSubCategoriesResponse,
  GetEventDetailResponse,
} from './event.dto';
import { HttpResponseUtil } from '@/common/utils/httpresponse.util';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Events, 'pg')
    private readonly eventRepository: Repository<Events>,
    @InjectRepository(EventCategory, 'pg')
    private readonly eventCategoryRepository: Repository<EventCategory>,
    @InjectRepository(EventSubCategory, 'pg')
    private readonly eventSubCategoryRepository: Repository<EventSubCategory>,
    private readonly i18n: I18nService,
  ) {}

  async getEvents(params: {
    page?: number;
    limit?: number;
    search?: string;
    category_slug?: string | string[];
    status?: EventStatusFilter;
    time?: EventTimeFilter;
  }): Promise<GetEventsResponse> {
    const { search, category_slug, status, time } = params;

    const queryBuilder = this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.category', 'category')
      .leftJoinAndSelect('event.tickets', 'tickets')
      .leftJoinAndSelect('event.user_creator', 'user_creator');

    // Apply filters
    if (search) {
      queryBuilder.andWhere('event.name_event ILIKE :search', {
        search: `%${search}%`,
      });
    }

    if (category_slug) {
      if (Array.isArray(category_slug)) {
        queryBuilder.andWhere('category.slug IN (:...category_slug)', {
          category_slug,
        });
      } else {
        queryBuilder.andWhere('category.slug = :category_slug', {
          category_slug,
        });
      }
    }

    // Apply status filter
    if (status) {
      queryBuilder.andWhere('event.status = :status', {
        status,
      });
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
          image: (await assetStorage(event.thumbnail_url || '')) || null,
          price: `${minPrice}`,
          date: event.start_date.toISOString(),
          status: event.status,
          organizer: {
            name: event.user_creator?.name || '',
            image:
              (await assetStorage(event.user_creator?.profile_image || '')) ||
              null,
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

  async getEventCategories(params: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<GetEventCategoriesResponse> {
    const { search } = params;

    const queryBuilder = this.eventCategoryRepository
      .createQueryBuilder('category')
      .orderBy('category.name', 'ASC');

    if (search) {
      queryBuilder.andWhere('category.name ILIKE :search', {
        search: `%${search}%`,
      });
    }

    const { data, total, page, total_pages } = await PaginationUtil.paginate(
      queryBuilder,
      params,
    );

    const formattedData: GetEventCategoriesResponse['data'] = data.map(
      (category) => ({
        id: category.id_event_category,
        name: category.name,
        slug: category.slug || '',
      }),
    );

    return {
      data: formattedData,
      total,
      page,
      total_pages,
    };
  }

  async getEventSubCategories(params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
  }): Promise<GetEventSubCategoriesResponse> {
    const { search, category } = params;

    const queryBuilder = this.eventSubCategoryRepository
      .createQueryBuilder('subcategory')
      .leftJoinAndSelect('subcategory.category', 'category')
      .orderBy('subcategory.name', 'ASC');

    if (search) {
      queryBuilder.andWhere('subcategory.name ILIKE :search', {
        search: `%${search}%`,
      });
    }

    if (category) {
      queryBuilder.andWhere('category.slug = :category', {
        category,
      });
    }

    const { data, total, page, total_pages } = await PaginationUtil.paginate(
      queryBuilder,
      params,
    );

    const formattedData: GetEventSubCategoriesResponse['data'] = data.map(
      (subcategory) => ({
        id: subcategory.id_event_subcategory,
        name: subcategory.name,
        slug: subcategory.slug || '',
      }),
    );

    return {
      data: formattedData,
      total,
      page,
      total_pages,
    };
  }

  async getEventDetail(id_event: string): Promise<GetEventDetailResponse> {
    const event = await this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.category', 'category')
      .leftJoinAndSelect('event.tickets', 'tickets')
      .leftJoinAndSelect('event.user_creator', 'user_creator')
      .where('event.id_event = :id_event', { id_event })
      .getOne();

    if (!event) {
      throw HttpResponseUtil.notFound({
        message: this.i18n.t(`general.event.notFound`),
      });
    }

    // Format tickets data
    const formattedTickets = event.tickets.map((ticket) => ({
      id: ticket.id_ticket,
      name: ticket.name_ticket,
      description: ticket.description,
      is_available:
        ticket.active && ticket.inventory_sold < ticket.inventory_total,
      price: ticket.price.toString(),
    }));

    return {
      id: event.id_event,
      name: event.name_event,
      image: (await assetStorage(event.thumbnail_url || '')) || null,
      description: event.description || '',
      status: event.status,
      time: {
        start: event.start_date.toISOString(),
        end: event.end_date.toISOString(),
        long: this.i18n.t(`general.event.duration.${event.duration}`),
      },
      category: {
        id: event.category.id_event_category,
        name: event.category.name,
        slug: event.category.slug || '',
      },
      organizer: {
        id: event.user_creator.id_user,
        name: event.user_creator.name,
        image:
          (await assetStorage(event.user_creator.profile_image || '')) || null,
      },
      tickets: formattedTickets,
    };
  }
}
