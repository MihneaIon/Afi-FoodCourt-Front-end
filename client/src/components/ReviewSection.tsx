import React, { useState, useMemo, useCallback, useTransition } from 'react';
import { Restaurant, Review } from '../types';
import StarRating from './StarRating';
import ReviewForm from './ReviewForm';

interface ReviewSectionProps {
  restaurant: Restaurant;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ restaurant }) => {
  const [showForm, setShowForm] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating'>('newest');
  const [isPending, startTransition] = useTransition();

  // Memoized sorted reviews pentru performanță
  const sortedReviews = useMemo(() => {
    const reviews = [...restaurant.reviews];
    
    switch (sortBy) {
      case 'newest':
        return reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'oldest':
        return reviews.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'rating':
        return reviews.sort((a, b) => b.rating - a.rating);
      default:
        return reviews;
    }
  }, [restaurant.reviews, sortBy]);

  // Memoized statistics
  const reviewStats = useMemo(() => {
    const total = restaurant.reviews.length;
    if (total === 0) return { average: 0, distribution: [0, 0, 0, 0, 0], total: 0 };

    const sum = restaurant.reviews.reduce((acc, review) => acc + review.rating, 0);
    const average = sum / total;
    
    const distribution = [1, 2, 3, 4, 5].map(rating => 
      restaurant.reviews.filter(review => review.rating === rating).length
    );

    return { average, distribution, total };
  }, [restaurant.reviews]);

  const handleSortChange = useCallback((newSort: 'newest' | 'oldest' | 'rating') => {
    startTransition(() => {
      setSortBy(newSort);
    });
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Reviews ({reviewStats.total})
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          {showForm ? 'Cancel' : 'Write Review'}
        </button>
      </div>

      {/* Review Stats */}
      {(reviewStats.total ?? 0) > 0 && (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Average Rating */}
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {reviewStats.average.toFixed(1)}
              </div>
              <StarRating rating={reviewStats.average} size="lg" showNumber={false} />
              <p className="text-sm text-gray-600 mt-2">
                Based on {reviewStats.total} reviews
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = reviewStats.distribution[rating - 1];
                const percentage = reviewStats.total > 0 ? (count / reviewStats.total) * 100 : 0;
                
                return (
                  <div key={rating} className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 w-8">{rating}★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-8">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Review Form */}
      {showForm && (
        <div className="mb-8">
          <ReviewForm 
            restaurantId={restaurant.id} 
            onSuccess={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Sort Controls */}
      {(reviewStats.total ?? 0) > 0 && (
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">All Reviews</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
              disabled={isPending}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="rating">Highest Rating</option>
            </select>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className={`space-y-6 ${isPending ? 'opacity-70' : ''}`}>
        {sortedReviews.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No reviews yet
            </h3>
            <p className="text-gray-500">
              Be the first to share your experience!
            </p>
          </div>
        ) : (
          sortedReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))
        )}
      </div>
    </div>
  );
};

// Individual Review Card Component
const ReviewCard: React.FC<{ review: Review }> = React.memo(({ review }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="border-b border-gray-200 pb-6 last:border-b-0">
      <div className="flex items-start space-x-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-600 font-medium text-sm">
              {(review.userName || 'Anonymous').charAt(0).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Review Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-medium text-gray-900">{review.userName}</h4>
              <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
            </div>
            <StarRating rating={review.rating} size="sm" showNumber={false} />
          </div>

          {review.comment && (
            <p className="text-gray-700 leading-relaxed">{review.comment}</p>
          )}
        </div>
      </div>
    </div>
  );
});

export default ReviewSection;
