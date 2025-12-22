"use client"

import * as React from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

export type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  searchKeys?: string[]
  searchPlaceholder?: string
  className?: string
  toolbarRight?: React.ReactNode
  controlledSearchValue?: string
  onControlledSearchChange?: (value: string) => void
  serverPage?: number
  serverPageCount?: number
  onServerPageChange?: (page: number) => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchKeys,
  searchPlaceholder = "Search...",
  className,
  toolbarRight,
  controlledSearchValue,
  onControlledSearchChange,
  serverPage,
  serverPageCount,
  onServerPageChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [multiSearch, setMultiSearch] = React.useState("")

  const isControlledSearch =
    typeof controlledSearchValue === "string" && typeof onControlledSearchChange === "function"

  const isServerPagination =
    typeof serverPage === "number" && typeof serverPageCount === "number" && typeof onServerPageChange === "function"

  const effectiveData = React.useMemo(() => {
    if (isControlledSearch) return data

    const keys = searchKeys?.filter(Boolean) ?? []
    const q = multiSearch.trim().toLowerCase()
    if (!keys.length || !q) return data

    return data.filter((row) => {
      const record = row as Record<string, unknown>
      return keys.some((k) => {
        const v = record[k]
        if (v == null) return false
        return String(v).toLowerCase().includes(q)
      })
    })
  }, [data, isControlledSearch, multiSearch, searchKeys])

  const table = useReactTable({
    data: effectiveData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  const searchValue =
    searchKey && table.getColumn(searchKey)
      ? ((table.getColumn(searchKey)?.getFilterValue() as string) ?? "")
      : ""

  const showMultiSearch = !searchKey && (searchKeys?.length ?? 0) > 0
  const showColumnSearch = Boolean(searchKey && table.getColumn(searchKey))
  const showToolbar = showMultiSearch || showColumnSearch || Boolean(toolbarRight)

  return (
    <div className={cn("space-y-4", className)}>
      {showToolbar ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-sm">
            {showMultiSearch ? (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={isControlledSearch ? controlledSearchValue : multiSearch}
                  onChange={(e) => {
                    const v = e.target.value
                    if (isControlledSearch) {
                      onControlledSearchChange(v)
                    } else {
                      setMultiSearch(v)
                    }
                  }}
                  placeholder={searchPlaceholder}
                  className="pl-9"
                />
              </div>
            ) : null}

            {showColumnSearch ? (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchValue}
                  onChange={(e) => table.getColumn(searchKey!)?.setFilterValue(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="pl-9"
                />
              </div>
            ) : null}
          </div>

          {toolbarRight ? <div className="flex items-center justify-end gap-2">{toolbarRight}</div> : null}
        </div>
      ) : null}

      <div className="rounded-xl border-2 border-border/50 bg-background shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b-2 border-border/60">
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  return (
                    <TableHead key={header.id} className="bg-primary font-semibold text-primary-foreground">
                      {header.isPlaceholder ? null : (
                        <button
                          type="button"
                          onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                          className={cn(
                            "inline-flex items-center gap-2 w-full justify-start rounded-md px-2 py-2 text-sm font-medium",
                            canSort && "cursor-pointer select-none hover:bg-primary/80 transition-colors"
                          )}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getIsSorted() === "asc" ? <span className="text-primary-foreground">▲</span> : null}
                          {header.column.getIsSorted() === "desc" ? <span className="text-primary-foreground">▼</span> : null}
                        </button>
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
                  className="border-b border-border/40 odd:bg-background even:bg-muted/20 hover:bg-accent/10 transition-colors duration-150"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-4xl opacity-20">📋</div>
                    <div>No results found.</div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="text-sm text-muted-foreground">
          {isServerPagination ? (
            <>
              Page <span className="font-medium">{serverPage}</span> of <span className="font-medium">{serverPageCount}</span>
            </>
          ) : (
            <>
              Showing <span className="font-medium">{table.getState().pagination.pageIndex + 1}</span> of <span className="font-medium">{table.getPageCount()}</span> pages
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (isServerPagination) {
                onServerPageChange(serverPage - 1)
              } else {
                table.previousPage()
              }
            }}
            disabled={isServerPagination ? serverPage <= 1 : !table.getCanPreviousPage()}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (isServerPagination) {
                onServerPageChange(serverPage + 1)
              } else {
                table.nextPage()
              }
            }}
            disabled={isServerPagination ? serverPage >= serverPageCount : !table.getCanNextPage()}
            className="gap-1"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
