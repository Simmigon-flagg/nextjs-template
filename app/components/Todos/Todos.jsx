"use client";

import { useContext, useState, useEffect, useCallback, Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { TodoContext } from "@/app/context/TodoContext";



const Filters = dynamic(() => import("../Filters"), { suspense: true });
const SortDropdown = dynamic(() => import("../SortDropdown"), { suspense: true });
const List = dynamic(() => import("../List"), { suspense: true });
const BulkActions = dynamic(() => import("../BulkActions"), { suspense: true });

function useDebounced(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export default function Todos() {
  const {
    todos,
    loading,
    fetchError,
    page,
    totalPages,
    search,
    setSearch,
    sortConfig,
    setSortConfig,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    selectedIds,
    toggleSelect,
    toggleFav,
    deleteTodo,
    nextPage,
    prevPage,
    clearSelection,
  } = useContext(TodoContext);

  const debouncedSearch = useDebounced(search, 300);

  const memoToggleFav = useCallback(toggleFav, [toggleFav]);
  const memoToggleSelect = useCallback(toggleSelect, [toggleSelect]);
  const memoDeleteTodo = useCallback(deleteTodo, [deleteTodo]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 py-20 px-6">
      <div className="max-w-4xl mx-auto space-y-6 text-black">
        <div className="flex justify-end mb-4">
          <Link href={`/createtodo`} className="px-4 py-2 bg-indigo-600 text-white rounded shadow hover:bg-indigo-700 transition">
            Create +
          </Link>
        </div>

        <Suspense fallback={<div>Loading filters...</div>}>
          <form>
            <Filters
              query={debouncedSearch}
              setQuery={setSearch}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
            />
          </form>
        </Suspense>

        <Suspense fallback={<div>Loading sort options...</div>}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-black">
            <label className="text-sm font-semibold">Sort by:</label>
            <SortDropdown sortConfig={sortConfig} setSortConfig={setSortConfig} />
          </div>
        </Suspense>

        {fetchError && <p className="text-sm text-red-600">{`Error: ${fetchError}`}</p>}

        {loading ? (
          <p className="text-center text-black">Loading...</p>
        ) : (
          <>
            <Suspense fallback={<div>Loading todos...</div>}>
              <List
                items={todos}
                selectedIds={selectedIds}
                toggleSelect={memoToggleSelect}
                handleToggle={memoToggleFav}
              />
            </Suspense>

            <Suspense fallback={<div>Loading bulk actions...</div>}>
              <BulkActions
                filtered={todos}
                selectedIds={selectedIds}
                deleteItem={memoDeleteTodo}
                handleToggle={memoToggleFav}
                clearSelection={clearSelection}
              />
            </Suspense>

            <div className="w-full bg-white border-t shadow-md z-50 rounded-t-md">
              <div className="flex justify-center gap-4 p-4">
                <button
                  onClick={prevPage}
                  disabled={page === 1}
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="self-center text-gray-700">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={nextPage}
                  disabled={page === totalPages}
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
