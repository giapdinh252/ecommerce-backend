import { pool } from "../config/database";
import { Order, OrderItem, Payment } from "./orders.model";

export const createOrder = async (
  orderData: Order,
  items: OrderItem[],
): Promise<Order> => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const item of items) {
      const stockRes = await client.query(
        "SELECT stock_quantity FROM product_variants WHERE variant_id = $1 FOR UPDATE",
        [item.variant_id],
      );

      const currentStock = stockRes.rows[0]?.stock_quantity;

      if (currentStock < item.quantity) {
        throw new Error(
          `Sản phẩm ID ${item.variant_id} đã hết hàng hoặc không đủ số lượng!`,
        );
      }

      await client.query(
        "UPDATE product_variants SET stock_quantity = stock_quantity - $1 WHERE variant_id = $2",
        [item.quantity, item.variant_id],
      );
    }
    const orderQuery = `
            INSERT INTO orders (user_id, total_amount, status,guest_name,guest_phone,guest_email ,payment_method,shipping_address)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;
    const orderRes = await client.query(orderQuery, [
      orderData.user_id,
      orderData.total_amount,
      orderData.status || "pending",
      orderData.guest_name,
      orderData.guest_phone,
      orderData.guest_email,
      orderData.payment_method,
      orderData.shipping_address,
    ]);
    const newOrder = orderRes.rows[0];
    console.log("New Order Created:", newOrder);
    for (const item of items) {
      const itemQuery = `
                INSERT INTO order_items (order_id, variant_id, quantity, unit_price)
                VALUES ($1, $2, $3, $4)`;
      await client.query(itemQuery, [
        newOrder.order_id,
        item.variant_id,
        item.quantity,
        item.unit_price,
      ]);
    }
    // const totalAmount = items.reduce(
    //   (total, item) => total + item.quantity * item.unit_price,
    //   0,
    // );
    // const paymentQuery = `
    //            INSERT INTO payments (order_id, amount, payment_method, payment_status, paid_at)
    //            VALUES ($1, $2, $3, $4, $5)`;
    // await client.query(paymentQuery, [
    //   newOrder.order_id,
    //   totalAmount,
    //   orderData.payment_method,
    //   "pending",
    //   null,
    // ]);

    await client.query("COMMIT");
    return {
      ...newOrder,
      payment_method: orderData.payment_method,
      payment_status: "pending",
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const getOrderById = async (orderId: string): Promise<Order | null> => {
  const res = await pool.query("SELECT * FROM orders WHERE order_id = $1", [
    orderId,
  ]);
  return res.rows[0] || null;
};
export const updateOrderPayment = async (
  orderId: string,
  payment_status: string,
) => {
  const query = `
    UPDATE orders 
    SET payment_status = $2
    WHERE order_id = $1
    RETURNING *;
  `;
  const values = [orderId, payment_status];
  const result = await pool.query(query, values);
  return result.rows[0];
};
