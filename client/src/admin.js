import m from "mithril";
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
//import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { i18nResources } from "./admin/resources";
import AdminUsersPage from "./admin/admin-users-page";
import AdminDataPage from "./admin/admin-data-page";
import AdminLocationsPage from "./admin/admin-locations-page";

const firebasseApp = firebase.initializeApp(firebaseConfig);
const auth = getAuth(firebasseApp);

i18next.use(LanguageDetector).init({
  fallbackLng: "en",
  debug: true,
  resources: i18nResources,
}).then(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const db = firebase.firestore();
      const userRef = db.collection("users").doc(user.email);
      userRef.get().then(doc => {
        const data = doc.data();
        if (data && data.admin) {
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
  m.route(root, "/users", {
    "/users": AdminUsersPage,
    "/data": AdminDataPage,
    "/locations": AdminLocationsPage,
  });

  window.onresize = e => {
    m.redraw();
  };
}

