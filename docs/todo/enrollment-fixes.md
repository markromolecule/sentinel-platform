# To-Do: Enrollment Enhancements & Fixes

Resolve issues with duplicate feedback, stale data, and missing approver names.

- [ ] Update Backend Data Layer
    - [ ] Modify `enroll-instructor.ts` to return metadata (counts) instead of just IDs.
    - [ ] Update `get-enrolled-subjects.ts` to correctly join `APPROVED` enrollment requests for accurate `approved_by_name`.
- [ ] Update Backend Controller
    - [ ] Modify `enroll-instructor-subject.controller.ts` to format a descriptive feedback message.
- [ ] Update Common Hooks
    - [ ] Update `use-enroll-subject-mutation.ts` to display the response message in a toast.
    - [ ] Add `refetchInterval` to `use-enrolled-subjects-query.ts` and `use-enrollment-requests-query.ts` for real-time feel.
- [ ] Verification
    - [ ] Confirm approver name appears in the Instructor's dashboard.
    - [ ] Confirm "Select All" with duplicate sections gives a clear message.
    - [ ] Confirm data refresh happens automatically after admin approval.
