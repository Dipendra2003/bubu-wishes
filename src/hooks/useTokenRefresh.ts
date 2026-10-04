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

        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return;
      }

      try {
        const csrfRes = await fetch('/api/csrf-token', { credentials: 'include' });
        const { csrfToken } = await csrfRes.json();
        
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
          },
          credentials: 'include', // Important for cookies
        });
        
        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('token', data.accessToken);
        } else if (response.status === 401 || response.status === 403) {
          // Token is genuinely invalid, expired, or revoked
          console.warn('🔒 Refresh token expired or revoked, logging out...');
          localStorage.removeItem('token');
          
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          
          if (!window.location.pathname.match(/\/(login|signup)/)) {
            window.location.href = '/login';
          }
        } else {
          // Server error (500, 503) or database sleep - DO NOT LOG OUT!
          console.warn(`⚠️ Token refresh encountered server status ${response.status}. Will retry on next interval.`);
        }
      } catch (error) {
        console.warn('⚠️ Network hiccup during token refresh, will retry later:', error);
      }
    };
    
    // Only start refresh if user has a token
    const token = localStorage.getItem('token');
    if (token) {
      // Refresh after 5 minutes (access token has 15-minute lifespan)
      const timeoutId = setTimeout(refreshAccessToken, 5 * 60 * 1000);
      
      // Then refresh every 10 minutes (token expires in 15 min)
      intervalRef.current = setInterval(refreshAccessToken, 10 * 60 * 1000);
      
      return () => {
        clearTimeout(timeoutId);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } else {

    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
}
