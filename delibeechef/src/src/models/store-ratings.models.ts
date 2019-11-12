import { Serializable } from "./serializalble.interface";
import { User } from "./user.models";
import { StoreResponse } from "./store-response.models";

export class StoreRating {
	id: number;
	rating: number;
	review: string;
	store_id: number;
	created_at: string;
	updated_at: string;
  user:User;
  store:StoreResponse;
}