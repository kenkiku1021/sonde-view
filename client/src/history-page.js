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
                    vnode.state.history.list().map(dateItem => {
                        return m(HistoryCardView, {
                            date: dateItem.date,
                            list: dateItem.list,
                        });
                    }),    
                ]),
            ]),
        ];

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
                            }, [
                                item.getTime(),
                            ]),
                            m("span.icon", [
                                m("i.fas.fa-angle-right"),
                            ]),
                        ]);
                    }),
                ]),
        ]);
    }
};


export default HistoryPage;