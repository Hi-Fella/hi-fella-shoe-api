import { DataSource } from 'typeorm';
import { transactionStorage } from '@/common/contexts/transaction.context';

// Allow passing the connection name (default to 'default' or 'pg')
export function Transactional(connectionName: string = 'pg') {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      let selectedDataSource: DataSource | undefined;

      // 🔍 SCANNING LOGIC
      // Iterate over every property in the Service (pgConnection, mysqlConnection, etc.)
      for (const key of Object.keys(this)) {
        const value = this[key];

        // 1. Check if it looks like a TypeORM DataSource (Duck Typing)
        if (
          value &&
          typeof value.createQueryRunner === 'function' &&
          value.name
        ) {
          // 2. Check if the internal name matches what we asked for
          if (value.name === connectionName) {
            selectedDataSource = value;
            break; // Found it!
          }
        }
      }

      // If not found, throw a helpful error
      if (!selectedDataSource) {
        throw new Error(
          `@Transactional('${connectionName}') failed. \n` +
            `Could not find a DataSource property on ${this.constructor.name} with name '${connectionName}'.\n` +
            `Ensure you injected it: constructor(@InjectDataSource('${connectionName}') private readonly db: DataSource) {}`,
        );
      }

      // 3. Standard Transaction Logic
      const queryRunner = selectedDataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Create the context object
        const context = {
          manager: queryRunner.manager,
          rollbackOnly: false, // Default is false
        };

        // Run the method inside the context
        return await transactionStorage.run(context, async () => {
          const result = await originalMethod.apply(this, args);

          // 👇 CHECK THE FLAG
          if (context.rollbackOnly) {
            // User requested rollback, but returned a value successfully
            await queryRunner.rollbackTransaction();
          } else {
            // Standard success
            await queryRunner.commitTransaction();
          }

          return result;
        });
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }
    };

    return descriptor;
  };
}
