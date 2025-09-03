import React from 'react';

export default function Pagination({ page, total, limit, onPage }) {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages = [];
    const visible = 5; // максимальное количество видимых страниц

    if (totalPages <= visible) {
      // если всего страниц меньше видимых, показываем все
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(page - 2, 1);
      let end = Math.min(start + visible - 1, totalPages);
      start = Math.max(end - visible + 1, 1);

      if (start > 1) pages.push(1);
      if (start > 2) pages.push('...');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push('...');
      if (end < totalPages) pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPages();

  return (
    <div className="pagination">
      <button onClick={() => onPage(Math.max(page - 1, 1))} disabled={page === 1}>←</button>
      {pages.map((p, idx) =>
        p === '...' ? (
          <span key={`dots-${idx}`} className="dots">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPage(p)}
            className={p === page ? 'active' : ''}
          >
            {p}
          </button>
        )
      )}
      <button onClick={() => onPage(Math.min(page + 1, totalPages))} disabled={page === totalPages}>→</button>
    </div>
  );
}