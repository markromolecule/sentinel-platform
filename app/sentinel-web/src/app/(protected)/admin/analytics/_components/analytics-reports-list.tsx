"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table/data-table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/status-badge";
import { Download, FileBarChart, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AnalyticsReportsListProps } from "@/app/(protected)/admin/analytics/_types";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";

type Report = AnalyticsReportsListProps["reports"][0];

const columns: ColumnDef<Report>[] = [
    {
        accessorKey: "title",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Report Title" />
        ),
        cell: ({ row }) => <div className="font-medium">{row.getValue("title")}</div>,
    },
    {
        accessorKey: "type",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Type" />
        ),
        cell: ({ row }) => <div className="capitalize">{row.getValue("type")}</div>,
    },
    {
        accessorKey: "generatedAt",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Generated At" />
        ),
    },
    {
        accessorKey: "format",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Format" />
        ),
        cell: ({ row }) => <div className="uppercase">{row.getValue("format")}</div>,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            return <StatusBadge status={status} />;
        }
    },
    {
        id: "actions",
        header: ({ column }) => (
            <div className="text-right">Actions</div>
        ),
        cell: ({ row }) => {
            const report = row.original;
            return (
                <div className="text-right">
                    {report.status === "ready" ? (
                        <Button variant="ghost" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                        </Button>
                    ) : report.status === "generating" ? (
                        <Button variant="ghost" size="sm" disabled>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                        </Button>
                    ) : (
                        <span className="text-muted-foreground text-sm">Unavailable</span>
                    )}
                </div>
            );
        },
    },
];

export function AnalyticsReportsList({ reports }: AnalyticsReportsListProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="space-y-1">
                    <CardTitle>Available Reports</CardTitle>
                    <CardDescription>
                        Download administrative reports on system usage and exam integrity.
                    </CardDescription>
                </div>
                <Button className="bg-[#323d8f] hover:bg-[#323d8f]/90">
                    <FileBarChart className="mr-2 h-4 w-4" />
                    Generate New Report
                </Button>
            </CardHeader>
            <CardContent>
                <DataTable
                    columns={columns}
                    data={reports}
                    searchKey="title"
                />
            </CardContent>
        </Card>
    );
}
