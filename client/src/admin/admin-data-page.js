import m from "mithril";
import AdminUI from "./admin-ui";
import SondeDataList from "../models/sonde_data_list";
import History from "../models/history";
import i18next from 'i18next';

const AdminDataPage = {
  oninit: vnode => {
    vnode.state.history = new History();
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
    ];
  },
};

const HistroyTableView = {
  view: vnode => {
    return m("table.table", [
      m("thead", [
        m("tr", [
          m("th[colspan=2]", i18next.t("dataDateTime")),
          m("th", ""),
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