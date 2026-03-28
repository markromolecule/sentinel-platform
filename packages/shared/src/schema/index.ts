export * from './auth/login-schema';
export * from './auth/register-schema';
export * from './users/user-schema';
export * from './subjects/SubjectSchema';
export * from './announcements/AnnouncementSchema';
export * from './assignments/AssignmentSchema';
export * from './exams/exam-create-schema';
export * from './exams/exam-config-schema';
export * from './exams/builder/question-content-schema';
export * as AdminExamConfigSchema from './exams/exam-config-schema';
export * as ProctorExamConfigSchema from './exams/exam-config-schema';

// Backported specific exports
export { announcementFormSchema } from './admin/announcements/announcement-schema';
export type { AnnouncementFormValues } from './admin/announcements/announcement-schema';

// Courses
export { courseSchema } from './superadmin/courses/course-schema';
export type { CourseFormValues } from './superadmin/courses/course-schema';

// Departments
export { departmentSchema } from './superadmin/departments/department-schema';
export type { DepartmentFormValues } from './superadmin/departments/department-schema';

// Institutions
export { institutionSchema } from './superadmin/institutions/institution-schema';
export type { InstitutionFormValues } from './superadmin/institutions/institution-schema';

// Exam Configs
export { examConfigFormSchema } from './exams/exam-config-schema';
export type { ExamConfigFormValues } from './exams/exam-config-schema';

// Subjects
export { subjectFormSchema } from './admin/subjects/subject-schema';
export type { SubjectFormValues } from './admin/subjects/subject-schema';

// Users
export { userFormSchema, userFormBaseSchema } from './admin/users/user-schema';
export type { UserFormValues } from './admin/users/user-schema';

// Sections
export { sectionSchema } from './admin/sections/section-schema';
export type { SectionFormValues } from './admin/sections/section-schema';

// Assignments
export { assignmentFormSchema } from './assignments/AssignmentSchema';
export type { AssignmentFormValues } from './assignments/AssignmentSchema';

// Auth
export { LoginSchema } from './auth/login-schema';
export type { LoginSchemaType } from './auth/login-schema';
export { RegisterSchema } from './auth/register-schema';
export type { RegisterSchemaType } from './auth/register-schema';

// Onboarding
export { onboardingSchema } from './onboarding/onboarding-schema';
export type { OnboardingSchemaValues } from './onboarding/onboarding-schema';

// Update Password
export * from './auth/update-password-schema';
export { UpdatePasswordSchema } from './auth/update-password-schema';
export type { UpdatePasswordSchemaType } from './auth/update-password-schema';
