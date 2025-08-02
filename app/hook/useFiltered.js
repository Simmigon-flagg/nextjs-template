import { useMemo } from "react";

function stripTime(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export default function useFiltered(items, { query, startDate, endDate, sortConfig }) {
  return useMemo(() => {
    const q = query.toLowerCase();

    return items
      .filter((item) => {
        const titleMatch = item.title.toLowerCase().includes(q);

        const dateStr = new Date(item.createdAt).toISOString().slice(0, 10);
        const dateMatch = dateStr.includes(q);

        return titleMatch || dateMatch;
      })
      .filter((item) => {
        if (!startDate && !endDate) return true;

        const itemDate = stripTime(new Date(item.createdAt));
        const start = startDate ? stripTime(new Date(startDate)) : null;
        const end = endDate ? stripTime(new Date(endDate)) : null;

        const afterStart = start ? itemDate >= start : true;
        const beforeEnd = end ? itemDate <= end : true;

        return afterStart && beforeEnd;
      })
      .sort((a, b) => {
        if (!sortConfig?.key) return 0;

        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        if (sortConfig.key === "createdAt") {
          return sortConfig.direction === "asc"
            ? new Date(aVal) - new Date(bVal)
            : new Date(bVal) - new Date(aVal);
        }

        if (typeof aVal === "string" && typeof bVal === "string") {
          return sortConfig.direction === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }

        return 0;
      });
  }, [items, query, startDate, endDate, sortConfig]);
}
