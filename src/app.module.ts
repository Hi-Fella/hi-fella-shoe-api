import { LoggerMiddleware } from '@/common/middlewares/logger.middleware';
import { DailyRotateTransport } from '@/common/transports/winston-daily-rotate.transport';
import { AuthModule } from '@/modules/v1.0/auth/auth.module';
import { UserModule } from '@/modules/v1.0/user/user.module';
import { LocationModule } from '@/modules/v1.0/location/location.module';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_PIPE } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import DiscordTransport from 'winston-discord-transport';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmailModule } from './email/email.module';
import { QueueModule } from './queue/queue.module';
import { WebsocketModule } from './websocket/websocket.module';
import * as path from 'path';
import {
  I18nModule,
  AcceptLanguageResolver,
  QueryResolver,
  HeaderResolver,
} from 'nestjs-i18n';
import { DtoValidationPipe } from '@/common/pipes/dto-validation.pipe';
import { AzureBlobStorageModule } from './azure-blob-storage/azure-blob-storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      name: 'pg', // alias
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: parseInt(config.get<string>('DB_PORT', '5432')),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
    }),
    I18nModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        fallbackLanguage: configService.get('FALLBACK_LANG') || 'id',
        loaderOptions: {
          path: path.join(
            __dirname,
            configService.get('I18N_PATH') || '/i18n/',
          ),
          watch: (configService.get('I18N_WATCH') || 'true') === 'true',
        },
      }),
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
        new HeaderResolver(['x-lang']),
      ],
      inject: [ConfigService],
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
    LocationModule,
    AzureBlobStorageModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: DtoValidationPipe,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      // * at the end is now deprecated, see warn below for more info
      // {"context":"LegacyRouteConverter","level":"warn","message":"Unsupported route path: \"/api/*\". In previous versions, the symbols ?, *, and + were used to denote optional or repeating path parameters. The latest version of \"path-to-regexp\" now requires the use of named parameters. For example, instead of using a route like /users/* to capture all routes starting with \"/users\", you should use /users/*path. For more details, refer to the migration guide. Attempting to auto-convert..."}
      .forRoutes('/'); // apply to all api routes
  }
}
