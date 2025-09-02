import React, { memo, useState, useCallback, startTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { Restaurant } from '../types';
import { useFavorites } from '../hooks/useFavorites';
import LazyImage from './LazyImage';
import StarRating from './StarRating';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

const RestaurantCard = memo(({ restaurant }: RestaurantCardProps) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();

  const handleCardClick = useCallback(() => {
    startTransition(() => {
      navigate(`/restaurant/${restaurant.id}`);
    });
  }, [navigate, restaurant.id]);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFavorite(restaurant.id)) {
      removeFromFavorites(restaurant.id);
    } else {
      addToFavorites(restaurant);
    }
  }, [restaurant, isFavorite, addToFavorites, removeFromFavorites]);

  const averageRating = restaurant.reviews.length > 0
    ? restaurant.reviews.reduce((sum, review) => sum + review.rating, 0) / restaurant.reviews.length
    : restaurant.rating;

  return (
    <div 
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleCardClick();
        }
      }}
    >
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden rounded-t-lg">
        {!imageError && restaurant.imageUrl ? (
          <LazyImage
            src={restaurant.imageUrl}
            alt={restaurant.name}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <span className="text-4xl">🍽️</span>
          </div>
        )}
        
        {/* Badges Container - Reorganized */}
        <div className="absolute inset-0 p-3">
          {/* Top row - Favorite and Status */}
          <div className="flex justify-between items-start mb-2">
            {/* Favorite Button - Left side */}
            <button
              onClick={handleFavoriteClick}
              className={`p-2 rounded-full shadow-md transition-all duration-200 ${
                isFavorite(restaurant.id)
                  ? 'bg-red-500 text-white scale-110'
                  : 'bg-white bg-opacity-90 text-gray-600 hover:text-red-500 hover:bg-opacity-100'
              }`}
              title={isFavorite(restaurant.id) ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isFavorite(restaurant.id) ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              )}
            </button>

            {/* Status Badge - Right side */}
            <span className={`px-2 py-1 rounded-full text-xs font-medium shadow-md ${
              restaurant.isOpen 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
            }`}>
              {restaurant.isOpen ? 'Open' : 'Closed'}
            </span>
          </div>

          {/* Bottom row - Price Range */}
          <div className="flex justify-start">
            <span className="bg-white bg-opacity-90 px-2 py-1 rounded-full text-sm font-medium text-gray-800 shadow-md">
              {restaurant.priceRange}
            </span>
          </div>
          {/* Discount Badge - Nou */}
          {restaurant.applyDiscount && restaurant.discountPercentage && (
            <div className="absolute top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md animate-pulse">
                -{restaurant.discountPercentage}% OFF
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 flex-1 mr-2">
            {restaurant.name}
          </h3>
          <StarRating rating={averageRating} size="sm" />
           {/* Discount info în footer */}
        </div>
        {/* discunt */}
        <div>
          {restaurant.applyDiscount && restaurant.discountPercentage && (
            <span className="text-xs text-red-600 font-medium mt-1">
              {restaurant.discountPercentage}% discount
            </span>
          )}
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-1 mb-2">
          {restaurant.categories.slice(0, 2).map((cat) => (
            <span
              key={cat.category.id}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
            >
              {cat.category.icon} {cat.category.name}
            </span>
          ))}
          {restaurant.categories.length > 2 && (
            <span className="text-xs text-gray-500">
              +{restaurant.categories.length - 2} more
            </span>
          )}
        </div>

        {/* Description */}
        {restaurant.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {restaurant.description}
          </p>
        )}

        {/* Address */}
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="line-clamp-1">{restaurant.address}</span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m0 0v8a2 2 0 002 2h6a2 2 0 002-2V8" />
            </svg>
            {restaurant.reviews.length} reviews
          </div>
          
          <button 
            className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
          >
            View Details →
          </button>
        </div>
      </div>
    </div>
  );
});

RestaurantCard.displayName = 'RestaurantCard';

export default RestaurantCard;
