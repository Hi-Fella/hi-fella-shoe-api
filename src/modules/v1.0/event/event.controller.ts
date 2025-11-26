import { HttpResponseUtil } from '@/common/utils/httpresponse.util';
import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { GetEventsDto, GetEventCategoriesDto } from './event.dto';
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
      category_id: query.category_id,
      status: query.status,
      time: query.time,
    });
    return HttpResponseUtil.success({
      data: events,
    });
  }

  @Get('categories')
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
}
