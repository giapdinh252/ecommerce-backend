import { Router } from "express";
import * as productController from "./products.controller";
import { upload } from "../middleware/uploadMiddleware";

const router = Router();

router.get("/products", productController.getProducts);
router.get("/products/:slug", productController.getDetailProduct);
router.post("/products", productController.addProduct);
router.post("/upload", upload.single("image"), productController.uploadImage);
export default router;
