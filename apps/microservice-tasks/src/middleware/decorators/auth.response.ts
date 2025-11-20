export interface AuthUser {
  id: string;
  name: string;
  roles: string[];
}

export interface ValidatePermissionsResponse {
  user: AuthUser;
}
