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

    static getSettings(settingKeys: Array<string>): Array<string> {
        let settings: Array<Setting> = JSON.parse(window.localStorage.getItem(Constants.KEY_SETTING));
        let toReturn = new Array<string>();
        if (settings && settingKeys) {
            for (let sk of settingKeys) {
                let pos = -1;
                for (let i = 0; i < settings.length; i++) {
                    if (settings[i].key == sk) {
                        pos = i;
                        break;
                    }
                }
                toReturn.push(pos == -1 ? "" : settings[pos].value);
            }
        }
        return toReturn;
    }
}