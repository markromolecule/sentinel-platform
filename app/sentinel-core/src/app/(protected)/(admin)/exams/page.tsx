"use client";

import { MOCK_PROCTOR_EXAMS } from '@sentinel/shared/constants';;
import { ExamsList } from "@/app/(protected)/(admin)/exams/_components/exams-list";
import { Button } from "@sentinel/ui";
import Link from "next/link";
import { Settings } from "lucide-react";
import { PageHeader } from "@/components/common";

export default function AdminExamsPage() {
    return (
        <div className="flex flex-col gap-6 md:p-6 p-4">
            <PageHeader
                title="Exam Management"
                description="View and monitor all examinations across the system."
            >
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline">
                        <Link href="/exams/configuration">
                            <Settings className="mr-2 h-4 w-4" />
                            Defaults
                        </Link>
                    </Button>
                </div>
            </PageHeader>

            <ExamsList exams={MOCK_PROCTOR_EXAMS} />
        </div>
    );
}
