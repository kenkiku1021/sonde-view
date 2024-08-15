import m from "mithril";
import i18next from 'i18next';
import {getAuth, signOut} from "firebase/auth";

let menuActive = false;

const UI = {

    NavBarItem: {
        view: vnode => {
            const isActive = m.route.get() == vnode.attrs.path;
            return m("a.navbar-item", {
                class: isActive ? "is-active" : "",
                onclick: e => {
                    menuActive = false;
                    m.route.set(vnode.attrs.path);
                },
            }, vnode.children);
        }
    },

    NavBarSignOutItem: {
        view: vnode => {
            return m("a.navbar-item", {
                onclick: e => {
                    const auth = getAuth();
                    signOut(auth).then(() => {
                        location.reload();
                    })
                },
            }, i18next.t("menuSignout"));
        },
    },

    NavBar: {
        view: vnode => {
            return m("nav.navbar", {
                class: vnode.attrs.class ? vnode.attrs.class : "is-primary",
            }, [
                m(".navbar-brand", [
                    m("a", {
                        onclick: e => {
                            e.preventDefault();
                            m.route.set("/main");
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
                        m(UI.NavBarItem, {path: "/main"}, i18next.t("menuView")),
                        m(UI.NavBarItem, {path: "/history"}, i18next.t("menuHistory")),
                        m(UI.NavBarItem, {path: "/download"}, i18next.t("menuDownload")),
                        m(UI.NavBarItem, {path: "/setup"}, i18next.t("menuSetup")),
                        m(UI.NavBarSignOutItem),
                    ])
                ])
            ]);
        },
    },

    SettingCard: {
        view: vnode => {
            return m(".card", [
                m("header.card-header", [
                    m("p.card-header-title", vnode.attrs.title),
                ]),
                m(".card-content", vnode.children),
            ]);
        },
    },
    
    ToggleButton: {
        view: vnode => {
            return m("button.button.toggle-button", {
                class: vnode.attrs.selected ? "is-selected is-info" : "",
                onclick: vnode.attrs.onclick,
            }, vnode.children);
        }
    },

    CollapseIcon: {
        view: vnode => {
            return m("i.fas.fa-angle-up[aria-hidden=true]");
        }
    },

    ExpandIcon: {
        view: vnode => {
            return m("i.fas.fa-angle-down[aria-hidden=true]");
        }
    },

    MapIcon: {
        view: vnode => {
            return m("i.fas.fa-map-marked-alt[aria-hiden=true]");
        }
    },

    DownloadIcon: {
        view: vnode => {
            return m("i.fas.fa-download[aria-hidden=true]");
        }
    },

    Footer: {
        view: vnode => {
            return m("footer.footer", [
                m(".content.has-text-centered", [
                    m("p", "Copyright © Kikuchi Ken"),
                ]),
            ]);
        }
    },
};

export default UI;