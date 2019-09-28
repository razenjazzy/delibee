import { Store } from "./store.models";
import { Item } from "./item.models";

export class StoreDetails {
  store: Store;
  menu_items: Array<Item>;
}