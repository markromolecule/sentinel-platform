"use client";

import { useMemo, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
    useDebounce,
    useInstitutionsQuery,
    usePurgeStudentWhitelistMutation,
    useStudentWhitelistQuery,
} from "@sentinel/hooks";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    Button,
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
    const [purgeOpen, setPurgeOpen] = useState(false);
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
    const purgeMutation = usePurgeStudentWhitelistMutation({
        onSuccess: (result) => {
            setPurgeOpen(false);
            if (result.skippedClaimedCount > 0) {
                const suffix =
                    result.skippedClaimedCount === 1 ? "entry was" : "entries were";
                const skippedText = `${result.skippedClaimedCount} claimed ${suffix} skipped.`;
                toast.info(skippedText);
            }
        },
    });

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
                    <Button
                        variant="outline"
                        className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setPurgeOpen(true)}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Unclaimed
                    </Button>
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

            <AlertDialog open={purgeOpen} onOpenChange={setPurgeOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete unclaimed whitelist entries?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This removes unclaimed whitelist records within your current admin
                            scope
                            {enableInstitutionFilter && selectedInstitutionId !== "all"
                                ? ` for ${selectedInstitutionLabel}.`
                                : "."}{" "}
                            Claimed entries are preserved. Delete the linked student account first
                            if you want a claimed record to return to an unclaimed state.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={purgeMutation.isPending}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-white hover:bg-destructive/90"
                            disabled={purgeMutation.isPending}
                            onClick={(event) => {
                                event.preventDefault();
                                purgeMutation.mutate({
                                    institution_id:
                                        enableInstitutionFilter && selectedInstitutionId !== "all"
                                            ? selectedInstitutionId
                                            : undefined,
                                    include_claimed: false,
                                });
                            }}
                        >
                            {purgeMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete Unclaimed"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
