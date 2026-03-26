import { Router } from "express";
import * as orderController from "./orders.controller";

const router = Router();

router.post("/checkout", orderController.checkout);

export default router;
