const BulkActions = ({ filtered, selectedIds, handleToggle, clearSelection, deleteItem }) => {
    const selected = filtered.filter(item => selectedIds.has(item._id));

    const setFavoriteForSelected = (favValue) => {
        selected.forEach(item => {
            if (item.fav !== favValue) {
                handleToggle(item._id, item, favValue);
            }
        });
    };
    const setDeleteForSelected = () => {
        selected.forEach(item => {
            deleteItem(item._id);
        });
        clearSelection()
     
    };

    if (selectedIds.size === 0) return null;

    return (
        <div className="flex flex-wrap justify-between items-center bg-gray-100 px-4 py-2 rounded mb-4 gap-y-2">
            <div>
                <span className="text-sm sm:text-base text-gray-700">
                    {selectedIds.size} selected
                </span>
            </div>
            <div className="flex flex-wrap gap-4">
                <button
                    onClick={() => setFavoriteForSelected(true)}
                    className="text-blue-600 hover:underline text-xs sm:text-sm"
                >
                    Mark as Favorite
                </button>
                <button
                    onClick={() => setFavoriteForSelected(false)}
                    className="text-yellow-600 hover:underline text-xs sm:text-sm"
                >
                    Unmark Favorite
                </button>
                <button
                    onClick={() => setDeleteForSelected()}
                    className="text-red-600 hover:underline text-xs sm:text-sm"
                >
                    Delete selected
                </button>
                <button
                    onClick={clearSelection}
                    className="text-grey-600 hover:underline text-xs sm:text-sm"
                >
                    Clear Selection
                </button>
            </div>
        </div>



    );
};

export default BulkActions;
