"use client";

import {
     Accordion,
     AccordionContent,
     AccordionItem,
     AccordionTrigger,
} from "@sentinel/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@sentinel/ui";
import { BookOpen, Users, FileText, UserCheck } from "lucide-react";

export default function ProctorGuidePage() {
     return (
          <div className="space-y-8 p-4 md:p-8 max-w-4xl mx-auto">
               <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold text-foreground">Proctor Guide</h1>
                    <p className="text-muted-foreground">
                         Step-by-step instructions for managing exams, students, and proctors.
                    </p>
               </div>

               <Accordion type="single" collapsible className="w-full space-y-4">
                    {/* 1. Adding a Subject */}
                    <AccordionItem value="item-1" className="border rounded-lg px-4">
                         <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center gap-3">
                                   <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                                        <BookOpen className="w-5 h-5" />
                                   </div>
                                   <span className="text-lg font-semibold">1. Adding a Subject</span>
                              </div>
                         </AccordionTrigger>
                         <AccordionContent className="pt-4 pb-6 text-muted-foreground space-y-3">
                              <p>
                                   Before you can enroll students or create exams, you must create a subject container.
                              </p>
                              <ol className="list-decimal list-inside space-y-2 ml-2">
                                   <li>Navigate to <strong>Subject Management</strong> in the sidebar.</li>
                                   <li>Click the <strong>"Add Subject"</strong> button.</li>
                                   <li>Fill in the subject details (e.g., Code, Description, Schedule).</li>
                                   <li>Save to create the subject.</li>
                              </ol>
                         </AccordionContent>
                    </AccordionItem>

                    {/* 2. Adding Students */}
                    <AccordionItem value="item-2" className="border rounded-lg px-4">
                         <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center gap-3">
                                   <div className="p-2 bg-green-100 rounded-full text-green-600">
                                        <Users className="w-5 h-5" />
                                   </div>
                                   <span className="text-lg font-semibold">2. Adding Students</span>
                              </div>
                         </AccordionTrigger>
                         <AccordionContent className="pt-4 pb-6 text-muted-foreground space-y-3">
                              <p>
                                   You can add students manually or invoke a bulk import via CSV/Excel.
                              </p>
                              <ol className="list-decimal list-inside space-y-2 ml-2">
                                   <li>Go to <strong>Student Management</strong>.</li>
                                   <li>Click <strong>"Add Students"</strong>.</li>
                                   <li>
                                        <strong>Manual Entry:</strong> Fill out the form for individual students.
                                   </li>
                                   <li>
                                        <strong>Import File:</strong> Switch to the "Import File" tab and upload your student list (CSV/Excel).
                                   </li>
                              </ol>
                         </AccordionContent>
                    </AccordionItem>

                    {/* 3. Creating an Exam */}
                    <AccordionItem value="item-3" className="border rounded-lg px-4">
                         <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center gap-3">
                                   <div className="p-2 bg-amber-100 rounded-full text-amber-600">
                                        <FileText className="w-5 h-5" />
                                   </div>
                                   <span className="text-lg font-semibold">3. Creating an Exam</span>
                              </div>
                         </AccordionTrigger>
                         <AccordionContent className="pt-4 pb-6 text-muted-foreground space-y-3">
                              <p>
                                   Set up your examination details, questions, and policies.
                              </p>
                              <ol className="list-decimal list-inside space-y-2 ml-2">
                                   <li>Go to <strong>Exam Management</strong>.</li>
                                   <li>Click <strong>"Create Exam"</strong>.</li>
                                   <li>Enter exam details (Title, Duration, Schedule).</li>
                                   <li>Add questions to the exam.</li>
                                   <li> Configure settings (randomization, strict mode, etc.) and Save.</li>
                              </ol>
                         </AccordionContent>
                    </AccordionItem>

                    {/* 4. Assigning to Students */}
                    <AccordionItem value="item-4" className="border rounded-lg px-4">
                         <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center gap-3">
                                   <div className="p-2 bg-purple-100 rounded-full text-purple-600">
                                        <UserCheck className="w-5 h-5" />
                                   </div>
                                   <span className="text-lg font-semibold">4. Assigning to Students</span>
                              </div>
                         </AccordionTrigger>
                         <AccordionContent className="pt-4 pb-6 text-muted-foreground space-y-3">
                              <p>
                                   Link your created exam to specific sections or students.
                              </p>
                              <ol className="list-decimal list-inside space-y-2 ml-2">
                                   <li>In <strong>Exam Management</strong>, select your exam.</li>
                                   <li>Click <strong>"Assign"</strong> or go to the "Assignments" tab.</li>
                                   <li>Select the target sections or individual students.</li>
                                   <li>Confirm assignment to make the exam available to them.</li>
                              </ol>
                         </AccordionContent>
                    </AccordionItem>

                    {/* 5. Assigning Proctor */}
                    <AccordionItem value="item-5" className="border rounded-lg px-4">
                         <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center gap-3">
                                   <div className="p-2 bg-rose-100 rounded-full text-rose-600">
                                        <UserCheck className="w-5 h-5" />
                                   </div>
                                   <span className="text-lg font-semibold">5. Assigning Another Proctor</span>
                              </div>
                         </AccordionTrigger>
                         <AccordionContent className="pt-4 pb-6 text-muted-foreground space-y-3">
                              <p>
                                   Delegate invigilation duties to other faculty members.
                              </p>
                              <ol className="list-decimal list-inside space-y-2 ml-2">
                                   <li>Navigate to <strong>Proctor Assignment</strong>.</li>
                                   <li>Select the exam you wish to delegate.</li>
                                   <li>Search for and select the faculty member/proctor.</li>
                                   <li>
                                        Assign them to specific sections or the entire exam. Use this if you are the creator but want others to facilitate.
                                   </li>
                              </ol>
                         </AccordionContent>
                    </AccordionItem>
               </Accordion>
          </div>
     );
}
