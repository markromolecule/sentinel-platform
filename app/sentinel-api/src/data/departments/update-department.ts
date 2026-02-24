import { prisma } from '../../lib/db';
import { Prisma } from '../../../generated/prisma';

export type UpdateDepartmentDataArgs = {
    id: string;
    values: Prisma.departmentsUncheckedUpdateInput;
};

export async function updateDepartmentData({ id, values }: UpdateDepartmentDataArgs) {
    const updatedRecord = await prisma.departments.update({
        where: { department_id: id },
        data: values,
    });

    return updatedRecord;
}

export type UpdateDepartmentDataResponse = Awaited<ReturnType<typeof updateDepartmentData>>;
