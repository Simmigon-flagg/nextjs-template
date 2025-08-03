"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TodoContext } from "@/app/context/TodoContext";
import SkeletonTodo from "../Skeleton/SkeletonTodo";

const Todo = ({ _id }) => {
  const router = useRouter();
  const { todos, updateTodo, setTodos } = useContext(TodoContext);
  const [todo, setTodo] = useState(null);
  const [formData, setFormData] = useState({ title: "", notes: "" });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const found = todos.find((item) => item._id === _id);
    if (found) {
      setTodo(found);
    }
  }, [todos, _id]);

  if (!todo) return <SkeletonTodo />;

  const openEditModal = () => {
    setFormData({
      title: todo.title || "",
      notes: todo.notes || "",
    });
    setIsEditModalOpen(true);
  };

  const handleChange = ({ target: { name, value } }) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

const handleSave = async () => {
  setIsUpdating(true);
  const updated = await updateTodo(todo._id, formData);
  if (updated) {
    setTodo(updated); // Local update
    setTodos((prev) =>
      prev.map((item) => (item._id === updated._id ? updated : item))
    ); // Global update
  }
  setIsUpdating(false);
  setIsEditModalOpen(false);
};


  return (
    <section className="min-h-screen bg-gradient-to-b from-white to-gray-100 py-20 px-6">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-8 space-y-6">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="text-xl font-semibold text-gray-800">
              {todo.title}
            </h3>
            <span className="text-sm text-gray-500">
              {new Date(todo.createdAt).toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-600 text-sm mb-1">Title</label>
              <p className="text-gray-900">{todo.title}</p>
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-1">Notes</label>
              <p className="text-gray-900">{todo.notes}</p>
            </div>
          </div>

          <div className="pt-6 flex gap-4">
            <button
              onClick={() => router.back()}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg shadow hover:bg-gray-300 transition"
            >
              Back
            </button>
            <button
              onClick={openEditModal}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
            >
              Edit Todo
            </button>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 flex items-center bg-gray-600/50 justify-center z-50 text-black">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Edit Todo</h2>

            <div className="space-y-2">
              <label className="block text-sm text-gray-600">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />

              <label className="block text-sm text-gray-600">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isUpdating}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
              >
                {isUpdating ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Todo;
