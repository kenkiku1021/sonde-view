import m from "mithril";
import agh from "agh.sprintf";
import i18next from "i18next";
import Setting from "./models/setting";
import Unit from "./models/unit";
import Direction from "./models/direction";

const DataTable = {
    view: vnode => {
        const dataList = vnode.attrs.dataList;
        const colspan = Setting.getDataTableColCount();
        const keyHeights = dataList.tableKeyHeights().reverse();
        return m(".data-table-wrapper", [
            m("table.table.is-bordered.data-table", [
                m("thead", [
                    m("tr", [
                        Setting.getAglAsMeter() ? m("th[rowspan=2].sticky-col", [i18next.t("agl"), m("br"), "[m]"]) : "",
                        Setting.getAglAsFt() ? m("th[rowspan=2].sticky-col", [i18next.t("agl"), m("br"), "[ft]"]) : "",
                        dataList.list().map((data, idx) => {
                            return m("th.measured-at", {
                                colspan: colspan,
                                class: `bg-color${idx+1}`,
                            }, data.getTime());
                        }),
                    ]),
                    m("tr", [
                        dataList.list().map(data => {
                            return [
                                Setting.getMslAsMeter() ? m("th", [i18next.t("msl"), m("br"), "[m]"]) : "",
                                Setting.getMslAsFt() ? m("th", [i18next.t("msl"), m("br"), "[ft]"]) : "",
                                m("th", [
                                    Setting.getWindDirection() == Direction.DirectionEnum.TO ? i18next.t("tblWindDirectionTo") : i18next.t("tblWindDirectionFrom"),
                                    m("br"),
                                    " (",
                                    Setting.getMagDeclination() == Direction.MagDeclinationEnum.MAG ? i18next.t("tblMagDeclinationMag") : i18next.t("tblMagDeclinationTrue"),
                                    ")",
                                ]),
                                Setting.getWindSpeedAsMerterPerSec() ? m("th", [i18next.t("tblWindSpeed"), m("br"), "[m/s]"]) : "",
                                Setting.getWindSpeedAsKmPerHour() ?  m("th", [i18next.t("tblWindSpeed"), m("br"), "[km/h]"]) : "",
                                Setting.getWindSpeedAsKt() ?  m("th", [i18next.t("tblWindSpeed"), m("br"), "[kt]"]) : "",
                                Setting.getTemperatureUnit() == Unit.TemperatureUnitEnum.CELSIUS ? m("th", [i18next.t("tblTemperature"), m("br"), "[℃]"]) : "",
                            ];
                        }),
                    ]),
                ]),
                m("tbody", [
                    keyHeights.map(h => {
                        return m("tr", [
                            Setting.getAglAsMeter() ? m("td.sticky-col", h) : "",
                            Setting.getAglAsFt() ? m("td.sticky-col", Math.round(Unit.conv_m_to_ft(h))) : "",
                            dataList.list().map(data => {
                                const record = data.getRecordByHeight(h);
                                if(record) {
                                    return [
                                        Setting.getMslAsMeter() ? m("td", Math.round(record.getAltitudeAsMeter())) : "",
                                        Setting.getMslAsFt() ? m("td", Math.round(record.getAltitudeAsFt())) : "",
                                        m("td", Math.round(record.getWindHeading())),
                                        Setting.getWindSpeedAsMerterPerSec() ? m("td", agh.sprintf("%.1f", record.getWindSpeedAsMerterPerSec())) : "",
                                        Setting.getWindSpeedAsKmPerHour() ? m("td", agh.sprintf("%.1f", record.getWindSpeedAsKmPerHour())) : "",
                                        Setting.getWindSpeedAsKt() ? m("td", agh.sprintf("%.1f", record.getWindSpeedAsKt())) : "",
                                        Setting.getTemperatureUnit() == Unit.TemperatureUnitEnum.CELSIUS ? m("td", Math.round(record.getTemperature())) : "",
                                    ];
                                }
                                else {
                                    return m("td.has-background-light", {colspan: colspan});
                                }
                            }),
                        ]);
                    }),
                ]),
            ]),
        ]);
    }
};

export default DataTable;