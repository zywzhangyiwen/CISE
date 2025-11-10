export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export async function getJson<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {})
    },
    // Ensure SSR fetch works for Next.js
    cache: 'no-store'
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Request failed ${res.status}: ${text}`);
  }
  return res.json();
}

export type SearchArticlesResponse = {
  articles: Array<{
    _id: string;
    title: string;
    authors: string[];
    source: string;
    pubyear: string;
    doi: string;
    claim: string;
    evidence: string;
  }>;
};

export async function getAuthJson<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  return getJson<T>(path, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function postAuthJson<T>(path: string, token: string, body: unknown, init?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    method: 'POST',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Request failed ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function putAuthJson<T>(path: string, token: string, body: unknown, init?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    method: 'PUT',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Request failed ${res.status}: ${await res.text()}`);
  return res.json();
}


