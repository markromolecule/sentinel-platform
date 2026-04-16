# Project Checklist: Global Search Query Implementation

Implement search-query functionality from backend to frontend for departments, institutions, sections, and subjects, following the pattern of the courses module.

- [x] search-query implementation on departments
- [x] search-query implementation on institutions
- [x] search-query implementation on sections
- [x] search-query implementation on subjects

## Backend (sentinel-api)

### 1. Departments Module

- [x] Update `departments.dto.ts` to include `search` in `getDepartmentsSchema.request.query`.
- [x] Update `departments.service.ts` `getDepartments` method to accept `search`.
- [x] Update `data/get-departments.ts` to implement `ilike` filter for `department_name` and `department_code`.

### 2. Institutions Module

- [x] Update `institution.dto.ts` to include `search` in `getInstitutionsSchema.request.query`.
- [x] Update `institution.service.ts` `getInstitutions` method to accept `search`.
- [x] Update `data/get-institutions.ts` to implement `ilike` filter for `name` and `code`.

### 3. Sections Module

- [x] Update `sections.dto.ts` to include `search` in `getSectionsSchema.request.query`.
- [x] Update `sections.service.ts` `getSections` method to accept `search`.
- [x] Update `data/get-sections.ts` to implement `ilike` filter for `section_name`.

### 4. Subjects Module

- [x] Update `subject.dto.ts` to include `search` in `getSubjectsSchema.request.query`.
- [x] Update `subject.service.ts` `getSubjects` method to accept `search`.
- [x] Update `data/get-subjects.ts` to implement `ilike` filter for `subject_title` and `subject_code`.

## Frontend (sentinel-core)

### 1. General Components

- [x] Ensure `useDebounce` hook is used effectively.

### 2. Departments Page

- [x] Update `app/(protected)/(superadmin)/departments/page.tsx` to use `PageHeader`.
- [x] Implement debounced search state.
- [x] Pass searchTerm and onSearchChange to `DepartmentList`.
- [x] Update `DepartmentList` to use `DataTable` search props.

### 3. Institutions Page

- [x] Update `app/(protected)/(superadmin)/institutions/page.tsx` to use `PageHeader`.
- [x] Implement debounced search state.
- [x] Pass searchTerm and onSearchChange to `InstitutionsList`.
- [x] Update `InstitutionsList` to use `DataTable` search props.

### 4. Sections Page

- [x] Update `app/(protected)/(admin)/sections/page.tsx` to use `PageHeader`.
- [x] Implement debounced search state.
- [x] Pass searchTerm and onSearchChange to `SectionList`.
- [x] Update `SectionList` to use `DataTable` search props.

### 5. Subjects Page

- [x] Update `app/(protected)/(admin)/subjects/page.tsx` to use `PageHeader`.
- [x] Implement debounced search state.
- [x] Pass searchTerm and onSearchChange to `SubjectList`.
- [x] Update `SubjectList` to use `DataTable` search props.
