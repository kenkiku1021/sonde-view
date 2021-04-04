import m from "mithril";
import agh from "agh.sprintf";
import Setting from "./models/setting";
import Unit from "./models/unit";

const DataTables = {
    view: vnode => {
        return m(".data-table-wrapper", [
            vnode.attrs.dataList.list().map((data, idx) => {
                return m(DataTable, {data: data, idx: idx});
            }),
        ]);
    }
};

const DataTable = {
    view: vnode => {
        const data = vnode.attrs.data;
        return m("table.table.is-bordered.data-table", [
            m("caption", {
                class: agh.sprintf("color-%02d", vnode.attrs.idx + 1),
            }, data.getTime()),
            m("thead", [
                m("th", [
                    "Altitude",
                ]),
                m("th[colspan=2]", [
                    "Wind",
                ]),
                m("th", [
                    "Temp",
                ]),
            ]),
            m("tbody", [
                data.records().map(item => {
                    return m("tr", [
                        m("td", agh.sprintf("%d[%s]", item.getAltitude(), Unit.altitudeUnitText(Setting.getMslUnit()))),
                        m("td", agh.sprintf("%.1f[deg]", item.getWindHeading())),
                        m("td", agh.sprintf("%.1f[%s]", item.getWindSpeed(), Unit.windspeedUnitText(Setting.getWindspeedUnit()))),
                        m("td", agh.sprintf("%.1f[℃]", item.getTemperature())),
                    ]);
                }).reverse(),
            ]),
        ]);
    }
};

export default DataTables;