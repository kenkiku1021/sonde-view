import m from "mithril";
import { db } from "../firebase-app";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

const DOWNLOAD_DATA_COLLECTION = "download_data"; // collection name in Firebase
const FETCH_COUNT = 10;

//
// MUST initialize firebase before create instance of SondeDataList
//

class DonwloadDataList {
  constructor() {
    this.downloadDataRef = collection(db, DOWNLOAD_DATA_COLLECTION);
    this._list = [];
  }

  async fetch() {
    const q = query(this.downloadDataRef, orderBy("updated_at", "desc"), limit(FETCH_COUNT));
    const querySnapshot = await getDocs(q);
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
  }

  list() {
    return this._list;
  }

  isEmpty() {
    return this._list.length === 0;
  }
}

export default DonwloadDataList;