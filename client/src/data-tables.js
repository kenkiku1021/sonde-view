import m from "mithril";
import agh from "agh.sprintf";
import i18next from "i18next";
import Setting from "./models/setting";
import Unit from "./models/unit";
import Direction from "./models/direction";
import Mithril from "mithril";

const DirectionColorLegend = {
    view: vnode => {
        const width = 280;
        const height = 250;
        const segmentsCount = 64;
        const r = (height / 2) - 30;
        const cx = width / 2;
        const cy = height / 2;
        const cw = 20;
        const degLabels = [0, 90, 180, 270];
        const paths = [];
        let prevX, prevY;
        for(let i=0; i<=segmentsCount; ++i) {
            const rad = Unit.degToRad(360.0 * (i / segmentsCount));
            const x = cx + (r * Math.sin(rad));
            const y = cy - (r * Math.cos(rad));
            const h = 360.0 * (i / segmentsCount);
            const color = [`hsl(${h},100%,${Direction.DIRECTION_BG_COLOR_L_VALUE}%)`];
            if(i > 0) {
                paths.push([prevX, prevY, x, y, color]);
            }

            prevX = x;
            prevY = y;
        }
        return m(".direction-color-legend-wrapper", [
            m("svg.direction-color-legend", [
                paths.map(path => {
                    return m("line", {
                        x1: path[0],
                        y1: path[1],
                        x2: path[2],
                        y2: path[3],
                        stroke: path[4],
                        "stroke-width": cw,
                        "stroke-linecap": "round",
                    });
                }),
                degLabels.map(deg => {
                    const rad = Unit.degToRad(deg);
                    let anchor = "middle";
                    let dx = 0;
                    let dy = 0;
                    if(deg == 90) {
                        anchor = "start";
                    }
                    else if(deg == 270) {
                        anchor = "end";
                    }
                    else if(deg == 180) {
                        dy = 10;
                    }
                    return m("text.deg-label", {
                        x: cx + ((r + cw) * Math.sin(rad)),
                        y: cy - ((r + cw) * Math.cos(rad)),
                        dx: dx,
                        dy: dy,
                        "text-anchor": anchor,
                    }, deg);
                }),
            ]),
        ]);
    }
};

const DataTable = {
    view: vnode => {
        const dataList = vnode.attrs.dataList;
        const colspan = Setting.getDataTableColCount();
        const keyHeights = dataList.tableKeyHeights();
        if(Setting.isSortOderDescend()) {
            keyHeights.reverse();
        }
        return [
            m(".data-table-wrapper", [
                m("table.table.is-bordered.data-table", {
                    class: `charsize-${Setting.getCharSize()}`,
                }, [
                    m("thead", [
                        m("tr", [
                            Setting.getAglAsMeter() ? m("th[rowspan=2].sticky-col", [i18next.t("agl"), m("br"), "[m]"]) : "",
                            Setting.getAglAsFt() ? m("th[rowspan=2].sticky-col", [i18next.t("agl"), m("br"), "[ft]"]) : "",
                            Setting.getMslAsMeter() ? m("th[rowspan=2].sticky-col", [i18next.t("msl"), m("br"), "[m]"]) : "",
                            Setting.getMslAsFt() ? m("th[rowspan=2].sticky-col", [i18next.t("msl"), m("br"), "[ft]"]) : "",
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
                                Setting.getAglAsMeter() ? m("td.sticky-col", h[0]) : "",
                                Setting.getAglAsFt() ? m("td.sticky-col", Math.round(Unit.conv_m_to_ft(h[0]))) : "",
                                Setting.getMslAsMeter() ? m("td.sticky-col", h[1]) : "",
                                Setting.getMslAsFt() ? m("td.sticky-col", Math.round(Unit.conv_m_to_ft(h[1]))) : "",
                                dataList.list().map(data => {
                                    const record = data.getRecordByHeight(h[0]);
                                    if(record) {
                                        const bgColorValue = Setting.isDataTableBackgroundColorByDirection() ? Direction.directionBackgroundColor(record.getWindHeading()) : "none";
                                        const style = `background-color: ${bgColorValue}`;
                                            return [
                                            m("td.has-text-weight-bold", {style: style}, Math.round(record.getWindHeading())),
                                            Setting.getWindSpeedAsMerterPerSec() ? m("td",  {style: style}, agh.sprintf("%.1f", record.getWindSpeedAsMerterPerSec())) : "",
                                            Setting.getWindSpeedAsKmPerHour() ? m("td", {style: style},  agh.sprintf("%.1f", record.getWindSpeedAsKmPerHour())) : "",
                                            Setting.getWindSpeedAsKt() ? m("td", {style: style},  agh.sprintf("%.1f", record.getWindSpeedAsKt())) : "",
                                            Setting.getTemperatureUnit() == Unit.TemperatureUnitEnum.CELSIUS ? m("td", {style: style},  Math.round(record.getTemperature())) : "",
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
            ]),
            Setting.isDataTableBackgroundColorByDirection() ? m(DirectionColorLegend) : "",
        ];
    }
};

export default DataTable;