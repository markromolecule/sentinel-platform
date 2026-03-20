"use client";

import { ChevronLeft } from "lucide-react";
import { Button } from "@sentinel/ui";
import { Separator } from "@sentinel/ui";
import Link from "next/link";
import { PageHeader } from "@/components/common/page-header";
import { ExamConfigForm } from "@/app/(protected)/(admin)/exams/configuration/_components";
import { MOCK_EXAM_CONFIG } from '@sentinel/shared/constants';

export default function ExamConfigPage() {
    return (
        <div className="flex flex-col gap-6 md:p-6 p-4">
            <PageHeader
                title="Exam Configuration"
                description="Manage global proctoring policies and system-wide exam rules."
            >
                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/exams">
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Back
                        </Link>
                    </Button>
                    <Button type="submit" form="admin-config-form">
                        Save Changes
                    </Button>
                </div>
            </PageHeader>

            <Separator />

            <ExamConfigForm defaultValues={MOCK_EXAM_CONFIG} />
        </div>
    );
}
