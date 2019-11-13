import { Category } from "./category.models";
import { ItemGroup } from "./item-group.models";

export class Item {
	id: string;
	title: string;
	detail: string;
	specification: string;
	image_url: string;
	price: number;
	quantity: number;
	is_available: number;
	is_non_veg: string;
	store_id: string;
	created_at: string;
	updated_at: string;
	categories: Array<Category>;
	menu_item_groups: Array<ItemGroup>;
}