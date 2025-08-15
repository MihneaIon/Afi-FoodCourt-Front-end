import { useState, useCallback } from 'react';
import { useLocalStorage } from '../utils/performance';
import { Restaurant, PickerStats, PickerHistoryEntry } from '../types';
import { generateId } from '../utils/performance';

export const useRandomPickerStats = () => {
  const [stats, setStats] = useLocalStorage<PickerStats>('randomPickerStats', {
    totalPicks: 0,
    favoriteCategories: {},
    history: [],
    streakCount: 0
  });

  const recordPick = useCallback((
    restaurant: Restaurant, 
    filters: { categories: string[]; priceRange?: string; rating?: number; }
  ) => {
    const historyEntry: PickerHistoryEntry = {
      id: generateId(),
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        imageUrl: restaurant.imageUrl,
        priceRange: restaurant.priceRange,
        rating: restaurant.rating,
        categories: restaurant.categories.map(c => c.category.name)
      },
      filters,
      pickedAt: new Date().toISOString(),
      wasVisited: false
    };

    setStats(prev => {
      const newFavoriteCategories = { ...prev.favoriteCategories };
      restaurant.categories.forEach(cat => {
        const categoryName = cat.category.name;
        newFavoriteCategories[categoryName] = (newFavoriteCategories[categoryName] || 0) + 1;
      });

      // Calculate streak
      const today = new Date().toDateString();
      const lastPickDate = prev.lastPickDate ? new Date(prev.lastPickDate).toDateString() : null;
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
      
      let newStreakCount = prev.streakCount;
      if (!lastPickDate || lastPickDate === yesterday) {
        newStreakCount = lastPickDate === yesterday ? prev.streakCount + 1 : 1;
      } else if (lastPickDate !== today) {
        newStreakCount = 1;
      }

      return {
        totalPicks: prev.totalPicks + 1,
        favoriteCategories: newFavoriteCategories,
        history: [historyEntry, ...prev.history.slice(0, 49)], // Keep last 50
        streakCount: newStreakCount,
        lastPickDate: new Date().toISOString()
      };
    });

    return historyEntry.id;
  }, [setStats]);

  const markAsVisited = useCallback((entryId: string) => {
    setStats(prev => ({
      ...prev,
      history: prev.history.map(entry =>
        entry.id === entryId ? { ...entry, wasVisited: true } : entry
      )
    }));
  }, [setStats]);

  const removeFromHistory = useCallback((entryId: string) => {
    setStats(prev => ({
      ...prev,
      history: prev.history.filter(entry => entry.id !== entryId)
    }));
  }, [setStats]);

  const clearHistory = useCallback(() => {
    setStats(prev => ({
      ...prev,
      history: []
    }));
  }, [setStats]);

  const getMostPickedCategory = useCallback(() => {
    const categories = Object.entries(stats.favoriteCategories);
    if (categories.length === 0) return null;
    
    return categories.reduce((max, current) => 
      current[1] > max[1] ? current : max
    )[0];
  }, [stats.favoriteCategories]);

  const getRecentPicks = useCallback((days: number = 7) => {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return stats.history.filter(entry => 
      new Date(entry.pickedAt) > cutoffDate
    );
  }, [stats.history]);

  const getPicksByCategory = useCallback((categoryName: string) => {
    return stats.history.filter(entry =>
      entry.restaurant.categories.includes(categoryName)
    );
  }, [stats.history]);

  return {
    stats,
    recordPick,
    markAsVisited,
    removeFromHistory,
    clearHistory,
    getMostPickedCategory,
    getRecentPicks,
    getPicksByCategory
  };
};
