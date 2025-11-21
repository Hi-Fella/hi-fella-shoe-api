import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from '@/entities/user.entity';
import { City } from '@/entities/city.entity';
import { Country } from '@/entities/country.entity';
import { UserLoginHistory } from '@/entities/user-login-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserLoginHistory, City, Country], 'pg'),
  ],
  providers: [UserService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
