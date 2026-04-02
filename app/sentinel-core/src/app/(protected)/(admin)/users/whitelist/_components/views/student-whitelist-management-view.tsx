"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import {
    useDebounce,
    useInstitutionsQuery,
    useStudentWhitelistQuery,
} from "@sentinel/hooks";
import {
    PageHeader,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Separator,
} from "@sentinel/ui";
import { AddStudentWhitelistDialog } from "@/app/(protected)/(admin)/users/whitelist/_components/dialogs/add-student-whitelist-dialog";
import { BulkImportStudentWhitelistDialog } from "@/app/(protected)/(admin)/users/whitelist/_components/dialogs/bulk-import-student-whitelist-dialog";
import { StudentWhitelistList } from "@/app/(protected)/(admin)/users/whitelist/_components/views/student-whitelist-list";
import {
    getStudentWhitelistReviewBuckets,
    StudentWhitelistReviewFilter,
    StudentWhitelistReviewPanel,
} from "@/app/(protected)/(admin)/users/whitelist/_components/views/student-whitelist-review-panel";

interface StudentWhitelistManagementViewProps {
    title?: string;
    description?: string;
    showInstitution?: boolean;
    enableInstitutionFilter?: boolean;
    showReviewTools?: boolean;
}

export function StudentWhitelistManagementView({
    title = "Student Whitelist",
    description = "Manage approved student identities used during onboarding verification.",
    showInstitution = false,
    enableInstitutionFilter = false,
    showReviewTools = false,
}: StudentWhitelistManagementViewProps) {
    const [search, setSearch] = useState("");
    const [selectedInstitutionId, setSelectedInstitutionId] = useState("all");
    const [reviewFilter, setReviewFilter] =
        useState<StudentWhitelistReviewFilter>("all");
    const debouncedSearch = useDebounce(search, 500);
    const { data: institutions = [] } = useInstitutionsQuery();
    const institutionQuery =
        enableInstitutionFilter && selectedInstitutionId !== "all"
            ? selectedInstitutionId
            : undefined;
    const { data: records = [], isLoading, error } = useStudentWhitelistQuery({
        search: debouncedSearch || undefined,
        institution_id: institutionQuery,
    });

    const reviewBuckets = useMemo(
        () => getStudentWhitelistReviewBuckets(records),
        [records],
    );
    const visibleRecords = useMemo(() => {
        if (!showReviewTools) {
            return records;
        }

        switch (reviewFilter) {
            case "duplicates":
                return reviewBuckets.duplicates;
            case "reassignment":
                return reviewBuckets.reassignment;
            case "unclaimed":
                return reviewBuckets.unclaimed;
            case "all":
            default:
                return records;
        }
    }, [records, reviewBuckets, reviewFilter, showReviewTools]);

    const selectedInstitutionLabel =
        selectedInstitutionId === "all"
            ? "All Institutions"
            : institutions.find(
                  (institution) => institution.id === selectedInstitutionId,
              )?.name;

    const toolbarActions = enableInstitutionFilter ? (
        <div className="min-w-[220px]">
            <Select
                value={selectedInstitutionId}
                onValueChange={setSelectedInstitutionId}
            >
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter institution" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Institutions</SelectItem>
                    {institutions.map((institution) => (
                        <SelectItem key={institution.id} value={institution.id}>
                            {institution.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    ) : undefined;

    if (error) {
        return (
            <div className="flex flex-col gap-6 md:p-6 p-4">
                <PageHeader title={title} description={description} />
                <div className="flex h-64 flex-col items-center justify-center gap-2">
                    <p className="text-destructive font-medium">
                        Failed to load whitelist records.
                    </p>
                    <p className="text-muted-foreground text-sm">
                        Please ensure the API is reachable.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 md:p-6 p-4">
            <PageHeader title={title} description={description}>
                <div className="flex flex-wrap items-center gap-2">
                    <BulkImportStudentWhitelistDialog />
                    <AddStudentWhitelistDialog />
                </div>
            </PageHeader>
            <Separator />

            {showReviewTools && (
                <StudentWhitelistReviewPanel
                    records={records}
                    activeFilter={reviewFilter}
                    onFilterChange={setReviewFilter}
                    selectedInstitutionLabel={selectedInstitutionLabel}
                />
            )}

            <div className="relative">
                <StudentWhitelistList
                    records={visibleRecords}
                    search={search}
                    onSearchChange={setSearch}
                    isLoading={isLoading}
                    showInstitution={showInstitution}
                    toolbarActions={toolbarActions}
                />

                {isLoading && visibleRecords.length === 0 && (
                    <div className="absolute inset-x-0 bottom-0 top-[60px] flex items-center justify-center rounded-md bg-background/80">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}
            </div>
        </div>
    );
}
