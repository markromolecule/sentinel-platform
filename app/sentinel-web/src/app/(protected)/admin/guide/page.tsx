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
import {
     Accordion,
     AccordionContent,
     AccordionItem,
     AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
     AlertCircle, Building2, Users, FileText, ShieldAlert,
     CheckCircle2, Layers, BookOpen, Presentation, CalendarCheck,
     Laptop, Lightbulb, Settings, Camera
} from "lucide-react";
import { PageHeader } from "@/components/common";

export default function AdminGuidePage() {
     return (
          <div className="flex flex-col gap-6 md:p-6 p-4 max-w-5xl mx-auto">
               <PageHeader
                    title="Administrator Guide"
                    description="Comprehensive guide to managing the Sentinel proctoring system."
               />

               <Tabs defaultValue="hierarchy" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:w-[800px]">
                         <TabsTrigger value="hierarchy">System Hierarchy</TabsTrigger>
                         <TabsTrigger value="exam-management">Exam Management</TabsTrigger>
                         <TabsTrigger value="incidents">Incidents & Flagging</TabsTrigger>
                         <TabsTrigger value="best-practices">Best Practices</TabsTrigger>
                    </TabsList>

                    <TabsContent value="hierarchy" className="space-y-4 mt-6">
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
                                        <div className="relative py-8">
                                             {/* Vertical Line */}
                                             <div className="absolute left-[28px] md:left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2"></div>

                                             <div className="space-y-12">
                                                  {/* Item 1 */}
                                                  <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between w-full group">
                                                       {/* Desktop Left / Mobile Right */}
                                                       <div className="w-full md:w-[45%] pl-16 md:pl-0 md:pr-8 md:text-right">
                                                            <div className="p-4 rounded-xl border bg-card shadow-sm hover:border-blue-500/50 transition-colors">
                                                                 <div className="flex flex-row md:flex-row-reverse items-center justify-start gap-2 mb-2">
                                                                      <span className="font-bold text-foreground">Institution</span>
                                                                 </div>
                                                                 <p className="text-xs text-muted-foreground leading-relaxed">The top-level entity representing the entire school or university (e.g., NU Dasmariñas) governing all rules.</p>
                                                            </div>
                                                       </div>

                                                       {/* Center Icon */}
                                                       <div className="absolute left-[28px] md:left-1/2 top-4 md:top-1/2 flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 -translate-x-1/2 -translate-y-1/2 z-10 shadow-sm">
                                                            <Building2 className="w-5 h-5" />
                                                       </div>

                                                       {/* Desktop Right (Empty) */}
                                                       <div className="hidden md:block w-[45%]"></div>
                                                  </div>

                                                  {/* Item 2 */}
                                                  <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between w-full group">
                                                       <div className="hidden md:block w-[45%]"></div>

                                                       <div className="absolute left-[28px] md:left-1/2 top-4 md:top-1/2 flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 -translate-x-1/2 -translate-y-1/2 z-10 shadow-sm">
                                                            <Building2 className="w-5 h-5" />
                                                       </div>

                                                       <div className="w-full md:w-[45%] pl-16 md:pl-8">
                                                            <div className="p-4 rounded-xl border bg-card shadow-sm hover:border-indigo-500/50 transition-colors">
                                                                 <div className="flex items-center gap-2 mb-2">
                                                                      <span className="font-bold text-foreground">Department</span>
                                                                 </div>
                                                                 <p className="text-xs text-muted-foreground leading-relaxed">A specialized division within the institution handling specific programs (e.g., College of Computer Studies).</p>
                                                            </div>
                                                       </div>
                                                  </div>

                                                  {/* Item 3 */}
                                                  <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between w-full group">
                                                       <div className="w-full md:w-[45%] pl-16 md:pl-0 md:pr-8 md:text-right">
                                                            <div className="p-4 rounded-xl border bg-card shadow-sm hover:border-violet-500/50 transition-colors">
                                                                 <div className="flex flex-row md:flex-row-reverse items-center justify-start gap-2 mb-2">
                                                                      <span className="font-bold text-foreground">Course / Program</span>
                                                                 </div>
                                                                 <p className="text-xs text-muted-foreground leading-relaxed">The specific degree or track a student is enrolled in (e.g., BS Information Technology).</p>
                                                            </div>
                                                       </div>

                                                       <div className="absolute left-[28px] md:left-1/2 top-4 md:top-1/2 flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400 -translate-x-1/2 -translate-y-1/2 z-10 shadow-sm">
                                                            <BookOpen className="w-5 h-5" />
                                                       </div>
                                                       <div className="hidden md:block w-[45%]"></div>
                                                  </div>

                                                  {/* Item 4 */}
                                                  <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between w-full group">
                                                       <div className="hidden md:block w-[45%]"></div>

                                                       <div className="absolute left-[28px] md:left-1/2 top-4 md:top-1/2 flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 -translate-x-1/2 -translate-y-1/2 z-10 shadow-sm">
                                                            <FileText className="w-5 h-5" />
                                                       </div>

                                                       <div className="w-full md:w-[45%] pl-16 md:pl-8">
                                                            <div className="p-4 rounded-xl border bg-card shadow-sm hover:border-purple-500/50 transition-colors">
                                                                 <div className="flex items-center gap-2 mb-2">
                                                                      <span className="font-bold text-foreground">Subject</span>
                                                                 </div>
                                                                 <p className="text-xs text-muted-foreground leading-relaxed">A module from the master catalog that proctors enroll in to teach across different blocks.</p>
                                                            </div>
                                                       </div>
                                                  </div>

                                                  {/* Item 5 */}
                                                  <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between w-full group">
                                                       <div className="w-full md:w-[45%] pl-16 md:pl-0 md:pr-8 md:text-right">
                                                            <div className="p-4 rounded-xl border bg-card shadow-sm hover:border-pink-500/50 transition-colors">
                                                                 <div className="flex flex-row md:flex-row-reverse items-center justify-start gap-2 mb-2">
                                                                      <span className="font-bold text-foreground">Section</span>
                                                                 </div>
                                                                 <p className="text-xs text-muted-foreground leading-relaxed">A distinct class block of students taking a specific subject together (e.g., Block A, Block B).</p>
                                                            </div>
                                                       </div>

                                                       <div className="absolute left-[28px] md:left-1/2 top-4 md:top-1/2 flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-400 -translate-x-1/2 -translate-y-1/2 z-10 shadow-sm">
                                                            <Users className="w-5 h-5" />
                                                       </div>
                                                       <div className="hidden md:block w-[45%]"></div>
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

                    <TabsContent value="exam-management" className="space-y-4 mt-6">
                         <Card>
                              <CardHeader>
                                   <CardTitle className="flex items-center gap-2">
                                        <Presentation className="h-5 w-5 text-primary" />
                                        Setting Up and Managing Exams
                                   </CardTitle>
                                   <CardDescription>
                                        Guidelines for creating secure and effective proctored exams.
                                   </CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-6">
                                   <Alert>
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Important Config Rule</AlertTitle>
                                        <AlertDescription>
                                             Once an exam has started or students have attempted it, changing core settings (like duration or camera requirements) may lead to inconsistent grading.
                                        </AlertDescription>
                                   </Alert>

                                   <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-4">
                                             <h3 className="font-semibold text-lg flex items-center gap-2">
                                                  <Settings className="h-5 w-5 text-muted-foreground" />
                                                  Configuration Options
                                             </h3>
                                             <div className="space-y-4">
                                                  <div className="flex items-start gap-3 p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                                                       <div className="bg-primary/10 p-2 rounded-md">
                                                            <CalendarCheck className="h-4 w-4 text-primary" />
                                                       </div>
                                                       <div>
                                                            <h4 className="font-medium text-sm">Scheduling & Availability</h4>
                                                            <p className="text-xs text-muted-foreground leading-relaxed mt-1">Set strict start and end times. The system prevents students from joining outside this window.</p>
                                                       </div>
                                                  </div>
                                                  <div className="flex items-start gap-3 p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                                                       <div className="bg-primary/10 p-2 rounded-md">
                                                            <Camera className="h-4 w-4 text-primary" />
                                                       </div>
                                                       <div>
                                                            <h4 className="font-medium text-sm">Device Requirements</h4>
                                                            <p className="text-xs text-muted-foreground leading-relaxed mt-1">Enable Camera, Microphone, and Screen recording toggles to enforce hardware checks during student onboarding.</p>
                                                       </div>
                                                  </div>
                                                  <div className="flex items-start gap-3 p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                                                       <div className="bg-primary/10 p-2 rounded-md">
                                                            <Laptop className="h-4 w-4 text-primary" />
                                                       </div>
                                                       <div>
                                                            <h4 className="font-medium text-sm">Browser Restrictions</h4>
                                                            <p className="text-xs text-muted-foreground leading-relaxed mt-1">Toggle whether students are allowed to exit full-screen mode or switch tabs.</p>
                                                       </div>
                                                  </div>
                                             </div>
                                        </div>

                                        <div className="space-y-4">
                                             <h3 className="font-semibold text-lg flex items-center gap-2">
                                                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                                                  Monitoring Active Exams
                                             </h3>
                                             <ul className="space-y-4 text-sm text-muted-foreground">
                                                  <li className="flex gap-3">
                                                       <Badge variant="outline" className="h-6 w-6 rounded-full flex items-center justify-center p-0 flex-shrink-0">1</Badge>
                                                       <span>Navigate to the <strong>Live Monitoring</strong> dashboard when an exam is active.</span>
                                                  </li>
                                                  <li className="flex gap-3">
                                                       <Badge variant="outline" className="h-6 w-6 rounded-full flex items-center justify-center p-0 flex-shrink-0">2</Badge>
                                                       <span>The main feed highlights students triggering real-time alerts (e.g., looking away, talking).</span>
                                                  </li>
                                                  <li className="flex gap-3">
                                                       <Badge variant="outline" className="h-6 w-6 rounded-full flex items-center justify-center p-0 flex-shrink-0">3</Badge>
                                                       <span>Click on a specific student to view their live camera feed, screen share, and audio metrics.</span>
                                                  </li>
                                             </ul>
                                        </div>
                                   </div>
                              </CardContent>
                         </Card>
                    </TabsContent>

                    <TabsContent value="incidents" className="space-y-4 mt-6">
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
                                             <li className="pl-2"><span className="text-foreground">Filter</span> by &quot;Flagged&quot; status or High Severity to prioritize incidents.</li>
                                             <li className="pl-2"><span className="text-foreground">Click</span> on a student entry to view detailed incident reports and snapshots.</li>
                                             <li className="pl-2"><span className="text-foreground">Decide</span> whether to <strong>Dismiss</strong> the flag (false positive) or <strong>Escalate</strong> to the department head.</li>
                                        </ol>
                                   </div>
                              </CardContent>
                         </Card>
                    </TabsContent>

                    <TabsContent value="best-practices" className="space-y-4 mt-6">
                         <Card>
                              <CardHeader>
                                   <CardTitle className="flex items-center gap-2">
                                        <Lightbulb className="h-5 w-5 text-amber-500" />
                                        Administrator Best Practices
                                   </CardTitle>
                                   <CardDescription>
                                        Tips and FAQs for maintaining a healthy and secure system environment.
                                   </CardDescription>
                              </CardHeader>
                              <CardContent>
                                   <Accordion type="single" collapsible className="w-full">
                                        <AccordionItem value="item-1">
                                             <AccordionTrigger className="text-sm font-semibold hover:text-primary transition-colors">
                                                  How often should I review system logs?
                                             </AccordionTrigger>
                                             <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                                                  We recommend checking the global incident logs <strong>at least once a week</strong>. High severity alerts (like blocked login attempts or unauthorized systemic changes) will trigger automated notifications, but routine audits help identify recurring minor issues like constant connectivity problems in specific regions or courses.
                                             </AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem value="item-2">
                                             <AccordionTrigger className="text-sm font-semibold hover:text-primary transition-colors">
                                                  What is the best way to handle false positive flags?
                                             </AccordionTrigger>
                                             <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                                                  When you encounter a false positive (e.g., the system flagged a poster behind a student as a &quot;second person&quot;), you should immediately mark it as <strong>Dismissed</strong> in the incident review panel. Providing a short comment (e.g., &quot;Poster on wall&quot;) helps the AI model learn and potentially tune edge cases in the future.
                                             </AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem value="item-3">
                                             <AccordionTrigger className="text-sm font-semibold hover:text-primary transition-colors">
                                                  How do I communicate with proctors regarding exam setup?
                                             </AccordionTrigger>
                                             <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                                                  Use the integrated <strong>Messaging</strong> or <strong>Announcements</strong> systems. Announcements are best for global rules (e.g., &quot;All finals must enforce camera and mic&quot;). Messaging is best for direct intervention when you notice a proctor has configured an exam incorrectly.
                                             </AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem value="item-4">
                                             <AccordionTrigger className="text-sm font-semibold hover:text-primary transition-colors">
                                                  Should I archive old departments or courses?
                                             </AccordionTrigger>
                                             <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                                                  <strong>Yes.</strong> Never delete old entities, as they may be tied to historical exam records and performance analytics. Use the <strong>&quot;Archive&quot;</strong> or <strong>&quot;Inactive&quot;</strong> status for departments and courses that are no longer active to keep the active UI clean while preserving data integrity.
                                             </AccordionContent>
                                        </AccordionItem>
                                   </Accordion>
                              </CardContent>
                         </Card>
                    </TabsContent>
               </Tabs>
          </div>
     );
}
