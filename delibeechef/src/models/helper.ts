import { Setting } from "./setting.models";
import { Constants } from "./constants.models";

export class Helper {
    static isEquivalent(a, b): boolean {
        // Create arrays of property names
        var aProps = Object.getOwnPropertyNames(a);
        var bProps = Object.getOwnPropertyNames(b);

        // If number of properties is different,
        // objects are not equivalent
        if (aProps.length != bProps.length) {
            return false;
        }

        for (var i = 0; i < aProps.length; i++) {
            var propName = aProps[i];

            // If values of same property are not equal,
            // objects are not equivalent
            if (a[propName] !== b[propName]) {
                return false;
            }
        }

        // If we made it this far, objects
        // are considered equivalent
        return true;
    }

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