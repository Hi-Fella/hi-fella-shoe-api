import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // use winston as global logger
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  // Start the server (HTTP + WebSocket via NestJS Gateway)
  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log(`Application is running on port ${port}`);
  logger.log(`WebSocket server is integrated and available on the same port`);
}
bootstrap();
