import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SESSIONS_API = 'https://functions.poehali.dev/16e39082-42c6-4aa9-9d08-b1ba9520eb50';

export const useSession = () => {
  const location = useLocation();

  const updateSession = async (route: string) => {
    const userId = localStorage.getItem('userId');
    const sessionToken = localStorage.getItem('sessionToken');

    if (!userId || !sessionToken) {
      return;
    }

    try {
      await fetch(SESSIONS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: parseInt(userId),
          session_token: sessionToken,
          current_route: route,
          ip_address: '',
          user_agent: navigator.userAgent,
        }),
      });
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  useEffect(() => {
    updateSession(location.pathname);
    
    const interval = setInterval(() => {
      updateSession(location.pathname);
    }, 30000);

    return () => clearInterval(interval);
  }, [location.pathname]);
};

export const createSession = async (userId: number): Promise<string> => {
  const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  
  try {
    await fetch(SESSIONS_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        session_token: sessionToken,
        current_route: '/dashboard',
        ip_address: '',
        user_agent: navigator.userAgent,
      }),
    });

    localStorage.setItem('sessionToken', sessionToken);
    return sessionToken;
  } catch (error) {
    console.error('Error creating session:', error);
    return sessionToken;
  }
};

export const endSession = async () => {
  const sessionToken = localStorage.getItem('sessionToken');

  if (!sessionToken) {
    return;
  }

  try {
    await fetch(`${SESSIONS_API}?session_token=${encodeURIComponent(sessionToken)}`, {
      method: 'DELETE',
    });

    localStorage.removeItem('sessionToken');
  } catch (error) {
    console.error('Error ending session:', error);
  }
};
