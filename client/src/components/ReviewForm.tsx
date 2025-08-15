import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import StarRating from './StarRating';
import { reviewApi } from '../service/api';

interface ReviewFormProps {
  restaurantId: string;
  onSuccess?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ restaurantId, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const queryClient = useQueryClient();

  const createReviewMutation = useMutation({
    mutationFn: (reviewData: any) => reviewApi.createReview(reviewData),
    onSuccess: () => {
      // Invalidate restaurant data to refetch with new review
      queryClient.invalidateQueries({ queryKey: ['restaurant', restaurantId] });
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      
      // Reset form
      setRating(0);
      setComment('');
      setUserName('');
      setUserEmail('');
      
      onSuccess?.();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0 || !userName.trim()) {
      return;
    }

    createReviewMutation.mutate({
      restaurantId,
      rating,
      comment: comment.trim() || undefined,
      userName: userName.trim(),
      userEmail: userEmail.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Write a Review</h3>
      
      {/* Rating */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Rating *
        </label>
        <StarRating
          rating={rating}
          interactive
          onRatingChange={setRating}
          size="lg"
          showNumber={false}
        />
      </div>

      {/* Name */}
      <div className="mb-4">
        <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-2">
          Your Name *
        </label>
        <input
          type="text"
          id="userName"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Enter your name"
          required
        />
      </div>

      {/* Email (optional) */}
      <div className="mb-4">
        <label htmlFor="userEmail" className="block text-sm font-medium text-gray-700 mb-2">
          Email (optional)
        </label>
        <input
          type="email"
          id="userEmail"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Enter your email"
        />
      </div>

      {/* Comment */}
      <div className="mb-6">
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
          Your Review
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Share your experience..."
        />
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end space-x-3">
        <button
          type="button"
          onClick={onSuccess}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={rating === 0 || !userName.trim() || createReviewMutation.isPending}
          className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {createReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
        </button>
      </div>

      {/* Error Message */}
      {createReviewMutation.error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">
            Failed to submit review. Please try again.
          </p>
        </div>
      )}
    </form>
  );
};

export default ReviewForm;
