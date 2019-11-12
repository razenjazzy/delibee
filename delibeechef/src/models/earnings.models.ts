import { Order } from "./order.models";

export class Earning {
  id: number;
  order_id: number;
  user_id: number;
  paid: number;
  created_at: string;
  updated_at: string;
  order:Order;
  tag:string;
}