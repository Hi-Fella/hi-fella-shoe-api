import {
  Repository,
  ObjectLiteral,
  EntityManager,
  EntityTarget,
} from 'typeorm';
import { getEntityManager } from '@/common/contexts/transaction.context';

export class BaseRepository<T extends ObjectLiteral> extends Repository<T> {
  constructor(target: EntityTarget<T>, manager: EntityManager) {
    super(target, manager);

    // Keep a reference to the default (non-transactional) manager
    const defaultManager = manager;

    // Dynamically redefine the 'manager' property on this instance
    Object.defineProperty(this, 'manager', {
      configurable: true,
      enumerable: true,
      get: () => {
        // 1. Check if we are inside a @Transactional() block (ALS)
        const transactionManager = getEntityManager();

        // 2. Return the transaction manager if it exists, otherwise the default one
        return transactionManager || defaultManager;
      },
    });
  }
}
