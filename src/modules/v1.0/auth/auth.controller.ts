import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  BadRequestException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto, LoginUserDto } from '../user/user.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

@Controller({
  path: 'auth',
  version: '1.0',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UseInterceptors(AnyFilesInterceptor()) // intercepts multipart and allows form fields
  // @UsePipes(new DtoValidationPipe())
  async register(@Body() dto: RegisterUserDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @UseInterceptors(AnyFilesInterceptor()) // intercepts multipart and allows form fields
  async login(@Body() dto: LoginUserDto) {
    return this.authService.login(dto);
  }
}
