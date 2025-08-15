import React, { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { restaurantApi } from '../service/api';
import { useCategories } from '../hooks/usageCategories';
import { useFavorites } from '../hooks/useFavorites';
import { useRandomPickerStats } from '../hooks/useRandomPicker';
import { Restaurant, RestaurantFilters } from '../types';
import { showToast } from './Toast';
import LoadingSpinner from './LoadingSpinner';
import RestaurantCard from './RestaurantCard';
import PickerHistory from './PickerHistory';
import FavoritesPanel from './FavoritesPanel';
import { useNavigate } from 'react-router-dom';

interface RandomPickerFilters {
  categories: string[];
  priceRange?: string;
  rating?: number;
  isOpen?: boolean;
  favoritesOnly?: boolean;
}

const RandomRestaurantPicker: React.FC = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'picker' | 'history' | 'favorites'>('picker');
  const [filters, setFilters] = useState<RandomPickerFilters>({
    categories: [],
    isOpen: true,
    favoritesOnly: false
  });
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const [currentPickId, setCurrentPickId] = useState<string | null>(null);
  const [hasInitialPick, setHasInitialPick] = useState(false); // Track if we've made initial pick

  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { favorites, addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { stats, recordPick, markAsVisited } = useRandomPickerStats();

  // Fetch restaurants based on filters
  const { data: restaurantData, refetch, isFetching } = useQuery({
    queryKey: ['random-restaurants', filters],
    queryFn: () => {
      if (filters.favoritesOnly) {
        // Return favorites as restaurant data
        return Promise.resolve({
          restaurants: favorites.restaurants.map(fav => ({
            id: fav.id,
            name: fav.name,
            imageUrl: fav.imageUrl,
            priceRange: fav.priceRange,
            rating: fav.rating,
            categories: fav.categories.map(cat => ({
              category: {
                id: cat.toLowerCase(), // or another unique id if available
                name: cat,
                slug: cat.toLowerCase(),
                createdAt: '', // or a valid date string if available
              },
              createdAt: '', // or a valid date string if available
              updatedAt: '', // or a valid date string if available
            })),
            isOpen: true,
            address: '',
            reviews: [],
            createdAt: fav.addedAt,
            updatedAt: fav.addedAt
          })) as unknown as Restaurant[],
          pagination: { page: 1, limit: 100, total: favorites.restaurants.length, pages: 1 }
        });
      }

      const apiFilters: RestaurantFilters = {
        limit: 100,
      };

      if (filters.categories.length > 0) {
        apiFilters.category = filters.categories[0];
      }
      if (filters.priceRange) {
        apiFilters.priceRange = filters.priceRange;
      }
      if (filters.rating) {
        apiFilters.rating = filters.rating;
      }

      return restaurantApi.getRestaurants(apiFilters);
    },
    enabled: false, // Don't fetch automatically
  });

  // Handle category filter change
  const handleCategoryToggle = useCallback((categorySlug: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(categorySlug)
        ? prev.categories.filter(c => c !== categorySlug)
        : [...prev.categories, categorySlug]
    }));
    // Reset the selection when filters change
    setSelectedRestaurant(null);
    setHasInitialPick(false);
  }, []);

  // Handle other filter changes
  const handleFilterChange = useCallback((key: keyof RandomPickerFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    // Reset the selection when filters change
    setSelectedRestaurant(null);
    setHasInitialPick(false);
  }, []);

  // Random selection with animation
  const selectRandomRestaurant = useCallback(async () => {
    // If we don't have data, fetch it first
    if (!restaurantData?.restaurants?.length) {
      const result = await refetch();
      if (!result.data?.restaurants?.length) {
        showToast.warning('No restaurants found with the selected filters');
        return;
      }
    }

    const restaurants = (restaurantData?.restaurants || []).filter(r => 
      !filters.isOpen || r.isOpen
    );

    if (restaurants.length === 0) {
      showToast.warning('No restaurants found with the selected filters');
      return;
    }

    setIsSpinning(true);
    setAnimationStep(0);
    setSelectedRestaurant(null);

    // Animation sequence
    const animationDuration = 2000; // 2 seconds
    const steps = 10;
    const stepDuration = animationDuration / steps;

    // Create animation intervals
    const intervals: NodeJS.Timeout[] = [];

    for (let i = 0; i < steps; i++) {
      const timeout = setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * restaurants.length);
        setSelectedRestaurant(restaurants[randomIndex]);
        setAnimationStep(i + 1);
      }, i * stepDuration);
      intervals.push(timeout);
    }

    // Final selection
    const finalTimeout = setTimeout(() => {
      const finalIndex = Math.floor(Math.random() * restaurants.length);
      const finalRestaurant = restaurants[finalIndex];
      setSelectedRestaurant(finalRestaurant);
      setIsSpinning(false);
      setAnimationStep(0);
      setHasInitialPick(true); // Mark that we've made a pick
      
      // Record the pick
      const pickId = recordPick(finalRestaurant, {
        categories: filters.categories,
        priceRange: filters.priceRange,
        rating: filters.rating
      });
      setCurrentPickId(pickId);
      
      showToast.success('🎉 Perfect choice for today!');
      
      // Clear intervals to prevent memory leaks
      intervals.forEach(clearTimeout);
    }, animationDuration);

    // Store final timeout for cleanup
    intervals.push(finalTimeout);

    // Cleanup function
    return () => {
      intervals.forEach(clearTimeout);
    };
  }, [restaurantData, filters, refetch, recordPick]);

  // Only auto-select on initial load when modal opens, not on filter changes
  useEffect(() => {
    if (isVisible && activeTab === 'picker' && !hasInitialPick && !isSpinning) {
      // Small delay to ensure modal is fully rendered
      const timeout = setTimeout(() => {
        selectRandomRestaurant();
      }, 100);
      
      return () => clearTimeout(timeout);
    }
  }, [isVisible, activeTab]); // Removed other dependencies to prevent auto-triggering

  const clearFilters = useCallback(() => {
    setFilters({
      categories: [],
      isOpen: true,
      favoritesOnly: false
    });
    setSelectedRestaurant(null);
    setHasInitialPick(false);
  }, []);

  const handleVisitRestaurant = useCallback((restaurantId: string) => {
    if (currentPickId) {
      markAsVisited(currentPickId);
    }
    navigate(`/restaurant/${restaurantId}`);
    setIsVisible(false);
  }, [currentPickId, markAsVisited, navigate]);

  // Manual pick function for button click
  const handleManualPick = useCallback(async () => {
    await selectRandomRestaurant();
  }, [selectRandomRestaurant]);

  return (
    <>
      {/* Header Button - Responsive positioning */}
      <div className="fixed top-4 right-4 z-40">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 sm:px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-1 sm:space-x-2"
          title="Alege unde mănânci astăzi"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span className="hidden sm:inline text-sm">Pick Restaurant</span>
          <span className="sm:hidden text-xs">Pick</span>
        </button>

        {/* Stats Badge - Responsive */}
        {stats.totalPicks > 0 && (
          <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center font-bold">
            {stats.totalPicks > 99 ? '99+' : stats.totalPicks}
          </div>
        )}
      </div>

      {/* Modal - Responsive */}
      {isVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header with Tabs - Responsive */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold">🎲 Restaurant Picker</h2>
                  <p className="text-orange-100 mt-1 text-sm sm:text-base">
                    {stats.streakCount > 1 && `🔥 ${stats.streakCount} day streak! `}
                    {stats.totalPicks > 0 && `${stats.totalPicks} total picks`}
                  </p>
                </div>
                <button
                  onClick={() => setIsVisible(false)}
                  className="text-white hover:text-orange-200 transition-colors p-1"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Tabs - Responsive */}
              <div className="flex space-x-1 bg-white bg-opacity-20 rounded-lg p-1">
                {[
                  { id: 'picker', label: '🎲 Picker', shortLabel: 'Pick', count: null },
                  { id: 'history', label: '📋 History', shortLabel: 'History', count: stats.history.length },
                  { id: 'favorites', label: '❤️ Favorites', shortLabel: 'Fav', count: favorites.restaurants.length }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 py-2 px-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-white text-orange-600'
                        : 'text-white hover:bg-white hover:bg-opacity-10'
                    }`}
                  >
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.shortLabel}</span>
                    {tab.count !== null && tab.count > 0 && (
                      <span className="ml-1 text-xs">({tab.count})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content - Responsive padding */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'picker' && (
                <div className="p-4 sm:p-6">
                  {/* Filters Section */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Setează preferințele
                    </h3>

                    {/* Quick Filters */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <button
                          onClick={() => handleFilterChange('favoritesOnly', !filters.favoritesOnly)}
                          className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                            filters.favoritesOnly
                              ? 'bg-pink-100 text-pink-800 border-2 border-pink-300'
                              : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                          }`}
                        >
                          ❤️ Doar favorite ({favorites.restaurants.length})
                        </button>
                        
                        {stats.history.length > 0 && (
                          <button
                            onClick={() => {
                              const recentCategories = stats.history.slice(0, 5)
                                .flatMap(h => h.restaurant.categories)
                                .filter((cat, index, arr) => arr.indexOf(cat) === index)
                                .slice(0, 2);
                              
                              setFilters(prev => ({
                                ...prev,
                                categories: recentCategories.map(cat => cat.toLowerCase())
                              }));
                              setSelectedRestaurant(null);
                              setHasInitialPick(false);
                            }}
                            className="bg-blue-100 text-blue-800 px-3 py-2 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
                          >
                            🕒 Recent preferences
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Categories */}
                    {!filters.favoritesOnly && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tipuri de bucătărie
                        </label>
                        {categoriesLoading ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {categories?.map((category) => (
                              <button
                                key={category.id}
                                onClick={() => handleCategoryToggle(category.slug)}
                                className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                                  filters.categories.includes(category.slug)
                                    ? 'bg-orange-100 text-orange-800 border-2 border-orange-300'
                                    : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                                }`}
                              >
                                <span className="mr-1">{category.icon}</span>
                                {category.name}
                                {stats.favoriteCategories[category.name] && (
                                  <span className="ml-1 text-xs bg-orange-200 text-orange-800 rounded-full px-1">
                                    {stats.favoriteCategories[category.name]}
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Other filters (Price Range, Rating, etc.) */}
                    {!filters.favoritesOnly && (
                      <>
                        {/* Price Range */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Buget
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {[
                              { value: '$', label: '$ - Economic' },
                              { value: '$$', label: '$$ - Moderat' },
                              { value: '$$$', label: '$$$ - Scump' },
                              { value: '$$$$', label: '$$$$ - Foarte scump' }
                            ].map((price) => (
                              <button
                                key={price.value}
                                onClick={() => handleFilterChange('priceRange', 
                                  filters.priceRange === price.value ? undefined : price.value
                                )}
                                className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                                  filters.priceRange === price.value
                                    ? 'bg-green-100 text-green-800 border-2 border-green-300'
                                    : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                                }`}
                              >
                                {price.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Rating */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Rating minim
                          </label>
                          <div className="flex gap-2">
                            {[3, 4, 4.5].map((rating) => (
                              <button
                                key={rating}
                                onClick={() => handleFilterChange('rating', 
                                  filters.rating === rating ? undefined : rating
                                )}
                                className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                                  filters.rating === rating
                                    ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300'
                                    : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                                }`}
                              >
                                {rating}+ ⭐
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Only Open Restaurants */}
                        <div className="mb-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={filters.isOpen}
                              onChange={(e) => handleFilterChange('isOpen', e.target.checked)}
                              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              Doar restaurante deschise acum
                            </span>
                          </label>
                        </div>
                      </>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={handleManualPick}
                        disabled={isFetching || isSpinning}
                        className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
                      >
                        {isSpinning ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Aleg... ({animationStep}/10)
                          </>
                        ) : (
                          '🎲 Alege pentru mine!'
                        )}
                      </button>
                      
                      <button
                        onClick={clearFilters}
                        className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  {/* Selected Restaurant */}
                  {selectedRestaurant && (
                    <div className="border-t pt-6">
                      <div className="text-center mb-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          🎉 Restaurantul tău pentru astăzi:
                        </h3>
                      </div>
                      
                      <div className={`transform transition-all duration-300 ${
                        isSpinning ? 'scale-95 opacity-70' : 'scale-100 opacity-100'
                      }`}>
                        <RestaurantCard restaurant={selectedRestaurant} />
                      </div>

                      {!isSpinning && (
                        <div className="flex gap-3 mt-4">
                          <button
                            onClick={() => handleVisitRestaurant(selectedRestaurant.id)}
                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Vezi detalii
                          </button>
                          <button
                            onClick={() => {
                              if (isFavorite(selectedRestaurant.id)) {
                                removeFromFavorites(selectedRestaurant.id);
                              } else {
                                addToFavorites(selectedRestaurant);
                              }
                            }}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                              isFavorite(selectedRestaurant.id)
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-pink-100 text-pink-700 hover:bg-pink-200'
                            }`}
                          >
                            {isFavorite(selectedRestaurant.id) ? '💔' : '❤️'}
                          </button>
                          <button
                            onClick={handleManualPick}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            🎲 Încearcă din nou
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* No results message */}
                  {restaurantData && restaurantData.restaurants.length === 0 && !isFetching && (
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">😔</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Nu am găsit restaurante
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {filters.favoritesOnly 
                          ? 'Nu ai restaurante favorite încă'
                          : 'Încearcă să modifici filtrele sau să elimini unele restricții'
                        }
                      </p>
                      <button
                        onClick={clearFilters}
                        className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                      >
                        {filters.favoritesOnly ? 'Caută în toate restaurantele' : 'Resetează filtrele'}
                      </button>
                    </div>
                  )}

                  {/* Initial state - no restaurant selected yet */}
                  {!selectedRestaurant && !isSpinning && !isFetching && (
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">🎲</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Ready to pick a restaurant!
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Set your preferences above and click "Alege pentru mine!" to get started
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'history' && (
                <PickerHistory />
              )}

              {activeTab === 'favorites' && (
                <FavoritesPanel />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RandomRestaurantPicker;
