import { Request, Response } from "express";
import * as productService from "../services/product.service";
import { uploadImageToCloudinary } from "../services/uploadImage";
import { successResponse } from "../helper/responseHelper";

export const getProducts = async (req: Request, res: Response) => {
  try {
    const id = Number(req.query.id);
    let products;
    products = await productService.getDetailProduct(id);
    res.json(products);
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
export const uploadImage = async (req: Request, res: Response) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const imageUrl = await uploadImageToCloudinary(file.path);

    res.json({
      message: "Upload successful",
      url: imageUrl,
    });
  } catch (error) {
    res.status(500).json({ error });
  }
};
