import { PaginationDto, PaginationResponse } from '@/app.dto';
import { IsStringNumeric } from '@/common/decorators/validator/is-string-numeric.decorator';
import { IsOptional, IsString } from 'class-validator';

export class GetCitiesDto extends PaginationDto {
  @IsOptional()
  @IsStringNumeric()
  country_id?: string;

  @IsOptional()
  @IsString()
  search?: string;
}

export class GetCountriesDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;
}

export interface GetCountriesResponseItem {
  id: string;
  name: string;
  country_code: string;
  phone_code: string;
  flag: string | null;
}

export type GetCountriesResponse = PaginationResponse<
  GetCountriesResponseItem[]
>;

export interface GetCitiesResponseItem {
  id: string;
  name: string;
}

export type GetCitiesResponse = PaginationResponse<GetCitiesResponseItem[]>;
