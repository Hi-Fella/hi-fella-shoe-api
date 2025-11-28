import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from './base.repository';
import { User } from '@/entities/user.entity';
import { getDataSourceToken } from '@nestjs/typeorm';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(@Inject(getDataSourceToken('pg')) dataSource: DataSource) {
    // Pass the Entity and the default EntityManager to the base constructor
    super(User, dataSource.createEntityManager());
  }
}
