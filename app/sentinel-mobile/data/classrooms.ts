export interface Classroom {
    id: string;
    subjectCode: string;
    subjectTitle: string;
    sectionName: string;
    instructorName: string;
    term: string;
    schedule?: string;
    room?: string;
    studentsCount?: number;
}

export const mockClassrooms: Classroom[] = [
    {
        id: '1',
        subjectCode: 'CS101',
        subjectTitle: 'Introduction to Computer Science',
        sectionName: 'BSIT-1A',
        instructorName: 'Dr. Alan Turing',
        term: '1st Semester 2023-2024',
        schedule: 'MWF 8:00 AM - 9:30 AM',
        room: 'Lab 1',
        studentsCount: 35,
    },
    {
        id: '2',
        subjectCode: 'MATH202',
        subjectTitle: 'Advanced Calculus',
        sectionName: 'BSIT-1A',
        instructorName: 'Dr. Isaac Newton',
        term: '1st Semester 2023-2024',
        schedule: 'TTH 10:00 AM - 11:30 AM',
        room: 'Room 302',
        studentsCount: 40,
    },
    {
        id: '3',
        subjectCode: 'ENG101',
        subjectTitle: 'English Communication',
        sectionName: 'BSIT-1A',
        instructorName: 'Prof. William Shakespeare',
        term: '1st Semester 2023-2024',
        schedule: 'MWF 1:00 PM - 2:00 PM',
        room: 'Room 101',
        studentsCount: 30,
    },
    {
        id: '4',
        subjectCode: 'PHY101',
        subjectTitle: 'General Physics',
        sectionName: 'BSIT-1A',
        instructorName: 'Dr. Albert Einstein',
        term: '1st Semester 2023-2024',
        schedule: 'TTH 2:00 PM - 3:30 PM',
        room: 'Lab 2',
        studentsCount: 25,
    },
];
