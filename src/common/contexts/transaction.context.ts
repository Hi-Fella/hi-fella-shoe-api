import { Injectable, Scope } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { ClientSession } from 'mongoose';
import { TxOptions } from '@/common/decorators/transactional.decorator';

@Injectable({ scope: Scope.REQUEST })
export class TransactionContext {
  typeormRunners: Record<string, QueryRunner> = {};
  mongooseSessions: Record<string, ClientSession> = {};
  currentOptions?: TxOptions;

  // Use decorator default if no target specified
  async rollback(target: 'typeorm' | 'mongoose' | 'both' = 'both') {
    if (target === 'both' && this.currentOptions) {
      // rollback all according to decorator
      if (this.currentOptions.typeorm) {
        for (const qr of Object.values(this.typeormRunners)) {
          if (qr.isTransactionActive) await qr.rollbackTransaction();
          await qr.release();
        }
        this.typeormRunners = {};
      }
      if (this.currentOptions.mongoose) {
        for (const session of Object.values(this.mongooseSessions)) {
          await session.abortTransaction();
          session.endSession();
        }
        this.mongooseSessions = {};
      }
      return;
    }

    if (target === 'typeorm') {
      for (const qr of Object.values(this.typeormRunners)) {
        if (qr.isTransactionActive) await qr.rollbackTransaction();
        await qr.release();
      }
      this.typeormRunners = {};
    }

    if (target === 'mongoose') {
      for (const session of Object.values(this.mongooseSessions)) {
        await session.abortTransaction();
        session.endSession();
      }
      this.mongooseSessions = {};
    }
  }

  async commit(target: 'typeorm' | 'mongoose' | 'both' = 'both') {
    if (target === 'both' && this.currentOptions) {
      if (this.currentOptions.typeorm) {
        for (const qr of Object.values(this.typeormRunners)) {
          if (qr.isTransactionActive) await qr.commitTransaction();
          await qr.release();
        }
        this.typeormRunners = {};
      }
      if (this.currentOptions.mongoose) {
        for (const session of Object.values(this.mongooseSessions)) {
          await session.commitTransaction();
          session.endSession();
        }
        this.mongooseSessions = {};
      }
      return;
    }

    if (target === 'typeorm') {
      for (const qr of Object.values(this.typeormRunners)) {
        if (qr.isTransactionActive) await qr.commitTransaction();
        await qr.release();
      }
      this.typeormRunners = {};
    }

    if (target === 'mongoose') {
      for (const session of Object.values(this.mongooseSessions)) {
        await session.commitTransaction();
        session.endSession();
      }
      this.mongooseSessions = {};
    }
  }
}
