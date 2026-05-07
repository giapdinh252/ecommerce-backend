import axios from "axios";
import crypto from "crypto";
import { momoConfig } from "../../../config/momo";
export const getMoMoLink = async (orderId: string, amount: number) => {
  const ngrokProxy = "https://unvarying-ramp-overthrow.ngrok-free.dev";

  var ipnUrl = `${ngrokProxy}/api/v1/payment/callback`;
  var accessKey = "F8BBA842ECF85";
  var secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
  var orderInfo = "pay with MoMo";
  var partnerCode = "MOMO";
  var redirectUrl = "https://momo.vn/return";

  var requestType = "payWithMethod";
  var Amount = Math.round(amount).toString();
  const finalOrderId = orderId;
  var requestId = finalOrderId;
  var extraData = "";
  var orderGroupId = "";
  var autoCapture = true;
  var lang = "vi";

  const rawSignature = `accessKey=${accessKey}&amount=${Amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${finalOrderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
  console.log("--------------------RAW SIGNATURE----------------");
  console.log(rawSignature);

  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(rawSignature)
    .digest("hex");

  const requestBody = {
    partnerCode: partnerCode,
    partnerName: "Test",
    storeId: "MomoTestStore",
    requestId: requestId,
    amount: Amount,
    orderId: finalOrderId,
    orderInfo: orderInfo,
    redirectUrl: redirectUrl,
    ipnUrl: ipnUrl,
    lang: lang,
    requestType: requestType,
    autoCapture: autoCapture,
    extraData: extraData,
    orderGroupId: orderGroupId,
    signature: signature,
  };

  try {
    const response = await axios.post(
      `https://test-payment.momo.vn/v2/gateway/api/create`,
      requestBody,
    );
    return response.data;
  } catch (error: any) {
    console.error("MOMO ERROR DETAIL:", error.response?.data);
    throw new Error("Lỗi chữ ký MoMo");
  }
};
