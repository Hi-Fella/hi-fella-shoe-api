import { HttpResponseUtil } from '@/common/utils/httpresponse.util';
import { Controller, Get, Query, Param, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import {
  GetEventsDto,
  GetEventCategoriesDto,
  GetEventSubCategoriesDto,
  GetEventDetailDto,
} from './event.dto';
import { EventService } from './event.service';

@Controller({
  path: 'event',
  version: '1.0',
})
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  @UseInterceptors(AnyFilesInterceptor())
  async getEvents(@Query() query: GetEventsDto) {
    const events = await this.eventService.getEvents({
      page: query.page,
      limit: query.limit,
      search: query.search,
      category_slug: query.category,
      status: query.status,
      time: query.time,
    });
    return HttpResponseUtil.success({
      data: events,
    });
  }

  @Get('category')
  @UseInterceptors(AnyFilesInterceptor())
  async getEventCategories(@Query() query: GetEventCategoriesDto) {
    const categories = await this.eventService.getEventCategories({
      page: query.page,
      limit: query.limit,
      search: query.search,
    });
    return HttpResponseUtil.success({
      data: categories,
    });
  }

  @Get('sub-category')
  @UseInterceptors(AnyFilesInterceptor())
  async getEventSubCategories(@Query() query: GetEventSubCategoriesDto) {
    const subCategories = await this.eventService.getEventSubCategories({
      page: query.page,
      limit: query.limit,
      search: query.search,
      category: query.category,
    });
    return HttpResponseUtil.success({
      data: subCategories,
    });
  }

  @Get('detail/:id_event')
  @UseInterceptors(AnyFilesInterceptor())
  async getEventDetail(@Param() params: GetEventDetailDto) {
    const event = await this.eventService.getEventDetail(params.id_event);
    return HttpResponseUtil.success({
      data: event,
    });
  }
}
