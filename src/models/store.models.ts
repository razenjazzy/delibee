import { CategoryFood } from "./category-food.models";

export class Store {
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
    preorder: number;
    favourite: number;
    // favourite: boolean;
    ratings: string;
    categories: Array<CategoryFood>;
}