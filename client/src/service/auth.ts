import type { IUser } from "./api";

export function setStoredUser(user: IUser): void {
  localStorage.setItem('user', JSON.stringify(user));
}

export function getStoredUser(): IUser | null {
  const userJson = localStorage.getItem('user');
  if (!userJson) return null;

  try {
    return JSON.parse(userJson) as IUser;
  } catch (e) {
    console.error("Failed to parse user data from localStorage", e);
    localStorage.removeItem('user');
    return null;
  }
}

export function clearClientAuthData(): void {
  localStorage.removeItem('user');
}
