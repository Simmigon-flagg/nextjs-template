const SortDropdown = ({ sortConfig, setSortConfig }) => {
    const handleSortChange = (e) => {
        const [key, direction] = e.target.value.split("_");
        setSortConfig({ key, direction });
    };

    return (
        <select
            value={`${sortConfig.key}_${sortConfig.direction}`}
            onChange={handleSortChange}
            className="border p-2 rounded ml-2"
        >
            <option value="title_asc">Title ↑</option>
            <option value="title_desc">Title ↓</option>
            <option value="date_asc">Date ↑</option>
            <option value="date_desc">Date ↓</option>
        </select>
    );
};

export default SortDropdown;
