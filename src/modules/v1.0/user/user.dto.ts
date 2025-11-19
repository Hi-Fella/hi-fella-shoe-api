import { Match } from '@/common/dtos/match.dto';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty()
  email: string;

  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty()
  password: string;

  @Match('password', { message: 'The passwords did not match' })
  @IsNotEmpty()
  password_confirmation: string;

  @IsString()
  @IsNotEmpty()
  browser: string;

  @IsString()
  @IsNotEmpty()
  device_info: string;

  @IsString()
  @IsOptional()
  utm_id?: string;

  @IsString()
  @IsOptional()
  utm_source?: string;

  @IsString()
  @IsOptional()
  utm_medium?: string;

  @IsString()
  @IsOptional()
  utm_campaign?: string;

  @IsString()
  @IsOptional()
  utm_term?: string;

  @IsString()
  @IsOptional()
  utm_content?: string;
}

export interface UserData {
  id: string;
  email: string;
  name: string | null;
  phone_code: string | null;
  phone: string | null;
  gender: string | null;
  birth_date: string | null;
  country: {
    id: string;
    name: string;
  } | null;
  city: {
    id: string;
    country: string;
  } | null;
  token_bearer: string | null;
  token_socket: string | null;
}
