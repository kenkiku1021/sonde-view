import "./style.scss";
import m from "mithril";
import Setting from "./models/setting";
import ErrorPage from "./error-page";
import ChartPage from "./chart-page";
import HistoryPage from "./history-page";
import SetupPage from "./setup-page";
import DownloadPage from "./download-page";
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
//import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { i18nResources } from "./resources";

const firebasseApp = firebase.initializeApp(firebaseConfig);
const auth = getAuth(firebasseApp);
onAuthStateChanged(auth, (user) => {
    if(user) {
        startApp();
    }
});

const signinWithGoogleButton = document.getElementById("google-login");
signinWithGoogleButton.addEventListener("click", signinWithGoogle);
const signinWithEmailButton = document.getElementById("email-login");
signinWithEmailButton.addEventListener("click", signinWithEmail);

function signinWithGoogle() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
        .then((result) => {
            // This gives you a Google Access Token. You can use it to access the Google API.
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            // The signed-in user info.
            const user = result.user;
            return true;
        }).catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used.
            const email = error.email;
            // The AuthCredential type that was used.
            const credential = GoogleAuthProvider.credentialFromError(error);

            alert(`Auth error: ${errorCode} ${errorMessage}`);
        });
}

function signinWithEmail() {
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in 
            return true;
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            alert(`Auth error: ${errorCode} ${errorMessage}`);
        });
}

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


