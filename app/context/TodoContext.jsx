"use client";

import { createContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  fetchTodos,
  toggleFavorite,
  createTodo,
  updateTodo,
  deleteTodo,
  saveUploadedFileService
} from "../../services/ui/todos";

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

  useEffect(() => {
    setPage(1);
  }, [search, startDate, endDate]);

  const loadTodos = async () => {
    if (!session?.user?._id) {
      setTodos([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const params = {
        userId: session.user._id.toString(),
        page,
        limit: ITEMS_PER_PAGE,
        search,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
      };
      if (startDate) params.startDate = new Date(startDate + "T00:00:00").toISOString();
      if (endDate) params.endDate = new Date(endDate + "T23:59:59.999").toISOString();

      const data = await fetchTodos(params);
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
    loadTodos();
  }, [session?.user?.email, page, search, sortConfig, startDate, endDate]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const toggleFav = async (_id, todo) => {
    try {
      const data = await toggleFavorite(_id, todo);

      setTodos((prev) =>
        prev.map((t) => (t._id === _id ? { ...t, fav: data.updated.fav } : t))
      );
    } catch (err) {
      console.error("Failed to toggle fav:", err);
    }
  };

  const createNewTodo = async (formData) => {

    setLoading(true);
    try {
      const data = await createTodo(formData);
      if (data?.todo) {
        setPage(1);
        await loadTodos();
      } else {
        console.warn("No todo returned from API:", data);
      }
    } catch (err) {
      console.error("Error creating todo:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateExistingTodo = async (_id, updateData) => {
    try {
      const data = await updateTodo(_id, updateData);
      setTodos((prev) =>
        prev.map((todo) => (todo?._id === _id ? data.updated : todo))
      );
      return data.updated;
    } catch (err) {
      console.error("Error updating todo:", err);
      return null;
    }
  };

  const deleteExistingTodo = async (_id) => {
    try {
      await deleteTodo(_id);
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

const saveUploadedFile = async (todoId, file) => {
  const result = await saveUploadedFileService(todoId, file);

  if (result.success) {
    setTodos((prev) =>
      prev.map((item) =>
        item._id === result.todo._id ? result.todo : item
      )
    );
  }

  return result;
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
        saveUploadedFile,
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
        deleteTodo: deleteExistingTodo,
        createTodo: createNewTodo,
        updateTodo: updateExistingTodo,
        nextPage,
        prevPage,
        clearSelection,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
};

export default TodoContextProvider;
