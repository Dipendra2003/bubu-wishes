import { useEffect, useState } from 'react';
import { useAuth } from '../App';
import { useToast } from '../components/ui/ToastProvider';
import { useNavigate } from 'react-router-dom';
import { fetchWithCsrf } from './useCsrf';

export function useGoogleAuth(buttonContainerId: string, buttonText: 'signin_with' | 'signup_with' = 'signin_with') {
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if client ID is configured
    const clientId = (import.meta as any).env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn('VITE_GOOGLE_CLIENT_ID is not configured. Google Sign-In will be disabled.');
      return;
    }

    const handleGoogleResponse = async (response: any) => {
      try {
        setGoogleLoading(true);
        const res = await fetchWithCsrf('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential: response.credential })
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Google authentication failed');
        
        login(data.accessToken, data.user);
        toast('Successfully signed in with Google!', 'success');
        navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
      } catch (err: any) {
        toast(err.message, 'error');
      } finally {
        setGoogleLoading(false);
      }
    };

    // Make callback globally available for the Google script
    (window as any).handleGoogleCallback = handleGoogleResponse;

    const initAndRender = () => {
      if ((window as any).google) {
        try {
          (window as any).google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleResponse,
          });
        } catch (e) {
          // ignore already initialized error
        }
        
        const buttonElement = document.getElementById(buttonContainerId);
        if (buttonElement) {
          (window as any).google.accounts.id.renderButton(
            buttonElement,
            { theme: 'outline', size: 'large', text: buttonText, shape: 'pill' }
          );
        }
      }
    };

    if ((window as any).google) {
      initAndRender();
    } else {
      let script = document.getElementById('gsi-script') as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.id = 'gsi-script';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
      }
      
      script.addEventListener('load', initAndRender);

      return () => {
        script.removeEventListener('load', initAndRender);
        // Do not remove script to allow other components to use it
        delete (window as any).handleGoogleCallback;
      };
    }
  }, [buttonContainerId, buttonText, login, navigate, toast]);

  return { googleLoading };
}
