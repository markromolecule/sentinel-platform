'use client';

import { StudentWhitelistManagementView } from '@/app/(protected)/(admin)/users/whitelist/_components/views/student-whitelist-management-view';

export default function SuperadminStudentWhitelistPage() {
    return (
        <StudentWhitelistManagementView
            title="Student Whitelist"
            description="Review and manage whitelist records for your assigned institution."
        />
    );
}
