import { Item } from "./item.models";

export class CartItem {
	item_id: string;
	quantity: number;
	priceBase: number;
	priceTotal: number;
	item: Item;
}
