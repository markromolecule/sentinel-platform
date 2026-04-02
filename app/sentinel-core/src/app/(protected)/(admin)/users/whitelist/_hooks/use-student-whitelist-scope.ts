"use client";

import { useUserQuery } from "@sentinel/hooks";
import { useUser } from "@/hooks/use-user";

export function useStudentWhitelistScope() {
    const { data: authUser } = useUser();
    const { data: currentProfile } = useUserQuery(authUser?.id || "");

    const isSuperadmin = authUser?.role === "superadmin";

    return {
        authUser,
        currentProfile,
        isSuperadmin,
        lockedInstitutionId: isSuperadmin ? "" : currentProfile?.institutionId || "",
        lockedInstitutionName: isSuperadmin ? "" : currentProfile?.institution || "",
        lockedDepartmentId: isSuperadmin ? "" : currentProfile?.departmentId || "",
        lockedCourseId: isSuperadmin ? "" : currentProfile?.courseId || "",
    };
}
