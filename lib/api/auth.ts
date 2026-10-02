import { http } from "./http";
import type { Role } from "@/lib/types";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResult {
  user: AuthUser;
}

export const authApi = {
  login: (data: LoginDto): Promise<LoginResult> => {
    return http.post<LoginResult>("/api/auth/login", data);
  },

  logout: (): Promise<{ success: boolean }> => {
    return http.post<{ success: boolean }>("/api/auth/logout");
  },

  me: (): Promise<{ user: AuthUser | null }> => {
    return http.get<{ user: AuthUser | null }>("/api/auth/me");
  },
};