import { Serializable } from "./serializalble.interface";
import { Category } from "./category.models";

export class StoreResponse {
  id: number;
  owner_id: number;
  name: string;
  tagline: string;
  image_url: string;
  delivery_time: string;
  details: string;
  area: string;
  address: string;
  minimum_order: number;
  delivery_fee: number;
  longitude: string;
  latitude: string;
  preorder: boolean;
  favourite: number;
  status: string;
  opens_at: string;
  closes_at: string;
  created_at: string;
  updated_at: string;
  ratings: number;
  categories: Array<Category>;
}