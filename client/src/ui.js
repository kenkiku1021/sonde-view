import m from "mithril";
import i18next from 'i18next';

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
                    ])
                ])
            ]);
        },
    },
    
};

export default UI;