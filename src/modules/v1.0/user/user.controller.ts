import {
  Controller,
  Get,
  UseGuards,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { TokenAuthGuard } from '@/common/guards/token-auth.guard';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { AddUserAgentInterceptor } from '@/common/interceptors/add-user-agent.interceptor';
import dayjs from 'dayjs';
import { HttpResponseUtil } from '@/common/utils/httpresponse.util';

@Controller({
  path: 'user',
  version: '1.0',
})
export class UserController {
  @Get('profile')
  @UseGuards(TokenAuthGuard)
  @UseInterceptors(AnyFilesInterceptor())
  getProfile(@Request() req) {
    // req.user is set by TokenStrategy
    return HttpResponseUtil.success({
      message: 'View Profile',
      data: {
        id: req.user.id,
        email: req.user.email,
        token_bearer: req.user.token_bearer,
      },
    });
  }

  @Get('view')
  @UseInterceptors(AnyFilesInterceptor(), AddUserAgentInterceptor)
  viewUser(@Request() req) {
    return HttpResponseUtil.success({
      message: 'Test Interceptor',
      data: {
        userAgent: req.customInjected.userAgent,
        injectedAt: req.customInjected.injectedAt,
      },
    });
  }

  @Get('tgl')
  @UseInterceptors(AnyFilesInterceptor())
  testTgl(@Request() req) {
    const dataTest: string[] = [];
    dataTest.push(formatDate('2025-01-31 15:20', 'iso_time')); // string
    dataTest.push(formatDate(new Date(), 'iso_time')); // date
    dataTest.push(formatDate(dayjs(), 'iso_time')); // dayjs
    dataTest.push(formatDate(Date.now(), 'iso_time')); // number

    return HttpResponseUtil.success({
      message: 'Test Global Helper',
      data: dataTest,
    });
  }
}
