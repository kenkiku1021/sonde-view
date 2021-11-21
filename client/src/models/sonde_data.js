import m from "mithril";
import Setting from "./setting";
import Unit from "./unit";
import Direction from "./direction";
import agh from "agh.sprintf";
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import i18next from "i18next";

const SONDE_DATA_COLLECTION = "sondeview";
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
                value -= this.magDeclination;
                if(value < 0) {
                    value += 360;
                }
                else if(value >= 360) {
                    value -= 360;
                }
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

    getWindMagFrom() {
        let value = this.windHeading - this.magDeclination - 180;
        if(value < 0) {
            value += 360;
        }
        else if(value >= 360) {
            value -= 360;
        }
        return value;
    }

    getWindTrueFrom() {
        let value = this.windHeading - 180;
        if(value < 0) {
            value += 360;
        }
        else if(value >= 360) {
            value -= 360;
        }
        return value;
    }

    getWindHeadingForChart() {
        let value = this.windHeading;
        switch(Setting.getMagDeclination()) {
            case Direction.MagDeclinationEnum.MAG:
                value -= this.magDeclination;
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
        this.init();
        if(id) {
            this.id = id;
        }
        if(data) {
            this.setData(data);
        }
    }

    init() {
        this.lat = 0;
        this.lng = 0;
        this.magDeclination = 0;
        this.measuredAt = new Date();
        this.id = Math.floor(this.measuredAt.getTime() / 1000);
        this.updatedAt = null;
        this.groundMSL = 0;
        this._records = [];
    }

    setData(data) {
        this.lat = data.lat ? data.lat : this.lat;
        this.lng = data.lng ? data.lng : this.lng;
        this.magDeclination = data.mag_dec ? data.mag_dec : this.magDeclination;
        this.measuredAt = data.measured_at ? data.measured_at.toDate() : this.measuredAt;
        this.updatedAt = data.updated_at ? data.updated_at.toDate() : this.updatedAt;
        this._records = data.values.map(v => new SondeDataItem(v, this.magDeclination));
        this.finished = data["finished"] ? data["finished"] : false
    }

    setMeasuredAtAsString(value) {
        try {
            this.measuredAt.setTime(Date.parse(value));
            this.id = Math.floor(this.measuredAt.getTime() / 1000);
        }
        catch(err) {
        }
    }

    setLat(value) {
        value = Number(value);
        if(value >= -90 && value <= 90) {
            this.lat = value;
        }
    }

    setLng(value) {
        value = Number(value);
        if(value >= -180 && value <= 180) {
            this.lng = value;
        }
    }

    setGroundMSL(value) {
        value = Number(value);
        this.groundMSL = value;
    }

    setMagDeclination(value) {
        value = Number(value);
        this.magDeclination = value;
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

    mapUrl() {
        return `https://www.google.com/maps/search/?api=1&query=${this.lat}%2C${this.lng}`;
    }

    parseDataText(txt) {
        if(!txt) {
            return;
        }
        const lines = txt.split("\n");
        this._records = [];
        for(let line of lines) {
            if(line.match(/^([\d\.]+)m\s+([\d+\.]+)°\s+([\d\.]+)kt/)) {
                const agl = Number(RegExp.$1);
                let windHeading = Number(RegExp.$2) - 180;
                if(windHeading < 0) {
                    windHeading += 360;
                }
                const windSpeed = Unit.conv_kt_to_m_s(Number(RegExp.$3));
                const data = {
                    altitude: this.groundMSL + agl,
                    height: agl,
                    windheading: windHeading,
                    windspeed: windSpeed,
                };
                this._records.push(new SondeDataItem(data, this.magDeclination));
            }
        }
    }

    update() {
        const db = firebase.firestore();
        const sondeDataRef = db.collection(SONDE_DATA_COLLECTION);
        const now = new Date();
        sondeDataRef.doc(String(this.id)).set({
            lat: this.lat,
            lng: this.lng,
            mag_dec: this.magDeclination,
            measured_at: this.measuredAt,
            updated_at: now,
            values: this._records.map(data => {
                return {
                    altitude: data.altitude,
                    height: data.height,
                    temperature: data.temperature,
                    windheading: data.windHeading,
                    windspeed: data.windSpeed,
                };
            }),
        }).then(() => {
            console.log("Data updated");
        }).catch(err => {
            alert(i18next.t("dataUpdateError"));
            console.log(err);
        });
    }
}

export {SondeData, SondeDataItem};