import m from "mithril";
import Setting from "./setting";
import { SondeData, SondeDataItem } from "./sonde_data";
import firebase from "firebase/app";
import "firebase/firestore";
import agh from "agh.sprintf";
import i18next from "i18next";
import SystemSetting from "./system_setting";

const SONDEVIEW_COLLECTION = "sondeview"; // collection name in Firebase
const HISTORY_COUNT = 100;

function formatDate(d) {
    return agh.sprintf("%04d-%02d-%02d", d.getFullYear(), d.getMonth() + 1, d.getDate());
}

//
// MUST initialize firebase before create instance of SondeDataList
//

class History {
    constructor() {
        const today = new Date();
        this._dateFrom = new Date();
        this.db = firebase.firestore();
        this.sondeDataRef = this.db.collection(SONDEVIEW_COLLECTION);
        this._dateList = [];
        this.systemSetting = new SystemSetting();
        this.systemSetting.getDisabledSondeDataIdList();
        this.adminMode = false;
    }

    setAdminMode(value) {
        this.adminMode = (value == true);
    }

    fetch() {
        let dateFrom = this._dateFrom;
        if (this._dateFrom == "") {
            dateFrom = new Date();
        }
        this._dateList = [];
        this.sondeDataRef.where("measured_at", "<=", dateFrom).orderBy("measured_at", "desc").limit(HISTORY_COUNT).get().then(querySnapshot => {
            let currentDateText;
            let currentData;
            querySnapshot.forEach(doc => {
                //console.log(doc.id)
                if(this.adminMode || !this.systemSetting.isDisabledSondeDataId(doc.id)) {
                    const newData = new SondeData(doc.id, doc.data());
                    const dateText = newData.getDate();
                    if (dateText != currentDateText) {
                        currentDateText = dateText;
                        currentData = {
                            date: dateText,
                            list: [],
                        };
                        this._dateList.push(currentData);
                    }
                    currentData.list.push(newData);    
                }
            });
            m.redraw();
        }).catch(err => {
            console.log("Cannot fetch sonde data history", err);
            m.route.set("/error/:err", { err: "errMsgInsufficientPrivilege" });
        });
    }

    list() {
        return this._dateList;
    }

    dateFrom() {
        return formatDate(this._dateFrom);
    }

    setDateFrom(value) {
        if (value.match(/^(\d{4})\-(\d{2})\-(\d{2})$/)) {
            const year = Number(RegExp.$1);
            const month = Number(RegExp.$2) - 1;
            const day = Number(RegExp.$3);
            this._dateFrom = new Date(year, month, day, 23, 59, 59);
            this.fetch();
        }
    }

    delete(id) {
        this.sondeDataRef.doc(String(id)).delete().then(() => {
            this.fetch();
        }).catch(err => {
            console.log(err);
            alert(i18next.t("dataUpdateError") + err);
        });
    }
}

export default History;