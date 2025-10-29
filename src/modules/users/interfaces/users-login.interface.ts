export interface UserPayload {
  sub: number;
  name: string | null;
  email: string|null;
}

export interface LoginResponse {
  access_token: string;
}