export interface Restaurant {
  id: string;
  name: string;
  description?: string;
  address: string;
  phone?: string;
  website?: string;
  imageUrl?: string;
  rating: number;
  priceRange: string;
  isOpen: boolean;
  applyDiscount: boolean;        // Nou
  discountPercentage?: number;   // Nou
  createdAt: string;
  updatedAt: string;
  categories: RestaurantCategory[];
  reviews: Review[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  createdAt: string;
}

export interface RestaurantCategory {
  category: Category;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  userName: string;
  userEmail?: string;
  createdAt: string;
}

export interface RestaurantFilters {
  category?: string;
  priceRange?: string;
  rating?: number;
  search?: string;
  page?: number;
  limit?: number;
  discounted?: boolean;
  applyMealTickets?: boolean;
  sortBy?: 'rating' | 'name' | 'price' | 'newest'; // Adaugă sortBy
  sortOrder?: 'asc' | 'desc'; // Adaugă sortOrder
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Tipuri pentru răspunsurile API
export interface RestaurantsResponse {
  restaurants: Restaurant[];
  pagination: PaginationInfo;
}

export interface ApiError {
  error: string;
  message?: string;
}

// Tipuri pentru form data
export interface CreateRestaurantData {
  name: string;
  description?: string;
  address: string;
  phone?: string;
  website?: string;
  imageUrl?: string;
  priceRange: string;
  applyDiscount?: boolean;       // Nou
  discountPercentage?: number;   // Nou
  categoryIds: string[];
}

export interface CreateReviewData {
  restaurantId: string;
  rating: number;
  comment?: string;
  userName: string;
  userEmail?: string;
}


// Favorite system types
export interface FavoriteRestaurant {
  id: string;
  name: string;
  imageUrl?: string;
  priceRange: string;
  rating: number;
  categories: string[];
  addedAt: string;
}

export interface UserFavorites {
  restaurants: FavoriteRestaurant[];
  categories: string[];
}

// Random picker history types
export interface PickerHistoryEntry {
  id: string;
  restaurant: {
    id: string;
    name: string;
    imageUrl?: string;
    priceRange: string;
    rating: number;
    categories: string[];
  };
  filters: {
    categories: string[];
    priceRange?: string;
    rating?: number;
  };
  pickedAt: string;
  wasVisited: boolean;
}

export interface PickerStats {
  totalPicks: number;
  favoriteCategories: Record<string, number>;
  history: PickerHistoryEntry[];
  streakCount: number; // Consecutive days with picks
  lastPickDate?: string;
}
