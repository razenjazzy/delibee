import { User } from "./user.models";
import { StoreResponse } from "./store-response.models";
import { Address } from "./address.models";

export class Order {
  id: number;
  subtotal: number;
  taxes: number;
  delivery_fee: number;
  total: number;
  discount: number;
  status: string;
  delivery_status: string;
  payment_status: string;
  payment_method_id: number;
  special_instructions: string;
  address_id: number;
  store_id: number;
  user_id: number;
  delivery_profile_id: number;
  created_at: string;
  updated_at: string;
  type: string;
  scheduled_on: string;
  delivery_profile: any;
  orderitems: Array<any>;
  user: User;
  store: StoreResponse;
  address: Address;
}