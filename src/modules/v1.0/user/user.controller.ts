import { Controller, Get, UseGuards, Request, UseInterceptors } from '@nestjs/common';
import { TokenAuthGuard } from '@/common/guards/token-auth.guard';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

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
    return {
        code: 200,
        status: 'success',
        message: 'View Profile',
        data: { id: req.user.id, email: req.user.email, token_bearer: req.user.token_bearer }
    };
  }
}
