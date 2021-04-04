import m from "mithril";
import UI from "./ui";

const HistoryPage = {
    view: vnode => {
        return [
            m(UI.NavBar, {title: "履歴"}),
        ];

    }
};

export default HistoryPage;