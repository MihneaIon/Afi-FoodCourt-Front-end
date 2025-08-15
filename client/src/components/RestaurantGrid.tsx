import React, { memo } from 'react';
import { Restaurant } from '../types';
import RestaurantCard from './RestaurantCard';

interface RestaurantGridProps {
  restaurants: Restaurant[];
}

const RestaurantGrid: React.FC<RestaurantGridProps> = memo(({ restaurants }) => {
  if (restaurants.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🍽️</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No restaurants found
        </h3>
        <p className="text-gray-500">
          Try adjusting your search criteria or filters
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {restaurants.map((restaurant) => (
        <RestaurantCard 
          key={restaurant.id} 
          restaurant={restaurant} 
        />
      ))}
    </div>
  );
});

RestaurantGrid.displayName = 'RestaurantGrid';

export default RestaurantGrid;
