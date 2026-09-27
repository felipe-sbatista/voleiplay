export type UserRole = 'ADMIN' | 'ATHLETE' | 'COACH' | 'FAN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
}

export interface UserRecord extends User {
  passwordHash: string; // Para fins didáticos, senha hasheada/armazenada
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  avatarUrl?: string;
  bio?: string;
}

export interface AuthSession {
  token: string;
  user: User;
  issuedAt: string;
  expiresAt: string;
}

export interface AuthStats {
  totalUsers: number;
  activeSessions: number;
  totalLogins: number;
  usersByRole: Record<UserRole, number>;
}
