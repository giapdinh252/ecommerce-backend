import { Pool } from "pg";
import { config } from "./index";

export const pool = new Pool({
  user: config.db.user,
  host: config.db.host,
  database: config.db.name,
  password: config.db.password,
  port: config.db.port,
});

pool.on("connect", () => {
  console.log(
    `✅ Kết nối DB ${config.db.name} thành công trên cổng ${config.db.port}`,
  );
});
