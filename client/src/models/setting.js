import m from "mithril";
import Unit from "./unit";
import Direction from "./direction";

const SETTING_KEY = "SONDE_VIEW_SETTING";

class SettingData {
    constructor() {
        this.mslUnit = Unit.AltitudeUnitEnum.M;
        this.aglUnit = Unit.AltitudeUnitEnum.M;
        this.windspeedUnit = Unit.WindspeedUnitEnum.M_PER_SEC;
        this.windDirection = Direction.DirectionEnum.TO;
        this.magDeclination = Direction.MagDeclinationEnum.MAG;
        this.load();
    }

    save() {
        if(window.localStorage) {
            window.localStorage.setItem(SETTING_KEY, JSON.stringify(this));
        }
    }

    load() {
        if(window.localStorage) {
            const value = window.localStorage.getItem(SETTING_KEY);
            if(value && value != "") {
                const data = JSON.parse();
                for(let key in this) {
                    this[key] = data[key] ? data[key] : this[key];
                }    
            }
        }
    }

    getMslUnit() {
        return this.mslUnit;
    }

    setMslUnit(value) {
        if(Unit.validAltitudeUnit(value)) {
            this.mslUnit = value;
            this.save();
        }
    }

    getAglUnit() {
        return this.aglUnit;
    }

    setAglUnit(value) {
        if(Unit.validAltitudeUnit(value)) {
            this.aglUnit = value;
            this.save();
        }
    }

    getWindspeedUnit() {
        return this.windspeedUnit;
    }

    setWindspeedUnit(value) {
        if(Unit.validWindspeedUnit(value)) {
            this.windspeedUnit = value;
            this.save();
        }
    }

    getWindDirection() {
        return this.windDirection;
    }

    setWindDirection(value) {
        if(Direction.validDirection(value)) {
            this.windDirection = value;
            this.save();
        }
    }

    getMagDeclination() {
        return this.magDeclination;
    }

    setMagDeclination(value) {
        if(Direction.validMagDeclination(value)) {
            this.magDeclination = value;
            this.save();
        }
    }
}

const Setting = new SettingData();

export default Setting;