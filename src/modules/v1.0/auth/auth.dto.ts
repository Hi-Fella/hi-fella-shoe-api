import { IsAgeValid } from '@/common/decorators/validator/is-age-valid.decorator';
import { IsPhoneNumberValid } from '@/common/decorators/validator/is-phone-number-valid.decorator';
import { CreateUserDto, UserData } from '@/modules/v1.0/user/user.dto';
import {
  IsAlpha,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class RegisterUserDto extends CreateUserDto {}

export interface RegisterUserResponseData {
  registration_type: string;
  registration_complete: boolean;
  token_bearer: string | null;
  token_socket: string | null;
  user: UserData;
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

export interface LoginUserResponseData {
  token_bearer: string | null;
  token_socket: string | null;
  user: UserData;
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
