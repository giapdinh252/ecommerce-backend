import { Router } from "express";
import * as orderController from "../controller/order.controller";

const router = Router();

router.post("/checkout", orderController.checkout);

export default router;
