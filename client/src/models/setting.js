import m from "mithril";
import Unit from "./unit";
import Direction from "./direction";
import i18next from 'i18next';

const SETTING_KEY = "SONDE_VIEW_SETTING";
const DST_CHART_MODE = 1;
const SPD_CHART_MODE = 2;
const MIN_DATA_LIST_DURATION = 1;
const MAX_DATA_LIST_DURATION = 12;
const SORT_ORDER_ASC = 1;
const SORT_ORDER_DESC = 2;
const TABLE_BACKGROUND_COLOR_NONE = 1;
const TABLE_BACKGROUND_COLOR_BY_DIRECTION = 2;

class SettingData {
    constructor() {
        this.mslAsMeter = false,
        this.mslAsFt = true,
        this.aglAsMeter = true,
        this.aglAsFt = false,
        this.windSpeedAsMeterPerSec = true;
        this.windSpeedAsKmPerHour = true;
        this.windSpeedAsKt = false;
        this.windDirection = Direction.DirectionEnum.TO;
        this.magDeclination = Direction.MagDeclinationEnum.MAG;
        this.temperatureUnit = Unit.TemperatureUnitEnum.NONE;
        this.chartMode = DST_CHART_MODE; // Dst Chart
        this.dstChartShowFrom = false;
        this.spdChartShowFrom = false;
        this.dataListDuration = 6; // 6hours
        this.sortOrder = SORT_ORDER_ASC;
        this.charSize = "M";
        this.tableBackgroundColor = TABLE_BACKGROUND_COLOR_BY_DIRECTION;
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
                const data = JSON.parse(value);
                for(let key in this) {
                    this[key] = data[key] !== undefined ? data[key] : this[key];
                }    
            }
        }
    }

    getDataTableColCount() {
        let count = 1;
        if(this.windSpeedAsMeterPerSec) {
            count++;
        }
        if(this.windSpeedAsKmPerHour) {
            count++;
        }
        if(this.windSpeedAsKt) {
            count++;
        }
        if(this.temperatureUnit == Unit.TemperatureUnitEnum.CELSIUS) {
            count++;
        }
        return count;
    }

    getMslAsMeter() {
        return this.mslAsMeter;
    }

    setMslAsMeter(value) {
        this.mslAsMeter = !!value;
        this.save();
    }

    getMslAsFt() {
        return this.mslAsFt;
    }

    setMslAsFt(value) {
        this.mslAsFt = !!value;
        this.save();
    }

    getAglAsMeter() {
        return this.aglAsMeter;
    }

    setAglAsMeter(value) {
        this.aglAsMeter = !!value;
        this.save();
    }

    getAglAsFt() {
        return this.aglAsFt;
    }

    setAglAsFt(value) {
        this.aglAsFt = !!value;
        this.save();
    }

    getWindSpeedAsMerterPerSec() {
        return this.windSpeedAsMeterPerSec;
    }

    setWindSpeedAsMeterPerSec(value) {
        this.windSpeedAsMeterPerSec = !!value;
        this.save();
    }

    getWindSpeedAsKmPerHour() {
        return this.windSpeedAsKmPerHour;
    }

    setWindSpeedAsKmPerHour(value) {
        this.windSpeedAsKmPerHour = !!value;
        this.save();
    }

    getWindSpeedAsKt() {
        return this.windSpeedAsKt;
    }

    setWindSpeedAsKt(value) {
        this.windSpeedAsKt = !!value;
        this.save();
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

    getTemperatureUnit() {
        return this.temperatureUnit;
    }

    setTemperatureUnit(value) {
        if(Unit.validTemperatureUnit(value)) {
            this.temperatureUnit = value;
            this.save();
        }
    }

    toggleTemperatureUnit() {
        if(this.temperatureUnit == Unit.TemperatureUnitEnum.CELSIUS) {
            this.temperatureUnit = Unit.TemperatureUnitEnum.NONE;
        }
        else {
            this.temperatureUnit = Unit.TemperatureUnitEnum.CELSIUS;
        }
        this.save();
    }

    setDstChartMode() {
        this.chartMode = DST_CHART_MODE;
        this.save();
    }

    setSpdChartMode() {
        this.chartMode = SPD_CHART_MODE;
        this.save();
    }

    isDstChartMode() {
        return this.chartMode === DST_CHART_MODE;
    }

    isSpdChartMode() {
        return this.chartMode === SPD_CHART_MODE;
    }

    getDstChartShowFrom() {
        return this.dstChartShowFrom;
    }

    setDstChartShowFrom(value) {
        this.dstChartShowFrom = !!value;
        this.save();
    }

    getSpdChartShowFrom() {
        return this.spdChartShowFrom;
    }

    setSpdChartShowFrom(value) {
        this.spdChartShowFrom = !!value;
        this.save();
    }

    getDataListDuration() {
        return this.dataListDuration;
    }

    setDataListDuration(value) {
        value = Math.round(value);
        if(value >= MIN_DATA_LIST_DURATION && value <= MAX_DATA_LIST_DURATION) {
            this.dataListDuration = value;
            this.save();
        }
    }

    dataListDurationValues() {
        const values = [];
        for(let v = MIN_DATA_LIST_DURATION; v <= MAX_DATA_LIST_DURATION; ++v) {
            values.push(v);
        }
        return values;
    }

    isSortOrderAscend() {
        return this.sortOrder == SORT_ORDER_ASC;
    }

    isSortOderDescend() {
        return this.sortOrder == SORT_ORDER_DESC;
    }

    setSortOrderAscend() {
        this.sortOrder = SORT_ORDER_ASC;
        this.save();
    }

    setSortOderDescend() {
        this.sortOrder = SORT_ORDER_DESC;
    }

    getCharSize() {
        return this.charSize;
    }

    setCharSize(value) {
        if(value == "S" || value == "M" || value == "L") {
            this.charSize = value;
            this.save();
        }
    }

    isDataTableBackgroundColorNone() {
        return this.tableBackgroundColor == TABLE_BACKGROUND_COLOR_NONE;
    }

    setDataTableBackgroundColorNone() {
        this.tableBackgroundColor = TABLE_BACKGROUND_COLOR_NONE;
        this.save();
    }

    isDataTableBackgroundColorByDirection() {
        return this.tableBackgroundColor == TABLE_BACKGROUND_COLOR_BY_DIRECTION;
    }

    setDataTableBackgroundColorByDirection() {
        this.tableBackgroundColor = TABLE_BACKGROUND_COLOR_BY_DIRECTION;
        this.save();
    }
}

const Setting = new SettingData();

export default Setting;