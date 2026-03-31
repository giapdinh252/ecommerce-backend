import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 3000,
  db: {
    user: process.env.DB_USER || "postgres",
    host: process.env.DB_HOST || "localhost",
    name: process.env.DB_NAME || "eShopDB",
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT) || 5432,
  },
  isDev: process.env.NODE_ENV === "development",
};

if (!config.db.password) {
  throw new Error("❌ Thiếu DB_PASSWORD trong file .env");
}
