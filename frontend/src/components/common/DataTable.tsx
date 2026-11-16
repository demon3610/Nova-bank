import { useState, useMemo, type ReactNode } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Inbox } from 'lucide-react';
import clsx from 'clsx';
import LoadingSkeleton from './LoadingSkeleton';

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  onRowClick?: (item: T) => void;
  keyExtractor: (item: T) => string;
  sortable?: boolean;
}

export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data found',
  emptyIcon,
  onRowClick,
  keyExtractor,
  sortable = true,
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const sortedData = useMemo(() => {
    if (!sortColumn) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = typeof aVal === 'string' ? aVal.localeCompare(String(bVal)) : Number(aVal) - Number(bVal);
      return sortDirection === 'asc' ? cmp : -cmp;
    });
  }, [data, sortColumn, sortDirection]);

  const handleSort = (key: string) => {
    if (!sortable) return;
    if (sortColumn === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(key);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ column }: { column: Column<T> }) => {
    if (!column.sortable || !sortable) return null;
    if (sortColumn !== column.key) return <ChevronsUpDown className="w-3.5 h-3.5 text-text-muted ml-1 flex-shrink-0" />;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-3.5 h-3.5 text-primary-500 ml-1 flex-shrink-0" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-primary-500 ml-1 flex-shrink-0" />
    );
  };

  if (loading) {
    return <LoadingSkeleton variant="table" />;
  }

  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        {emptyIcon || <Inbox className="w-12 h-12 text-text-muted mb-3" />}
        <p className="text-sm text-text-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-surface-border">
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => col.sortable && handleSort(col.key)}
                className={clsx(
                  'px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider',
                  col.sortable && sortable && 'cursor-pointer select-none hover:text-text transition-colors',
                )}
              >
                <div className="flex items-center">
                  {col.label}
                  <SortIcon column={col} />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item, idx) => (
            <tr
              key={keyExtractor(item)}
              onClick={() => onRowClick?.(item)}
              className={clsx(
                'border-b border-surface-border transition-colors',
                idx % 2 === 0 ? 'bg-white' : 'bg-surface/50',
                onRowClick && 'cursor-pointer hover:bg-primary-50/50',
              )}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-sm text-text">
                  {col.render ? col.render(item) : String(item[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
