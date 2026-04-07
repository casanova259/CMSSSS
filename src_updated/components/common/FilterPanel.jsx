const FilterPanel = ({ filters, onFilterChange, onClearFilters }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filters.map(filter => (
          <div key={filter.key}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {filter.label}
            </label>
            {filter.type === 'select' && (
              <select
                value={filter.value}
                onChange={(e) => onFilterChange(filter.key, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {filter.options.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            )}
            {filter.type === 'date' && (
              <input
                type="date"
                value={filter.value}
                onChange={(e) => onFilterChange(filter.key, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            )}
            {filter.type === 'text' && (
              <input
                type="text"
                value={filter.value}
                onChange={(e) => onFilterChange(filter.key, e.target.value)}
                placeholder={filter.placeholder}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-end space-x-3">
        <button
          onClick={onClearFilters}
          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
        >
          Clear Filters
        </button>
        <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium">
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;
