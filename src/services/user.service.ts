import { pool } from "../config/database"; // Giả sử bạn đã setup file config kết nối db
import { User } from "../model/User.model";

export const getAllUsers = async (): Promise<User[]> => {
  const result = await pool.query(
    "SELECT user_id, username, email, full_name, role FROM users",
  );
  return result.rows;
};

export const getUserById = async (id: number): Promise<User | null> => {
  const result = await pool.query("SELECT * FROM users WHERE user_id = $1", [
    id,
  ]);
  return result.rows[0] || null;
};

export const createUser = async (userData: User): Promise<User> => {
  const { username, password_hash, email, full_name, role } = userData;
  const query = `
    INSERT INTO users (username, password_hash, email, full_name, role)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING user_id, username, email, full_name, role
  `;
  const values = [username, password_hash, email, full_name, role];
  const result = await pool.query(query, values);
  return result.rows[0];
};
