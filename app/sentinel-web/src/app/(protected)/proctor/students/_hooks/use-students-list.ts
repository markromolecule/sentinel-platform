import { useState } from "react";
import { MOCK_STUDENTS } from "@/app/(protected)/proctor/_constants";

export function useStudentsList() {
    const [isEnrollmentOpen, setIsEnrollmentOpen] = useState(false);
    
    // In a real app, useQuery to fetch students
    const students = MOCK_STUDENTS;

    return {
        students,
        isEnrollmentOpen,
        setIsEnrollmentOpen,
    };
}
