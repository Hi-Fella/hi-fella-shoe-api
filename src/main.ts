import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';
import { DtoValidationPipe } from '@/common/pipes/dto-validation.pipe';
import { InternalExceptionFilter } from '@/common/filters/internal-exception.filter';
import { DdExceptionFilter } from '@/common/filters/dd-exception.filter';
import { ConfigService } from '@nestjs/config';
import '@/global/dd.util';
import '@/global/helpers.util';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  // Serve static files from the 'public' directory
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // use winston as global logger
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  // Global prefix for API
  app.setGlobalPrefix('api');

  // ✅ Enable versioning
  app.enableVersioning({
    type: VersioningType.URI, // or HEADER, MEDIA_TYPE, CUSTOM
    defaultVersion: '1.0', // optional, fallback version
  });

  // Global Pipes
  app.useGlobalPipes(new DtoValidationPipe());

  // Global Filters
  app.useGlobalFilters(
    new InternalExceptionFilter(config),
    new DdExceptionFilter(),
  );

  // Configure CORS
  let allowedHosts: string[] = [];
  if (
    !!process.env.CORS_ALLOWED_HOST &&
    typeof process.env.CORS_ALLOWED_HOST === 'string'
  ) {
    allowedHosts = process.env.CORS_ALLOWED_HOST.split(',');
  }
  if (allowedHosts.length > 0) {
    app.enableCors({
      origin: allowedHosts,
      credentials: true,
    });
  } else {
    app.enableCors();
  }

  // Start the server (HTTP + WebSocket via NestJS Gateway)
  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log(`Application is running on port ${port}`);
  logger.log(`WebSocket server is integrated and available on the same port`);
}
bootstrap();
