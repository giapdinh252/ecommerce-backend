import { Router } from "express";
import * as paymentController from "./payment.controller";

const router = Router();

router.post("/payment/callback", paymentController.handleMomoIPN);
export default router;
