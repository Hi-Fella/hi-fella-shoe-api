import { LoggerMiddleware } from '@/common/middlewares/logger.middleware';
import { DailyRotateTransport } from '@/common/transports/winston-daily-rotate.transport';
import { AuthModule } from '@/modules/v1.0/auth/auth.module';
import { UserModule } from '@/modules/v1.0/user/user.module';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import DiscordTransport from 'winston-discord-transport';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmailModule } from './email/email.module';
import { QueueModule } from './queue/queue.module';
import { WebsocketModule } from './websocket/websocket.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      name: 'pg', // alias
      type: 'postgres',
      host: process.env.DB_HOST,
      port: !!process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    // MongooseModule.forRoot('mongodb://localhost/nest', {
    //   connectionName: "mongoDB"
    // }),
    QueueModule,
    EmailModule,
    WebsocketModule,
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, context }) => {
              return `${timestamp} [${context}] ${level}: ${message}`;
            }),
          ),
        }),
        new winston.transports.File({
          filename: 'logs/all.log',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
        new DailyRotateTransport({
          dirname: 'logs',
          filename: 'log-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
        }),
        ...(!!process.env.DISCORD_LOG_WEBHOOK
          ? [
              new DiscordTransport({
                webhook: process.env.DISCORD_LOG_WEBHOOK || `-`,
                defaultMeta: { service: 'hi-fella-shoe-api' },
                level: 'error',
              }),
            ]
          : []),
      ],
    }),
    AuthModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      // * at the end is now deprecated, see warn below for more info
      // {"context":"LegacyRouteConverter","level":"warn","message":"Unsupported route path: \"/api/*\". In previous versions, the symbols ?, *, and + were used to denote optional or repeating path parameters. The latest version of \"path-to-regexp\" now requires the use of named parameters. For example, instead of using a route like /users/* to capture all routes starting with \"/users\", you should use /users/*path. For more details, refer to the migration guide. Attempting to auto-convert..."}
      .forRoutes('/*api'); // apply to all api routes
  }
}
