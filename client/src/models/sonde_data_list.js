import m from "mithril";
import Setting from "./setting";
import {SondeData, SondeDataItem} from "./sonde_data";
import firebase from "firebase/app";
import "firebase/firestore";

const SONDEVIEW_COLLECTION = "sondeview"; // collection name in Firebase
const FETCH_COUNT = 10;
const FETCH_INTERVAL = 10 * 1000; // 10sec
const FETCH_TIMEOUT = 60 * 60 * 1000; // 1hour

//
// MUST initialize firebase before create instance of SondeDataList
//

class SondeDataList {
    constructor() {
        this.db = firebase.firestore();
        this.sondeDataRef = this.db.collection(SONDEVIEW_COLLECTION);
        this._list = [];
        this._selectedData = null;
        this.lastFetchedAt = null;
    }

    fetch(date = null) {
        if(!this.lastFetchedAt) {
            this.lastFetchedAt = new Date();
        }
        let query = this.sondeDataRef;
        if(date) {
            query = query.where("measured_at", "<=", date);
        }

        query.orderBy("measured_at", "desc").limit(FETCH_COUNT).get().then(querySnapshot => {
            console.log("fetched");
            this._list = [];
            const prevSelectedId = this._selectedData ? this._selectedData.id : null;
            this._selectedData = null;
            const duration = Setting.getDataListDuration() * 60 * 60 * 1000;
            querySnapshot.forEach(doc => {
                const newData = new SondeData(doc.id, doc.data());
                if(!date) {
                    date = newData.measuredAt;
                }

                if(newData.id === prevSelectedId) {
                    this._selectedData = newData;
                    this._list.push(newData);
                }
                else if(date.getTime() - newData.measuredAt.getTime() <= duration) {
                    this._list.push(newData);
                }
            });
            if(!this._selectedData && this._list.length > 0) {
                this._selectedData = this._list[0];
            }
            if(this._selectedData && this.lastFetchedAt.getTime() - this._selectedData.measuredAt.getTime() < FETCH_TIMEOUT) {
                setTimeout(() => {this.fetch();}, FETCH_INTERVAL);
            }
            else {
                console.log("fetch timed out");
                this.lastFetchedAt = null;
            }
            m.redraw();
        }).catch(err => {
            console.log("Cannot fetch sonde data list", err);
            m.route.set("/error/:err", {err: "errMsgInsufficientPrivilege"});
        });
    }

    list() {
        return this._list;
    }

    selectedData() {
        return this._selectedData;
    }

    selectData(id) {
        this._selectedData = this._list.find(data => data.getID() === id);
    }

    // get key heights valus for table view
    tableKeyHeights() {
        const keyHeights = [];
        this._list.forEach(data => {
            data.records().forEach(record => {
                const height = Math.round(record.getHeightAsMeter());
                if(keyHeights.indexOf(height) == -1) {
                    keyHeights.push(height);
                }
            });
        });
        keyHeights.sort((a, b) => a - b);
        return keyHeights;
    }

    autoUpdateEnabled() {
        return !!this.lastFetchedAt;
    }
}

export default SondeDataList;