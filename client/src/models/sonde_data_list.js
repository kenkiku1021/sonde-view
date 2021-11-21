import m from "mithril";
import Setting from "./setting";
import {SondeData, SondeDataItem} from "./sonde_data";
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import agh from "agh.sprintf";
import SystemSetting from "./system_setting";

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
        this._list = []; // チャートに表示する計測データリスト
        this._selectedData = null;
        this.lastFetchedAt = null;
        this.systemSetting = new SystemSetting();
        this.systemSetting.getDisabledSondeDataIdList();
    }

    // 計測データを取得する
    fetch(date = null) {
        if(!this.lastFetchedAt) {
            this.lastFetchedAt = new Date();
        }
        let query = this.sondeDataRef;
        if(date) {
            // 指定された日付以前の計測データを取得する
            query = query.where("measured_at", "<=", date);
        }

        query.orderBy("measured_at", "desc").limit(FETCH_COUNT).get().then(querySnapshot => {
            this._list = [];
            const prevSelectedId = this._selectedData ? this._selectedData.id : null;
            this._selectedData = null;
            const duration = Setting.getDataListDuration() * 60 * 60 * 1000; // チャート表示期間
            querySnapshot.forEach(doc => {
                const newData = new SondeData(doc.id, doc.data());
                if(!this.systemSetting.isDisabledSondeDataId(doc.id)) {
                    // 無効化されていないデータ
                    if(!date) {
                        // 日付が指定されていない場合は，取得した中で有効な最新のデータの日付をチャート表示期間の基準にする
                        date = newData.measuredAt;
                    }
    
                    if(date.getTime() - newData.measuredAt.getTime() <= duration) {
                        // チャート表示期間の基準から指定された期間内のデータをチャート表示リストに追加する
                        this._list.push(newData);
                        if(newData.id === prevSelectedId) {
                            this._selectedData = newData;
                        }
                    }    
                }
            });
            if(!this._selectedData && this._list.length > 0) {
                // 表示選択済みデータが指定されていない場合は，取得されたチャート表示リストの中の最新のデータを選択する
                this._selectedData = this._list[0];
            }
            if(this._selectedData && this.lastFetchedAt.getTime() - this._selectedData.measuredAt.getTime() < FETCH_TIMEOUT) {
                // 表示選択済みデータの計測日時が前回のデータ更新日時から1時間以内なら，10秒後にデータ再取得
                setTimeout(() => {this.fetch();}, FETCH_INTERVAL);
            }
            else {
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
                const altitude = Math.round(record.getAltitudeAsMeter());
                if(!keyHeights.some(x => x[0] === height)) {
                    keyHeights.push([height, altitude]);
                }
            });
        });
        keyHeights.sort((a, b) => a[0] - b[0]);
        return keyHeights;
    }

    autoUpdateEnabled() {
        return !!this.lastFetchedAt;
    }

    lastUpdatedAt() {
        if(this._list.length === 0) {
            return "";
        }
        else {
            const data = this._list[0];
            return data.updatedAt ? agh.sprintf("%02d:%02d", data.updatedAt.getHours(), data.updatedAt.getMinutes()) : "";
        }
    }

    isFinished() {
        if(this._list.length === 0) {
            return false;
        }
        else {
            const data = this._list[0];
            return data.finished;
        }
    }
}

export default SondeDataList;