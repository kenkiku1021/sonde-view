import m from "mithril";
import Setting from "./setting";
import Unit from "./unit";
import Direction from "./direction";
import agh from "agh.sprintf";
import { db } from "../firebase-app";
import { doc, setDoc} from "firebase/firestore";
import i18next from "i18next";
import UploadSetting from "../upload/models/upload-setting";

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
        this.altitude = value.altitude ? Math.round(value.altitude) : null;
        this.height = value.height ? Math.round(value.height) : null;
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
        this.location = null;
        this._records = [];
    }

    setData(data) {
        this.lat = data.lat ? data.lat : this.lat;
        this.lng = data.lng ? data.lng : this.lng;
        this.magDeclination = data.mag_dec ? data.mag_dec : this.magDeclination;
        this.measuredAt = data.measured_at ? data.measured_at.toDate() : this.measuredAt;
        this.updatedAt = data.updated_at ? data.updated_at.toDate() : this.updatedAt;
        this._records = data.values.map(v => new SondeDataItem(v, this.magDeclination));
        this.finished = data["finished"] ? data["finished"] : false;
        this.location = data["location"] ? data["location"] : null;
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

    getDateTime() {
        return `${this.getDate()} ${this.measuredAt.toTimeString()}`;
    }

    getDateAsISOString() {
        return this.measuredAt.toISOString();
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

    getGroundMSLAsMeter() {
        let value = 0;
        if(this.groundMSL > 0) {
            value = this.groundMSL;
        }
        else if(this._records.length > 0) {
            const record = this._records[0];
            value = record.getAltitudeAsMeter() - record.getHeightAsMeter();
        }
        return value;
    }

    mapUrl() {
        return `https://www.google.com/maps/search/?api=1&query=${this.lat}%2C${this.lng}`;
    }

    locationLabel() {
        if(this.location && this.location.address_components) {
            const country = this.location.address_components.find(item => item.types[0] == "country");
            const admin_area_lv1 = this.location.address_components.find(item => item.types[0] == "administrative_area_level_1");
            const locality = this.location.address_components.find(item => item.types[0] == "locality");
            const countryLabel = country ? country.short_name : "";
            const adminLv1Label = admin_area_lv1 ? admin_area_lv1.short_name : "";
            const localityLabel = locality ? locality.long_name : "";

            return `${localityLabel} ${adminLv1Label}, ${countryLabel}`;
        }
        else {
            return "";
        }
    }

    parseDataText(txt) {
        if(!txt) {
            return;
        }
        const uploadSetting = new UploadSetting();
        uploadSetting.load();
        const lines = txt.split("\n");
        this._records = [];
        for(let line of lines) {
            const m = line.match(/^([\d\.]+)(m|ft)?\s+([\d+\.]+)(°)?\s+([\d\.]+)(kt|m\/s|km\/h)?/);
            if(m) {
                const altitudeUnit = m[2] ? m[2] : uploadSetting.altitudeUnit;
                const windspeedUnit = m[6] ? m[6] : uploadSetting.windspeedUnit;
                let altitude = uploadSetting.altitudeType === "AGL" ? Number(m[1]) + this.groundMSL : Number(m[1]);
                if(altitudeUnit === "ft") {
                    altitude = Unit.conv_ft_to_m(altitude);
                }
                let windHeading = uploadSetting.windDirectionType === "To" ? Number(m[3]) : Number(m[3]) - 180;
                if(windHeading < 0) {
                    windHeading += 360;
                }
                if(uploadSetting.degreeType === "Mag") {
                    windHeading += this.magDeclination;
                }
                let windspeed = Number(m[5]);
                if(windspeedUnit === "kt") {
                    windspeed = Unit.conv_kt_to_m_s(windspeed);
                }
                else if(windspeedUnit === "km/h") {
                    windspeed = Unit.conv_km_h_to_m_s(windspeed);
                }
                const data = {
                    altitude: altitude,
                    height: altitude - this.groundMSL,
                    windheading: windHeading,
                    windspeed: windspeed,
                };
                this._records.push(new SondeDataItem(data, this.magDeclination));
            }
        }
        this._records.sort((a, b) => a.altitude - b.altitude);
    }

    async update() {
        const docRef = doc(db, SONDE_DATA_COLLECTION, String(this.id));
        const now = new Date();
        await setDoc(docRef, {
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
        });
    }

    downloadBasename() {
        // CSV/XMLで保存するときのファイル名
        return agh.sprintf("windview-%04d%02d%02d%02d%02d%02d",
            this.measuredAt.getFullYear(), this.measuredAt.getMonth()+1, this.measuredAt.getDate(),
            this.measuredAt.getHours(), this.measuredAt.getMinutes(), this.measuredAt.getSeconds());
    }

    generateCsvAsBlob() {
        const headerLines = [
            `# WindView Export Measured Date=${this.getDateTime()}, ${this.locationLabel()}`,
            `# lat=${this.lat}, lng=${this.lng}, groundLevel=${this.getGroundMSLAsMeter()}[m], mag_dec=${this.magDeclination}`,
            "MSL(altitude)[m],AGL(height)[m],windheading (true/from)[°],windspeed[m/s],temperature [℃]"
        ];
        const lines = headerLines.concat(this.records().map(record => {
            const fields = [
                record.getAltitudeAsMeter(),
                record.getHeightAsMeter(),
                record.getWindTrueFrom(),
                record.getWindSpeedAsMerterPerSec(),
                record.getTemperature(),
            ];
            return fields.join(",");
        }));
        const csvString = lines.join("\n");
        const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
        const blob = new Blob([bom, csvString], {type: "text/csv"});
        return blob;
    }

    generateXmlAsBlob() {
        let doc = document.implementation.createDocument("", "", null);
        let rootEle = doc.createElement("Windreading");
        // Headers
        let headerEle = doc.createElement("wRs");
        let idEle = doc.createElement("Id");
        idEle.appendChild(doc.createTextNode(this.getDateTime()));
        headerEle.appendChild(idEle);
        let spdUnitsEle = doc.createElement("SpdUnits");
        spdUnitsEle.appendChild(doc.createTextNode("M/s"));
        headerEle.appendChild(spdUnitsEle);
        let altUnitsEle = doc.createElement("AltUnits");
        altUnitsEle.appendChild(doc.createTextNode("Meters"));
        headerEle.appendChild(altUnitsEle);
        let dirToFromEle = doc.createElement("DirToFrom");
        dirToFromEle.appendChild(doc.createTextNode("From"));
        headerEle.appendChild(dirToFromEle);
        let dirMagTrueEle = doc.createElement("DirMagTrue")
        dirMagTrueEle.appendChild(doc.createTextNode("True"));
        headerEle.appendChild(dirMagTrueEle);
        let aglAmslEle = doc.createElement("AglAmsl");
        aglAmslEle.appendChild(doc.createTextNode("AMSL"));
        headerEle.appendChild(aglAmslEle);
        let magVariationEle = doc.createElement("MagVariation");
        magVariationEle.appendChild(doc.createTextNode(String(this.magDeclination)));
        headerEle.appendChild(magVariationEle);
        let elevationEle = doc.createElement("Elevation");
        elevationEle.appendChild(doc.createTextNode(String(this.getGroundMSLAsMeter())));
        headerEle.appendChild(elevationEle);
        let latEle = doc.createElement("lat");
        latEle.appendChild(doc.createTextNode(String(this.lat)));
        headerEle.appendChild(latEle);
        let lngEle = doc.createElement("lng");
        lngEle.appendChild(doc.createTextNode(String(this.lng)));
        headerEle.appendChild(lngEle);
        rootEle.appendChild(headerEle);
        // records
        this.records().forEach(record => {
            let recordEle = doc.createElement("wR");
            let altEle = doc.createElement("Alt");
            altEle.appendChild(doc.createTextNode(String(record.getAltitudeAsMeter())));
            recordEle.appendChild(altEle);
            let spdEle = doc.createElement("Spd");
            spdEle.appendChild(doc.createTextNode(String(record.getWindSpeedAsMerterPerSec())));
            recordEle.appendChild(spdEle);
            let dirEle = doc.createElement("Dir");
            dirEle.appendChild(doc.createTextNode(String(record.getWindTrueFrom())));
            recordEle.appendChild(dirEle);
            rootEle.appendChild(recordEle);
        });
        doc.appendChild(rootEle);

        const serializer = new XMLSerializer();
        const xmlString = serializer.serializeToString(doc);

        const blob = new Blob([xmlString], {type: "text/xml"});
        return blob;
    }
}

export {SondeData, SondeDataItem};