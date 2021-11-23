import m from "mithril";
import { auth, db } from "./firebase-app";
import { onAuthStateChanged, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc } from "@firebase/firestore";
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { i18nResources } from "./upload/resources";
import UploadDataPage from "./upload/upload-data-page";

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

i18next.use(LanguageDetector).init({
  fallbackLng: "en",
  debug: true,
  resources: i18nResources,
}).then(() => {
  onAuthStateChanged(auth, async (user) => {
    if(user) {
      // ユーザ権限の確認
      const docRef = doc(db, "users", user.email);
      const docSnap = await getDoc(docRef);
      if(docSnap.exists()) {
        const data = docSnap.data();
        if (data && data.upload) {
          startApp();
        }
        else {
          alert(i18next.t("uploadPrivilegeError"));
        }
      }
      else {
        alert(i18next.t("cannotGetUserInfo"));
      }
    }
  });
});

function startApp() {
  const root = document.body;
  m.route(root, "/upload", {
    "/upload": UploadDataPage,
  });

  window.onresize = e => {
    m.redraw();
  };
}
