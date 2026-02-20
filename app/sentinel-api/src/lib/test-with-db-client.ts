import { dbClient } from './create-db-client'
import { Transaction } from 'kysely'
import { DB } from './types'
import { test } from 'vitest'

export type DbClient = Transaction<DB>

export const testWithDbClient = test.extend<{ dbClient: DbClient }>({
  dbClient: async ({}, use) => {
    // Start a transaction
    await dbClient.transaction().execute(async (trx) => {
      try {
        // Provide the transaction to the test
        await use(trx)
      } finally {
        // Roll back the transaction after the test completes
        // This throw is caught by Kysely and triggers a ROLLBACK
        throw new Error('ROLLBACK_FOR_TESTING')
      }
    }).catch((e) => {
      // Ignore the expected rollback error
      if (e.message !== 'ROLLBACK_FOR_TESTING') {
        throw e
      }
    })
  }
})
