import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsString,
  IsInt,
  MinLength,
} from 'class-validator';
import { Match } from '@/common/dtos/match.dto';

export class RegisterUserDto {
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

  @MinLength(3)
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Type(() => Number)
  @IsOptional()
  age: number;
}

export class LoginUserDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty()
  email: string;

  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty()
  password: string;
}
