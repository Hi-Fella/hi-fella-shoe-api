import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';
import { DtoValidationPipe } from '@/common/pipes/dto-validation.pipe';
import { InternalExceptionFilter } from '@/common/filters/internal-exception.filter';
import { DdExceptionFilter } from '@/common/filters/dd-exception.filter';
import { ConfigService } from '@nestjs/config';
import '@/global/dd.util';
import '@/global/helpers.util';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // Global prefix for API
  app.setGlobalPrefix('api');
  
  // ✅ Enable versioning
  app.enableVersioning({
    type: VersioningType.URI, // or HEADER, MEDIA_TYPE, CUSTOM
    defaultVersion: '1.0',    // optional, fallback version
  });

  // Global Pipes
  app.useGlobalPipes(
    new DtoValidationPipe(),
  );

  // Global Filters
  app.useGlobalFilters(
    new InternalExceptionFilter(config),
    new DdExceptionFilter(),
  );

  // Port
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
