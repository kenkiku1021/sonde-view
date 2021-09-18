import m from "mithril";
import firebase from "firebase/app";
import "firebase/firestore";
import i18next from "i18next";

const USERS_COLLECTION = "users";

class AdminUsers {
  constructor() {
    this.db = firebase.firestore();
    this.usersRef = this.db.collection(USERS_COLLECTION);
    this._list = [];
  }

  fetch() {
    let query = this.usersRef;
    query.get().then(querySnapshot => {
      this._list = [];
      querySnapshot.forEach(doc => {
        const data = doc.data();
        this._list.push({
          email: doc.id,
          allow: !!data.allow,
          admin: !!data.admin,
          upload: !!data.upload,
          name: data.name ? data.name : "",
          memo: data.memo ? data.memo : "",
        });
      });
      m.redraw();
    }).catch(err => {
        console.log("Cannot fetch users list", err);
        alert("Cannot fetch users");
    });
  }

  list() {
    return this._list;
  }

  append(email, name, memo) {
    return this.usersRef.doc(email).set({
      allow: true,
      admin: false,
      upload: false,
      name: name,
      memo: memo,
    }).then(() => {
      alert(i18next.t("userAppended"));
      this.fetch();
    }).catch(err => {
      console.log(err);
      alert(i18next.t("userUpdateError") + err);
    });
  }

  update(user, withAlert=false) {
    return this.usersRef.doc(user.email).update({
      allow: user.allow,
      admin: user.admin,
      upload: user.upload,
      name: user.name,
      memo: user.memo,
    }).then(() => {
      if(withAlert) {
        alert(i18next.t("userUpdated"));
      }
      this.fetch();
    }).catch(err => {
      console.log(err);
      alert(i18next.t("userUpdateError") + err);
    });
  }

  delete(email) {
    return this.usersRef.doc(email).delete().then(() => {
      this.fetch();
    }).catch(err => {
      console.log(err);
      alert(i18next.t("userUpdateError") + err);
    });
  }
}

export default AdminUsers;