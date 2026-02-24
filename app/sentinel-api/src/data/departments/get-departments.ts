import { prisma } from '../../lib/db';

export async function getDepartmentsData() {
    const records = await prisma.departments.findMany({
        orderBy: {
            department_name: 'asc',
        },
    });

    return records;
}

export type GetDepartmentsDataResponse = Awaited<ReturnType<typeof getDepartmentsData>>;
