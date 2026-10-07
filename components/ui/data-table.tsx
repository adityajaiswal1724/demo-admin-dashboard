"use client";
/* TanStack Table v8 is intentionally not compiled/memoized by React Compiler. */
/* eslint-disable react-hooks/incompatible-library */
import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from "lucide-react";
import { EmptyState } from "./shared";
export interface TableColumn<T> {
  key: string;
  label: string;
  value: (row: T) => string | number;
  render?: (row: T) => React.ReactNode;
  money?: boolean;
}
export function DataTable<T>({
  data,
  columns,
  searchText,
  searchPlaceholder = "Search records…",
  filters,
  label = "Records",
  pageSize = 7,
}: {
  data: T[];
  columns: TableColumn<T>[];
  searchText: (row: T) => string;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  label?: string;
  pageSize?: number;
}) {
  const [query, setQuery] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize });
  const filtered = useMemo(
    () =>
      data.filter((r) =>
        searchText(r).toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [data, query, searchText],
  );
  const defs = useMemo<ColumnDef<T>[]>(
    () =>
      columns.map((c) => ({
        id: c.key,
        header: c.label,
        accessorFn: c.value,
        cell: (info) =>
          c.render
            ? c.render(info.row.original)
            : String(info.getValue() ?? ""),
      })),
    [columns],
  );
  const table = useReactTable({
    data: filtered,
    columns: defs,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
  return (
    <div className="data-table">
      <div className="table-toolbar">
        <div className="table-search">
          <Search size={16} />
          <input
            aria-label={`Search ${label.toLowerCase()}`}
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPagination((p) => ({ ...p, pageIndex: 0 }));
            }}
          />
          {query && (
            <button
              className="icon-button"
              aria-label="Clear table search"
              onClick={() => setQuery("")}
            >
              <X size={14} />
            </button>
          )}
        </div>
        <div className="table-filters">{filters}</div>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            {table.getHeaderGroups().map((g) => (
              <tr key={g.id}>
                {g.headers.map((h) => (
                  <th
                    key={h.id}
                    className={
                      columns.find((c) => c.key === h.id)?.money
                        ? "money-cell"
                        : ""
                    }
                    aria-sort={
                      h.column.getIsSorted() === "asc"
                        ? "ascending"
                        : h.column.getIsSorted() === "desc"
                          ? "descending"
                          : "none"
                    }
                  >
                    <button onClick={h.column.getToggleSortingHandler()}>
                      {flexRender(h.column.columnDef.header, h.getContext())}
                      {h.column.getIsSorted() === "asc" ? (
                        <ArrowUp size={12} />
                      ) : h.column.getIsSorted() === "desc" ? (
                        <ArrowDown size={12} />
                      ) : (
                        <ArrowUpDown size={11} />
                      )}
                    </button>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((r) => (
              <tr key={r.id}>
                {r.getVisibleCells().map((c) => (
                  <td
                    key={c.id}
                    className={
                      columns.find((col) => col.key === c.column.id)?.money
                        ? "money-cell"
                        : ""
                    }
                  >
                    {flexRender(c.column.columnDef.cell, c.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!filtered.length && <EmptyState />}
      <div className="table-footer">
        <span>
          {filtered.length
            ? `${pagination.pageIndex * pagination.pageSize + 1}–${Math.min((pagination.pageIndex + 1) * pagination.pageSize, filtered.length)} of ${filtered.length}`
            : "0"}{" "}
          {label.toLowerCase()}
        </span>
        <div className="row">
          <span>
            Page {table.getPageCount() ? pagination.pageIndex + 1 : 0} of{" "}
            {table.getPageCount()}
          </span>
          <button
            className="icon-button"
            aria-label="Previous page"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            <ChevronLeft size={17} />
          </button>
          <button
            className="icon-button"
            aria-label="Next page"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}
