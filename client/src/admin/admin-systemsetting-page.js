import m from "mithril";
import AdminUI from "./admin-ui";
import UI from "../ui";
import i18next from 'i18next';
import SystemSetting from "../models/system_setting";

const AdminSystemSettingPage = {
  oninit: vnode => {
    vnode.state.systemSetting = new SystemSetting();
  },

  view: vnode => {
    return [
      m(AdminUI.AdminNavBar),
      m("main", [
        m(".container.mt-4", [
          m(".field", [
            m(".control", [
              m("label.checkbox", [
                m("input[type=checkbox]", {
                  checked: vnode.state.systemSetting.sondeDataDefaultDisabledFlag,
                  onclick: e => {
                    vnode.state.systemSetting.setSondeDataDefaultDisabledFlag(e.target.checked);
                  }
                }),
              ], i18next.t("defaultDataDisabledFlag")),
            ]),
          ]),
        ]),
      ]),
      m(UI.Footer),
    ];
  },
};

export default AdminSystemSettingPage;