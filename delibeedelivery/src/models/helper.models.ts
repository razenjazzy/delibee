import { Setting } from "./setting.models";
import { Constants } from "./constants.models";

export class Helper {
    static getSetting(settingKey: string): string {
        let settings: Array<Setting> = JSON.parse(window.localStorage.getItem(Constants.KEY_SETTING));
        let toReturn: string;
        if (settings && settingKey) {
            for (let s of settings) {
                if (s.key == settingKey) {
                    toReturn = s.value;
                    break;
                }
            }
        }
        if (!toReturn) toReturn = "";
        return toReturn;
    }

    static getSettings(settingKeys: Array<string>): Array<string> {
        let settings: Array<Setting> = JSON.parse(window.localStorage.getItem(Constants.KEY_SETTING));
        let toReturn = new Array<string>();
        if (settings && settingKeys) {
            for (let ks of settingKeys) {
                for (let s of settings) {
                    if (s.key == ks) {
                        toReturn.push(s.value);
                        break;
                    }
                }
            }
        }
        return toReturn;
    }
}