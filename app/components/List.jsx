import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { StarIcon as StarOutline } from "@heroicons/react/24/outline";
import Link from "next/link";

const List = ({ items, selectedIds, toggleSelect, handleToggle }) => {
    return (
        <ul className="space-y-2 text-black">
            {items.length > 0 ? (
                items.map((item) => {
                    const isSelected = selectedIds.has(item._id);

                    return (
                        <li
                            key={item._id}
                            className={`flex items-center justify-between px-4 py-2 rounded hover:bg-gray-200 ${isSelected ? "bg-blue-100" : "bg-gray-100"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleSelect(item._id)}
                                    className="h-4 w-4"
                                />
                                <div>
                                    <div className="flex gap-8 items-center">
                                        <p className="font-medium">{item.title}</p>
                                        <Link href={`/todos/${item._id}`}>
                                            <span className="font-medium text-gray-600">
                                                {item.notes && item.notes.length > 8
                                                    ? item.notes.slice(0, 20) + "..."
                                                    : item.notes}
                                            </span>
                                        </Link>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {new Date(item.createdAt).toLocaleString()}
                                    </p>
                                </div>


                            </div>
                            <div className="ml-4">
                                {item.fav ? (
                                    <StarSolid
                                        onClick={() => handleToggle(item._id, item)}
                                        className="h-5 w-5 text-yellow-500 cursor-pointer"
                                    />
                                ) : (
                                    <StarOutline
                                        onClick={() => handleToggle(item._id, item)}
                                        className="h-5 w-5 text-gray-400 cursor-pointer"
                                    />
                                )}
                            </div>
                        </li>
                    );
                })
            ) : (
                <li className="text-gray-500">No results found.</li>
            )}
        </ul>
    );
};

export default List;
