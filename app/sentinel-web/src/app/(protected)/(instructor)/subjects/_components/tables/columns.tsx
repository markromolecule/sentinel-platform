import { ColumnDef } from "@tanstack/react-table"
import { Subject } from "@sentinel/shared/types"
import { DataTableColumnHeader } from "@sentinel/ui"
import { Badge } from "@sentinel/ui"
import { format } from "date-fns"
import { SubjectActionsCell } from "@/app/(protected)/(instructor)/subjects/_components/tables/subject-actions-cell"

export const columns = (): ColumnDef<Subject>[] => [
  {
    accessorKey: "code",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Code" />
    ),
    cell: ({ row }) => <div className="font-medium text-sm">{row.getValue("code")}</div>,
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => <div className="max-w-[180px] truncate text-sm" title={row.getValue("title")}>{row.getValue("title")}</div>,
  },
  {
    id: "term",
    accessorFn: (row) => `${row.termAcademicYear || ""} ${row.termSemester || ""}`.trim(),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Term" />
    ),
    cell: ({ row }) => {
      const termAcademicYear = row.original.termAcademicYear;
      const termSemester = row.original.termSemester;

      return (
        <div className="max-w-[150px] text-sm">
          {termAcademicYear || termSemester ? (
            <>
              <div className="font-medium">{termAcademicYear || "Term"}</div>
              <div className="text-xs text-muted-foreground">{termSemester || "Semester not set"}</div>
            </>
          ) : (
            <span className="text-muted-foreground text-xs font-normal italic">N/A</span>
          )}
        </div>
      );
    }
  },
  {
    accessorKey: "department_code",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Dept" />
    ),
    cell: ({ row }) => {
      const code = row.original.department_code;
      return (
        <div className="max-w-[80px] truncate text-sm font-semibold" title={code || 'N/A'}>
          {code || <span className="text-muted-foreground text-xs font-normal italic">N/A</span>}
        </div>
      );
    }
  },
  {
    accessorKey: "course_code",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Course" />
    ),
    cell: ({ row }) => {
      const code = row.original.course_code;
      return (
        <div className="max-w-[80px] truncate text-sm font-semibold" title={code || 'N/A'}>
          {code || <span className="text-muted-foreground text-xs font-normal italic">N/A</span>}
        </div>
      );
    }
  },
  {
    accessorKey: "sections",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sections" />
    ),
    cell: ({ row }) => {
      const sections = (row.original.sections || []) as (string | { id: string; name: string })[];
      return (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {sections.length > 0 ? sections.map((s) => (
            <Badge key={typeof s === 'string' ? s : s.id} variant="secondary" className="text-[11px] h-5 px-1.5 font-medium border-primary/20 bg-primary/5 text-primary">
              {typeof s === 'string' ? s : s.name}
            </Badge>
          )) : <span className="text-muted-foreground text-xs font-normal italic">N/A</span>}
        </div>
      );
    }
  },
  {
    accessorKey: "requested_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Requested At" />
    ),
    cell: ({ row }) => {
      const date = row.original.requested_at;
      return (
        <div className="text-xs text-muted-foreground font-medium">
          {date ? format(new Date(date), "MMM dd, yyyy") : "-"}
        </div>
      );
    }
  },
  {
    accessorKey: "approved_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Approved At" />
    ),
    cell: ({ row }) => {
      const date = row.original.approved_at;
      return (
        <div className="text-xs text-muted-foreground font-medium">
          {date ? format(new Date(date), "MMM dd, yyyy") : "-"}
        </div>
      );
    }
  },
  {
    accessorKey: "approved_by",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Approved By" />
    ),
    cell: ({ row }) => {
      const approver = row.original.approved_by;
      return (
        <div className="text-xs font-medium truncate max-w-[100px]" title={approver || ''}>
          {approver || "-"}
        </div>
      );
    }
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.original.status || 'APPROVED';
      return (
        <Badge
          variant={
            status === 'PENDING' ? 'secondary' :
              status === 'APPROVED' ? 'default' :
                status === 'REJECTED' ? 'destructive' : 'default'
          }
          className="text-[10px] uppercase font-bold tracking-wider h-5"
        >
          {status}
        </Badge>
      );
    }
  },
  {
    id: "actions",
    cell: ({ row }) => <SubjectActionsCell subject={row.original} />,
  },
]
