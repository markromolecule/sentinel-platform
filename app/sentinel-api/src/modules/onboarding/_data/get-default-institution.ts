import { DbClient } from '@/lib/create-db-client'

export type GetDefaultInstitutionDataArgs = {
  dbClient: DbClient;
}

export async function getDefaultInstitutionData({ dbClient }: GetDefaultInstitutionDataArgs) {
  const institution = await dbClient
    .selectFrom('institutions')
    .selectAll()
    .where('name', '=', 'NU DASMARIÑAS')
    .executeTakeFirst()

  return institution
}

export type GetDefaultInstitutionDataResponse = Awaited<ReturnType<typeof getDefaultInstitutionData>>
