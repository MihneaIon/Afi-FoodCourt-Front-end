import React, { useMemo, startTransition } from 'react';
import { useRestaurants } from '../hooks/useRestaurant';
import { useCategories } from '../hooks/usageCategories';
import { useRestaurantStore } from '../store/restuarantStore';
import SearchBar from '../components/SearchBar';
import FilterSidebar from '../components/FilterSidebar';
import RestaurantGrid from '../components/RestaurantGrid';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Pagination from '../components/Pagination';

const HomePage: React.FC = () => {
  const { filters } = useRestaurantStore();
  
  // React Query hooks
  const { 
    data: restaurantData, 
    isLoading: restaurantsLoading, 
    error: restaurantsError,
    refetch: refetchRestaurants
  } = useRestaurants();
  
  const { 
    data: categories, 
    isLoading: categoriesLoading,
    error: categoriesError
  } = useCategories();

  // Memoized values pentru performanță
  const restaurants = useMemo(() => 
    restaurantData?.restaurants || [], 
    [restaurantData]
  );
  
  const pagination = useMemo(() => 
    restaurantData?.pagination, 
    [restaurantData]
  );

  // Handle errors
  if (restaurantsError) {
    return (
      <ErrorMessage 
        message="Failed to load restaurants" 
        onRetry={() => refetchRestaurants()}
        fullScreen
      />
    );
  }

  if (categoriesError) {
    return (
      <ErrorMessage 
        message="Failed to load categories" 
        onRetry={() => window.location.reload()}
        fullScreen
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Improved responsive design */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Title */}
            <div className="flex-shrink-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                🍽️ Restaurant Finder
              </h1>
            </div>
            
            {/* Add Restaurant Button */}
            <div className="flex-shrink-0">
              <button 
                onClick={() => window.location.href = '/create'}
                className="w-full sm:w-auto bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-center"
              >
                <span className="sm:hidden">Add New Restaurant</span>
                <span className="hidden sm:inline">Add Restaurant</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <SearchBar />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Sidebar - Hidden on mobile, shown on large screens */}
          <div className="hidden lg:block">
            <FilterSidebar 
              categories={categories || []} 
              loading={categoriesLoading} 
            />
          </div>

          {/* Mobile Filter Button - Shown only on mobile */}
          <div className="lg:hidden mb-6">
            <button
              onClick={() => {
                // TODO: Implement mobile filter modal
                console.log('Open mobile filters');
              }}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 flex items-center justify-center space-x-2 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
              </svg>
              <span className="text-gray-700 font-medium">Filters & Sort</span>
            </button>
          </div>

          {/* Restaurant Grid */}
          <div className="lg:col-span-3">
            {restaurantsLoading ? (
              <LoadingSpinner text="Loading restaurants..." />
            ) : (
              <>
                {/* Results header - Responsive */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <p className="text-gray-600">
                    {pagination?.total || 0} restaurants found
                  </p>
                  <select 
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full sm:w-auto"
                    onChange={(e) => {
                      startTransition(() => {
                        // TODO: Implement sorting logic
                        console.log('Sort by:', e.target.value);
                      });
                    }}
                  >
                    <option value="rating">Sort by Rating</option>
                    <option value="name">Sort by Name</option>
                    <option value="price">Sort by Price</option>
                  </select>
                </div>

                <RestaurantGrid restaurants={restaurants} />
                
                {pagination && (
                  <div className="mt-8">
                    <Pagination pagination={pagination} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

// TYO DO: Verificaa
//  Asigură-te că backend-ul returnează datele în formatul:   
// {
//   "restaurants": [...],
//   "pagination": {
//     "page": 1,
//     "limit": 12,
//     "total": 50,
//     "pages": 5
//   }
// }
