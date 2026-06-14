import { useState, useEffect } from 'react';

/**
 * Hook to manage CSRF token for secure API requests
 */
export function useCsrf() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  useEffect(() => {
    // Fetch CSRF token on mount
    fetch('/api/csrf-token', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        setCsrfToken(data.csrfToken);
      })
      .catch(err => {
        console.error('Failed to fetch CSRF token:', err);
      });
  }, []);

  return csrfToken;
}

/**
 * Enhanced fetch wrapper that automatically includes CSRF token
 */
export async function fetchWithCsrf(url: string, options: RequestInit = {}) {
  // Get CSRF token from cookie or fetch it
  let csrfToken = getCsrfTokenFromCookie();
  
  if (!csrfToken) {
    // Fetch CSRF token if not in cookie
    const response = await fetch('/api/csrf-token', {
      credentials: 'include'
    });
    const data = await response.json();
    csrfToken = data.csrfToken;
  }

  // Add CSRF token to headers for non-GET requests
  const method = options.method?.toUpperCase() || 'GET';
  const headers = new Headers(options.headers);
  
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method) && csrfToken) {
    headers.set('X-CSRF-Token', csrfToken);
  }

  // Always include credentials for cookies
  return fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });
}

/**
 * Extract CSRF token from cookie (fallback)
 */
function getCsrfTokenFromCookie(): string | null {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'csrf-token') {
      return decodeURIComponent(value);
    }
  }
  return null;
}
