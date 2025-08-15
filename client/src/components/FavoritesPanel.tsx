import React, { useState } from 'react';
import { useFavorites } from '../hooks/useFavorites';
import { useCategories } from '../hooks/usageCategories';
import { formatRelativeTime } from '../utils/performance';
import { useNavigate } from 'react-router-dom';
import { showToast } from './Toast';

const FavoritesPanel: React.FC = () => {
  const navigate = useNavigate();
  const { favorites, removeFromFavorites, clearAllFavorites, getFavoritesByCategory } = useFavorites();
  const { data: categories } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'rating' | 'name'>('date');

  const displayedFavorites = selectedCategory
    ? getFavoritesByCategory(selectedCategory)
    : favorites.restaurants;

  const sortedFavorites = [...displayedFavorites].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'date':
      default:
        return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
    }
  });

  const categoryStats = categories?.map(category => ({
    ...category,
    count: getFavoritesByCategory(category.name).length
  })).filter(cat => cat.count > 0) || [];

  if (favorites.restaurants.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="text-6xl mb-4">❤️</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No favorites yet
        </h3>
        <p className="text-gray-600 mb-4">
          Start adding restaurants to your favorites to see them here!
        </p>
        <div className="text-sm text-gray-500">
          💡 Tip: Use the heart button when picking restaurants or viewing restaurant details
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          My Favorites ({favorites.restaurants.length})
        </h3>
        <button
          onClick={() => {
            if (window.confirm('Remove all favorites?')) {
              clearAllFavorites();
            }
          }}
          className="text-red-600 hover:text-red-700 text-sm"
        >
          Clear all
        </button>
      </div>

      {/* Category filters */}
      {categoryStats.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by category
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === null
                  ? 'bg-pink-100 text-pink-800 border-2 border-pink-300'
                  : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
              }`}
            >
              All ({favorites.restaurants.length})
            </button>
            {categoryStats.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.name)}
                className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.name
                    ? 'bg-pink-100 text-pink-800 border-2 border-pink-300'
                    : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                }`}
              >
                <span className="mr-1">{category.icon}</span>
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sort options */}
      <div className="mb-4">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="border border-gray-300 rounded-md px-3 py-1 text-sm"
        >
          <option value="date">Sort by Date Added</option>
          <option value="rating">Sort by Rating</option>
          <option value="name">Sort by Name</option>
        </select>
      </div>

      {/* Favorites grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedFavorites.map((favorite) => (
          <div
            key={favorite.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start space-x-4">
              {/* Restaurant image */}
              <div className="flex-shrink-0">
                {favorite.imageUrl ? (
                  <img
                    src={favorite.imageUrl}
                    alt={favorite.name}
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
                      {favorite.name}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-gray-600">
                        {favorite.priceRange}
                      </span>
                      <span className="text-sm text-gray-600">
                        ⭐ {favorite.rating}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {favorite.categories.slice(0, 2).map((category, index) => (
                        <span
                          key={index}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                        >
                          {category}
                        </span>
                      ))}
                      {favorite.categories.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{favorite.categories.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromFavorites(favorite.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    title="Remove from favorites"
                  >
                    💔
                  </button>
                </div>

                <div className="text-xs text-gray-500 mt-2">
                  Added {formatRelativeTime(favorite.addedAt)}
                </div>

                {/* Actions */}
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={() => {
                      navigate(`/restaurant/${favorite.id}`);
                    }}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View details
                  </button>
                  
                  <button
                    onClick={() => {
                      // Quick pick this favorite
                      showToast.success(`🎯 Today's choice: ${favorite.name}!`);
                    }}
                    className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                  >
                    Pick this one!
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sortedFavorites.length === 0 && selectedCategory && (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-gray-600">No favorites in "{selectedCategory}" category</p>
          <button
            onClick={() => setSelectedCategory(null)}
            className="mt-2 text-pink-600 hover:text-pink-700 text-sm font-medium"
          >
            Show all favorites
          </button>
        </div>
      )}

      {/* Quick stats */}
      {favorites.restaurants.length > 0 && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">📊 Your favorite stats</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-semibold text-gray-900">
                {Math.round(favorites.restaurants.reduce((sum, r) => sum + r.rating, 0) / favorites.restaurants.length * 10) / 10}
              </div>
              <div className="text-gray-600">Avg. rating</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                {favorites.restaurants.filter(r => r.priceRange === '$').length}
              </div>
              <div className="text-gray-600">Budget-friendly</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                {categoryStats.length}
              </div>
              <div className="text-gray-600">Categories</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                {favorites.restaurants.filter(r => r.rating >= 4.5).length}
              </div>
              <div className="text-gray-600">Top-rated</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoritesPanel;
