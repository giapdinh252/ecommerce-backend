import { Request, Response } from "express";
import * as orderService from "../orders/orders.service";
import { successResponse } from "../helper/responseHelper";

export const checkout = async (req: Request, res: Response) => {
  try {
    const { items, ...orderData } = req.body;
    const result = await orderService.createOrder(orderData, items);
    successResponse(res, "Đơn hàng đã được thêm thành công !", 200, result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
