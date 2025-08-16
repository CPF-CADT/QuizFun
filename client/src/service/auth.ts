interface User {
  id: string;
  name: string;
  email: string;
  role: string; 
}

export function setAccessToken(token: string): void {
  localStorage.setItem('accessToken', token);
}

export function getAccessToken(): string | null {
  return localStorage.getItem('accessToken');
}

export function setStoredUser(user: User): void {
  localStorage.setItem('user', JSON.stringify(user));
}

export function getStoredUser(): User | null {
  const userJson = localStorage.getItem('user');
  if (!userJson) return null;
  try {
    return JSON.parse(userJson) as User;
  } catch (e) {
    console.error("Failed to parse user data from localStorage", e);
    return null;
  }
}

export function clearClientAuthData(): void {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
}
