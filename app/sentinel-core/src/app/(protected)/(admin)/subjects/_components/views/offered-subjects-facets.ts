"use client";

import { type DataTableFacet } from "@sentinel/ui";

export const offeredSubjectsFacets = [
    {
        columnKey: "status",
        title: "Status",
        options: [
            { label: "Draft", value: "DRAFT" },
            { label: "Open", value: "OPEN" },
            { label: "Closed", value: "CLOSED" },
            { label: "Archived", value: "ARCHIVED" },
        ],
    },
] satisfies DataTableFacet[];
