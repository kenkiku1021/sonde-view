import "./style.scss";
import m from "mithril";
import Setting from "./models/setting";
import ErrorPage from "./error-page";
import ChartPage from "./chart-page";
import HistoryPage from "./history-page";
import SetupPage from "./setup-page";
import DownloadPage from "./download-page";
import firebase from "firebase/app";
import "firebase/firestore";
var firebaseui = require('firebaseui');
import "firebaseui/dist/firebaseui.css";
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { i18nResources } from "./resources";

firebase.initializeApp(firebaseConfig);
firebase.auth().onAuthStateChanged(user => {
    if(user) {
        startApp();
    }
})

const ui = new firebaseui.auth.AuthUI(firebase.auth());
const uiConfig = {
    callbacks: {
        signInSuccessWithAuthResult: function (authResult, redirectUrl) {
            // User successfully signed in.
            // Return type determines whether we continue the redirect automatically
            // or whether we leave that to developer to handle.
            return true;
        },
        uiShown: function () {
            // The widget is rendered.
            // Hide the loader.
            document.getElementById('loader').style.display = 'none';
        }
    },
    // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
    signInFlow: 'popup',
    signInOptions: [
        // Leave the lines as is for the providers you want to offer your users.
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
    ],
};
ui.start('#firebaseui-auth-container', uiConfig);

function startApp() {
    const root = document.body;
    i18next.use(LanguageDetector).init({
        fallbackLng: "en",
        debug: true,
        resources: i18nResources,
    }).then(() => {
        m.route(root, "/main", {
            "/main": ChartPage,
            "/main/:date": ChartPage,
            "/history": HistoryPage,
            "/setup": SetupPage,
            "/download": DownloadPage,
            "/error/:err": ErrorPage,
        });

        window.onresize = e => {
            m.redraw();
        };
    });
}


