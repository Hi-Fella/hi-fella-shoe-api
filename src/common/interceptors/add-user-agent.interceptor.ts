import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';

@Injectable()
export class AddUserAgentInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();

    // Condition: required header missing
    if (!req.headers['x-api-key']) {
      // Return sudden response
      return of({
        code: 401,
        status: 'failed',
        message: 'Missing X-API-KEY header',
        data: null
      });
    }

    // modify request before controller
    req.customInjected = {
      userAgent: req.headers['user-agent'] || 'unknown',
      injectedAt: new Date().toISOString(),
    };

    // Continue to controller
    return next.handle();
  }
}