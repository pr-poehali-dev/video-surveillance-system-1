import { AUTH_SERVICE_API, USERS_SERVICE_API, CAMERAS_SERVICE_API } from '@/lib/backendUrls';

const PROTECTED_PREFIXES = [AUTH_SERVICE_API, USERS_SERVICE_API, CAMERAS_SERVICE_API];
const TOKEN_KEY = 'authToken';
const SESSION_KEYS = [
  'isAuthenticated', 'userLogin', 'userFullName', 'userId',
  'userRoleId', 'userGroupId', 'cameraGroupId', 'sessionToken', TOKEN_KEY,
];

const urlOf = (input: RequestInfo | URL): string => {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.toString();
  return input.url;
};

const isAuthAttempt = (url: string) => url.includes('resource=auth') && !url.includes('resource=auth-');

export const clearAuthStorage = () => {
  SESSION_KEYS.forEach((k) => localStorage.removeItem(k));
};

let installed = false;

export const installAuthFetch = () => {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = urlOf(input);
    if (!PROTECTED_PREFIXES.some((p) => url.startsWith(p))) {
      return originalFetch(input, init);
    }
    const token = localStorage.getItem(TOKEN_KEY);
    const headers = new Headers(init?.headers || (typeof input !== 'string' && !(input instanceof URL) ? input.headers : undefined));
    if (token) headers.set('X-Auth-Token', token);
    const response = await originalFetch(input, { ...init, headers });

    if (response.status === 401 && !isAuthAttempt(url)) {
      const onLogin = window.location.pathname.startsWith('/login');
      if (!onLogin && localStorage.getItem('isAuthenticated')) {
        clearAuthStorage();
        window.location.href = '/login';
      }
    }
    return response;
  };
};
