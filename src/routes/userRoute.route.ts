import { Router } from "express";
import * as userController from "../controller/user.controller";

const router = Router();

// Lấy danh sách user (Chỉ nên cho Admin truy cập sau này)
router.get("/users", userController.getUsers);

// Đăng ký user mới
router.post("/users", userController.registerUser);

export default router;
