"use client";

import { useContext, useEffect, useState } from "react";
import Filters from "../Filters";
import SortDropdown from "../SortDropdown";
import List from "../List";
import BulkActions from "../BulkActions";
import Create from "../CreateTodo/CreateTodo";
import Link from "next/link";
import { TodoContext } from "@/app/context/TodoContext";

export default function Todos() {
  const { setTodos } = useContext(TodoContext)
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
        });

        // convert startDate to local midnight ISO string
        if (startDate) {
          const start = new Date(startDate + "T00:00:00"); // local midnight
          params.set("startDate", start.toISOString());
        }

        // convert endDate to local end-of-day ISO string
        if (endDate) {
          const end = new Date(endDate + "T23:59:59.999"); // local end of day
          params.set("endDate", end.toISOString());
        }


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

  const handleToggle = async (_id, todo) => {
    try {
      const response = await fetch(`/api/todos/${_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fav: !todo.fav }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to toggle fav");
      }

      const data = await response.json();
      const updatedTodo = data.updated; // assuming API returns updated todo in this field

      if (!updatedTodo) {
        throw new Error("No updated todo returned from API");
      }

      setFetchedTodos((prev) =>
        prev.map((t) => (t._id === _id ? { ...t, fav: updatedTodo.fav } : t))
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
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 py-20 px-6">
      <div className="max-w-4xl mx-auto space-y-6 text-black">
        <div className="flex justify-end mb-4">
          <Link
            href={`/createtodo`}
            className="px-4 py-2 bg-indigo-600 text-white rounded shadow hover:bg-indigo-700 transition"
          >
            Create +
          </Link>
        </div>

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-black">
          <label className="text-sm font-semibold">Sort by:</label>
          <SortDropdown sortConfig={sortConfig} setSortConfig={setSortConfig} />
        </div>

        {/* Error Display */}
        {fetchError && (
          <p className="text-sm text-red-600">{`Error: ${fetchError}`}</p>
        )}

        {/* Loading State */}
        {loading ? (
          <p className="text-center text-black">Loading...</p>
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
            <div className="w-full bg-white border-t shadow-md z-50 rounded-t-md">
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
