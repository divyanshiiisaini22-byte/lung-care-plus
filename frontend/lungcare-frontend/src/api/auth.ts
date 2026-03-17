import api from "./client";

export interface AuthUser {
  id: number;
  full_name: string;
  email: string;
  role: "doctor" | "patient";
  age?: number;
  slug?: string;
  specialization?: string;
  hospital_name?: string;
  city?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export const loginApi = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>("/auth/login", { email, password });
  return res.data;
};

export const registerApi = async (
  full_name: string,
  email: string,
  password: string,
  role: "doctor" | "patient",
  age?: number
): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>("/auth/register", {
    full_name,
    email,
    password,
    role,
    age,
  });
  return res.data;
};

export const getMeApi = async (): Promise<AuthUser> => {
  const res = await api.get<AuthUser>("/auth/me");
  return res.data;
};
