import React, { useState, useCallback } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { useRestaurantStore } from '../store/restuarantStore';

const SearchBar: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { setFilters, filters } = useRestaurantStore();
  
  // Debounce search term pentru a evita prea multe API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Update filters când se schimbă debounced search term
  React.useEffect(() => {
    setFilters({ search: debouncedSearchTerm });
  }, [debouncedSearchTerm, setFilters]);

  const handleClear = useCallback(() => {
    setSearchTerm('');
    setFilters({ search: '' });
  }, [setFilters]);

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
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Search restaurants, cuisines, or locations..."
        />
        
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <svg 
              className="h-5 w-5 text-gray-400 hover:text-gray-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        )}
      </div>
      
      {/* Search suggestions - poate fi extins */}
      {searchTerm && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg border border-gray-200">
          <div className="p-2 text-sm text-gray-600">
            Press Enter to search for "{searchTerm}"
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
