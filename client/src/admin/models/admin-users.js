import m from "mithril";
import { db } from '../../firebase-app';
import { collection, query, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import i18next from "i18next";

const USERS_COLLECTION = "users";

class AdminUsers {
  constructor() {
    this.usersRef = collection(db, USERS_COLLECTION);
    this._list = [];
  }

  async fetch() {
    try {
      const q = query(this.usersRef);
      const querySnapshot = await getDocs(q);
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
    } catch(e) {
        console.log("Cannot fetch users list", e);
        alert("Cannot fetch users");
    }
  }

  list() {
    return this._list;
  }

  async append(email, name, memo) {
    try {
      await setDoc(doc(db, USERS_COLLECTION, email), {
        allow: true,
        admin: false,
        upload: false,
        name: name ? name : "",
        memo: memo ? memo : "",
      });
      alert(i18next.t("userAppended"));
      this.fetch();
    } catch(e) {
      console.log(e);
      alert(i18next.t("userUpdateError") + e);
    }
  }

  async update(user, withAlert=false) {
    try {
      await setDoc(doc(db, USERS_COLLECTION, user.email), {
        allow: user.allow,
        admin: user.admin,
        upload: user.upload,
        name: user.name,
        memo: user.memo,  
      });
      if(withAlert) {
        alert(i18next.t("userUpdated"));
      }
      this.fetch();
    } catch (e) {
      console.log(e);
      alert(i18next.t("userUpdateError") + e);
    }
  }

  async delete(email) {
    try {
      await deleteDoc(doc(db, USERS_COLLECTION, email));
      this.fetch();
    } catch(e) {
      console.log(e);
      alert(i18next.t("userUpdateError") + e);
    }
  }
}

export default AdminUsers;