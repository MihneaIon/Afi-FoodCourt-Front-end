import { create } from 'zustand';
import { Restaurant, RestaurantFilters } from '../types';

interface RestaurantStore {
  // State
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  filters: RestaurantFilters;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setRestaurants: (restaurants: Restaurant[]) => void;
  setSelectedRestaurant: (restaurant: Restaurant | null) => void;
  setFilters: (filters: Partial<RestaurantFilters>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearFilters: () => void;
}

export const useRestaurantStore = create<RestaurantStore>((set) => ({
  // Initial state
  restaurants: [],
  selectedRestaurant: null,
  filters: {
    page: 1,
    limit: 12
  },
  isLoading: false,
  error: null,
  
  // Actions
  setRestaurants: (restaurants) => set({ restaurants }),
  setSelectedRestaurant: (restaurant) => set({ selectedRestaurant: restaurant }),
  setFilters: (newFilters) => 
    set((state) => ({ 
      filters: { ...state.filters, ...newFilters, page: 1 } // Reset page when filters change
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearFilters: () => set({ 
    filters: { page: 1, limit: 12 } 
  }),
}));
