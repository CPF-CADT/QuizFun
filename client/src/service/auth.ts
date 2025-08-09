// src/service/authService.ts
interface User {
  id: string;
  name: string;
  email: string;
}

export function setToken(token: string): void {
  localStorage.setItem('token', token);
}

export function getToken(): string | null {
  return localStorage.getItem('token');
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
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}