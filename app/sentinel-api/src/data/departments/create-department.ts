import { prisma } from '../../lib/db';
import { Prisma } from '../../../generated/prisma';

export type CreateDepartmentDataArgs = {
    values: Prisma.departmentsUncheckedCreateInput;
};

export async function createDepartmentData({ values }: CreateDepartmentDataArgs) {
    const createdRecord = await prisma.departments.create({
        data: {
            ...values,
            created_at: values.created_at || new Date(),
        },
    });

    return createdRecord;
}

export type CreateDepartmentDataResponse = Awaited<ReturnType<typeof createDepartmentData>>;
