import m from "mithril";
import Setting from "./setting";
import Unit from "./unit";
import Direction from "./direction";
import agh from "agh.sprintf";

class SondeDataItem {
    /*
        Units:
        Altitude and Height : m
        WindHeading : true_deg / to
        WindSpeed : m/s
        Temperature : ℃
    */

    constructor(value, magDeclination = 0) {
        this.altitude = value.altitude ? value.altitude : null;
        this.height = value.height ? value.height : null;
        this.temperature = value.temperature ? value.temperature : null;
        this.windHeading = value.windheading ? value.windheading : null;
        this.windSpeed = value.windspeed ? value.windspeed : null;
        this.magDeclination = magDeclination;
    }

    getAltitudeAsMeter() {
        return this.altitude;
    }

    getAltitudeAsFt() {
        return Unit.conv_m_to_ft(this.altitude);
    }

    getHeightAsMeter() {
        return this.height;
    }

    getHeightAsFt() {
        return Unit.conv_m_to_ft(this.height);
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

    getWindHeadingForChart() {
        let value = this.windHeading;
        switch(Setting.getMagDeclination()) {
            case Direction.MagDeclinationEnum.MAG:
                value += this.magDeclination;
                break;
        }
        return value;
    }

    getWindSpeedAsMerterPerSec() {
        return this.windSpeed;
    }

    getWindSpeedAsKmPerHour() {
        return Unit.conv_m_s_to_km_h(this.windSpeed);
    }

    getWindSpeedAsKt() {
        return Unit.conv_m_s_to_kt(this.windSpeed);
    }

    getWindSpeedForChart() {
        // get wind speed as [m/s] (for chart)
        return this.windSpeed;
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
        this.updatedAt = null;
        this._records = [];
    }

    setData(data) {
        this.lat = data.lat ? data.lat : this.lat;
        this.lng = data.lng ? data.lng : this.lng;
        this.magDeclination = data.mag_dec ? data.mag_dec : this.magDeclination;
        this.measuredAt = data.measured_at ? data.measured_at.toDate() : this.measuredAt;
        this.updatedAt = data.updated_at ? data.updated_at.toDate() : this.updatedAt;
        this._records = data.values.map(v => new SondeDataItem(v, this.magDeclination));
    }

    getID() {
        return this.id;
    }

    getDate() {
        return this.measuredAt.toLocaleDateString();
    }

    getTime() {
        return agh.sprintf("%02d:%02d", this.measuredAt.getHours(), this.measuredAt.getMinutes());
    }

    records() {
        return this._records;
    }

    maxSpeed() {
        const windSpeeds = this._records.map(record => record.getWindSpeedForChart()).sort((a, b) => a - b);
        return windSpeeds[windSpeeds.length - 1];
    }

    dstChartValues(invert = false) {
        let x = 0;
        let y = 0;
        const angleOffset = invert ? 90 : -90;
        const values = [[x, y]];
        let prevHeight = 0;
        this._records.forEach(item => {
            const dh = item.getHeightAsMeter() - prevHeight;
            const dt = 60.0 * (dh / 100.0);
            x += dt * item.getWindSpeedForChart() * Math.cos(Unit.degToRad(item.getWindHeadingForChart() + angleOffset));
            y += dt * item.getWindSpeedForChart() * Math.sin(Unit.degToRad(item.getWindHeadingForChart() + angleOffset));
            values.push([x, y]);
            prevHeight = item.getHeightAsMeter();
        });

        return values;
    }

    minHeight() {
        return this._records[0].getHeightAsMeter();
    }

    maxHeight() {
        return this._records[this._records.length-1].getHeightAsMeter();
    }

    getRecordByHeight(height) {
        return this._records.find(record => record.getHeightAsMeter() == height);
    }

    getLastItem() {
        if(this._records.length === 0) {
            return null;
        }
        else {
            return this._records[this._records.length - 1];
        }
    }

}

export {SondeData, SondeDataItem};