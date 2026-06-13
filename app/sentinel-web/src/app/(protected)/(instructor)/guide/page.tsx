'use client';

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
    PageHeader,
    Separator,
} from '@sentinel/ui';
import { BookOpen, Users, FileText, UserCheck } from 'lucide-react';
import { ESSAY_RUBRIC_CRITERIA } from '@sentinel/shared';

export default function ProctorGuidePage() {
    return (
        <div className="mx-auto flex max-w-4xl flex-col gap-6 p-4 md:p-6">
            <PageHeader
                title="Instructor Guide"
                description="Step-by-step instructions for managing exams, students, and instructors."
            />

            <Separator />

            <Accordion type="single" collapsible className="w-full space-y-4">
                {/* 1. Requesting an Offered Subject */}
                <AccordionItem value="item-1" className="rounded-lg border px-4">
                    <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-blue-100 p-2 text-blue-600">
                                <BookOpen className="h-5 w-5" />
                            </div>
                            <span className="text-lg font-semibold">
                                1. Requesting an Offered Subject
                            </span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground space-y-3 pt-4 pb-6">
                        <p>
                            Before you can enroll students or create exams, you need to request one
                            of the offered subjects prepared by the admin for the current term.
                        </p>
                        <ol className="ml-2 list-inside list-decimal space-y-2">
                            <li>
                                Navigate to <strong>Subject Management</strong> in the sidebar.
                            </li>
                            <li>
                                Click the <strong>Request Offered Subject</strong> button.
                            </li>
                            <li>
                                Select the offered subject for the correct academic year and
                                semester.
                            </li>
                            <li>
                                Choose the matching department, course, year level, and sections.
                            </li>
                            <li>Submit your request and wait for admin approval.</li>
                        </ol>
                    </AccordionContent>
                </AccordionItem>

                {/* 2. Adding Students */}
                <AccordionItem value="item-2" className="rounded-lg border px-4">
                    <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-green-100 p-2 text-green-600">
                                <Users className="h-5 w-5" />
                            </div>
                            <span className="text-lg font-semibold">2. Adding Students</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground space-y-3 pt-4 pb-6">
                        <p>You can add students manually or invoke a bulk import via CSV/Excel.</p>
                        <ol className="ml-2 list-inside list-decimal space-y-2">
                            <li>
                                Go to <strong>Student Management</strong>.
                            </li>
                            <li>
                                Click <strong>Add Students</strong>.
                            </li>
                            <li>
                                <strong>Manual Entry:</strong> Fill out the form for individual
                                students.
                            </li>
                            <li>
                                <strong>Import File:</strong> Switch to the Import File tab and
                                upload your student list (CSV/Excel).
                            </li>
                        </ol>
                    </AccordionContent>
                </AccordionItem>

                {/* 3. Creating an Exam */}
                <AccordionItem value="item-3" className="rounded-lg border px-4">
                    <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-amber-100 p-2 text-amber-600">
                                <FileText className="h-5 w-5" />
                            </div>
                            <span className="text-lg font-semibold">3. Creating an Exam</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground space-y-3 pt-4 pb-6">
                        <p>Set up your examination details, questions, and policies.</p>
                        <ol className="ml-2 list-inside list-decimal space-y-2">
                            <li>
                                Go to <strong>Exam Management</strong>.
                            </li>
                            <li>
                                Click <strong>Create Exam</strong>.
                            </li>
                            <li>Enter exam details (Title, Duration, Schedule).</li>
                            <li>Add questions to the exam.</li>
                            <li>Configure settings (randomization, strict mode, etc.) and Save.</li>
                        </ol>
                    </AccordionContent>
                </AccordionItem>

                {/* 4. Assigning to Students */}
                <AccordionItem value="item-4" className="rounded-lg border px-4">
                    <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-purple-100 p-2 text-purple-600">
                                <UserCheck className="h-5 w-5" />
                            </div>
                            <span className="text-lg font-semibold">4. Assigning to Students</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground space-y-3 pt-4 pb-6">
                        <p>Link your created exam to specific sections or students.</p>
                        <ol className="ml-2 list-inside list-decimal space-y-2">
                            <li>
                                In <strong>Exam Management</strong>, select your exam.
                            </li>
                            <li>
                                Click <strong>Assign</strong> or go to the Assignments tab.
                            </li>
                            <li>Select the target sections or individual students.</li>
                            <li>Confirm assignment to make the exam available to them.</li>
                        </ol>
                    </AccordionContent>
                </AccordionItem>

                {/* 5. Assigning Instructor */}
                <AccordionItem value="item-5" className="rounded-lg border px-4">
                    <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-rose-100 p-2 text-rose-600">
                                <UserCheck className="h-5 w-5" />
                            </div>
                            <span className="text-lg font-semibold">
                                5. Assigning Another Instructor
                            </span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground space-y-3 pt-4 pb-6">
                        <p>Delegate invigilation duties to other faculty members.</p>
                        <ol className="ml-2 list-inside list-decimal space-y-2">
                            <li>
                                Navigate to <strong>Instructor Assignment</strong>.
                            </li>
                            <li>Select the exam you wish to delegate.</li>
                            <li>Search for and select the faculty member/instructor.</li>
                            <li>
                                Assign them to specific sections or the entire exam. Use this if you
                                are the creator but want others to facilitate.
                            </li>
                        </ol>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            <div className="bg-card mt-4 space-y-4 rounded-lg border p-6 shadow-sm">
                <div className="space-y-1">
                    <h2 className="text-xl font-semibold tracking-tight">
                        Standardized Essay Rubric
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        This rubric is automatically applied to all essay-type questions to ensure
                        consistent grading standards.
                    </p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm">
                        <thead>
                            <tr className="bg-muted/50 border-b">
                                <th className="text-muted-foreground w-1/4 p-3 font-medium">
                                    Criterion
                                </th>
                                <th className="text-muted-foreground w-12 p-3 text-center font-medium">
                                    Weight
                                </th>
                                <th className="text-muted-foreground p-3 font-medium">
                                    Description
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {ESSAY_RUBRIC_CRITERIA.map((criterion) => (
                                <tr key={criterion.key} className="hover:bg-muted/30">
                                    <td className="p-3 align-top font-semibold">
                                        {criterion.name}
                                    </td>
                                    <td className="p-3 text-center align-top font-mono">
                                        {criterion.weight * 100}%
                                    </td>
                                    <td className="text-muted-foreground space-y-2 p-3 align-top">
                                        <p className="text-foreground font-medium">
                                            {criterion.description}
                                        </p>
                                        <div className="grid grid-cols-1 gap-2 pt-2 text-xs md:grid-cols-5">
                                            {[4, 3, 2, 1, 0].map((level) => (
                                                <div
                                                    key={level}
                                                    className="bg-muted/40 flex flex-col gap-1 rounded p-2"
                                                >
                                                    <span className="text-foreground font-bold">
                                                        Score {level}
                                                    </span>
                                                    <span className="leading-snug">
                                                        {criterion.levels[level]}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
