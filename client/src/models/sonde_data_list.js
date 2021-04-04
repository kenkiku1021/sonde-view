import m from "mithril";
import Setting from "./setting";
import {SondeData} from "./sonde_data";
import firebase from "firebase/app";
import "firebase/firestore";

const SONDEVIEW_COLLECTION = "sondeview"; // collection name in Firebase
const FETCH_COUNT = 10;

//
// MUST initialize firebase before create instance of SondeDataList
//

class SondeDataList {
    constructor() {
        this.db = firebase.firestore();
        this.sondeDataRef = this.db.collection(SONDEVIEW_COLLECTION);
        this._list = [];
        this._selectedData = null;
    }

    fetch() {
        const doc = this.sondeDataRef.orderBy("measured_at", "desc").limit(FETCH_COUNT).get().then(querySnapshot => {
            this._list = [];
            querySnapshot.forEach(doc => {
                const newData = new SondeData(doc.id, doc.data());
                this._list.push(newData);
            });
            console.log(this._list);
            this._selectedData = this._list[0];
            m.redraw();
        });
    }

    list() {
        return this._list;
    }

    selectedData() {
        return this._selectedData;
    }
}

export default SondeDataList;