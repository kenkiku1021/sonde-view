import m from "mithril";
import agh from "agh.sprintf";
import UI from "./ui";
import SondeDataList from "./models/sonde_data_list";
import {DstChart, SpdChart} from "./charts";
import DataTable from "./data-tables";
import Setting from "./models/setting";
import i18next from "i18next";

let dataList;
const ChartPage = {
    oninit: vnode => {
        vnode.state.date = null;
        if(vnode.attrs.date) {
            vnode.state.date = new Date();
            vnode.state.date.setTime(Number(vnode.attrs.date));
        }
        dataList = new SondeDataList();
        dataList.fetch(vnode.state.date);
        window.scrollTo(0, 0);
    },

    onupdate: vnode => {
        const timeValue = vnode.attrs.date ? Number(vnode.attrs.date) : null;
        if(vnode.state.date === null && timeValue === null) {
            // do nothing
        }
        else if((vnode.state.date === null && timeValue !== null) || (vnode.state.date !== null && timeValue === null)
            || vnode.state.date.getTime() !== timeValue) {
                if(timeValue === null) {
                    vnode.state.date = null;
                }
                else {
                    vnode.state.date = new Date();
                    vnode.state.date.setTime(timeValue);
                }
                dataList.fetch(vnode.state.date);
        }
    },

    view: vnode => {
        const selectedData = dataList ? dataList.selectedData() : null;
        return [
            m(UI.NavBar, {
                title: selectedData ? selectedData.getDate() : "",
                status: dataList && dataList.autoUpdateEnabled() ? i18next.t("statusUpdating") : i18next.t("statusStopped"),
            }),
            m("main", [
                m(".container", [
                    dataList ? [
                        m(ChartDataSelector),
                        m(".chart-wrapper.is-flex.is-justify-content-center	", [
                            m(DstChart, {dataList: dataList}),
                            selectedData ? m(SpdChart, {data: selectedData}) : "",
                        ]),
                        m(ChartSelectorView),
                        m(DataTable, {dataList: dataList})
                    ] : "",        
                ]),
            ]),
        ];
    },
};

const ChartSelectorView = {
    view: vnode => {
        return m(".buttons.has-addons.is-hidden-tablet.is-justify-content-center", [
            m("button.button", {
                class: Setting.isDstChartMode() ? "is-success is-selected" : "",
                onclick: e => {
                    Setting.setDstChartMode();
                },
            }, "DstChart"),
            m("button.button", {
                class: Setting.isSpdChartMode() ? "is-success is-selected" : "",
                onclick: e => {
                    Setting.setSpdChartMode();
                },
            }, "SpdChart"),
        ]);
    }
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
                                onclick : e => {
                                    dataList.selectData(data.getID());
                                },
                            }, data.getTime()),
                        ]);
                    }),
                ]),
            ]),
        ]);
    }
};

export default ChartPage;