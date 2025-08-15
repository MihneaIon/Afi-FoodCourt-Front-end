import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { restaurantApi } from '../service/api';
import { useRestaurantStore } from '../store/restuarantStore';
import { RestaurantFilters, RestaurantsResponse, Restaurant, CreateRestaurantData } from '../types';

export const useRestaurants = () => {
  const { filters, setLoading, setError } = useRestaurantStore();
  
  const query = useQuery<RestaurantsResponse, Error>({
    queryKey: ['restaurants', filters],
    queryFn: () => restaurantApi.getRestaurants(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Handle loading and error states with useEffect
  useEffect(() => {
    setLoading(query.isLoading);
  }, [query.isLoading, setLoading]);

  useEffect(() => {
    setError(query.error?.message || null);
  }, [query.error, setError]);

  return query;
};

export const useRestaurant = (id: string) => {
  return useQuery<Restaurant, Error>({
    queryKey: ['restaurant', id],
    queryFn: () => restaurantApi.getRestaurant(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  });
};

export const useCreateRestaurant = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Restaurant, Error, CreateRestaurantData>({
    mutationFn: restaurantApi.createRestaurant,
    onSuccess: () => {
      // Invalidate and refetch restaurants
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
    onError: (error) => {
      console.error('Failed to create restaurant:', error);
    },
  });
};
