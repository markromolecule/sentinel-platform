import { prisma } from '../../lib/db';

export type DeleteDepartmentDataArgs = {
    id: string;
};

export async function deleteDepartmentData({ id }: DeleteDepartmentDataArgs) {
    const deletedRecord = await prisma.departments.delete({
        where: { department_id: id },
    });

    return deletedRecord;
}

export type DeleteDepartmentDataResponse = Awaited<ReturnType<typeof deleteDepartmentData>>;
