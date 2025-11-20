import { Match } from '@/common/dtos/match.dto';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IsPasswordValid } from '@/common/decorators/validator/is-password-valid.decorator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsPasswordValid()
  @IsString()
  @IsNotEmpty()
  password: string;

  @Match('password')
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

export class UpdateUserDto {
  @IsPasswordValid()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  @MaxLength(300)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  @Matches(/^\d+$/, { message: 'Phone number must contain numbers only' })
  phone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  @Matches(/^\+\d+$/, {
    message: 'Phone code must start with + followed by numbers (e.g., +62)',
  })
  phone_code?: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  @IsIn(['male', 'female', 'prefer_not'], {
    message: 'Gender must be male, female, or prefer not',
  })
  gender?: 'male' | 'female' | 'prefer_not';

  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Birth date must be in YYYY-MM-DD format',
  })
  @IsOptional()
  birthdate?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d+$/, { message: 'Invalid City' })
  city_id?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  profile_image?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  banner_image?: string;

  @IsBoolean()
  @IsOptional()
  account_status?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(80)
  token_socket?: string;

  @IsString()
  @IsOptional()
  @MaxLength(80)
  token_bearer?: string;

  @IsDateString()
  @IsOptional()
  last_login?: string;

  @IsDateString()
  @IsOptional()
  email_verified_at?: string;

  @IsInt()
  @IsOptional()
  registration_step?: number | null;

  @IsString()
  @IsOptional()
  registration_type?: 'manual' | 'google';

  @IsDateString()
  @IsOptional()
  finish_registration_at?: string;

  @IsString()
  @IsOptional()
  about?: string;

  @IsString()
  @IsOptional()
  google_id?: string;

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
}
