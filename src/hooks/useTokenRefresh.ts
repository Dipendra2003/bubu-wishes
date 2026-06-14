import { useEffect, useRef } from 'react';

/**
 * Hook to automatically refresh access tokens before they expire
 * Runs every 10 minutes to refresh the 15-minute access token
 * Now uses secure httpOnly cookies for refresh tokens
 */
export function useTokenRefresh() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    const refreshAccessToken = async () => {
      // Don't try to refresh if user is not logged in
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('⏸️ No token found, skipping refresh');
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return;
      }

      try {
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json' 
          },
          credentials: 'include', // Important for cookies
        });
        
        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('token', data.accessToken);
          // Token refreshed successfully
        } else {
          // If refresh fails, clear tokens and stop trying
          console.error('❌ Token refresh failed, clearing tokens...');
          localStorage.removeItem('token');
          
          // Clear the interval to stop further attempts
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          
          // Only redirect if we're not already on login/signup pages
          if (!window.location.pathname.match(/\/(login|signup)/)) {
            window.location.href = '/login';
          }
        }
      } catch (error) {
        console.error('Token refresh error:', error);
        // Stop trying on error
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    };
    
    // Only start refresh if user has a token
    const token = localStorage.getItem('token');
    if (token) {
      // Refresh after 5 seconds on mount (give app time to load)
      const timeoutId = setTimeout(refreshAccessToken, 5000);
      
      // Then refresh every 10 minutes (token expires in 15 min)
      intervalRef.current = setInterval(refreshAccessToken, 10 * 60 * 1000);
      
      return () => {
        clearTimeout(timeoutId);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } else {
      console.log('⏸️ No initial token, refresh hook inactive');
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
}
