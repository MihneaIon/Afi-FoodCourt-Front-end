import React, { useState } from 'react';
import { useRandomPickerStats } from '../hooks/useRandomPicker';
import { useFavorites } from '../hooks/useFavorites';
import { formatRelativeTime, formatDate } from '../utils/performance';
import { useNavigate } from 'react-router-dom';
import { showToast } from './Toast';

const PickerHistory: React.FC = () => {
  const navigate = useNavigate();
  const { stats, markAsVisited, removeFromHistory, clearHistory } = useRandomPickerStats();
  const { addToFavorites, isFavorite } = useFavorites();
  const [filter, setFilter] = useState<'all' | 'visited' | 'unvisited'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'rating' | 'category'>('date');

  const filteredHistory = stats.history
    .filter(entry => {
      if (filter === 'visited') return entry.wasVisited;
      if (filter === 'unvisited') return !entry.wasVisited;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.restaurant.rating - a.restaurant.rating;
        case 'category':
          return a.restaurant.categories[0]?.localeCompare(b.restaurant.categories[0] || '') || 0;
        case 'date':
        default:
          return new Date(b.pickedAt).getTime() - new Date(a.pickedAt).getTime();
      }
    });

  const handleVisitRestaurant = (entryId: string, restaurantId: string) => {
    markAsVisited(entryId);
    navigate(`/restaurant/${restaurantId}`);
  };

  const handleAddToFavorites = (entry: any) => {
    const restaurant = {
      id: entry.restaurant.id,
      name: entry.restaurant.name,
      imageUrl: entry.restaurant.imageUrl,
      priceRange: entry.restaurant.priceRange,
      rating: entry.restaurant.rating,
      applyDiscount: entry.restaurant.applyDiscount,      // Nou cu valoare default
      discountPercentage: entry.restaurant.discountPercentage, // Nou cu valoare default
      categories: entry.restaurant.categories.map((cat: string) => ({ category: { name: cat } })),
      isOpen: true,
      address: '',
      reviews: [],
      createdAt: entry.pickedAt,
      updatedAt: entry.pickedAt
    };
    addToFavorites(restaurant);
  };

  if (stats.history.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No history yet
        </h3>
        <p className="text-gray-600">
          Start picking restaurants to see your history here!
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header with stats */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Istoric Selecții ({stats.history.length})
          </h3>
          <button
            onClick={() => {
              if (window.confirm('Ștergi tot istoricul?')) {
                clearHistory();
                showToast.success('Istoric șters');
              }
            }}
            className="text-red-600 hover:text-red-700 text-sm"
          >
            Șterge tot
          </button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.totalPicks}</div>
            <div className="text-sm text-blue-600">Total picks</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {stats.history.filter(h => h.wasVisited).length}
            </div>
            <div className="text-sm text-green-600">Visited</div>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{stats.streakCount}</div>
            <div className="text-sm text-orange-600">Day streak</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="all">All ({stats.history.length})</option>
            <option value="visited">Visited ({stats.history.filter(h => h.wasVisited).length})</option>
            <option value="unvisited">Not visited ({stats.history.filter(h => !h.wasVisited).length})</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="date">Sort by Date</option>
            <option value="rating">Sort by Rating</option>
            <option value="category">Sort by Category</option>
          </select>
        </div>
      </div>

      {/* History list */}
      <div className="space-y-4">
        {filteredHistory.map((entry) => (
          <div
            key={entry.id}
            className={`border rounded-lg p-4 transition-colors ${
              entry.wasVisited ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-start space-x-4">
              {/* Restaurant image */}
              <div className="flex-shrink-0">
                {entry.restaurant.imageUrl ? (
                  <img
                    src={entry.restaurant.imageUrl}
                    alt={entry.restaurant.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    🍽️
                  </div>
                )}
              </div>

              {/* Restaurant info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 truncate">
                      {entry.restaurant.name}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-gray-600">
                        {entry.restaurant.priceRange}
                      </span>
                      <span className="text-sm text-gray-600">
                        ⭐ {entry.restaurant.rating}
                      </span>
                      {entry.wasVisited && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          ✓ Visited
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {entry.restaurant.categories.slice(0, 2).map((category, index) => (
                        <span
                          key={index}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-right text-sm text-gray-500">
                    <div>{formatRelativeTime(entry.pickedAt)}</div>
                    <div className="text-xs">{formatDate(entry.pickedAt)}</div>
                  </div>
                </div>

                {/* Applied filters */}
                {(entry.filters.categories.length > 0 || entry.filters.priceRange || entry.filters.rating) && (
                  <div className="mt-2 text-xs text-gray-500">
                    Filters: {entry.filters.categories.join(', ')}
                    {entry.filters.priceRange && ` • ${entry.filters.priceRange}`}
                    {entry.filters.rating && ` • ${entry.filters.rating}+ stars`}
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={() => handleVisitRestaurant(entry.id, entry.restaurant.id)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    {entry.wasVisited ? 'Visit again' : 'Visit now'}
                  </button>
                  
                  {!isFavorite(entry.restaurant.id) && (
                    <button
                      onClick={() => handleAddToFavorites(entry)}
                      className="text-pink-600 hover:text-pink-700 text-sm font-medium"
                    >
                      Add to favorites
                    </button>
                  )}
                  
                  <button
                    onClick={() => {
                      removeFromHistory(entry.id);
                      showToast.success('Removed from history');
                    }}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredHistory.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-gray-600">No entries match your filters</p>
        </div>
      )}
    </div>
  );
};

export default PickerHistory;
