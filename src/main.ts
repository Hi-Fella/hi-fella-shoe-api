import { NestFactory } from '@nestjs/core';
import { VersioningType } from '@nestjs/common';
import { InternalExceptionFilter } from '@/common/filters/internal-exception.filter';
import { DdExceptionFilter } from '@/common/filters/dd-exception.filter';
import { ConfigService } from '@nestjs/config';
import '@/global/dd.util';
import '@/global/helpers.util';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import {
  installDtoRequireInterceptor,
  // listTrackedDtos,
} from '@/common/utils/dto-file-tracker.utils';

// CRITICAL: Install interceptor BEFORE importing AppModule
installDtoRequireInterceptor();

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);
  // Debug: List all tracked DTOs
  // listTrackedDtos();

  // Serve static files from the 'public' directory
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // use winston as global logger
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  // ✅ Enable versioning
  app.enableVersioning({
    type: VersioningType.URI, // or HEADER, MEDIA_TYPE, CUSTOM
    defaultVersion: '1.0', // optional, fallback version
  });

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
  const port = config.get<string>('PORT') ?? 3000;
  await app.listen(port);

  logger.log(`Application is running on port ${port}`);
  logger.log(`WebSocket server is integrated and available on the same port`);
}
bootstrap();
