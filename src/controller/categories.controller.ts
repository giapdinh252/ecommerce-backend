import { Request, Response } from "express";
import { CategoriesService } from "../services/categories.service";

const categoryService = new CategoriesService();

export const getCategories = async (req: Request, res: Response) => {
  try {
    const data = await categoryService.getAllCategories();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách category" });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const newItem = await categoryService.createCategory(req.body);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ message: "Lỗi khi tạo mới" });
  }
};
