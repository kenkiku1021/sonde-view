import m from "mithril";
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

const DOWNLOAD_DATA_COLLECTION = "download_data"; // collection name in Firebase
const FETCH_COUNT = 10;

//
// MUST initialize firebase before create instance of SondeDataList
//

class DonwloadDataList {
  constructor() {
    this.db = firebase.firestore();
    this.downloadDataRef = this.db.collection(DOWNLOAD_DATA_COLLECTION);
    this._list = [];
  }

  fetch() {
    let query = this.downloadDataRef;
    query.orderBy("updated_at", "desc").limit(FETCH_COUNT).get().then(querySnapshot => {
      this._list = [];
      querySnapshot.forEach(doc => {
        const data = doc.data();
        const item = {
          name: data.name,
          size: data.size,
          url: data.url,
          updated_at: data.updated_at ? data.updated_at.toDate() : new Date(),
        };
        this._list.push(item);
      });
      m.redraw();
    }).catch(err => {
      console.log("Cannot fetch download data list", err);
      m.route.set("/error/:err", {err: "errMsgInsufficientPrivilege"});
    });
  }

  list() {
    return this._list;
  }

  isEmpty() {
    return this._list.length === 0;
  }
}

export default DonwloadDataList;