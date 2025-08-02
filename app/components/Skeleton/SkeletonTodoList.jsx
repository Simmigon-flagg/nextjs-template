
const SkeletonTodoList = () => {
    return (
        <section id="todo">
            <ul className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                {[...Array(5)].map((_, i) => (
                    <li
                        key={i}
                        className="animate-pulse flex justify-between items-center p-4 rounded-md shadow-sm border bg-gray-100 border-gray-200"
                    >
                        <div className="h-4 w-3/4 bg-gray-300 rounded"></div>
                        <div className="flex gap-2">
                            <div className="h-4 w-5 bg-gray-300 rounded"></div>
                            <div className="h-4 w-5 bg-gray-300 rounded"></div>
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    )
}

export default SkeletonTodoList