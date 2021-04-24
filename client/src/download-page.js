import m from "mithril";
import UI from "./ui";
import i18next from "i18next";

const DownloadPage = {
    view: vnode => {
        return [
            m(UI.NavBar, {title: i18next.t("menuDownload")}),
        ];

    }
};

export default DownloadPage;