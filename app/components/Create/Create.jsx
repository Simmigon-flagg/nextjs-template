import { TodoContext } from "@/app/context/TodoContext";
import React, { useContext, useState } from "react";

const Create = () => {
    const [showModal, setShowModal] = useState(false);
    const {
        createTodo,
        updateTodo,
        deleteTodo,

    } = useContext(TodoContext);

    const [input, setInput] = useState({
        title: "",
        completed: false,
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editTodo, setEditTodo] = useState(null);
    const [editedTitle, setEditedTitle] = useState("");

    const addTodo = async () => {
        if (!input.title.trim()) return;
        await createTodo({
            title: input.title.trim(),
            completed: input.completed,
            notes: ""
        });
        setInput({ title: "", completed: false });
        setShowModal(false)
    };



    return (
        <div className="p-4">
            <div className="flex justify-end">
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                    Create
                </button>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white w-full max-w-2xl p-6 rounded-lg shadow-xl relative">
                        <header className="text-2xl font-bold text-center text-gray-800 mb-4">
                            📝 Add a Todo
                        </header>

                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4">
                            <input
                                type="text"
                                className="flex-1 p-3 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="What do you need to do?"
                                value={input.title}
                                onChange={(e) => setInput({ ...input, title: e.target.value })}
                                onKeyDown={(e) => e.key === "Enter" && addTodo()}
                            />
                            <button
                                onClick={addTodo}
                                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition"
                            >
                                Add Task
                            </button>
                        </div>

                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-xl font-bold"
                        >
                            &times;
                        </button>
                    </div>
                </div>
            )}
        </div>

    );
};

export default Create;
