import { useQuery } from '@tanstack/react-query';
import { categoryApi } from '../service/api';
import { Category } from '../types';

export const useCategories = () => {
  return useQuery<Category[], Error>({
    queryKey: ['categories'],
    queryFn: categoryApi.getCategories,
    staleTime: 10 * 60 * 1000, // 10 minutes - categories don't change often
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
