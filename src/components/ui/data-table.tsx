'use client';

import { Skeleton } from '@components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui/table';
import {
  type ColumnDef,
  createColumnHelper,
  type RowData,
  tableFeatures,
  useTable,
} from '@tanstack/react-table';
import * as React from 'react';

type DataTableColumnMeta = {
  headerClassName?: string;
  cellClassName?: string;
  /** Placeholder rendered in this column while the table is loading. */
  skeleton?: React.ReactNode;
};

const dataTableFeatures = tableFeatures({
  columnMeta: {} as DataTableColumnMeta,
});

type DataTableFeatures = typeof dataTableFeatures;

export type DataTableColumnDef<TData extends RowData> = ColumnDef<
  DataTableFeatures,
  TData,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any
>;

export const createDataTableColumnHelper = <TData extends RowData>() =>
  createColumnHelper<DataTableFeatures, TData>();

const NO_DATA: never[] = [];

export type DataTableProps<TData extends RowData> = Omit<
  React.ComponentProps<typeof Table>,
  'children'
> & {
  columns: DataTableColumnDef<TData>[];
  data: Optional<TData[]>;
  getRowId?: (row: TData, index: number) => string;
  /** Renders `skeletonRows` placeholder rows instead of the data. */
  loading?: boolean;
  skeletonRows?: number;
  /** Applied to every row, header row included. */
  rowClassName?: string;
};

export const DataTable = <TData extends RowData>({
  columns,
  data,
  getRowId,
  loading = false,
  skeletonRows = 3,
  rowClassName,
  ...props
}: DataTableProps<TData>) => {
  const table = useTable({
    features: dataTableFeatures,
    columns,
    data: data ?? NO_DATA,
    getRowId,
  });

  const leafColumns = table.getAllLeafColumns();

  return (
    <Table aria-busy={loading || undefined} {...props}>
      <TableHeader>
        {table.getHeaderGroups().map((group) => (
          <TableRow key={group.id} className={rowClassName}>
            {group.headers.map((header) => (
              <TableHead
                key={header.id}
                scope="col"
                colSpan={header.colSpan}
                className={header.column.columnDef.meta?.headerClassName}
              >
                {header.isPlaceholder ? null : (
                  <table.FlexRender header={header} />
                )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {loading
          ? Array.from({ length: skeletonRows }, (_, index) => (
              <TableRow key={index} className={rowClassName}>
                {leafColumns.map((column) => (
                  <TableCell
                    key={column.id}
                    className={column.columnDef.meta?.cellClassName}
                  >
                    {column.columnDef.meta?.skeleton ?? (
                      <Skeleton className="h-3.5 w-20" />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          : table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className={rowClassName}>
                {row.getAllCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cell.column.columnDef.meta?.cellClassName}
                  >
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
      </TableBody>
    </Table>
  );
};
