/**
 * CRUD barrel — re-exports all institution CRUD operations from their
 * individual service files. Import directly from the specific files in new code.
 *
 *  - get-institutions.service.ts    → getInstitutions, getInstitutionById
 *  - create-institution.service.ts  → createInstitution
 *  - update-institution.service.ts  → updateInstitution
 *  - delete-institution.service.ts  → deleteInstitution
 *  - delete-institutions.service.ts → deleteInstitutions
 */

export { getInstitutions, getInstitutionById } from './get-institutions.service';
export { createInstitution } from './create-institution.service';
export { updateInstitution } from './update-institution.service';
export { deleteInstitution } from './delete-institution.service';
export { deleteInstitutions } from './delete-institutions.service';
