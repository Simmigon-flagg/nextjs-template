"use client";

import { createContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export const TodoContext = createContext({});
const TodoContextProvider = ({ children }) => {

  const PAGE_SIZE = 5;
  const { data: session } = useSession();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination & search state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  // Reset page to 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (!session?.user?.email) {
      setTodos([]);
      setLoading(false);
      return;
    }

    const fetchTodos = async () => {

      try {
        setLoading(true);
        const res = await fetch(`/api/todos?page=${page}&limit=${PAGE_SIZE}&search=${encodeURIComponent(search)}`);
        const data = await res.json();
        console.log(data)
        setTodos(data.todos || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } catch (err) {
        console.error(err)
        console.error("Error fetching todos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTodos();
  }, [session?.user?.email, page, search]);

  const createTodo = async (data) => {
    setLoading(true);
    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const incoming = await res.json();
      setTodos((prev) => [incoming.todo, ...prev]);
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

      return incoming.updated
    } catch (err) {
      console.error("Error updating todo:", err);
    }
  };

  const deleteTodo = async (_id) => {
    try {
      await fetch(`/api/todos/${_id}`, { method: "DELETE" });
      setTodos((prev) => prev.filter((todo) => todo._id !== _id));
    } catch (err) {
      console.error("Error deleting todo:", err);
    }
  };

  const getTodoDetails = async (_id) => {

    try {
      setLoading(true);
      const res = await fetch(`/api/todos/${_id}`);

      if (!res.ok) throw new Error('Failed to fetch todo details');

      const data = await res.json();

      return data.todo;
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  const nextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const prevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  return (
    <TodoContext.Provider
      value={{
        todos,
        loading,
        page,
        totalPages,
        search,
        createTodo,
        getTodoDetails,
        updateTodo,
        deleteTodo,
        nextPage,
        prevPage,
        setSearch,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
};

export default TodoContextProvider;
