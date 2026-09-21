import { Loader2 } from 'lucide-react';
import Button from './Button';
import { EmptyState, ErrorState, TableSkeleton } from './States';

/**
 * columns: [{ key, header, render?(row), className?, headerClassName? }]
 * Horizontally scrollable on small screens. Rows become clickable when onRowClick is given
 * (the first cell link/button remains the keyboard-accessible target — pass `render` accordingly).
 */
export default function DataTable({ columns, rows, loading, error, onRetry, empty, onRowClick, rowKey = (r) => r.id, caption }) {
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (loading) return <TableSkeleton cols={Math.min(columns.length, 6)} />;
  if (!rows.length) return empty || <EmptyState title="Nothing to show" />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="border-b border-ink-200 bg-ink-50 text-xs font-semibold tracking-wide text-ink-600 uppercase">
          <tr>
            {columns.map((c) => <th key={c.key} scope="col" className={`px-4 py-3 whitespace-nowrap ${c.headerClassName || ''}`}>{c.header}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {rows.map((row) => (
            <tr key={rowKey(row)} onClick={onRowClick ? () => onRowClick(row) : undefined} className={onRowClick ? 'cursor-pointer hover:bg-ink-50' : ''}>
              {columns.map((c) => <td key={c.key} className={`px-4 py-3 align-middle ${c.className || ''}`}>{c.render ? c.render(row) : row[c.key] ?? '—'}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Footer for cursor-paginated lists. */
export function LoadMore({ shown, hasMore, loading, onLoadMore, noun = 'records' }) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-ink-100 px-4 py-3 text-sm text-ink-600">
      <span aria-live="polite">Showing {shown} {noun}</span>
      {hasMore ? (
        <Button variant="secondary" size="sm" onClick={onLoadMore} disabled={loading}>
          {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />} Load more
        </Button>
      ) : shown > 0 ? <span className="text-ink-400">End of list</span> : null}
    </div>
  );
}
