import { User } from "./user.models";
import { Order } from "./order.models";

export class EarningHistory {
    id: number;
    user_id: number;
    order_id: number;
    is_paid: number;
    source: string;
    title: string;
    image_url: string;
    description: string;
    status: string;
    user: User;
    order: Order;
}