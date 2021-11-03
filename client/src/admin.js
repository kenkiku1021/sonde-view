import m from "mithril";
import firebase from "firebase/app";
import "firebase/firestore";
var firebaseui = require('firebaseui');
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { i18nResources } from "./admin/resources";
import AdminUsersPage from "./admin/admin-users-page";
import AdminDataPage from  "./admin/admin-data-page";
import AdminLocationsPage from "./admin/admin-locations-page";


i18next.use(LanguageDetector).init({
  fallbackLng: "en",
  debug: true,
  resources: i18nResources,
}).then(() => {
  firebase.initializeApp(firebaseConfig);
  firebase.auth().onAuthStateChanged(user => {
    if(user) {
      const db = firebase.firestore();
      const userRef = db.collection("users").doc(user.email);
      userRef.get().then(doc => {
        const data = doc.data();
        if(data && data.admin) {
          startApp();
        }
        else {
          alert(i18next.t("adminPrivilegeError"));
        }
      }).catch(error => {
        alert(i18next.t("cannotGetUserInfo"));
      });
    }
  });
});


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
    ],
};
ui.start('#firebaseui-auth-container', uiConfig);

function startApp() {
  const root = document.body;
  m.route(root, "/users", {
    "/users": AdminUsersPage,
    "/data": AdminDataPage,
    "/locations": AdminLocationsPage,
  });

  window.onresize = e => {
    m.redraw();
  };
}

