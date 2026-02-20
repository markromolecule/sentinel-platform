import { DbClient } from '@/lib/create-db-client'

export type GetDepartmentsDataArgs = {
  dbClient: DbClient;
}

export async function getDepartmentsData({ dbClient }: GetDepartmentsDataArgs) {
  const departments = await dbClient
    .selectFrom('departments')
    .selectAll()
    .orderBy('department_name', 'asc')
    .execute()

  return departments
}

export type GetDepartmentsDataResponse = Awaited<ReturnType<typeof getDepartmentsData>>
