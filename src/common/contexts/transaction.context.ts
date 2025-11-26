import { AsyncLocalStorage } from 'async_hooks';
import { EntityManager } from 'typeorm';

// Define the shape of our context
interface TransactionContext {
  manager: EntityManager;
  rollbackOnly: boolean;
}

// Update storage type
export const transactionStorage = new AsyncLocalStorage<TransactionContext>();

// Helper to get manager (for Repositories)
export function getEntityManager(): EntityManager | undefined {
  const store = transactionStorage.getStore();
  return store?.manager;
}

// 👇 NEW: Helper to mark the current transaction for rollback
export function setRollbackOnly() {
  const store = transactionStorage.getStore();
  if (store) {
    store.rollbackOnly = true;
  }
}
