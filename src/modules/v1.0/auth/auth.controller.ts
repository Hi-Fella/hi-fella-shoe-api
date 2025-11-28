import { IpAddress } from '@/common/decorators/ip-address.decorator';
import { TokenAuthGuard } from '@/common/guards/token-auth.guard';
import { HttpResponseUtil } from '@/common/utils/httpresponse.util';
import { UserService } from '@/modules/v1.0/user/user.service';
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
import {
  CompleteProfileDto,
  LoginUserDto,
  RegisterUserDto,
  ValidateGoogleOAuthDto,
} from './auth.dto';
import { AuthService } from './auth.service';
import type { AuthenticatedRequest } from './auth.types';
// import { Transactional } from '@/common/decorators/transactional.decorator';

@Controller({
  path: 'auth',
  version: '1.0',
})
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('register')
  @UseInterceptors(AnyFilesInterceptor()) // intercepts multipart and allows form fields
  // @Transactional({ typeorm: ['pg'] })
  async register(@Body() dto: RegisterUserDto, @IpAddress() ip: string) {
    const createdData = await this.authService.register(dto, ip);
    return HttpResponseUtil.successCreated({
      data: createdData,
    });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(AnyFilesInterceptor()) // intercepts multipart and allows form fields
  async login(@Body() dto: LoginUserDto, @IpAddress() ip: string) {
    const loginData = await this.authService.login(dto, ip);

    return HttpResponseUtil.success({
      data: loginData,
    });
  }

  @Post('complete-profile')
  @UseGuards(TokenAuthGuard)
  @UseInterceptors(AnyFilesInterceptor())
  @HttpCode(HttpStatus.OK)
  async completeProfile(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CompleteProfileDto,
  ) {
    const completedData = await this.authService.completeProfile(req.user, dto);
    return HttpResponseUtil.success({
      data: completedData,
    });
  }

  @Post('google-oauth')
  @UseInterceptors(AnyFilesInterceptor())
  @HttpCode(HttpStatus.OK)
  async validateGoogleOAuth(
    @Body() dto: ValidateGoogleOAuthDto,
    @IpAddress() ip: string,
  ) {
    // validate and get info from oAuth
    const validationResult = await this.authService.validateGoogleOAuth(dto);

    // check available email
    const user = await this.userService.findByEmail(
      validationResult.user_info.email,
    );

    // if email is registered, then login automatically
    if (!!user) {
      const loginData = await this.authService.loginWithoutPassword(
        {
          email: validationResult.user_info.email,
          browser: dto.browser,
          device_info: dto.device_info,
        },
        ip,
      );
      return HttpResponseUtil.success({
        data: loginData,
      });
    }

    // if email is not registered, then create new one
    const createdData = await this.authService.registerWithoutPassword(
      {
        ...dto,
        email: validationResult.user_info.email,
        google_id: validationResult.user_info.id,
      },
      ip,
    );

    return HttpResponseUtil.success({
      data: createdData,
    });
  }
}
