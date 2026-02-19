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
import { AlertCircle, Building2, Users, FileText, ShieldAlert, CheckCircle2, Layers, BookOpen } from "lucide-react";
import { PageHeader } from "@/components/common";

export default function AdminGuidePage() {
     return (
          <div className="flex flex-col gap-6 md:p-6 p-4 max-w-5xl mx-auto">
               <PageHeader
                    title="Administrator Guide"
                    description="Comprehensive guide to managing the Sentinel proctoring system."
               />

               <Tabs defaultValue="hierarchy" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                         <TabsTrigger value="hierarchy">System Hierarchy</TabsTrigger>
                         <TabsTrigger value="incidents">Incidents & Flagging</TabsTrigger>
                    </TabsList>

                    <TabsContent value="hierarchy" className="space-y-4 mt-4">
                         <Card>
                              <CardHeader>
                                   <CardTitle className="flex items-center gap-2">
                                        <Layers className="h-5 w-5 text-primary" />
                                        Organizational Structure
                                   </CardTitle>
                                   <CardDescription>
                                        Understanding the relationship between data entities.
                                   </CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-6">
                                   <div className="p-6 bg-muted/30 rounded-xl border border-border">
                                        <h3 className="font-semibold text-lg mb-6 text-center text-foreground/80">Data Hierarchy</h3>
                                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
                                             <div className="flex flex-col items-center gap-3 p-4 bg-card rounded-lg shadow-sm w-full md:w-auto border border-border/50 hover:border-primary/50 transition-colors">
                                                  <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-full">
                                                       <Building2 className="h-6 w-6 text-blue-500" />
                                                  </div>
                                                  <div className="text-center">
                                                       <span className="font-bold block">Institution</span>
                                                       <span className="text-xs text-muted-foreground">NU Dasmariñas</span>
                                                  </div>
                                             </div>
                                             <div className="hidden md:block w-8 h-0.5 bg-muted-foreground/30"></div>
                                             <div className="flex md:hidden h-8 w-0.5 bg-muted-foreground/30"></div>

                                             <div className="flex flex-col items-center gap-3 p-4 bg-card rounded-lg shadow-sm w-full md:w-auto border border-border/50 hover:border-primary/50 transition-colors">
                                                  <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-full">
                                                       <Building2 className="h-6 w-6 text-indigo-500" />
                                                  </div>
                                                  <div className="text-center">
                                                       <span className="font-bold block">Department</span>
                                                       <span className="text-xs text-muted-foreground">College of CS</span>
                                                  </div>
                                             </div>
                                             <div className="hidden md:block w-8 h-0.5 bg-muted-foreground/30"></div>
                                             <div className="flex md:hidden h-8 w-0.5 bg-muted-foreground/30"></div>

                                             <div className="flex flex-col items-center gap-3 p-4 bg-card rounded-lg shadow-sm w-full md:w-auto border border-border/50 hover:border-primary/50 transition-colors">
                                                  <div className="p-2 bg-violet-50 dark:bg-violet-950/30 rounded-full">
                                                       <BookOpen className="h-6 w-6 text-violet-500" />
                                                  </div>
                                                  <div className="text-center">
                                                       <span className="font-bold block">Course</span>
                                                       <span className="text-xs text-muted-foreground">BSIT, BSCS</span>
                                                  </div>
                                             </div>
                                             <div className="hidden md:block w-8 h-0.5 bg-muted-foreground/30"></div>
                                             <div className="flex md:hidden h-8 w-0.5 bg-muted-foreground/30"></div>

                                             <div className="flex flex-col items-center gap-3 p-4 bg-card rounded-lg shadow-sm w-full md:w-auto border border-border/50 hover:border-primary/50 transition-colors">
                                                  <div className="p-2 bg-purple-50 dark:bg-purple-950/30 rounded-full">
                                                       <FileText className="h-6 w-6 text-purple-500" />
                                                  </div>
                                                  <div className="text-center">
                                                       <span className="font-bold block">Subject</span>
                                                       <span className="text-xs text-muted-foreground">Master Catalog</span>
                                                  </div>
                                             </div>
                                             <div className="hidden md:block w-8 h-0.5 bg-muted-foreground/30"></div>
                                             <div className="flex md:hidden h-8 w-0.5 bg-muted-foreground/30"></div>

                                             <div className="flex flex-col items-center gap-3 p-4 bg-card rounded-lg shadow-sm w-full md:w-auto border border-border/50 hover:border-primary/50 transition-colors">
                                                  <div className="p-2 bg-pink-50 dark:bg-pink-950/30 rounded-full">
                                                       <Users className="h-6 w-6 text-pink-500" />
                                                  </div>
                                                  <div className="text-center">
                                                       <span className="font-bold block">Section</span>
                                                       <span className="text-xs text-muted-foreground">Class Block</span>
                                                  </div>
                                             </div>
                                        </div>
                                   </div>

                                   <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-3">
                                             <h4 className="font-semibold flex items-center gap-2 text-primary">
                                                  <CheckCircle2 className="h-5 w-5" />
                                                  Admin Responsibilities
                                             </h4>
                                             <ul className="space-y-2 text-sm text-muted-foreground ml-1">
                                                  <li className="flex items-start gap-2">
                                                       <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                                                       <span>Manage the <strong>Master Subject Catalog</strong> and ensure all subjects are up-to-date.</span>
                                                  </li>
                                                  <li className="flex items-start gap-2">
                                                       <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                                                       <span>Create and maintain <strong>Courses</strong> (e.g., BSIT-MWA) and assign them to <strong>Departments</strong>.</span>
                                                  </li>
                                                  <li className="flex items-start gap-2">
                                                       <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                                                       <span>Oversee <strong>Sections</strong> and ensure they are linked to the correct Course.</span>
                                                  </li>
                                                  <li className="flex items-start gap-2">
                                                       <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                                                       <span>Manage User Accounts, Departments, and System Settings.</span>
                                                  </li>
                                             </ul>
                                        </div>
                                        <div className="space-y-3">
                                             <h4 className="font-semibold flex items-center gap-2 text-blue-500">
                                                  <CheckCircle2 className="h-5 w-5" />
                                                  Proctor Responsibilities
                                             </h4>
                                             <ul className="space-y-2 text-sm text-muted-foreground ml-1">
                                                  <li className="flex items-start gap-2">
                                                       <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                                                       <span><strong>Enroll</strong> in Subjects from the Master Catalog to teach them.</span>
                                                  </li>
                                                  <li className="flex items-start gap-2">
                                                       <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                                                       <span>Assign their specific <strong>Section</strong> to the Subject they are teaching.</span>
                                                  </li>
                                                  <li className="flex items-start gap-2">
                                                       <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                                                       <span>Create Exams for their Enrolled Subjects and monitor student performance.</span>
                                                  </li>
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
                                        <div className="border p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50">
                                             <div className="flex items-center gap-2 font-semibold text-red-700 dark:text-red-400 mb-2">
                                                  <AlertCircle className="h-4 w-4" />
                                                  Severe Flags
                                             </div>
                                             <p className="text-sm text-foreground/80 leading-relaxed">
                                                  Multiple faces detected, leaving the exam window, or unauthorized device usage. These require immediate review.
                                             </p>
                                        </div>
                                        <div className="border p-4 rounded-xl bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/50">
                                             <div className="flex items-center gap-2 font-semibold text-orange-700 dark:text-orange-400 mb-2">
                                                  <AlertCircle className="h-4 w-4" />
                                                  Moderate Flags
                                             </div>
                                             <p className="text-sm text-foreground/80 leading-relaxed">
                                                  Suspicious gaze behavior, prolonged silence, or minor background noise.
                                             </p>
                                        </div>
                                        <div className="border p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50">
                                             <div className="flex items-center gap-2 font-semibold text-blue-700 dark:text-blue-400 mb-2">
                                                  <AlertCircle className="h-4 w-4" />
                                                  System Flags
                                             </div>
                                             <p className="text-sm text-foreground/80 leading-relaxed">
                                                  Connection interruptions, browser compatibility warnings, or low latency alerts.
                                             </p>
                                        </div>
                                   </div>

                                   <div className="space-y-4 pt-4 border-t">
                                        <h3 className="font-semibold text-lg">Review Process</h3>
                                        <ol className="list-decimal list-inside space-y-3 text-sm text-muted-foreground ml-2">
                                             <li className="pl-2"><span className="text-foreground">Navigate</span> to the <strong>Exam Management</strong> or <strong>Logs</strong> page.</li>
                                             <li className="pl-2"><span className="text-foreground">Filter</span> by "Flagged" status or High Severity to prioritize incidents.</li>
                                             <li className="pl-2"><span className="text-foreground">Click</span> on a student entry to view detailed incident reports and snapshots.</li>
                                             <li className="pl-2"><span className="text-foreground">Decide</span> whether to <strong>Dismiss</strong> the flag (false positive) or <strong>Escalate</strong> to the department head.</li>
                                        </ol>
                                   </div>
                              </CardContent>
                         </Card>
                    </TabsContent>
               </Tabs>
          </div>
     );
}
