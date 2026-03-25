import { Router } from "express";
import * as productController from "../controller/product.controller";
import { upload } from "../middleware/uploadMiddleware";

const router = Router();

router.get("/products", productController.getProducts);

router.post("/products", productController.addProduct);
router.post("/upload", upload.single("image"), productController.uploadImage);
export default router;
