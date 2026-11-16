import { useMemo, useState, useCallback } from 'react';

interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
  total?: number;
}

export function usePagination({ initialPage = 1, initialLimit = 10, total = 0 }: UsePaginationOptions = {}) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  const hasNext = useMemo(() => page < totalPages, [page, totalPages]);
  const hasPrev = useMemo(() => page > 1, [page]);

  const nextPage = useCallback(() => {
    setPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToPage = useCallback((p: number) => {
    setPage(Math.max(1, Math.min(p, totalPages)));
  }, [totalPages]);

  const changeLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  }, []);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext,
    hasPrev,
    setPage: goToPage,
    nextPage,
    prevPage,
    setLimit: changeLimit,
  };
}
