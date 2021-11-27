import i18next from "i18next";
import m from "mithril";
import History from "./models/history";
import UI from "./ui";

const HistoryPage = {
    oninit: vnode => {
        vnode.state.history = new History();
        vnode.state.history.fetch();
    },

    view: vnode => {
        return [
            m(UI.NavBar, {title: i18next.t("menuHistory")}),
            m("main", [
                m(".container", [
                    m(HistorySearchView, {history: vnode.state.history}),
                    vnode.state.history.list().map(dateItem => {
                        return m(HistoryCardView, {
                            date: dateItem.date,
                            list: dateItem.list,
                        });
                    }),    
                ]),
            ]),
            m(UI.Footer),
        ];

    }
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

const HistoryCardView = {
    oninit: vnode => {
        vnode.state.collapsed = false;
    },

    view: vnode => {
        return m(".card.history-card.mt-4", [
            m("header.card-header", [
                m("p.card-header-title", [
                    vnode.attrs.date,
                ]),
                m("a.card-header-icon[href=#]", {
                    onclick: e => {                    
                        e.preventDefault();    
                        vnode.state.collapsed = !vnode.state.collapsed;
                    }
                }, [
                    m("span.icon", [
                        vnode.state.collapsed ? m(UI.ExpandIcon) : m(UI.CollapseIcon),
                    ]),
                ]),
            ]),
            m("ul.card-content.history-list", {
                    class: vnode.state.collapsed ? "is-hidden" : "is-block",
                }, [
                    vnode.attrs.list.map(item => {
                        return m("li", [
                            m(m.route.Link, {
                                href: m.buildPathname("/main/:date", {date: item.measuredAt.getTime()}),
                                class: "measured-time",
                            }, [
                                item.getTime(),
                            ]),
                            m(".location-label", item.locationLabel()),
                            m("a.map[target=_blank]", {
                                href: item.mapUrl(),
                            }, [m("span.icon", m(UI.MapIcon)), " ", i18next.t("map")]),
                        ]);
                    }),
                ]),
        ]);
    }
};


export default HistoryPage;