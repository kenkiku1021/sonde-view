import "./style.scss";
import m from "mithril";
import Setting from "./models/setting";
import ChartPage from "./chart-page";
import HistoryPage from "./history-page";
import SetupPage from "./setup-page";
import firebase from "firebase/app";
import "firebase/firestore";
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import {i18nResources} from "./resources";

firebase.initializeApp(firebaseConfig);
const root = document.body;
i18next.use(LanguageDetector).init({
    fallbackLng: "en",
    debug: true,
    resources: i18nResources,
}).then(() => {
    m.route(root, "/main", {
        "/main": ChartPage,
        "/history": HistoryPage,
        "/setup": SetupPage,
    });
});

