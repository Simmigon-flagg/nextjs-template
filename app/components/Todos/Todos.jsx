"use client";

import { useContext } from "react";

import Filters from "../Filters";
import SortDropdown from "../SortDropdown";
import List from "../List";
import BulkActions from "../BulkActions";
import Link from "next/link";
import { TodoContext } from "@/app/context/TodoContext";

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
    clearSelection
  } = useContext(TodoContext);

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
            query={search}
            setQuery={setSearch}
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
              items={todos}
              selectedIds={selectedIds}
              toggleSelect={toggleSelect}
              handleToggle={toggleFav}
            />

            {/* Bulk Actions */}
            <BulkActions
              filtered={todos}
              selectedIds={selectedIds}
              deleteItem={deleteTodo}
              handleToggle={toggleFav}
              clearSelection={clearSelection}
            />

            {/* Pagination Controls */}
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
