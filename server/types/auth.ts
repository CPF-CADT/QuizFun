// types/auth.ts
export type Role = 'admin' | 'player' | 'guest' | 'user';

export interface UserPayload {
  id: string;
  email?: string;
  role?: string;
}
