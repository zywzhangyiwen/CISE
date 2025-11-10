export const TOKEN_COOKIE = 'speed_token';

export function setTokenCookie(token: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${TOKEN_COOKIE}=${token}; path=/; max-age=${7 * 24 * 3600}`;
}

export function clearTokenCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0`;
}

export function getTokenFromCookieStr(cookieStr: string | undefined): string | null {
  if (!cookieStr) return null;
  const parts = cookieStr.split(';').map((s) => s.trim());
  for (const p of parts) {
    if (p.startsWith(`${TOKEN_COOKIE}=`)) {
      return p.substring(TOKEN_COOKIE.length + 1);
    }
  }
  return null;
}

export type JwtPayload = {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
};

export function decodeToken(token: string | null): JwtPayload | null {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    return JSON.parse(Buffer.from(payload, 'base64').toString('utf-8')) as JwtPayload;
  } catch {
    try {
      // Fallback for browser without Buffer
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload)) as JwtPayload;
    } catch {
      return null;
    }
  }
}

