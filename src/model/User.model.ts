export interface User {
  user_id?: number;
  username: string;
  password_hash: string;
  email: string;
  full_name?: string;
  role: "customer" | "admin";
}
