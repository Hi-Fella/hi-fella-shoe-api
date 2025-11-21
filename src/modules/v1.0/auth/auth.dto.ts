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
  @IsEmail({}, { message: 'Silakan masukkan alamat email yang valid' })
  @IsNotEmpty({ message: 'Silakan masukkan email anda' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty()
  password: string;

  @IsString({ message: 'Browser must be a string' })
  @IsNotEmpty()
  browser: string;

  @IsString({ message: 'Browser must be a string' })
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

  @IsString({ message: 'Gender must be a string' })
  @IsNotEmpty()
  @IsIn(['male', 'female', 'prefer_not'], {
    message: 'Gender must be male, female, or prefer not',
  })
  gender: 'male' | 'female' | 'prefer_not';

  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Birth date must be in YYYY-MM-DD format',
  })
  @IsAgeValid()
  @IsNotEmpty()
  birth_date: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+$/, { message: 'Invalid City' })
  city_id: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\+\d+$/, {
    message: 'Phone code must start with + followed by numbers (e.g., +62)',
  })
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
