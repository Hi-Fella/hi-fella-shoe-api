import { HttpResponseUtil } from '@/common/utils/httpresponse.util';
import {
  Body,
  Controller,
  Post,
  UseInterceptors,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { LoginUserDto, RegisterUserDto, CompleteProfileDto } from './auth.dto';
import { TokenAuthGuard } from '@/common/guards/token-auth.guard';
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
  @UseInterceptors(AnyFilesInterceptor()) // intercepts multipart and allows form fields
  async login(@Body() dto: LoginUserDto) {
    return this.authService.login(dto);
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
