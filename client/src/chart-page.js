import m from "mithril";
import agh from "agh.sprintf";
import UI from "./ui";
import SondeDataList from "./models/sonde_data_list";
import {DstChart, SpdChart} from "./charts";
import DataTables from "./data-tables";

let dataList;
const ChartPage = {
    oninit: vnode => {
        dataList = new SondeDataList();
        dataList.fetch();
    },

    view: vnode => {
        const selectedData = dataList ? dataList.selectedData() : null;
        return [
            m(UI.NavBar, {title: selectedData ? selectedData.getDate() : ""}),
            dataList ? m(ChartDataSelector) : "",
            dataList ? m(".chart-wrapper", [
                m(DstChart, {dataList: dataList}),
                m(SpdChart),
            ]) : "",
            dataList ? m(DataTables, {dataList: dataList}) : "",
        ];
    },
};

const ChartDataSelector = {
    view: vnode => {
        if(!dataList) {
            return "";
        }
        return m(".data-selector", [
            m(".chart-top-button.is-flex.is-justify-content-space-between", [
                m(".field.is-grouped", [
                    dataList.list().map((data, idx) => {
                        let buttonClass = agh.sprintf("color-%02d", idx + 1);
                        if(data.id == dataList.selectedData().id) {
                            buttonClass += " is-active";
                        }
                        return m(".control", [
                            m("button.button.is-small", {
                                class: buttonClass,
                            }, data.getTime()),
                        ]);
                    }),
                ]),
            ]),
        ]);
    }
};

export default ChartPage;