"use client";

import {
     Card,
     CardContent,
     CardDescription,
     CardHeader,
     CardTitle,
} from "@/components/ui/card";
import {
     Tabs,
     TabsContent,
     TabsList,
     TabsTrigger,
} from "@/components/ui/tabs";
import { AlertCircle, Building2, Users, FileText, ShieldAlert, CheckCircle2 } from "lucide-react";

export default function AdminGuidePage() {
     return (
          <div className="flex flex-col gap-6 md:p-6 p-4 max-w-5xl mx-auto">
               <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Administrator Guide</h1>
                    <p className="text-muted-foreground">
                         Comprehensive guide to managing the Sentinel proctoring system.
                    </p>
               </div>

               <Tabs defaultValue="hierarchy" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                         <TabsTrigger value="hierarchy">System Hierarchy</TabsTrigger>
                         <TabsTrigger value="incidents">Incidents & Flagging</TabsTrigger>
                    </TabsList>

                    <TabsContent value="hierarchy" className="space-y-4 mt-4">
                         <Card>
                              <CardHeader>
                                   <CardTitle className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5 text-primary" />
                                        Organizational Structure
                                   </CardTitle>
                                   <CardDescription>
                                        Understanding the relationship between data entities.
                                   </CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-6">
                                   <div className="p-4 bg-muted/50 rounded-lg border border-border">
                                        <h3 className="font-semibold text-lg mb-4 text-center">Data Hierarchy</h3>
                                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
                                             <div className="flex flex-col items-center gap-2 p-3 bg-card rounded shadow-sm w-full md:w-auto border">
                                                  <Building2 className="h-6 w-6 text-blue-500" />
                                                  <span className="font-bold">Institution</span>
                                                  <span className="text-xs text-muted-foreground">NU Dasmariñas</span>
                                             </div>
                                             <div className="hidden md:block w-8 h-0.5 bg-muted-foreground/30"></div>
                                             <div className="flex md:hidden h-8 w-0.5 bg-muted-foreground/30"></div>

                                             <div className="flex flex-col items-center gap-2 p-3 bg-card rounded shadow-sm w-full md:w-auto border">
                                                  <Building2 className="h-6 w-6 text-indigo-500" />
                                                  <span className="font-bold">Department</span>
                                                  <span className="text-xs text-muted-foreground">College of CS</span>
                                             </div>
                                             <div className="hidden md:block w-8 h-0.5 bg-muted-foreground/30"></div>
                                             <div className="flex md:hidden h-8 w-0.5 bg-muted-foreground/30"></div>

                                             <div className="flex flex-col items-center gap-2 p-3 bg-card rounded shadow-sm w-full md:w-auto border">
                                                  <FileText className="h-6 w-6 text-purple-500" />
                                                  <span className="font-bold">Subject</span>
                                                  <span className="text-xs text-muted-foreground">Master Catalog</span>
                                             </div>
                                             <div className="hidden md:block w-8 h-0.5 bg-muted-foreground/30"></div>
                                             <div className="flex md:hidden h-8 w-0.5 bg-muted-foreground/30"></div>

                                             <div className="flex flex-col items-center gap-2 p-3 bg-card rounded shadow-sm w-full md:w-auto border">
                                                  <Users className="h-6 w-6 text-pink-500" />
                                                  <span className="font-bold">Section</span>
                                                  <span className="text-xs text-muted-foreground">Class Block</span>
                                             </div>
                                             <div className="hidden md:block w-8 h-0.5 bg-muted-foreground/30"></div>
                                             <div className="flex md:hidden h-8 w-0.5 bg-muted-foreground/30"></div>

                                             <div className="flex flex-col items-center gap-2 p-3 bg-card rounded shadow-sm w-full md:w-auto border">
                                                  <Users className="h-6 w-6 text-green-500" />
                                                  <span className="font-bold">Student</span>
                                                  <span className="text-xs text-muted-foreground">Enrolled Learner</span>
                                             </div>
                                        </div>
                                   </div>

                                   <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                             <h4 className="font-semibold flex items-center gap-2">
                                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                  Admin Responsibilities
                                             </h4>
                                             <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
                                                  <li>Manage the <strong>Master Subject Catalog</strong>.</li>
                                                  <li>Create and maintain <strong>Sections</strong>.</li>
                                                  <li>Oversee <strong>Departments</strong> and Accounts.</li>
                                             </ul>
                                        </div>
                                        <div className="space-y-2">
                                             <h4 className="font-semibold flex items-center gap-2">
                                                  <CheckCircle2 className="h-4 w-4 text-blue-500" />
                                                  Proctor Responsibilities
                                             </h4>
                                             <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
                                                  <li><strong>Enroll</strong> in Subjects from the Catalog.</li>
                                                  <li>Assign their specific <strong>Section</strong> to the Subject.</li>
                                                  <li>Create Exams for their Enrolled Subjects.</li>
                                             </ul>
                                        </div>
                                   </div>
                              </CardContent>
                         </Card>
                    </TabsContent>

                    <TabsContent value="incidents" className="space-y-4 mt-4">
                         <Card>
                              <CardHeader>
                                   <CardTitle className="flex items-center gap-2">
                                        <ShieldAlert className="h-5 w-5 text-destructive" />
                                        Incident Management & Flagging
                                   </CardTitle>
                                   <CardDescription>
                                        How the system detects and handles academic integrity issues.
                                   </CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-6">
                                   <div className="grid gap-4 md:grid-cols-3">
                                        <div className="border p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
                                             <div className="flex items-center gap-2 font-semibold text-red-700 dark:text-red-400 mb-2">
                                                  <AlertCircle className="h-4 w-4" />
                                                  Severe Flags
                                             </div>
                                             <p className="text-sm text-foreground/80">
                                                  Multiple faces detected, leaving the exam window, or unauthorized device usage. These require immediate review.
                                             </p>
                                        </div>
                                        <div className="border p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900">
                                             <div className="flex items-center gap-2 font-semibold text-orange-700 dark:text-orange-400 mb-2">
                                                  <AlertCircle className="h-4 w-4" />
                                                  Moderate Flags
                                             </div>
                                             <p className="text-sm text-foreground/80">
                                                  Suspicious gaze behavior, prolonged silence, or minor background noise.
                                             </p>
                                        </div>
                                        <div className="border p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
                                             <div className="flex items-center gap-2 font-semibold text-blue-700 dark:text-blue-400 mb-2">
                                                  <AlertCircle className="h-4 w-4" />
                                                  System Flags
                                             </div>
                                             <p className="text-sm text-foreground/80">
                                                  Connection interruptions, browser compatibility warnings, or low latency alerts.
                                             </p>
                                        </div>
                                   </div>

                                   <div className="space-y-4">
                                        <h3 className="font-semibold text-lg">Review Process</h3>
                                        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground ml-2">
                                             <li>Navigate to the <strong>Exam Management</strong> or <strong>Logs</strong> page.</li>
                                             <li>Filter by "Flagged" status or High Severity.</li>
                                             <li>Click on a student entry to view detailed incident reports and snapshots.</li>
                                             <li>Review the evidence and decide whether to <strong>Dismiss</strong> the flag or <strong>Escalate</strong> to the department head.</li>
                                        </ol>
                                   </div>
                              </CardContent>
                         </Card>
                    </TabsContent>
               </Tabs>
          </div>
     );
}
