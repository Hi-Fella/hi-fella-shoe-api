import { IsAgeValid } from '@/common/decorators/validator/is-age-valid.decorator';
import { IsPasswordValid } from '@/common/decorators/validator/is-password-valid.decorator';
import { IsPhoneNumberValid } from '@/common/decorators/validator/is-phone-number-valid.decorator';
import { Match } from '@/common/decorators/validator/match.dto';
import { UserData } from '@/modules/v1.0/user/user.dto';
import {
  IsAlpha,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CommonRegisterUserDto {
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

export class RegisterUserDto extends CommonRegisterUserDto {
  @IsEmail()
  email: string;

  @IsPasswordValid()
  @MinLength(8)
  @IsString()
  @IsNotEmpty()
  password: string;

  @Match('password')
  @IsNotEmpty()
  password_confirmation: string;
}

export interface RegisterUserResponseData {
  registration_type: string;
  registration_complete: boolean;
  token_bearer: string | null;
  token_socket: string | null;
  user: UserData;
}

export class RegisterWithoutPasswordDto extends CommonRegisterUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  google_id: string;
}

export class LoginUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  browser: string;

  @IsString()
  @IsNotEmpty()
  device_info: string;
}

export interface LoginUserResponseData extends RegisterUserResponseData {}

export class LoginWithoutPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  browser: string;

  @IsString()
  @IsNotEmpty()
  device_info: string;
}

export class CompleteProfileDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  @IsAlpha()
  fullname: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['male', 'female', 'prefer_not'])
  gender: 'male' | 'female' | 'prefer_not';

  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsAgeValid()
  @IsNotEmpty()
  birth_date: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+$/)
  city_id: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\+\d+$/)
  phone_code: string;

  @IsPhoneNumberValid('phone_code')
  @IsNotEmpty()
  phone_number: string;
}

export interface CompleteProfileResponseData {
  registration_type: string;
  registration_complete: boolean;
  token_bearer: string | null;
  token_socket: string | null;
  user: UserData;
}

export class ValidateGoogleOAuthDto extends CommonRegisterUserDto {
  @IsString()
  @IsNotEmpty()
  access_token: string;
}

export interface ValidateGoogleOAuthResponseData {
  user_info: {
    id: string;
    email: string;
    name: string;
    picture: string;
    verified_email: boolean;
    locale: string;
  };
  token_info: {
    access_token: string;
    expires_in: number;
    scope: string;
  };
}
