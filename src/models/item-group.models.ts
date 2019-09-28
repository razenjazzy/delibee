import { ItemChoice } from "./item-choice.models";

export class ItemGroup {
    id: number;
    max_choices: number;
    min_choices: number;
    menu_item_id: number;
    singleChoiceId = -1;
    title: string;
    menu_item_choices: Array<ItemChoice>;
}