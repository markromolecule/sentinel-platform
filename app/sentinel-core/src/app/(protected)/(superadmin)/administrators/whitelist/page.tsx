"use client";

import { StudentWhitelistManagementView } from "@/app/(protected)/(admin)/users/whitelist/_components/views/student-whitelist-management-view";

export default function SuperadminStudentWhitelistPage() {
    return (
        <StudentWhitelistManagementView
            title="Combined Student Whitelist"
            description="Review and manage whitelist records across institutions, departments, and programs."
            showInstitution
            enableInstitutionFilter
            showReviewTools
        />
    );
}
