import { Request, Response } from "express";
import * as orderService from "../orders/orders.service";
import { successResponse } from "../helper/responseHelper";
import * as paymentService from "../modules/payments/services/payment.service";
export const checkout = async (req: Request, res: Response) => {
  try {
    const { items, ...orderData } = req.body;
    const order = await orderService.createOrder(orderData, items);
    const paymentResult = await paymentService.processPayment(
      order,
      orderData.payment_method,
    );
    return successResponse(res, "Vui lòng thanh toán qua MoMo", 200, {
      ...order,
      payUrl: paymentResult.data?.payUrl,
      qrCode: paymentResult.data?.qrCode,
    });
  } catch (error: any) {
    console.error("Checkout Error:", error);
    res.status(500).json({ message: error.message });
  }
};
export const getOrder = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.orderId; // đúng

    const order = await orderService.getOrderById(orderId as string);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return successResponse(res, "Success", 200, order);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
