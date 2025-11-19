import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from '@/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User], 'pg')],
  providers: [UserService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
