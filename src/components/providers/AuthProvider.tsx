'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setAuthenticated, setCurrentUser } from '@/lib/features/auth/authSlice';
import { tokenManager, authFetch } from '@/lib/auth/token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Check if we have a token
        if (!tokenManager.isAuthenticated()) {
          dispatch(setAuthenticated(false));
          dispatch(setCurrentUser(null));
          return;
        }

        // Try to verify the token with the server
        const response = await authFetch('/api/auth/check');
        if (response.ok) {
          const data = await response.json();
          if (data.authenticated && data.user) {
            dispatch(setCurrentUser(data.user));
            dispatch(setAuthenticated(true));
          } else {
            // Token is invalid, clear auth state
            tokenManager.removeToken();
            dispatch(setAuthenticated(false));
            dispatch(setCurrentUser(null));
            localStorage.removeItem('currentUser');
          }
        } else {
          // Auth check failed, clear auth state
          tokenManager.removeToken();
          dispatch(setAuthenticated(false));
          dispatch(setCurrentUser(null));
          localStorage.removeItem('currentUser');
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        // On error, clear auth state
        tokenManager.removeToken();
        dispatch(setAuthenticated(false));
        dispatch(setCurrentUser(null));
        localStorage.removeItem('currentUser');
      }
    };

    checkAuthStatus();
  }, [dispatch]);

  return <>{children}</>;
}
