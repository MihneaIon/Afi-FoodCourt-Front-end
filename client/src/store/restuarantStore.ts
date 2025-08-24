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
  // Noi actions pentru filtre specifice
  setSortBy: (sortBy: string) => void;
  setPriceRange: (priceRange: string | undefined) => void;
  setRatingFilter: (rating: number | undefined) => void;
  setSearch: (search: string) => void;
  setDiscountFilter: (discounted: boolean) => void;
  setMealTicketsFilter: (applyMealTickets: boolean) => void;
}

export const useRestaurantStore = create<RestaurantStore>((set, get) => ({
  // Initial state
  restaurants: [],
  selectedRestaurant: null,
  filters: {
    page: 1,
    limit: 12,
    sortBy: 'rating',
    sortOrder: 'desc'
  },
  isLoading: false,
  error: null,

  // Actions
  setRestaurants: (restaurants) => set({ restaurants }),
  setSelectedRestaurant: (restaurant) => set({ selectedRestaurant: restaurant }),
  setFilters: (newFilters) => {
    console.log('Store: Setting filters', newFilters);
    console.log('Store: Current filters', get().filters);

    set((state) => {
      // Resetează pagina la 1 când se schimbă filtrele (except page change)
      const updatedFilters = {
        ...state.filters,
        ...newFilters,
        page: newFilters.page !== undefined ? newFilters.page : 1
      };
      console.log('Store: Updated filters', updatedFilters);
      return { filters: updatedFilters };
    });
  },
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearFilters: () => set({
    filters: {
      page: 1,
      limit: 12,
      sortBy: 'rating',
      sortOrder: 'desc'
    }
  }),

  // Noi actions
  setSortBy: (sortBy) => {
    const currentFilters = get().filters;
    set({
      filters: {
        ...currentFilters,
        sortBy: sortBy as any,
        page: 1 // Reset la prima pagină
      }
    });
  },
  setPriceRange: (priceRange) => {
    const currentFilters = get().filters;
    set({
      filters: {
        ...currentFilters,
        priceRange,
        page: 1
      }
    });
  },
  setRatingFilter: (rating) => {
    const currentFilters = get().filters;
    set({
      filters: {
        ...currentFilters,
        rating,
        page: 1
      }
    });
  },
  setDiscountFilter: (discounted: boolean) => {
    const currentFilters = get().filters;
    set({
      filters: {
        ...currentFilters,
        discounted: discounted,
        page: 1
      }
    });
  },
  setMealTicketsFilter: (applyMealTickets: boolean) => {
    const currentFilters = get().filters;
    set({
      filters: {
        ...currentFilters,
        applyMealTickets,
        page: 1
      }
    });
  },
  setSearch: (search) => {
    const currentFilters = get().filters;
    set({
      filters: {
        ...currentFilters,
        search,
        page: 1
      }
    });
  },
}));
