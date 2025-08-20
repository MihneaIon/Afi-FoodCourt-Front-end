import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ToastContainer } from './components/Toast'; // Adaugă import
import './App.css';

// Lazy loading pentru performanță
const HomePage = React.lazy(() => import('./pages/HomePage'));
const RestaurantDetailPage = React.lazy(() => import('./pages/RestaurantDetailPage'));
const CreateRestaurantPage = React.lazy(() => import('./pages/CreateRestaurantPage'));

// Loading component cu Skeleton
const PageSkeleton = () => (
  <div className="min-h-screen bg-gray-50 animate-pulse">
    <div className="h-16 bg-gray-200 mb-8"></div>
    <div className="max-w-7xl mx-auto px-4">
      {/* Grid de carduri skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow overflow-hidden">
            {/* Image skeleton */}
            <div className="h-48 bg-gray-200 animate-pulse"></div>
            
            {/* Content skeleton */}
            <div className="p-4 space-y-3">
              {/* Title skeleton */}
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              
              {/* Description skeleton */}
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              </div>
              
              {/* Tags skeleton */}
              <div className="flex space-x-2">
                <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: true, // Refetch când user revine la tab
      refetchOnReconnect: true,   // Refetch când se reconectează la internet
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Suspense fallback={<PageSkeleton />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/restaurant/:id" element={<RestaurantDetailPage />} />
              <Route path="/create" element={<CreateRestaurantPage />} />
            </Routes>
          </Suspense>
          <ToastContainer /> {/* Adaugă aici */}
        </div>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
