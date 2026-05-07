export interface Payment {
  payment_id?: string;
  order_id: string;
  amount: number;
  payment_method: "cod" | "bank" | "momo" | "vnpay";
  payment_status: "pending" | "completed" | "failed" | "refunded";
  external_transaction_id?: string;
  checkout_url?: string;
  paid_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}
