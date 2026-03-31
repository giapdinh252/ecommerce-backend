import { Request, Response } from "express";
import * as productService from "./products.service";
import { uploadImageToCloudinary } from "../services/uploadImage";
import { successResponse } from "../helper/responseHelper";
import { IpaginationOptions } from "../utils/types/pagination-option";

export const getProducts = async (req: Request, res: Response) => {
  try {
    const options: IpaginationOptions = {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 8,
      searchText: req.query.searchText as string,
      category: req.query.category as string,
      brand: req.query.brand as string,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      sortBy: req.query.sortBy as string,
      sortDesc: req.query.sortDesc === "true",
      filters: req.query.filters
        ? JSON.parse(req.query.filters as string)
        : undefined,
    };
    const products = await productService.getNewProducts(options);
    successResponse(res, "Get Product Success !", 200, products);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getDetailProduct = async (req: Request, res: Response) => {
  const slug = req.params.slug as string;
  if (!slug) {
    return res.status(400).json({ message: "Slug không hợp lệ!" });
  }
  try {
    const product = await productService.getDetailProduct(slug);
    successResponse(res, "Get DetailProduct Success !", 200, product);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const addProduct = async (req: Request, res: Response) => {
  try {
    const newProduct = await productService.createProduct(req.body);
    successResponse(res, "Create Products Success !", 200, newProduct);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
export const handleUploadToCloud = async (filePath: string) => {
  const imageUrl = await uploadImageToCloudinary(filePath);
  return imageUrl;
};
export const uploadImage = async (req: Request, res: Response) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const imageUrl = await uploadImageToCloudinary(file.path);

    return imageUrl;
  } catch (error) {
    res.status(500).json({ error });
  }
};
