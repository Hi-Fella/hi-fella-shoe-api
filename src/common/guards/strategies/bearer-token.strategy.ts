import { Strategy } from 'passport-http-bearer';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '@/modules/v1.0/auth/auth.service';

@Injectable()
export class BearerTokenStrategy extends PassportStrategy(Strategy, 'bearer') {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(token: string) {
    // Validate token however you store it
    const user = await this.authService.validateToken(token);
    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }
    return user; // attaches user to req.user
  }
}
