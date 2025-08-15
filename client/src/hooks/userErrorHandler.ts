import { useEffect } from 'react';
import { showToast } from '../components/Toast';

export const useErrorHandler = (error: Error | null, message?: string) => {
  useEffect(() => {
    if (error) {
      showToast.error(message || error.message || 'Something went wrong');
    }
  }, [error, message]);
};
