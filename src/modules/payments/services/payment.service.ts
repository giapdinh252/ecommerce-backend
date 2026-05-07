import { pool } from "../../../config/database";
import { getMoMoLink } from "./momo.service";
export const createPayment = async (data: any) => {
  const {
    order_id,
    amount,
    payment_method,
    payment_status,
    paid_at,
    external_transaction_id,
    checkout_url,
  } = data;
  const query = `
    INSERT INTO payments (order_id, amount, payment_method,payment_status , paid_at, external_transaction_id, checkout_url)
    VALUES ($1, $2, $3, $4, $5, $6, $7 )
    RETURNING *;
  `;
  const values = [
    order_id,
    amount,
    payment_method,
    payment_status,
    paid_at,
    external_transaction_id,
    checkout_url,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};
export const processPayment = async (order: any, method: string) => {
  let paymentData = {
    order_id: order.order_id,
    amount: order.total_amount,
    payment_method: method,
  };

  switch (method) {
    case "momo":
      const momoResponse = await getMoMoLink(
        order.order_id,
        order.total_amount,
      );

      if (momoResponse.resultCode === 0) {
        await createPayment({
          ...paymentData,
          external_transaction_id: momoResponse.requestId,
          checkout_url: momoResponse.payUrl,
          paid_at: null,
          payment_status: "pending",
        });
        return {
          data: { payUrl: momoResponse.payUrl, qrCode: momoResponse.qrCodeUrl },
        };
      } else {
        await createPayment({ ...paymentData, status: "failed" });
        throw new Error("Lỗi khởi tạo thanh toán MoMo");
      }

    case "cod":
      await createPayment({ ...paymentData, status: "pending" });
      return {
        message: "Đặt hàng thành công! Bạn sẽ thanh toán khi nhận hàng.",
        data: null,
      };

    default:
      throw new Error("Phương thức thanh toán không hỗ trợ");
  }
};
export const updatePaymentStatus = async (order_id: string, status: string) => {
  const query = `
  UPDATE payments
  SET
    payment_status = $2::varchar,

    paid_at = CASE
      WHEN $2 = 'completed'
      THEN NOW()
      ELSE paid_at
    END
  WHERE order_id = $1
  RETURNING *;
`;
  const values = [order_id, status];
  const result = await pool.query(query, values);
  return result.rows[0];
};
