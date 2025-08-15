import { useCallback } from 'react';
import { useLocalStorage } from '../utils/performance';
import { Restaurant, UserFavorites, FavoriteRestaurant } from '../types';
import { showToast } from '../components/Toast';

export const useFavorites = () => {
  const [favorites, setFavorites] = useLocalStorage<UserFavorites>('userFavorites', {
    restaurants: [],
    categories: []
  });

  const addToFavorites = useCallback((restaurant: Restaurant) => {
    const favoriteRestaurant: FavoriteRestaurant = {
      id: restaurant.id,
      name: restaurant.name,
      imageUrl: restaurant.imageUrl,
      priceRange: restaurant.priceRange,
      rating: restaurant.rating,
      categories: restaurant.categories.map(c => c.category.name),
      addedAt: new Date().toISOString()
    };

    setFavorites(prev => {
      if (prev.restaurants.some(r => r.id === restaurant.id)) {
        showToast.info('Restaurant already in favorites');
        return prev;
      }

      showToast.success('Added to favorites!');
      return {
        ...prev,
        restaurants: [favoriteRestaurant, ...prev.restaurants]
      };
    });
  }, [setFavorites]);

  const removeFromFavorites = useCallback((restaurantId: string) => {
    setFavorites(prev => {
      const filtered = prev.restaurants.filter(r => r.id !== restaurantId);
      if (filtered.length < prev.restaurants.length) {
        showToast.success('Removed from favorites');
      }
      return {
        ...prev,
        restaurants: filtered
      };
    });
  }, [setFavorites]);

  const isFavorite = useCallback((restaurantId: string) => {
    return favorites.restaurants.some(r => r.id === restaurantId);
  }, [favorites.restaurants]);

  const addCategoryToFavorites = useCallback((categoryName: string) => {
    setFavorites(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryName) 
        ? prev.categories 
        : [...prev.categories, categoryName]
    }));
  }, [setFavorites]);

  const removeCategoryFromFavorites = useCallback((categoryName: string) => {
    setFavorites(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c !== categoryName)
    }));
  }, [setFavorites]);

  const getFavoritesByCategory = useCallback((categoryName: string) => {
    return favorites.restaurants.filter(r => 
      r.categories.includes(categoryName)
    );
  }, [favorites.restaurants]);

  const clearAllFavorites = useCallback(() => {
    setFavorites({
      restaurants: [],
      categories: []
    });
    showToast.success('All favorites cleared');
  }, [setFavorites]);

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    addCategoryToFavorites,
    removeCategoryFromFavorites,
    getFavoritesByCategory,
    clearAllFavorites
  };
};
