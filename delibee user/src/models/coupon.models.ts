import { Serializable } from "./serializalble.interface";

export class Coupon {
  id: number;
  code: string;
  reward: string;
  type: string; //Options: percent, fixed_cart and fixed_product.
  data: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}