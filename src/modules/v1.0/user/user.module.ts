import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserProcessor } from './user.processor';
import { User } from '@/entities/user.entity';
import { City } from '@/entities/city.entity';
import { Country } from '@/entities/country.entity';
import { UserLoginHistory } from '@/entities/user-login-history.entity';
import { GoogleSheetsModule } from '@/google-sheets/google-sheets.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserLoginHistory, City, Country], 'pg'),
    GoogleSheetsModule,
    BullModule.registerQueue({
      name: 'user-sync-gsheet',
    }),
  ],
  providers: [UserService, UserProcessor],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
