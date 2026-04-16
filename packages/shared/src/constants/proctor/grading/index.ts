import { GradingExam, GradingStudent } from '../../../types/proctor/grading';

export const MOCK_GRADING_EXAMS: GradingExam[] = [
    {
        id: 'exam-001',
        title: 'Midterm Examination',
        subject: 'Introduction to Computer Science',
        date: '2023-10-15',
        totalStudents: 45,
        gradedCount: 10,
        status: 'IN_PROGRESS',
    },
    {
        id: 'exam-002',
        title: 'Final Project Defense',
        subject: 'Software Engineering',
        date: '2023-12-01',
        totalStudents: 30,
        gradedCount: 0,
        status: 'PENDING',
    },
    {
        id: 'exam-003',
        title: 'Quiz 1',
        subject: 'Data Structures',
        date: '2023-09-20',
        totalStudents: 50,
        gradedCount: 50,
        status: 'COMPLETED',
    },
];

export const MOCK_GRADING_STUDENTS: GradingStudent[] = [
    {
        id: 'student-001',
        name: 'Alice Johnson',
        studentId: '2023-0001',
        submissionDate: '2023-10-15T10:30:00',
        score: 85,
        maxScore: 100,
        status: 'GRADED',
        feedback: 'Good job!',
    },
    {
        id: 'student-002',
        name: 'Bob Smith',
        studentId: '2023-0002',
        submissionDate: '2023-10-15T11:00:00',
        maxScore: 100,
        status: 'SUBMITTED',
    },
    {
        id: 'student-003',
        name: 'Charlie Brown',
        studentId: '2023-0003',
        maxScore: 100,
        status: 'NOT_SUBMITTED',
    },
    {
        id: 'student-004',
        name: 'David Lee',
        studentId: '2023-0004',
        submissionDate: '2023-10-15T10:45:00',
        maxScore: 100,
        status: 'SUBMITTED',
    },
    {
        id: 'student-005',
        name: 'Eva Green',
        studentId: '2023-0005',
        submissionDate: '2023-10-15T10:00:00',
        score: 92,
        maxScore: 100,
        status: 'GRADED',
    },
];
