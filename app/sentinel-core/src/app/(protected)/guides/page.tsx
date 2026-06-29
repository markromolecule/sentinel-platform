'use client';

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
    PageHeader,
    Separator,
} from '@sentinel/ui';
import { BookOpen, Users, FileText, UserCheck, School } from 'lucide-react';

/**
 * ProctorGuidePage renders the step-by-step instructions for managing offerings,
 * classrooms, students, exams, assignments, and delegating roles.
 */
export default function ProctorGuidePage() {
    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title="Instructor Guide"
                description="Step-by-step instructions for setting up subjects, creating classrooms, enrolling students, and managing examinations."
            />

            <Separator />

            <Accordion type="single" collapsible className="w-full space-y-4">
                {/* 1. Requesting an Offered Subject */}
                <AccordionItem value="item-1" className="rounded-lg border px-4">
                    <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                <BookOpen className="h-5 w-5" />
                            </div>
                            <span className="text-lg font-semibold">
                                1. Requesting an Offered Subject
                            </span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground space-y-3 pt-4 pb-6">
                        <p>
                            Before you can build classrooms or enroll students, you must request one
                            of the offered subjects prepared by the administrator for the current
                            academic term.
                        </p>
                        <ol className="ml-2 list-inside list-decimal space-y-2">
                            <li>
                                Navigate to <strong>Subject Management</strong> in the sidebar.
                            </li>
                            <li>
                                Click the <strong>Request Offered Subject</strong> button.
                            </li>
                            <li>
                                Select the subject offering for the correct academic year and
                                semester.
                            </li>
                            <li>
                                Choose the target department, course, year level, and matching
                                sections.
                            </li>
                            <li>Submit your request and wait for administrator approval.</li>
                        </ol>
                    </AccordionContent>
                </AccordionItem>

                {/* 2. Creating a Classroom */}
                <AccordionItem value="item-2" className="rounded-lg border px-4">
                    <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-indigo-100 p-2 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                <School className="h-5 w-5" />
                            </div>
                            <span className="text-lg font-semibold">2. Creating a Classroom</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground space-y-3 pt-4 pb-6">
                        <p>
                            Once the administrator approves your requested subject offering, you
                            must initialize a Classroom (class group) to serve as your workspace.
                        </p>
                        <ol className="ml-2 list-inside list-decimal space-y-2">
                            <li>
                                Go to <strong>Classrooms</strong> in the sidebar.
                            </li>
                            <li>
                                Click the <strong>Create Classroom</strong> button in the top right
                                header.
                            </li>
                            <li>Select your approved offered subject from the dropdown menu.</li>
                            <li>
                                Verify the section and term details, then save to finalize the
                                Classroom.
                            </li>
                        </ol>
                    </AccordionContent>
                </AccordionItem>

                {/* 3. Enrolling Students */}
                <AccordionItem value="item-3" className="rounded-lg border px-4">
                    <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-green-100 p-2 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                                <Users className="h-5 w-5" />
                            </div>
                            <span className="text-lg font-semibold">3. Enrolling Students</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground space-y-3 pt-4 pb-6">
                        <p>
                            Add students to your created Classroom rosters using manual entry or
                            bulk file imports.
                        </p>
                        <ol className="ml-2 list-inside list-decimal space-y-2">
                            <li>
                                Go to <strong>Student Management</strong> in the sidebar.
                            </li>
                            <li>
                                Click the <strong>Add Students</strong> button in the header.
                            </li>
                            <li>Select the target Classroom (class group) for enrollment.</li>
                            <li>
                                <strong>Manual Entry:</strong> Type the student email, name, and
                                student number.
                            </li>
                            <li>
                                <strong>Import File:</strong> Upload a student roster list
                                (CSV/Excel) mapping to the required format.
                            </li>
                            <li>Verify and execute the enrollment.</li>
                        </ol>
                    </AccordionContent>
                </AccordionItem>

                {/* 4. Creating an Exam */}
                <AccordionItem value="item-4" className="rounded-lg border px-4">
                    <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-amber-100 p-2 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                                <FileText className="h-5 w-5" />
                            </div>
                            <span className="text-lg font-semibold">4. Creating an Exam</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground space-y-3 pt-4 pb-6">
                        <p>Configure examination parameters, questions, and scheduling policies.</p>
                        <ol className="ml-2 list-inside list-decimal space-y-2">
                            <li>
                                Navigate to <strong>Exam Management</strong>.
                            </li>
                            <li>
                                Click the <strong>Create Exam</strong> button.
                            </li>
                            <li>Enter exam meta details (Title, Duration, Schedule window).</li>
                            <li>
                                Build out your questions (Multiple Choice, Essay, etc.) and save.
                            </li>
                            <li>
                                Adjust configuration settings (strict browser locking, question
                                order shuffling).
                            </li>
                        </ol>
                    </AccordionContent>
                </AccordionItem>

                {/* 5. Assigning the Exam */}
                <AccordionItem value="item-5" className="rounded-lg border px-4">
                    <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-purple-100 p-2 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                                <UserCheck className="h-5 w-5" />
                            </div>
                            <span className="text-lg font-semibold">5. Assigning the Exam</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground space-y-3 pt-4 pb-6">
                        <p>
                            Link your created exam to specific Classroom sections or student
                            cohorts.
                        </p>
                        <ol className="ml-2 list-inside list-decimal space-y-2">
                            <li>
                                In <strong>Exam Management</strong>, select the desired exam.
                            </li>
                            <li>
                                Click <strong>Assign</strong> or navigate to the Assignments tab.
                            </li>
                            <li>
                                Choose the target Classroom(s) or individual student selections.
                            </li>
                            <li>
                                Confirm and save the assignment to make the exam active for
                                scheduled students.
                            </li>
                        </ol>
                    </AccordionContent>
                </AccordionItem>

                {/* 6. Assigning Another Instructor (Optional) */}
                <AccordionItem
                    value="item-6"
                    className="rounded-lg border px-4"
                    style={{ borderBottomWidth: '1px' }}
                >
                    <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-rose-100 p-2 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
                                <UserCheck className="h-5 w-5" />
                            </div>
                            <span className="text-lg font-semibold">
                                6. Assigning Another Instructor (Optional)
                            </span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground space-y-3 pt-4 pb-6">
                        <p>
                            Delegate classroom instruction, invigilation, or grading roles to
                            another faculty member.
                        </p>
                        <ol className="ml-2 list-inside list-decimal space-y-2">
                            <li>Navigate to your target Classroom roster.</li>
                            <li>
                                Select the delegate instructor option or classroom role management.
                            </li>
                            <li>Search for the faculty member by name or email.</li>
                            <li>Assign them the appropriate instructor privileges.</li>
                        </ol>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}
