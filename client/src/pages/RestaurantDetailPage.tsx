import React, { Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRestaurant } from '../hooks/useRestaurant';
import ErrorBoundary from '../components/ErrorBoundary';
import LoadingSpinner from '../components/LoadingSpinner';
import StarRating from '../components/StarRating';
import LazyImage from '../components/LazyImage';

// Lazy load review component
const ReviewSection = React.lazy(() => import('../components/ReviewSection'));

const RestaurantDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: restaurant, isLoading, error } = useRestaurant(id!);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Restaurant not found</h2>
          <button
            onClick={() => navigate('/')}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            Back to Restaurants
          </button>
        </div>
      </div>
    );
  }

  const averageRating = restaurant.reviews.length > 0
    ? restaurant.reviews.reduce((sum, review) => sum + review.rating, 0) / restaurant.reviews.length
    : restaurant.rating;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-primary-600 hover:text-primary-700 mb-4"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Restaurants
            </button>
          </div>
        </div>

        {/* Restaurant Hero */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="lg:grid lg:grid-cols-2 lg:gap-8">
              {/* Image */}
              <div className="aspect-w-16 aspect-h-9 lg:aspect-w-1 lg:aspect-h-1">
                <LazyImage
                  src={restaurant.imageUrl || ''}
                  alt={restaurant.name}
                  className="w-full h-96 object-cover rounded-lg"
                />
              </div>

              {/* Info */}
              <div className="mt-8 lg:mt-0">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-3xl font-bold text-gray-900">{restaurant.name}</h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    restaurant.isOpen 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {restaurant.isOpen ? 'Open' : 'Closed'}
                  </span>
                </div>

                <div className="flex items-center space-x-4 mb-4">
                  <StarRating rating={averageRating} size="lg" />
                  <span className="text-lg font-medium text-gray-900">{restaurant.priceRange}</span>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {restaurant.categories.map((cat) => (
                    <span
                      key={cat.category.id}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                    >
                      {cat.category.icon} {cat.category.name}
                    </span>
                  ))}
                </div>

                {restaurant.description && (
                  <p className="text-gray-600 mb-6">{restaurant.description}</p>
                )}

                {/* Contact Info */}
                <div className="space-y-3">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span className="text-gray-900">{restaurant.address}</span>
                  </div>

                  {restaurant.phone && (
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <a href={`tel:${restaurant.phone}`} className="text-primary-600 hover:text-primary-700">
                        {restaurant.phone}
                      </a>
                    </div>
                  )}

                  {restaurant.website && (
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                      </svg>
                      <a 
                        href={restaurant.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section with Suspense */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Suspense fallback={
            <div className="bg-white rounded-lg p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          }>
            <ReviewSection restaurant={restaurant} />
          </Suspense>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default RestaurantDetailPage;
