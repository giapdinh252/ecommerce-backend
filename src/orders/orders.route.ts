import { Router } from "express";
import * as orderController from "./orders.controller";

const router = Router();

router.post("/orders", orderController.checkout);
router.get("/orders/:orderId", orderController.getOrder);
export default router;
