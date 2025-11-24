import { City } from '@/entities/city.entity';
import { Country } from '@/entities/country.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetCitiesResponse, GetCountriesResponse } from './location.dto';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Country, 'pg')
    private readonly countryRepository: Repository<Country>,
    @InjectRepository(City, 'pg')
    private readonly cityRepository: Repository<City>,
  ) {}

  async getCountries(params: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<GetCountriesResponse> {
    const { page = 1, limit = 20, search } = params;
    const skip = (page - 1) * limit;

    const queryBuilder = this.countryRepository
      .createQueryBuilder('country')
      .where('country.status = :status', { status: true })
      .andWhere('country.deleted_at IS NULL');

    if (search) {
      queryBuilder.andWhere('country.name_country ILIKE :search', {
        search: `%${search}%`,
      });
    }

    const [data, total] = await queryBuilder
      .orderBy('country.name_country', 'ASC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const formattedData: GetCountriesResponse['data'] = data.map((c) => ({
      id: c.id_country,
      name: c.name_country,
      country_code: c.country_code,
      phone_code: c.phone_code,
      flag: c.flag,
    }));
    const total_pages = Math.ceil(total / limit);

    return {
      data: formattedData,
      total,
      page,
      total_pages,
    };
  }

  async getCities(params: {
    page?: number;
    limit?: number;
    search?: string;
    country_id?: string;
  }): Promise<GetCitiesResponse> {
    const { page = 1, limit = 20, search, country_id } = params;
    const skip = (page - 1) * limit;

    const queryBuilder = this.cityRepository
      .createQueryBuilder('city')
      .leftJoinAndSelect('city.province', 'province')
      .leftJoinAndSelect('province.country', 'country')
      .where('city.status = :status', { status: true })
      .andWhere('city.deleted_at IS NULL');

    if (country_id) {
      queryBuilder.andWhere('province.country_id = :country_id', {
        country_id,
      });
    }

    if (search) {
      queryBuilder.andWhere('city.name_city ILIKE :search', {
        search: `%${search}%`,
      });
    }

    const [data, total] = await queryBuilder
      .orderBy('city.name_city', 'ASC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const formattedData: GetCitiesResponse['data'] = data.map((c) => ({
      id: c.id_city,
      name: c.name_city,
    }));
    const total_pages = Math.ceil(total / limit);

    return {
      data: formattedData,
      total,
      page,
      total_pages,
    };
  }
}
