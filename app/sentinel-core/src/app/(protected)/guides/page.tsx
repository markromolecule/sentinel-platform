'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sentinel/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@sentinel/ui';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@sentinel/ui';
import { Badge } from '@sentinel/ui';
import { Alert, AlertDescription, AlertTitle } from '@sentinel/ui';
import {
    AlertCircle,
    Building2,
    Users,
    FileText,
    ShieldAlert,
    CheckCircle2,
    Layers,
    BookOpen,
    Presentation,
    CalendarCheck,
    Laptop,
    Lightbulb,
    Settings,
    Camera,
} from 'lucide-react';
import { PageHeader } from '@sentinel/ui';

export default function AdminGuidePage() {
    return (
        <div className="mx-auto flex max-w-5xl flex-col gap-6 p-4 md:p-6">
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

                <TabsContent value="hierarchy" className="mt-6 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Layers className="text-primary h-5 w-5" />
                                Organizational Structure
                            </CardTitle>
                            <CardDescription>
                                Understanding the relationship between data entities.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="bg-muted/30 border-border rounded-xl border p-6">
                                <h3 className="text-foreground/80 mb-6 text-center text-lg font-semibold">
                                    Data Hierarchy
                                </h3>
                                <div className="relative py-8">
                                    {/* Vertical Line */}
                                    <div className="bg-border absolute top-0 bottom-0 left-[28px] w-0.5 -translate-x-1/2 md:left-1/2"></div>

                                    <div className="space-y-12">
                                        {/* Item 1 */}
                                        <div className="group relative flex w-full flex-col items-start justify-between md:flex-row md:items-center">
                                            {/* Desktop Left / Mobile Right */}
                                            <div className="w-full pl-16 md:w-[45%] md:pr-8 md:pl-0 md:text-right">
                                                <div className="bg-card rounded-xl border p-4 shadow-sm transition-colors hover:border-blue-500/50">
                                                    <div className="mb-2 flex flex-row items-center justify-start gap-2 md:flex-row-reverse">
                                                        <span className="text-foreground font-bold">
                                                            Institution
                                                        </span>
                                                    </div>
                                                    <p className="text-muted-foreground text-xs leading-relaxed">
                                                        The top-level entity representing the entire
                                                        school or university (e.g., NU Dasmariñas)
                                                        governing all rules.
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Center Icon */}
                                            <div className="border-background absolute top-4 left-[28px] z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 bg-blue-100 text-blue-600 shadow-sm md:top-1/2 md:left-1/2 dark:bg-blue-900/50 dark:text-blue-400">
                                                <Building2 className="h-5 w-5" />
                                            </div>

                                            {/* Desktop Right (Empty) */}
                                            <div className="hidden w-[45%] md:block"></div>
                                        </div>

                                        {/* Item 2 */}
                                        <div className="group relative flex w-full flex-col items-start justify-between md:flex-row md:items-center">
                                            <div className="hidden w-[45%] md:block"></div>

                                            <div className="border-background absolute top-4 left-[28px] z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 bg-indigo-100 text-indigo-600 shadow-sm md:top-1/2 md:left-1/2 dark:bg-indigo-900/50 dark:text-indigo-400">
                                                <Building2 className="h-5 w-5" />
                                            </div>

                                            <div className="w-full pl-16 md:w-[45%] md:pl-8">
                                                <div className="bg-card rounded-xl border p-4 shadow-sm transition-colors hover:border-indigo-500/50">
                                                    <div className="mb-2 flex items-center gap-2">
                                                        <span className="text-foreground font-bold">
                                                            Department
                                                        </span>
                                                    </div>
                                                    <p className="text-muted-foreground text-xs leading-relaxed">
                                                        A specialized division within the
                                                        institution handling specific programs
                                                        (e.g., College of Computer Studies).
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Item 3 */}
                                        <div className="group relative flex w-full flex-col items-start justify-between md:flex-row md:items-center">
                                            <div className="w-full pl-16 md:w-[45%] md:pr-8 md:pl-0 md:text-right">
                                                <div className="bg-card rounded-xl border p-4 shadow-sm transition-colors hover:border-violet-500/50">
                                                    <div className="mb-2 flex flex-row items-center justify-start gap-2 md:flex-row-reverse">
                                                        <span className="text-foreground font-bold">
                                                            Course / Program
                                                        </span>
                                                    </div>
                                                    <p className="text-muted-foreground text-xs leading-relaxed">
                                                        The specific degree or track a student is
                                                        enrolled in (e.g., BS Information
                                                        Technology).
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="border-background absolute top-4 left-[28px] z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 bg-violet-100 text-violet-600 shadow-sm md:top-1/2 md:left-1/2 dark:bg-violet-900/50 dark:text-violet-400">
                                                <BookOpen className="h-5 w-5" />
                                            </div>
                                            <div className="hidden w-[45%] md:block"></div>
                                        </div>

                                        {/* Item 4 */}
                                        <div className="group relative flex w-full flex-col items-start justify-between md:flex-row md:items-center">
                                            <div className="hidden w-[45%] md:block"></div>

                                            <div className="border-background absolute top-4 left-[28px] z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 bg-purple-100 text-purple-600 shadow-sm md:top-1/2 md:left-1/2 dark:bg-purple-900/50 dark:text-purple-400">
                                                <FileText className="h-5 w-5" />
                                            </div>

                                            <div className="w-full pl-16 md:w-[45%] md:pl-8">
                                                <div className="bg-card rounded-xl border p-4 shadow-sm transition-colors hover:border-purple-500/50">
                                                    <div className="mb-2 flex items-center gap-2">
                                                        <span className="text-foreground font-bold">
                                                            Subject
                                                        </span>
                                                    </div>
                                                    <p className="text-muted-foreground text-xs leading-relaxed">
                                                        A module from the master catalog that
                                                        proctors enroll in to teach across different
                                                        blocks.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Item 5 */}
                                        <div className="group relative flex w-full flex-col items-start justify-between md:flex-row md:items-center">
                                            <div className="w-full pl-16 md:w-[45%] md:pr-8 md:pl-0 md:text-right">
                                                <div className="bg-card rounded-xl border p-4 shadow-sm transition-colors hover:border-pink-500/50">
                                                    <div className="mb-2 flex flex-row items-center justify-start gap-2 md:flex-row-reverse">
                                                        <span className="text-foreground font-bold">
                                                            Section
                                                        </span>
                                                    </div>
                                                    <p className="text-muted-foreground text-xs leading-relaxed">
                                                        A distinct class block of students taking a
                                                        specific subject together (e.g., Block A,
                                                        Block B).
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="border-background absolute top-4 left-[28px] z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 bg-pink-100 text-pink-600 shadow-sm md:top-1/2 md:left-1/2 dark:bg-pink-900/50 dark:text-pink-400">
                                                <Users className="h-5 w-5" />
                                            </div>
                                            <div className="hidden w-[45%] md:block"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-3">
                                    <h4 className="text-primary flex items-center gap-2 font-semibold">
                                        <CheckCircle2 className="h-5 w-5" />
                                        Admin Responsibilities
                                    </h4>
                                    <ul className="text-muted-foreground ml-1 space-y-2 text-sm">
                                        <li className="flex items-start gap-2">
                                            <span className="bg-primary mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full" />
                                            <span>
                                                Manage the <strong>Master Subject Catalog</strong>{' '}
                                                and ensure all subjects are up-to-date.
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="bg-primary mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full" />
                                            <span>
                                                Create and maintain <strong>Courses</strong> (e.g.,
                                                BSIT-MWA) and assign them to{' '}
                                                <strong>Departments</strong>.
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="bg-primary mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full" />
                                            <span>
                                                Oversee <strong>Sections</strong> and ensure they
                                                are linked to the correct Course.
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="bg-primary mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full" />
                                            <span>
                                                Manage User Accounts, Departments, and System
                                                Settings.
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                                <div className="space-y-3">
                                    <h4 className="flex items-center gap-2 font-semibold text-blue-500">
                                        <CheckCircle2 className="h-5 w-5" />
                                        Proctor Responsibilities
                                    </h4>
                                    <ul className="text-muted-foreground ml-1 space-y-2 text-sm">
                                        <li className="flex items-start gap-2">
                                            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                                            <span>
                                                <strong>Enroll</strong> in Subjects from the Master
                                                Catalog to teach them.
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                                            <span>
                                                Assign their specific <strong>Section</strong> to
                                                the Subject they are teaching.
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                                            <span>
                                                Create Exams for their Enrolled Subjects and monitor
                                                student performance.
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="exam-management" className="mt-6 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Presentation className="text-primary h-5 w-5" />
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
                                    Once an exam has started or students have attempted it, changing
                                    core settings (like duration or camera requirements) may lead to
                                    inconsistent grading.
                                </AlertDescription>
                            </Alert>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-4">
                                    <h3 className="flex items-center gap-2 text-lg font-semibold">
                                        <Settings className="text-muted-foreground h-5 w-5" />
                                        Configuration Options
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="bg-card hover:bg-muted/50 flex items-start gap-3 rounded-lg border p-3 transition-colors">
                                            <div className="bg-primary/10 rounded-md p-2">
                                                <CalendarCheck className="text-primary h-4 w-4" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-medium">
                                                    Scheduling & Availability
                                                </h4>
                                                <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                                                    Set strict start and end times. The system
                                                    prevents students from joining outside this
                                                    window.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="bg-card hover:bg-muted/50 flex items-start gap-3 rounded-lg border p-3 transition-colors">
                                            <div className="bg-primary/10 rounded-md p-2">
                                                <Camera className="text-primary h-4 w-4" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-medium">
                                                    Device Requirements
                                                </h4>
                                                <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                                                    Enable Camera, Microphone, and Screen recording
                                                    toggles to enforce hardware checks during
                                                    student onboarding.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="bg-card hover:bg-muted/50 flex items-start gap-3 rounded-lg border p-3 transition-colors">
                                            <div className="bg-primary/10 rounded-md p-2">
                                                <Laptop className="text-primary h-4 w-4" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-medium">
                                                    Browser Restrictions
                                                </h4>
                                                <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                                                    Toggle whether students are allowed to exit
                                                    full-screen mode or switch tabs.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="flex items-center gap-2 text-lg font-semibold">
                                        <AlertCircle className="text-muted-foreground h-5 w-5" />
                                        Monitoring Active Exams
                                    </h3>
                                    <ul className="text-muted-foreground space-y-4 text-sm">
                                        <li className="flex gap-3">
                                            <Badge
                                                variant="outline"
                                                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full p-0"
                                            >
                                                1
                                            </Badge>
                                            <span>
                                                Navigate to the <strong>Live Monitoring</strong>{' '}
                                                dashboard when an exam is active.
                                            </span>
                                        </li>
                                        <li className="flex gap-3">
                                            <Badge
                                                variant="outline"
                                                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full p-0"
                                            >
                                                2
                                            </Badge>
                                            <span>
                                                The main feed highlights students triggering
                                                real-time alerts (e.g., looking away, talking).
                                            </span>
                                        </li>
                                        <li className="flex gap-3">
                                            <Badge
                                                variant="outline"
                                                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full p-0"
                                            >
                                                3
                                            </Badge>
                                            <span>
                                                Click on a specific student to view their live
                                                camera feed, screen share, and audio metrics.
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="incidents" className="mt-6 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShieldAlert className="text-destructive h-5 w-5" />
                                Incident Management & Flagging
                            </CardTitle>
                            <CardDescription>
                                How the system detects and handles academic integrity issues.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/20">
                                    <div className="mb-2 flex items-center gap-2 font-semibold text-red-700 dark:text-red-400">
                                        <AlertCircle className="h-4 w-4" />
                                        Severe Flags
                                    </div>
                                    <p className="text-foreground/80 text-sm leading-relaxed">
                                        Multiple faces detected, leaving the exam window, or
                                        unauthorized device usage. These require immediate review.
                                    </p>
                                </div>
                                <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-900/50 dark:bg-orange-950/20">
                                    <div className="mb-2 flex items-center gap-2 font-semibold text-orange-700 dark:text-orange-400">
                                        <AlertCircle className="h-4 w-4" />
                                        Moderate Flags
                                    </div>
                                    <p className="text-foreground/80 text-sm leading-relaxed">
                                        Suspicious gaze behavior, prolonged silence, or minor
                                        background noise.
                                    </p>
                                </div>
                                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-950/20">
                                    <div className="mb-2 flex items-center gap-2 font-semibold text-blue-700 dark:text-blue-400">
                                        <AlertCircle className="h-4 w-4" />
                                        System Flags
                                    </div>
                                    <p className="text-foreground/80 text-sm leading-relaxed">
                                        Connection interruptions, browser compatibility warnings, or
                                        low latency alerts.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4 border-t pt-4">
                                <h3 className="text-lg font-semibold">Review Process</h3>
                                <ol className="text-muted-foreground ml-2 list-inside list-decimal space-y-3 text-sm">
                                    <li className="pl-2">
                                        <span className="text-foreground">Navigate</span> to the{' '}
                                        <strong>Exam Management</strong> or <strong>Logs</strong>{' '}
                                        page.
                                    </li>
                                    <li className="pl-2">
                                        <span className="text-foreground">Filter</span> by
                                        &quot;Flagged&quot; status or High Severity to prioritize
                                        incidents.
                                    </li>
                                    <li className="pl-2">
                                        <span className="text-foreground">Click</span> on a student
                                        entry to view detailed incident reports and snapshots.
                                    </li>
                                    <li className="pl-2">
                                        <span className="text-foreground">Decide</span> whether to{' '}
                                        <strong>Dismiss</strong> the flag (false positive) or{' '}
                                        <strong>Escalate</strong> to the department head.
                                    </li>
                                </ol>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="best-practices" className="mt-6 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lightbulb className="h-5 w-5 text-amber-500" />
                                Administrator Best Practices
                            </CardTitle>
                            <CardDescription>
                                Tips and FAQs for maintaining a healthy and secure system
                                environment.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger className="hover:text-primary text-sm font-semibold transition-colors">
                                        How often should I review system logs?
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                                        We recommend checking the global incident logs{' '}
                                        <strong>at least once a week</strong>. High severity alerts
                                        (like blocked login attempts or unauthorized systemic
                                        changes) will trigger automated notifications, but routine
                                        audits help identify recurring minor issues like constant
                                        connectivity problems in specific regions or courses.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-2">
                                    <AccordionTrigger className="hover:text-primary text-sm font-semibold transition-colors">
                                        What is the best way to handle false positive flags?
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                                        When you encounter a false positive (e.g., the system
                                        flagged a poster behind a student as a &quot;second
                                        person&quot;), you should immediately mark it as{' '}
                                        <strong>Dismissed</strong> in the incident review panel.
                                        Providing a short comment (e.g., &quot;Poster on wall&quot;)
                                        helps the AI model learn and potentially tune edge cases in
                                        the future.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-3">
                                    <AccordionTrigger className="hover:text-primary text-sm font-semibold transition-colors">
                                        How do I communicate with proctors regarding exam setup?
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                                        Use the integrated <strong>Messaging</strong> or{' '}
                                        <strong>Announcements</strong> systems. Announcements are
                                        best for global rules (e.g., &quot;All finals must enforce
                                        camera and mic&quot;). Messaging is best for direct
                                        intervention when you notice a proctor has configured an
                                        exam incorrectly.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-4">
                                    <AccordionTrigger className="hover:text-primary text-sm font-semibold transition-colors">
                                        Should I archive old departments or courses?
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                                        <strong>Yes.</strong> Never delete old entities, as they may
                                        be tied to historical exam records and performance
                                        analytics. Use the <strong>&quot;Archive&quot;</strong> or{' '}
                                        <strong>&quot;Inactive&quot;</strong> status for departments
                                        and courses that are no longer active to keep the active UI
                                        clean while preserving data integrity.
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
