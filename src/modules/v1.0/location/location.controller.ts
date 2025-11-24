import { HttpResponseUtil } from '@/common/utils/httpresponse.util';
import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { GetCitiesDto, GetCountriesDto } from './location.dto';
import { LocationService } from './location.service';

@Controller({
  path: 'location',
  version: '1.0',
})
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get('countries')
  @UseInterceptors(AnyFilesInterceptor())
  async getCountries(@Query() query: GetCountriesDto) {
    const countries = await this.locationService.getCountries({
      page: query.page,
      limit: query.limit,
      search: query.search,
    });
    return HttpResponseUtil.success({
      data: countries,
    });
  }

  @Get('cities')
  @UseInterceptors(AnyFilesInterceptor())
  async getCities(@Query() query: GetCitiesDto) {
    const cities = await this.locationService.getCities({
      page: query.page,
      limit: query.limit,
      search: query.search,
      country_id: query.country_id,
    });
    return HttpResponseUtil.success({
      data: cities,
    });
  }
}
