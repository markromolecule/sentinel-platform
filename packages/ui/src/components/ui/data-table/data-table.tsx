"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../table"
import { cn } from "../../../lib/utils"
import { DataTablePagination } from "./data-table-pagination"
import { DataTableViewOptions } from "./data-table-view-options"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import { X } from "lucide-react"
import { Button } from "../button"
import { SearchBar } from "../search-bar"

export interface DataTableFacet {
  columnKey: string;
  title: string;
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  searchPlaceholder?: string
  toolbarActions?: React.ReactNode
  meta?: any
  facets?: DataTableFacet[];
  onRowClick?: (row: TData) => void;
  rowSelection?: any;
  onRowSelectionChange?: (selection: any) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  initialColumnVisibility?: VisibilityState;
  emptyContent?: React.ReactNode;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search...",
  toolbarActions,
  meta,
  facets,
  onRowClick,
  rowSelection,
  onRowSelectionChange,
  searchValue,
  onSearchChange,
  initialColumnVisibility = {},
  emptyContent,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(initialColumnVisibility)
  const [internalRowSelection, setInternalRowSelection] = React.useState({})

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: onRowSelectionChange || setInternalRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection: rowSelection || internalRowSelection,
    },
    meta,
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          {(searchKey || onSearchChange) && (
            <SearchBar
              placeholder={searchPlaceholder}
              value={onSearchChange ? searchValue : (table.getColumn(searchKey!)?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                onSearchChange
                  ? onSearchChange(event.target.value)
                  : table.getColumn(searchKey!)?.setFilterValue(event.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              containerClassName="max-w-sm"
            />
          )}

          {facets && facets.map((facet) => {
            const column = table.getColumn(facet.columnKey);
            if (!column) return null;
            return (
              <DataTableFacetedFilter
                key={facet.columnKey}
                column={column}
                title={facet.title}
                options={facet.options}
              />
            );
          })}

          {table.getState().columnFilters.length > 0 && (
            <Button
              variant="ghost"
              onClick={() => table.resetColumnFilters()}
              className="h-8 px-2 lg:px-3"
            >
              Reset
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}

          {toolbarActions}
        </div>
        <DataTableViewOptions table={table} />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => onRowClick?.(row.original)}
                  className={cn(onRowClick && "cursor-pointer hover:bg-muted/50")}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center border-none"
                >
                  {emptyContent || "No results."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
}
