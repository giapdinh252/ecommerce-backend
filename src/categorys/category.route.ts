import { Router } from "express";
import { createCategory, getCategories } from "./category.controller";

const router = Router();

router.get("/categories", getCategories);
router.post("/categories", createCategory);

export default router;
