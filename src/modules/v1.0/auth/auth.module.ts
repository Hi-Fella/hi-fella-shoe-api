import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { BearerTokenStrategy } from '@/common/guards/strategies/bearer-token.strategy';

@Module({
  imports: [UserModule, PassportModule],
  providers: [AuthService, BearerTokenStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
