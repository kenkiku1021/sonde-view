import m from "mithril";
import Setting from "./setting";
import {SondeData, SondeDataItem} from "./sonde_data";
import firebase from "firebase/app";
import "firebase/firestore";

const SONDEVIEW_COLLECTION = "sondeview"; // collection name in Firebase
const HISTORY_COUNT = 100;

//
// MUST initialize firebase before create instance of SondeDataList
//

class History {
    constructor() {
        this.db = firebase.firestore();
        this.sondeDataRef = this.db.collection(SONDEVIEW_COLLECTION);
        this._dateList = [];
    }

    fetch(dateFrom = null) {
        if(!dateFrom) {
            dateFrom = new Date();
        }
        this.sondeDataRef.where("measured_at", "<=", dateFrom).orderBy("measured_at", "desc").limit(HISTORY_COUNT).get().then(querySnapshot => {
            let currentDateText;
            let currentData;
            querySnapshot.forEach(doc => {
                const newData = new SondeData(doc.id, doc.data());
                const dateText = newData.getDate();
                if(dateText != currentDateText) {
                    currentDateText = dateText;
                    currentData = {
                        date: dateText,
                        list: [],
                    };
                    this._dateList.push(currentData);
                }
                currentData.list.push(newData);
            });
            m.redraw();
        }).catch(err => {
            console.log("Cannot fetch sonde data history", err);
            m.route.set("/error/:err", {err: "errMsgInsufficientPrivilege"});
        });
    }

    list() {
        return this._dateList;
    }
}

export default History;