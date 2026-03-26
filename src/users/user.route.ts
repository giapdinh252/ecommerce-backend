import { Router } from "express";
import * as userController from "./user.controller";

const router = Router();

router.get("/users", userController.getUsers);

router.post("/users", userController.registerUser);

export default router;
