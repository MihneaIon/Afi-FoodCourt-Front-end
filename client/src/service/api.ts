import axios from 'axios';
import {
  Restaurant,
  Category,
  RestaurantFilters,
  RestaurantsResponse,
  CreateRestaurantData,
  CreateReviewData
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL + '/api' || 'http://localhost:5000/api';
console.log('API Base URL:', API_BASE_URL); // Debug log

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const restaurantApi = {
  // Get restaurants with filters
  getRestaurants: async (filters: RestaurantFilters = {}): Promise<RestaurantsResponse> => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/restaurants?${params}`);
    return response.data;
  },

  // Get single restaurant
  getRestaurant: async (id: string): Promise<Restaurant> => {
    const response = await api.get(`/restaurants/${id}`);
    return response.data;
  },

  // Create restaurant
  createRestaurant: async (restaurant: Partial<Restaurant>): Promise<Restaurant> => {
    const response = await api.post('/restaurants', restaurant);
    return response.data;
  },
};

export const categoryApi = {
  // Get all categories
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    return response.data;
  },
};

// Add to existing restaurantApi object
export const reviewApi = {
  // Create review
  createReview: async (reviewData: {
    restaurantId: string;
    rating: number;
    comment?: string;
    userName: string;
    userEmail?: string;
  }) => {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  },

  // Get reviews for restaurant
  getReviews: async (restaurantId: string) => {
    const response = await api.get(`/reviews/restaurant/${restaurantId}`);
    return response.data;
  },
};
