import React, { useState, useCallback } from 'react';
import { useRestaurantStore } from '../store/restuarantStore';
import { useDebounce } from '../hooks/useDebounce';

const SearchBar: React.FC = () => {
  const { filters, setSearch } = useRestaurantStore();
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  // Debounce search pentru a nu face prea multe API calls
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Când se schimbă debounced search, updatează store-ul
  React.useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
    setSearch('');
  }, [setSearch]);

  return (
    <div className="relative max-w-2xl mx-auto">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Search restaurants by name or description..."
        />
        {searchTerm && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              onClick={handleClearSearch}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>
      
      {/* Search suggestions sau recent searches */}
      {searchTerm && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200">
          <div className="p-2 text-sm text-gray-600">
            Press Enter to search for "{searchTerm}"
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
