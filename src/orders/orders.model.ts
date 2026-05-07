export interface Order {
  order_id?: string;
  user_id: string | null;
  total_amount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  guest_name: string;
  guest_phone: string;
  guest_email: string;
  payment_method?: "cod" | "bank" | "momo" | "vnpay";
  payment_status?: "pending" | "completed" | "failed";
  tracking_number?: string;
  shipping_address: string;
  note?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface OrderItem {
  order_id: string;
  variant_id: string;
  quantity: number;
  unit_price: number;
}

export interface Payment {
  payment_id?: string;
  order_id: string;
  amount: number;
  payment_method: "cod" | "bank" | "momo" | "vnpay";
  payment_status: "pending" | "completed" | "failed";
  paid_at?: Date;
  created_at?: Date;
}
