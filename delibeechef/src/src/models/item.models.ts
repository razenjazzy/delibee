import { Category } from "./category.models";
import { Serializable } from "./serializalble.interface";

export class Item {
	id: number;
	title: string;
	detail: string;
	specification: string;
	image_url: string;
	price: number;
	quantity: number;
	is_available: string;
	is_non_veg: number;
	store_id: number;
	created_at: string;
	updated_at: string;
	categories: Array<any>;
	available: boolean;

	constructor() {
		this.is_non_veg = 1;
		this.is_available = "1";
		this.categories = new Array<any>();
	}
}