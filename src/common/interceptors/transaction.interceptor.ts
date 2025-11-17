import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { Connection as MongooseConnection } from 'mongoose';
import { TransactionContext } from '@/common/contexts/transaction.context';
import { TxOptions } from '@/common/decorators/transactional.decorator';

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private dataSource: DataSource, // default DataSource manager
    private mongo: MongooseConnection, // default mongo connection
    private tx: TransactionContext,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const handler = context.getHandler();
    const opts: TxOptions = this.reflector.get<TxOptions>(
      'tx:options',
      handler,
    );

    // If no @Transactional() on this method, just proceed
    if (!opts) return next.handle();

    const run = async () => {
      this.tx.currentOptions = opts;

      // --- TypeORM transactions ---
      if (opts.typeorm?.length) {
        for (const alias of opts.typeorm) {
          // Get connection by alias, fallback to default
          const conn =
            alias === 'default'
              ? this.dataSource
              : this.dataSource.manager.connection;
          const qr = conn.createQueryRunner();
          await qr.connect();
          await qr.startTransaction();
          this.tx.typeormRunners[alias] = qr;
        }
      }

      // --- Mongoose transactions ---
      if (opts.mongoose?.length) {
        for (const connName of opts.mongoose) {
          const conn =
            connName === 'default' ? this.mongo : this.mongo.useDb(connName);
          const session = await conn.startSession();
          session.startTransaction();
          this.tx.mongooseSessions[connName] = session;
        }
      }

      try {
        // Execute the route handler
        const result = await next.handle().toPromise();

        // Commit all according to decorator
        await this.tx.commit();

        return result;
      } catch (err) {
        // Rollback all according to decorator
        await this.tx.rollback();
        throw err;
      }
    };

    return from(run());
  }
}
