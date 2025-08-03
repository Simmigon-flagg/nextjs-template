"use client";

import { useEffect, useState } from "react";
import Filters from "../Filters";
import SortDropdown from "../SortDropdown";
import List from "../List";
import BulkActions from "../BulkActions";
import Create from "../Create/Create";

export default function Todos() {
  const ITEMS_PER_PAGE = 4;

  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [fetchedTodos, setFetchedTodos] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [fetchError, setFetchError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCurrentPage(1); // reset page if query/filter changes
  }, [query, startDate, endDate]);

  useEffect(() => {
    const fetchTodos = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          search: query,
          sortBy: sortConfig.key,
          sortOrder: sortConfig.direction,
          ...(startDate && { startDate }),
          ...(endDate && { endDate }),
        });

        const res = await fetch(`/api/todos?${params.toString()}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to fetch");

        setFetchedTodos(data.todos);
        setTotalPages(data.pagination.totalPages);
        setFetchError(null);
      } catch (err) {
        setFetchError(err.message);
        setFetchedTodos([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchTodos();
  }, [currentPage, query, sortConfig, startDate, endDate]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const handleToggle = async (id, todo) => {
    try {
      await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fav: !todo.fav }),
      });
      // Update state manually or re-fetch if needed
      setFetchedTodos((prev) =>
        prev.map((t) => (t._id === id ? { ...t, fav: !t.fav } : t))
      );
    } catch (error) {
      console.error("Failed to toggle fav:", error);
    }
  };

  const deleteItem = async (id) => {
    try {
      await fetch(`/api/todos/${id}`, {
        method: "DELETE"
      });
      // Update state manually or re-fetch if needed
      setFetchedTodos((prev) => prev.filter((t) => t._id !== id));

    } catch (error) {
      console.error("Failed to toggle fav:", error);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-100 dark:bg-gray-800 p-6">
      <div className="max-w-4xl mx-auto space-y-6 text-white">
        <Create />

        {/* Filters */}
        <form>
          <Filters
            query={query}
            setQuery={setQuery}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
          />
        </form>

        {/* Sort Dropdown */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-white">
          <label className="text-sm font-semibold">Sort by:</label>
          <SortDropdown sortConfig={sortConfig} setSortConfig={setSortConfig} />
        </div>

        {/* Error Display */}
        {fetchError && (
          <p className="text-sm text-red-600">{`Error: ${fetchError}`}</p>
        )}

        {/* Loading State */}
        {loading ? (
          <p className="text-center text-white">Loading...</p>
        ) : (
          <>
            {/* Todo List */}
            <List
              items={fetchedTodos}
              selectedIds={selectedIds}
              toggleSelect={toggleSelect}
              handleToggle={handleToggle}
            />

            {/* Bulk Actions */}
            <BulkActions
              filtered={fetchedTodos}
              selectedIds={selectedIds}
              deleteItem={deleteItem}
              handleToggle={handleToggle}
              clearSelection={() => setSelectedIds(new Set())}
            />

            {/* Pagination Controls */}
            <div className=" left-0 w-full bg-white border-t shadow-md z-50">
              <div className="flex justify-center gap-4 p-4">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="self-center text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
