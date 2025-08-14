const Filters = ({
  query,
  setQuery,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}) => {
  const clearDates = () => {
    setStartDate('');
    setEndDate('');
  };

  return (
    <>
      <div className="mb-3">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search..."
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div className="flex flex-wrap gap-2 items-center text-xs">
        <label className="flex items-center gap-1">
          Start Date:
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="px-1 py-0.5 border border-gray-300 rounded text-xs"
          />
        </label>

        <label className="flex items-center gap-1">
          End Date:
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="px-1 py-0.5 border border-gray-300 rounded text-xs"
          />
        </label>

        <button
          type="button"
          onClick={clearDates}
          className="px-2 py-0.5 text-xs text-gray-900 hover:text-white hover:bg-gray-700 rounded transition"
        >
          Clear Dates
        </button>
      </div>
    </>
  );
};

export default Filters;
