import { pool } from "../config/database";
import { Order, OrderItem } from "./orders.model";

export const createOrder = async (
  orderData: Order,
  items: OrderItem[],
): Promise<Order> => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN"); // Bắt đầu transaction
    for (const item of items) {
      // 1. KHÓA dòng sản phẩm này lại để kiểm tra tồn kho
      const stockRes = await client.query(
        "SELECT stock_quantity FROM product_variants WHERE variant_id = $1 FOR UPDATE",
        [item.variant_id],
      );

      const currentStock = stockRes.rows[0]?.stock_quantity;

      // 2. Kiểm tra nếu không đủ hàng thì văng lỗi ngay
      if (currentStock < item.quantity) {
        throw new Error(
          `Sản phẩm ID ${item.variant_id} đã hết hàng hoặc không đủ số lượng!`,
        );
      }

      // 3. Trừ kho (Lúc này yên tâm là không có ai chen ngang được)
      await client.query(
        "UPDATE product_variants SET stock_quantity = stock_quantity - $1 WHERE variant_id = $2",
        [item.quantity, item.variant_id],
      );
    }
    // 1. Chèn vào bảng orders
    const orderQuery = `
            INSERT INTO orders (user_id, total_amount, status)
            VALUES ($1, $2, $3) RETURNING *`;
    const orderRes = await client.query(orderQuery, [
      orderData.user_id,
      orderData.total_amount,
      orderData.status || "pending",
    ]);
    const newOrder = orderRes.rows[0];

    // 2. Chèn các item vào bảng order_items
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

    await client.query("COMMIT");
    return newOrder;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
