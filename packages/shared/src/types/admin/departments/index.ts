import { Department } from '../../index';

export type DepartmentStoreState = {
    departments: Department[];
};

export type DepartmentInput = {
    name: string;
    code?: string;
};
