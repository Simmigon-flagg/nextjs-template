import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { StarIcon as StarOutline } from "@heroicons/react/24/outline";
import Link from "next/link";

const List = ({ items, selectedIds, toggleSelect, handleToggle }) => {
    console.log(items)
    return (
        <ul className="space-y-3 text-black">
            {items.length > 0 ? (
                items.map((item) => {
                    const isSelected = selectedIds.has(item._id);

                    return (
                        <li
                            key={item._id}
                            className={`flex items-center justify-between py-2 px-3 rounded-lg shadow-sm cursor-pointer transition-colors
    hover:bg-gray-100 border border-gray-200
    ${isSelected ? "bg-indigo-100 border-indigo-400" : "bg-white"}
  `}
                        >
                            <div className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleSelect(item._id)}
                                    className="h-4 w-4 mt-1 accent-indigo-600 cursor-pointer"
                                />
                                <div>
                                    <Link href={`/todos/${item._id}`}>
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 cursor-pointer">
                                            <p className="font-semibold text-gray-900  whitespace-normal text-sm">
                                                {item.title}
                                            </p>
                                            <p className="text-gray-600  truncate mt-0 sm:mt-0 text-sm">
                                                <span className="font-medium">Notes:</span>{" "}
                                                {item.notes && item.notes.length > 40
                                                    ? item.notes.slice(0, 40) + "..."
                                                    : item.notes || "No notes"}
                                            </p>
                                        </div>
                                    </Link>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(item.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div className="ml-4 flex-shrink-0">
                                {item.fav ? (
                                    <StarSolid
                                        onClick={() => handleToggle(item._id, item)}
                                        className="h-5 w-5 text-yellow-400 hover:text-yellow-500 cursor-pointer transition"
                                        title="Unfavorite"
                                    />
                                ) : (
                                    <StarOutline
                                        onClick={() => handleToggle(item._id, item)}
                                        className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer transition"
                                        title="Favorite"
                                    />
                                )}
                            </div>
                        </li>

                    );
                })
            ) : (
                <li className="text-gray-500 text-center py-8">No results found.</li>
            )}
        </ul>
    );
};

export default List;
