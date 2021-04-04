import m from "mithril";
import UI from "./ui";
import Setting from "./models/setting";

const SetupPage = {
    view: vnode => {
        return [
            m(UI.NavBar, {title: "設定"}),
        ];

    }
};

export default SetupPage;