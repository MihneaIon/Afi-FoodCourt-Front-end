import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ToastContainer } from './components/Toast'; // Adaugă import
import RandomRestaurantPicker from './components/RandomRestaurantPicker'; //
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg h-64 shadow"></div>
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
           {/* Random Restaurant Picker - disponibil pe toate paginile */}
          <RandomRestaurantPicker />
          <ToastContainer /> {/* Adaugă aici */}
        </div>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
