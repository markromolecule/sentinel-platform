# To-Do: Fix SQL GROUP BY Error in Enrollment Requests

Fix the SQL error occurring in the `getEnrollmentRequestsData` function due to missing columns in the `GROUP BY` clause.

- [ ] Update `app/sentinel-api/src/modules/enrollments/data/get-enrollment-requests.ts`
    - [ ] Option A: Add `approver_profiles.first_name` and `approver_profiles.last_name` to the `.groupBy()` call.
    - [ ] Option B: Wrap the `CONCAT` of approver names in a `MAX()` aggregate function to satisfy Postgres requirements.
- [ ] Verify the fix by calling the API or observing the server logs for the `42803` error.
- [ ] Ensure that other related queries (like `get-enrolled-subjects.ts`) satisfy the same SQL constraints.
