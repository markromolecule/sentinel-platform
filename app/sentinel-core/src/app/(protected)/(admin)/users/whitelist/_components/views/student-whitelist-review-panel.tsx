"use client";

import { useMemo } from "react";
import {
    Alert,
    AlertDescription,
    Badge,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Tabs,
    TabsList,
    TabsTrigger,
} from "@sentinel/ui";
import { AlertTriangle, ArrowRightLeft, CopyCheck, Layers3 } from "lucide-react";
import { StudentWhitelist } from "@sentinel/shared/types";

export type StudentWhitelistReviewFilter =
    | "all"
    | "duplicates"
    | "reassignment"
    | "unclaimed";

interface StudentWhitelistReviewPanelProps {
    records: StudentWhitelist[];
    activeFilter: StudentWhitelistReviewFilter;
    onFilterChange: (value: StudentWhitelistReviewFilter) => void;
    selectedInstitutionLabel?: string | null;
}

type ReviewSummary = {
    duplicateIds: Set<string>;
    reassignmentIds: Set<string>;
    duplicateGroups: string[][];
    reassignmentGroups: string[][];
};

function normalizeValue(value?: string | null) {
    return (value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function buildProgramKey(record: StudentWhitelist) {
    return [record.institutionId, record.departmentId, record.courseId].join("::");
}

function buildDisplayName(record: StudentWhitelist) {
    return [record.lastName, record.firstName].filter(Boolean).join(", ");
}

function createReviewSummary(records: StudentWhitelist[]): ReviewSummary {
    const studentNumberGroups = new Map<string, StudentWhitelist[]>();
    const identityGroups = new Map<string, StudentWhitelist[]>();

    records.forEach((record) => {
        const normalizedStudentNumber = normalizeValue(record.studentNumber);
        const normalizedLastName = normalizeValue(record.lastName);
        const normalizedFirstName = normalizeValue(record.firstName);

        if (normalizedStudentNumber) {
            const group = studentNumberGroups.get(normalizedStudentNumber) || [];
            group.push(record);
            studentNumberGroups.set(normalizedStudentNumber, group);
        }

        if (normalizedLastName && normalizedFirstName) {
            const identityKey = [
                record.institutionId,
                normalizedLastName,
                normalizedFirstName,
            ].join("::");
            const group = identityGroups.get(identityKey) || [];
            group.push(record);
            identityGroups.set(identityKey, group);
        }
    });

    const duplicateIds = new Set<string>();
    const reassignmentIds = new Set<string>();
    const duplicateGroups: string[][] = [];
    const reassignmentGroups: string[][] = [];

    const registerGroup = (
        groupedRecords: StudentWhitelist[],
        targetIds: Set<string>,
        targetGroups: string[][],
    ) => {
        const groupIds = groupedRecords.map((record) => record.id);
        groupIds.forEach((id) => targetIds.add(id));
        targetGroups.push(groupIds);
    };

    studentNumberGroups.forEach((groupedRecords) => {
        if (groupedRecords.length < 2) {
            return;
        }

        registerGroup(groupedRecords, duplicateIds, duplicateGroups);

        const uniquePrograms = new Set(groupedRecords.map(buildProgramKey));
        if (uniquePrograms.size > 1) {
            registerGroup(groupedRecords, reassignmentIds, reassignmentGroups);
        }
    });

    identityGroups.forEach((groupedRecords) => {
        if (groupedRecords.length < 2) {
            return;
        }

        registerGroup(groupedRecords, duplicateIds, duplicateGroups);

        const uniquePrograms = new Set(groupedRecords.map(buildProgramKey));
        if (uniquePrograms.size > 1) {
            registerGroup(groupedRecords, reassignmentIds, reassignmentGroups);
        }
    });

    return {
        duplicateIds,
        reassignmentIds,
        duplicateGroups,
        reassignmentGroups,
    };
}

function summarizeGroups(records: StudentWhitelist[], groups: string[][]) {
    return groups
        .slice(0, 3)
        .map((group) =>
            group
                .map((id) => records.find((record) => record.id === id))
                .filter(Boolean)
                .map((record) => {
                    const resolvedRecord = record as StudentWhitelist;
                    return buildDisplayName(resolvedRecord) || resolvedRecord.studentNumber;
                })
                .join(" / "),
        )
        .filter(Boolean);
}

export function getStudentWhitelistReviewBuckets(records: StudentWhitelist[]) {
    const summary = createReviewSummary(records);

    return {
        duplicates: records.filter((record) => summary.duplicateIds.has(record.id)),
        reassignment: records.filter((record) => summary.reassignmentIds.has(record.id)),
        unclaimed: records.filter((record) => !record.claimedUserId),
        summary,
    };
}

export function StudentWhitelistReviewPanel({
    records,
    activeFilter,
    onFilterChange,
    selectedInstitutionLabel,
}: StudentWhitelistReviewPanelProps) {
    const { duplicates, reassignment, unclaimed, summary } = useMemo(
        () => getStudentWhitelistReviewBuckets(records),
        [records],
    );

    const duplicateExamples = useMemo(
        () => summarizeGroups(records, summary.duplicateGroups),
        [records, summary.duplicateGroups],
    );
    const reassignmentExamples = useMemo(
        () => summarizeGroups(records, summary.reassignmentGroups),
        [records, summary.reassignmentGroups],
    );

    const scopeLabel = selectedInstitutionLabel || "all institutions";

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Visible Entries
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold">{records.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Reviewing {scopeLabel}.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Potential Duplicates
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <div className="text-2xl font-semibold">{duplicates.length}</div>
                            <CopyCheck className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Same student number or same full name within one institution.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Needs Reassignment
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <div className="text-2xl font-semibold">{reassignment.length}</div>
                            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Same identity appears across more than one academic scope.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Unclaimed Entries
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <div className="text-2xl font-semibold">{unclaimed.length}</div>
                            <Layers3 className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Ready for onboarding or still waiting for students to claim.
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="space-y-2">
                    <p>
                        Review buckets are heuristic and intended to help superadmin spot
                        records that may need attention without taking ownership away from
                        program admins.
                    </p>
                    {(duplicateExamples.length > 0 || reassignmentExamples.length > 0) && (
                        <div className="flex flex-wrap gap-2">
                            {duplicateExamples.map((example) => (
                                <Badge key={`duplicate-${example}`} variant="outline">
                                    Duplicate: {example}
                                </Badge>
                            ))}
                            {reassignmentExamples.map((example) => (
                                <Badge key={`reassign-${example}`} variant="outline">
                                    Reassign: {example}
                                </Badge>
                            ))}
                        </div>
                    )}
                </AlertDescription>
            </Alert>

            <Tabs
                value={activeFilter}
                onValueChange={(value) =>
                    onFilterChange(value as StudentWhitelistReviewFilter)
                }
            >
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="duplicates">
                        Duplicates
                        <Badge variant="outline" className="ml-2">
                            {duplicates.length}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="reassignment">
                        Needs Reassignment
                        <Badge variant="outline" className="ml-2">
                            {reassignment.length}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="unclaimed">
                        Unclaimed
                        <Badge variant="outline" className="ml-2">
                            {unclaimed.length}
                        </Badge>
                    </TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
    );
}
