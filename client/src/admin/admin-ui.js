import m from "mithril";
import i18next from 'i18next';
import UI from "../ui";

let menuActive = false;

const AdminUI = {
  AdminNavBar: {
    view: vnode => {
      return m("nav.navbar", {
        class: vnode.attrs.class ? vnode.attrs.class : "is-info",
      }, [
        m(".navbar-brand", [
          m("a", {
            onclick: e => {
              e.preventDefault();
              m.route.set("/users");
            },
            class: "navbar-item",
          }, i18next.t("appName")),
          m(".navbar-item.data-title", vnode.attrs.title),
          vnode.attrs.status ? m(".navbar-item.status", vnode.attrs.status) : "",
          m("a.navbar-burger[role=button][aria-label=menu][aria-expanded=false]", {
            class: menuActive ? "is-active" : "",
            onclick: e => {
              menuActive = !menuActive;
            },
          }, [
            m("span[aria-hidden=true]"),
            m("span[aria-hidden=true]"),
            m("span[aria-hidden=true]"),
          ]),
        ]),
        m(".navbar-menu", {
          class: menuActive ? "is-active" : "",
        }, [
          m(".navbar-start", [
            m(UI.NavBarItem, { path: "/users" }, i18next.t("menuUsers")),
            m(UI.NavBarItem, { path: "/data" }, i18next.t("menuData")),
            m(UI.NavBarItem, { path: "/locations"}, i18next.t("menuLocations")),
            m(UI.NavBarItem, { path: "/systemsetting"}, i18next.t("menuSystemSetting")),
            m(UI.NavBarSignOutItem),
          ])
        ])
      ]);
    },
  },
};

export default AdminUI;