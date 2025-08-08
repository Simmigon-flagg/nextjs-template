"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TodoContext } from "@/app/context/TodoContext";
import SkeletonTodo from "../Skeleton/SkeletonTodo";
import Image from "next/image";

const Todo = ({ _id }) => {
    const router = useRouter();
    const { todos, updateTodo, setTodos } = useContext(TodoContext);
    const [todo, setTodo] = useState(null);
    const [formData, setFormData] = useState({ title: "", notes: "" });
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null); // raw File object
    const [previewURL, setPreviewURL] = useState(null);     // URL for display

    useEffect(() => {
        return () => {
            if (previewURL) {
                URL.revokeObjectURL(previewURL);
            }
        };
    }, [previewURL]);

    useEffect(() => {
        
        const found = todos.find((item) => item._id === _id);
        console.log(found)
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

    const saveUploadedFile = async () => {
        if (!uploadedFile) return;

        const formDataToSend = new FormData();
        formDataToSend.append("file", uploadedFile);

        const res = await fetch(`/api/todos/${todo._id}/upload`, {
            method: "POST",
            body: formDataToSend,
        });

        if (!res.ok) {
            const error = await res.json();
            console.error("Upload error:", error);
        } else {
            const result = await res.json();
   
            const updatedRes = await fetch(`/api/todos/${todo._id}`);
            if (updatedRes.ok) {
                const updatedTodo = await updatedRes.json();

                setTodo(updatedTodo.todo);
                setTodos((prev) =>
                    prev.map((item) => (item._id === updatedTodo.todo._id ? updatedTodo.todo : item))
                );
            }

            // Reset preview and file input
            setUploadedFile(null);
            setPreviewURL(null);
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploadedFile(file);
        setPreviewURL(URL.createObjectURL(file));
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

                    <div className="pt-6 flex justify-between items-center flex-wrap gap-2">
                        {/* Left side: Back + Edit */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => router.push("/todos")}
                                className="px-4 py-1.5 text-sm bg-gray-200 text-gray-800 rounded shadow hover:bg-gray-300 transition"
                            >
                                Back
                            </button>
                            <button
                                onClick={openEditModal}
                                className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded shadow hover:bg-indigo-700 transition"
                            >
                                Edit
                            </button>
                        </div>

                        {/* Right side: Upload */}
                        <div>
                            <button
                                onClick={() => document.getElementById("file-upload").click()}
                                className="px-4 py-1.5 text-sm bg-green-600 text-white rounded shadow hover:bg-green-700 transition"
                            >
                                Upload File
                            </button>
                            <input
                                id="file-upload"
                                type="file"
                                accept="image/*,.pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                style={{ display: "none" }}
                                onChange={handleFileUpload}
                            />


                        </div>
                    </div>

                    {previewURL && uploadedFile && (
                        <div className="mt-4 space-y-2">
                            {/* File name display */}
                            <p className="text-sm font-medium text-gray-800">
                                Selected File: <span className="text-gray-600">{uploadedFile.name}</span>
                            </p>

                            {/* File preview */}
                            {uploadedFile.type.startsWith("image/") ? (
                                <img
                                    src={previewURL}
                                    alt="Preview"
                                    className="max-w-xs rounded shadow border-2 border-green-700"
                                />
                            ) : (
                                <a
                                    href={previewURL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline"
                                >
                                    {uploadedFile.name}
                                </a>
                            )}

                            {/* Save button */}
                            <div>
                                <button
                                    onClick={saveUploadedFile}
                                    className="mt-2 px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                                >
                                    Save Upload
                                </button>
                            </div>
                        </div>
                    )}
                    <h4 className="text-gray-700 font-semibold  mb-1">Attached Files</h4>
                    <div className="flex items-center justify-center">
                        {todo.file && (
                            <>
                                {/\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(todo.file.filename) ? (
                                    <Image
                                        src={`/api/files/${todo.file.fileId}`}
                                        alt={todo.file.filename}
                                        width={200}
                                        height={200}
                                        priority
                                        className="max-w-xs max-h-60 border rounded"
                                    />
                                ) : /\.(pdf)$/i.test(todo.file.filename) ? (
                                    <iframe
                                        src={`/api/files/${todo.file.fileId}`}
                                        className="w-full h-[600px] border rounded"
                                        title={todo.file.filename}
                                    />
                                ) : /\.(docx?|pptx?)$/i.test(todo.file.filename) ? (
                                    typeof window !== "undefined" && (
                                        <iframe
                                            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                                                `${window.location.origin}/api/files/${todo.file.fileId}`
                                            )}`}
                                            className="w-full h-[600px] border rounded"
                                            title={todo.file.filename}
                                        />
                                    )
                                ) : (
                                    <a
                                        href={`/api/files/${todo.file.fileId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 underline"
                                    >
                                        {todo.file.filename}
                                    </a>
                                )}
                            </>
                        )}

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
