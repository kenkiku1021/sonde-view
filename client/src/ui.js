import m from "mithril";
import i18next from 'i18next';
import firebase from "firebase/app";

const UI = {
    NavBarItem: {
        view: vnode => {
            const isActive = m.route.get() == vnode.attrs.path;
            return m("a.navbar-item", {
                class: isActive ? "is-active" : "",
                onclick: e => {
                    m.route.set(vnode.attrs.path);
                },
            }, vnode.children);
        }
    },

    NavBarSignOutItem: {
        view: vnode => {
            return m("a.navbar-item", {
                onclick: e => {
                    firebase.auth().signOut().then(() => {
                        location.reload();
                    })
                },
            }, i18next.t("menuSignout"));
        },
    },

    NavBar: {
        oninit: vnode => {
            vnode.state.menuActive = false;
        },

        view: vnode => {
            return m("nav.navbar.is-primary", [
                m(".navbar-brand", [
                    m(m.route.Link, {
                        href: "/main",
                        class: "navbar-item",
                    }, i18next.t("appName")),
                    m(".navbar-item.data-title", vnode.attrs.title),
                    vnode.attrs.status ? m(".navbar-item.status", vnode.attrs.status) : "",
                    m("a.navbar-burger[role=button][aria-label=menu][aria-expanded=false]", {
                        class: vnode.state.menuActive ? "is-active" : "",
                        onclick: e => {
                            vnode.state.menuActive = !vnode.state.menuActive;
                        },
                    }, [
                        m("span[aria-hidden=true]"),
                        m("span[aria-hidden=true]"),
                        m("span[aria-hidden=true]"),
                    ]),
                ]),
                m(".navbar-menu", {
                    class: vnode.state.menuActive ? "is-active" : "",
                }, [
                    m(".navbar-start", [
                        m(UI.NavBarItem, {path: "/main"}, i18next.t("menuView")),
                        m(UI.NavBarItem, {path: "/history"}, i18next.t("menuHistory")),
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
};

export default UI;