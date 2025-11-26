import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from './base.repository';
import { getDataSourceToken } from '@nestjs/typeorm';
import { UserLoginHistory } from '@/entities/user-login-history.entity';

@Injectable()
export class UserLoginHistoryRepository extends BaseRepository<UserLoginHistory> {
  constructor(@Inject(getDataSourceToken('pg')) dataSource: DataSource) {
    // Pass the Entity and the default EntityManager to the base constructor
    super(UserLoginHistory, dataSource.createEntityManager());
  }
}
