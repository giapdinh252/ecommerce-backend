import { Router } from "express";
import { createCategory, getCategories } from "./categories.controller";

const router = Router();

router.get("/categories", getCategories);
router.post("/categories", createCategory);

export default router;
