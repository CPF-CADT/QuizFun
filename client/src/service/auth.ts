interface User {
  id: string;
  name: string;
  email: string;
}
interface JwtPayload {
  exp?: number;
}
export function isTokenValid(): boolean {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split('.')[1])) as JwtPayload;

    if (typeof payload.exp === 'undefined') {
      return false;
    }

    const currentTimeInSeconds = Math.floor(Date.now() / 1000);
    return payload.exp > currentTimeInSeconds;
  } catch (err) {
    console.error("Failed to parse or validate token:", err);
    return false;
  }
}

export function setToken(token: string): void {
  localStorage.setItem('token', token);
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
    return null;
  }
}

export function logout(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}
