import { Request, Response } from "express";
import crypto from "crypto";
import { updateOrderPayment } from "../../orders/orders.service";
import { updatePaymentStatus } from "./services/payment.service";

export const handleMomoIPN = async (req: Request, res: Response) => {
  try {
    const data = req.body;

    console.log("🔔 IPN MOMO:", data);
    const accessKey = "F8BBA842ECF85";
    const secretKey =
      process.env.MOMO_SECRET_KEY || "K951B6PE1waDMi640xX08PD3vg6EkVlz";
    const rawSignature =
      `accessKey=${accessKey}` +
      `&amount=${data.amount}` +
      `&extraData=${data.extraData || ""}` +
      `&message=${data.message}` +
      `&orderId=${data.orderId}` +
      `&orderInfo=${data.orderInfo}` +
      `&orderType=${data.orderType}` +
      `&partnerCode=${data.partnerCode}` +
      `&payType=${data.payType || ""}` +
      `&requestId=${data.requestId}` +
      `&responseTime=${data.responseTime}` +
      `&resultCode=${data.resultCode}` +
      `&transId=${data.transId}`;

    console.log("RAW SIGNATURE:", rawSignature);

    const localSignature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");

    if (localSignature !== data.signature) {
      console.error("❌ INVALID SIGNATURE");
      return res.status(204).send();
    }

    if (data.partnerCode !== "MOMO") {
      console.error("❌ INVALID PARTNER");
      return res.status(204).send();
    }

    if (Number(data.resultCode) === 0) {
      console.log(`✅ PAYMENT SUCCESS: ${data.orderId}`);
      updateOrderPayment(data.orderId, "paid");
      updatePaymentStatus(data.orderId, "completed");
    } else {
      console.log(`❌ PAYMENT FAILED: ${data.orderId}`);
      updatePaymentStatus(data.orderId, "failed");
    }

    return res.status(204).send();
  } catch (error) {
    console.error("🔥 MOMO IPN ERROR:", error);

    return res.status(204).send();
  }
};
