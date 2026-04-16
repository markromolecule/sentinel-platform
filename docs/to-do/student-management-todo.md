# Student Management Integration Plan

## Goal (Instructor)

- Ensure to provide a [/to-do-workflow] and follow [/1-3-1-rule] that I need to read and analyze before proceeding with the changes
- Student Management

### Tasks

1. Connect it now to backend, ensure to use mutation that related to the student or create a mutation connect to the backend
2. When the Instructor add a student using manual and import -> it will validate the student if the student is:
    - existing on the course & department
    - claimed the account

If not existing or claimed it will not be enrolled to the instructor but they can try again if the student already claimed the account

## Progress Tracking

- [x] Backend API endpoint for student enrollment
- [x] Instructor student filtering in `getUsers`
- [x] Frontend `useStudentEnrollment` hook integration
- [x] Frontend `useStudentsList` hook integration
- [x] manual entry validation and enrollment
- [x] UI/UX enhancements (Subject/Section selection)
- [ ] Update `useManualEntry` hook to call the backend mutation
- [ ] Update `handleImport` in `StudentEnrollmentDialog` to handle validation failures (e.g., "Student not found in course/department" or "Account not claimed")
- [ ] Replace mock data in `useStudentsList` with a `useQuery` call to fetch enrolled students

### Phase 3: Verification
- [ ] Verify manual student entry with valid/invalid data
- [ ] Verify bulk import with valid/invalid data
- [ ] Ensure students can only be added if they have claimed their account
- [ ] Ensure students can only be added if they belong to the same course/department
