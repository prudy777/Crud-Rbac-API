export interface UserPayload {
  sub: number;
  email: string;
  /** may be null if the user hasn’t set it */
  name: string | null;
  /** role slugs included in the JWT for RBAC guards */
  roles: string[];
  /** permission slugs included in the JWT for RBAC guards */
  perms: string[];
  /** standard JWT claims (optional) */
  iat?: number;
  exp?: number;
}

export interface LoginResponse {
  access_token: string;
}

