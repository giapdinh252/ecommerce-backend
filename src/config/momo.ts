import dotenv from "dotenv";
dotenv.config();

export const momoConfig = {
  partnerCode: process.env.MOMO_PARTNER_CODE || "",
  accessKey: process.env.MOMO_ACCESS_KEY || "",
  secretKey: process.env.MOMO_SECRET_KEY || "",
  apiUrl:
    process.env.MOMO_API_URL ||
    "https://test-payment.momo.vn/v2/gateway/api/create",
  redirectUrl: process.env.MOMO_REDIRECT_URL || "",
  ipnUrl:
    process.env.MOMO_IPN_URL ||
    "https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b",
};
