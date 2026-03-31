import { pool } from "../config/database";
import { Categories } from "./categories.model";

export class CategoriesService {
  async getAllCategories(): Promise<Categories[]> {
    const result = await pool.query("SELECT * FROM categories");
    return result.rows;
  }

  async getCategoryById(id: number): Promise<Categories | null> {
    const result = await pool.query(
      "SELECT * FROM categories WHERE category_id = $1",
      [id],
    );
    const category = result.rows[0];
    return category || null;
  }

  async createCategory(data: Categories): Promise<Categories> {
    const { name, slug } = data;
    const query = `
    INSERT INTO categories (name, slug)
    VALUES ($1, $2)
    RETURNING category_id, name, slug
  `;
    const values = [name, slug];
    const result = await pool.query(query, values);
    return result.rows[0];
  }
}
