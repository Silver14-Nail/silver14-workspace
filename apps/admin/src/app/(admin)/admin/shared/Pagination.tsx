'use client';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (value: number) => void;
}

export default function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const start = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="px-4 py-3 border-t border-[#E5E7EB] flex items-center justify-between flex-wrap gap-3">
      <div className="flex items-center gap-2 text-xs text-[#6B7280]">
        <span>Rows per page:</span>
        <select
          value={itemsPerPage}
          onChange={(e) => {
            onItemsPerPageChange(Number(e.target.value));
            onPageChange(1);
          }}
          className="border border-[#E5E7EB] rounded px-1.5 py-1 outline-none cursor-pointer text-[#374151]"
        >
          {[10, 20, 50].map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-1 text-xs text-[#6B7280]">
        <span>
          {totalItems === 0 ? '0' : `${start}–${end}`} of {totalItems}
        </span>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-2 py-1 rounded hover:bg-[#F3F4F6] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ‹
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-2 py-1 rounded hover:bg-[#F3F4F6] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ›
        </button>
      </div>
    </div>
  );
}
