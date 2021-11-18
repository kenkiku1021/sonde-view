import m from "mithril";
import AdminUI from "./admin-ui";
import UI from "../ui";
import SondeDataList from "../models/sonde_data_list";
import History from "../models/history";
import i18next from 'i18next';
import SystemSetting from "../models/system_setting";

const AdminDataPage = {
  oninit: vnode => {
    vnode.state.history = new History();
    vnode.state.history.setAdminMode(true);
    vnode.state.history.fetch();
  },

  view: vnode => {
    return [
      m(AdminUI.AdminNavBar),
      m("main", [
        m(".container.mt-4", [
          m(HistorySearchView, {history: vnode.state.history}),
          m(HistroyTableView, {history: vnode.state.history}),
        ]),
      ]),
      m(UI.Footer),
    ];
  },
};

const HistroyTableView = {
  oninit: async (vnode) => {
    vnode.state.systemSetting = new SystemSetting();
    vnode.state.systemSetting.getDisabledSondeDataIdList();
  },

  onupdate: vnode => {
  },

  view: vnode => {
    return m("table.table", [
      m("thead", [
        m("tr", [
          m("th[colspan=2]", i18next.t("dataDateTime")),
          m("th", ""),
          m("th", i18next.t("disabledData")),
        ]),
      ]),
      m("tbody", [
        vnode.attrs.history.list().map(item => {
          return item.list.map((data, idx) => {
            return m("tr", [
              idx === 0 ? m("th.date", {rowspan: item.list.length}, item.date) : "",
              m("td", data.getTime()),
              m("td", [
                m("button.button.is-danger.is-small[type=button]", {
                  onclick: e => {
                    if(confirm(i18next.t("deleteDataConfirmation") + data.getTime())) {
                      vnode.attrs.history.delete(data.id);
                    }
                  }
                }, i18next.t("deleteData")),
              ]),
              m("td", [
                m("label.checkbox", [
                  m("input[type=checkbox]", {
                    checked: vnode.state.systemSetting.isDisabledSondeDataId(data.id),
                    onclick: e => {
                      if(e.target.checked) {
                        vnode.state.systemSetting.addDisabledSondeDataId(data.id);
                      }
                      else {
                        vnode.state.systemSetting.removeDisabledSondeDataId(data.id);
                      }
                    }
                  }),
                ]),
              ]),
            ]);
          });
        }),
      ]),
    ]);
  },
};

const HistorySearchView = {
  view: vnode => {
    return m(".field.has-addons.my-4.mx-2", [
      m(".control", [
        m("a.button.is-static", [
          i18next.t("historyDate"),
        ]),
      ]),
      m(".control", [
        m("input.input[type=date]", {
          value: vnode.attrs.history.dateFrom(),
          oninput: e => {
            vnode.attrs.history.setDateFrom(e.target.value);
          }
        }),
      ]),
    ]);
  }
};

export default AdminDataPage;