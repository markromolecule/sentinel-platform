import { SubjectStoreState } from "@/app/(protected)/admin/subjects/_types";

// Default state constant
export const DEFAULT_SUBJECT_STORE_STATE: SubjectStoreState = {
    subjects: [
        {
            id: "1",
            title: "Data Structures",
            code: "CS201",
            section: "A",
            department: "SECA",
            createdAt: new Date().toISOString(),
            createdBy: "Maria Santos",
        },
        {
            id: "2",
            title: "Programming Fundamentals",
            code: "CS101",
            section: "B",
            department: "SECA",
            createdAt: new Date().toISOString(),
            createdBy: "Juan Dela Cruz",
        },
        {
            id: "3",
            title: "Web Development",
            code: "IT305",
            section: "A",
            department: "SECA",
            createdAt: new Date().toISOString(),
            createdBy: "Maria Santos",
        },
    ],
    masterSubjects: [
        { 
            code: "CS101", 
            title: "Introduction to Computing", 
            department: "College of Computer Studies",
            yearLevel: "1st Year",
            sections: ["BSCS-1A", "BSCS-1B"]
        },
        { 
            code: "CS102", 
            title: "Computer Programming 1", 
            department: "College of Computer Studies",
            yearLevel: "1st Year",
            sections: ["BSCS-1A", "BSCS-1B"]
        },
        { 
            code: "CS201", 
            title: "Data Structures and Algorithms", 
            department: "College of Computer Studies",
            yearLevel: "2nd Year",
            sections: ["BSCS-2A"]
        },
        { 
            code: "IT101", 
            title: "IT Fundamentals", 
            department: "College of Computer Studies",
            yearLevel: "1st Year",
            sections: ["BSIT-1A"]
        },
        { 
            code: "MAT101", 
            title: "Calculus I", 
            department: "Mathematics",
            yearLevel: "1st Year",
            sections: ["BSCS-1A", "BSIT-1A", "BSCE-1A"]
        },
        { 
            code: "MAT201", 
            title: "Advanced Calculus", 
            department: "Mathematics",
            yearLevel: "2nd Year",
            sections: ["BSCE-2A"]
        },
        { 
            code: "GE101", 
            title: "Understanding the Self", 
            department: "General Education",
            yearLevel: "1st Year",
            sections: ["BSCS-1A", "BSIT-1A", "BSN-1A"]
        },
    ],
};