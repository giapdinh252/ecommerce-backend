import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import userRoute from "./routes/userRoute.route";
import productRoute from "./routes/product.route";
import categoriesRoute from "./routes/categories.route";
import orderRoute from "./routes/order.route";
import uploadImg from "./routes/product.route";
import { config } from "../src/config/index";
const app = express();
app.use(cors());
app.use(express.json());
const PORT = config.port;

app.use(express.json());
app.use("/api/v1", categoriesRoute);
app.use("/api/v1", orderRoute);
app.use("/api/v1", userRoute);
app.use("/api/v1", productRoute);
app.use("/api/v1", uploadImg);
app.get("/api/v1", (req: Request, res: Response) => {
  res.json({ message: "Server Node.js 6746 đang chạy mượt mà!" });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
