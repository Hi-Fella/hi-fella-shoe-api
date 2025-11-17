import { Catch, ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { DdException } from '@/common/exceptions/dd.exception';

@Catch(DdException)
export class DdExceptionFilter implements ExceptionFilter {
  catch(exception: DdException, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse();

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'no-store');
    res.status(500).send(exception.ddHtml);
  }
}