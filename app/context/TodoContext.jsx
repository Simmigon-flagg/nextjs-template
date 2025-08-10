"use client";

import { createContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export const TodoContext = createContext({});

const TodoContextProvider = ({ children }) => {
  const ITEMS_PER_PAGE = 4;
  const { data: session } = useSession();

  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Pagination & filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Reset page on filter/search change
  useEffect(() => {
    setPage(1);
  }, [search, startDate, endDate]);

  // Fetch todos with all params
  const fetchTodos = async () => {
    if (!session?.user?.email) {
      setTodos([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: ITEMS_PER_PAGE,
        search,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
      });
      if (startDate) params.set("startDate", new Date(startDate + "T00:00:00").toISOString());
      if (endDate) params.set("endDate", new Date(endDate + "T23:59:59.999").toISOString());

      const res = await fetch(`/api/todos?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch");

      setTodos(data.todos || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setFetchError(null);
    } catch (err) {
      setFetchError(err.message);
      setTodos([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, [session?.user?.email, page, search, sortConfig, startDate, endDate]);

  // Select toggle
  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  // Toggle favorite
  const toggleFav = async (_id, currentFav) => {
   
    try {
      const res = await fetch(`/api/todos/${_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fav: !currentFav.fav }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to toggle fav");
      }
      const data = await res.json();
      if (!data.updated) throw new Error("No updated todo returned from API");

      setTodos((prev) =>
        prev.map((t) => (t._id === _id ? { ...t, fav: data.updated.fav } : t))
      );
    } catch (err) {
      console.error("Failed to toggle fav:", err);
    }
  };

  const createTodo = async (formData) => {
  setLoading(true);
  try {
    const res = await fetch("/api/todos", {
      method: "POST",
      body: formData, // Don't stringify, just send FormData
      // Don't set headers, browser sets multipart boundaries
    });

    const incoming = await res.json();

    if (!res.ok) {
      console.error("Failed to create todo:", incoming.error || incoming);
      return;
    }

    if (incoming?.todo) {
      setPage(1); // force to first page to show the new todo
      await fetchTodos();
    } else {
      console.warn("No todo returned from API:", incoming);
    }
  } catch (err) {
    console.error("Error creating todo:", err);
  } finally {
    setLoading(false);
  }
};

  const updateTodo = async (_id, updateData) => {
    try {
      const res = await fetch(`/api/todos/${_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      const incoming = await res.json();
      setTodos((prev) =>
        prev.map((todo) => (todo?._id === _id ? incoming.updated : todo))
      );
      return incoming.updated;
    } catch (err) {
      console.error("Error updating todo:", err);
    }
  };


  // Delete todo
  const deleteTodo = async (_id) => {
    try {
      const res = await fetch(`/api/todos/${_id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete todo");
      setTodos((prev) => prev.filter((t) => t._id !== _id));
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(_id);
        return newSet;
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Pagination controls
  const nextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };
  const prevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const clearSelection = () => setSelectedIds(new Set());


  return (
    <TodoContext.Provider
      value={{
        todos,
        setTodos,
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
        createTodo,
        updateTodo,
        nextPage,
        prevPage,
        clearSelection
      }}
    >
      {children}
    </TodoContext.Provider>
  );
};

export default TodoContextProvider;
