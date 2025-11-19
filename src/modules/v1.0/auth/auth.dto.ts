import { CreateUserDto, UserData } from '@/modules/v1.0/user/user.dto';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterUserDto extends CreateUserDto {}

export interface RegisterUserResponseData {
  registration_type: string;
  registration_complete: boolean;
  token_bearer: string | null;
  token_socket: string | null;
  user: UserData;
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
