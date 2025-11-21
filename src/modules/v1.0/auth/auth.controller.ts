import { TokenAuthGuard } from '@/common/guards/token-auth.guard';
import { HttpResponseUtil } from '@/common/utils/httpresponse.util';
import { IpAddress } from '@/common/decorators/ip-address.decorator';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { CompleteProfileDto, LoginUserDto, RegisterUserDto } from './auth.dto';
import { AuthService } from './auth.service';
import type { AuthenticatedRequest } from './auth.types';

@Controller({
  path: 'auth',
  version: '1.0',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UseInterceptors(AnyFilesInterceptor()) // intercepts multipart and allows form fields
  async register(@Body() dto: RegisterUserDto) {
    const createdData = await this.authService.register(dto);
    return HttpResponseUtil.successCreated({
      data: createdData,
    });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(AnyFilesInterceptor()) // intercepts multipart and allows form fields
  async login(@Body() dto: LoginUserDto, @IpAddress() ip: string) {
    const loginData = await this.authService.login(dto);

    return HttpResponseUtil.success({
      data: loginData,
    });
  }

  @Post('complete-profile')
  @UseGuards(TokenAuthGuard)
  @UseInterceptors(AnyFilesInterceptor())
  async completeProfile(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CompleteProfileDto,
  ) {
    const completedData = await this.authService.completeProfile(req.user, dto);
    return HttpResponseUtil.success({
      data: completedData,
    });
  }
}
