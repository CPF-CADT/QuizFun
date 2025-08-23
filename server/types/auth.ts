// types/auth.ts
export type Role = 'admin' | 'player' | 'guest';

export interface UserPayload {
  id: string;
  email?: string;
  role?: string;
}
