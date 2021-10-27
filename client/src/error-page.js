import m from "mithril";
import UI from "./ui";
import i18next from "i18next";

const ErrorPage = {
    view: vnode => {
        return [
            m(UI.NavBar),
            m(".container", [
                m("article.message.is-danger.mt-4", [
                    m(".message-header", [
                        i18next.t("error"),
                    ]),
                    m(".message-body", [
                        vnode.attrs.err ? i18next.t(vnode.attrs.err) : i18next.t("errUnknown"),
                    ]),
                ]),    
            ]),
            m(UI.Footer),
        ];
    }
};

export default ErrorPage;