import m from "mithril";
import Setting from "./setting";
import Unit from "./unit";
import Direction from "./direction";
import agh from "agh.sprintf";

class SondeDataItem {
    /*
        Units:
        Altitude and Height : ft
        WindHeading : true_deg / to
        WindSpeed : m/s
        Temperature : ℃
    */

    constructor(value, magDeclination = 0) {
        this.altitude = value.altitude ? value.altitude : 0;
        this.height = value.height ? value.height : 0;
        this.temperature = value.temperature ? value.temperature : 0;
        this.windHeading = value.windheading ? value.windheading : 0;
        this.windSpeed = value.windspeed ? value.windspeed : 0;
        this.magDeclination = magDeclination;
    }

    getAltitude() {
        let value = this.altitude;
        switch(Setting.getMslUnit()) {
            case Unit.AltitudeUnitEnum.M:
                value = Unit.conv_ft_to_m(this.altitude);
                break;
        }

        return value;
    }

    getHeight() {
        let value = this.height;
        switch(Setting.getAglUnit()) {
            case Unit.AltitudeUnitEnum.M:
                value = Unit.conv_ft_to_m(this.height);
                break;
        }

        return value;
    }

    getTemperature() {
        return this.temperature;
    }

    getWindHeading() {
        let value = this.windHeading;
        switch(Setting.getMagDeclination()) {
            case Direction.MagDeclinationEnum.MAG:
                value += this.magDeclination;
                break;
        }
        if(Setting.getWindDirection() == Direction.DirectionEnum.FROM) {
            value -= 180;
            if(value < 0) {
                value += 360;
            }
        }

        return value;
    }

    getWindSpeed() {
        let value = this.windSpeed;
        switch(Setting.getWindspeedUnit()) {
            case Unit.WindspeedUnitEnum.KT:
                value = Unit.conv_m_s_to_kt(this.windSpeed);
                break;
            case Unit.WindspeedUnitEnum.KM_PER_HOUR:
                value = Unit.conv_m_s_to_km_h(this.windSpeed);
                break;
        }

        return value;
    }
}

class SondeData {
    constructor(id, data) {
        this.id = id;
        this.init();
        if(data) {
            this.setData(data);
        }
    }

    init() {
        this.lat = 0;
        this.lng = 0;
        this.magDeclination = 0;
        this.measuredAt = new Date();
        this._records = [];
    }

    setData(data) {
        this.lat = data.lat ? data.lat : this.lat;
        this.lng = data.lng ? data.lng : this.lng;
        this.magDeclination = data.mag_dec ? data.mag_dec : this.magDeclination;
        this.measuredAt = data.measured_at ? data.measured_at.toDate() : this.measuredAt;
        this._records = data.values.map(v => new SondeDataItem(v));
    }

    getDate() {
        return this.measuredAt.toLocaleDateString();
    }

    getTime() {
        console.log(this.measuredAt);
        return agh.sprintf("%02d:%02d", this.measuredAt.getHours(), this.measuredAt.getMinutes());
    }

    records() {
        return this._records;
    }
}

export {SondeData, SondeDataItem};