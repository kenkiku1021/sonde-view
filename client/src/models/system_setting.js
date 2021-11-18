import m from "mithril";
import firebase from "firebase/app";
import "firebase/firestore";
import i18next from "i18next";

const SYSTEM_SETTING_COLLECTION = "system_setting";
const DISABLED_SONDE_DATA_ID_LIST_ID = "disabled_sonde_data_id";

class SystemSetting {
  constructor() {
    this.db = firebase.firestore();
    this.systemSettingRef = this.db.collection(SYSTEM_SETTING_COLLECTION);
    this.disabledSondeDataIdRef = this.systemSettingRef.doc(DISABLED_SONDE_DATA_ID_LIST_ID);
    this.disabledSondeDataIdList = [];
  }

  isDisabledSondeDataId(id) {
    return this.disabledSondeDataIdList.indexOf(id) != -1;
  }

  getDisabledSondeDataIdList() {
    this.systemSettingRef.doc(DISABLED_SONDE_DATA_ID_LIST_ID).get().then(doc => {
      if(doc.exists) {
        this.disabledSondeDataIdList = doc.data().list;
      }
      else {
        this.disabledSondeDataIdList = [];
      }
      m.redraw();
    }).catch(error => {
      console.log(`Cannot get disabled sonde data id list: ${error}`);
    });  
  }

  addDisabledSondeDataId(id) {
    this.disabledSondeDataIdList.push(id);

    return this.db.runTransaction(transaction => {
      return transaction.get(this.disabledSondeDataIdRef).then(doc => {
        const data = doc.exists ? doc.data() : {list: []};
        data.list.push(id);
        this.disabledSondeDataIdList = data.list;
        if(doc.exists) {
          transaction.update(this.disabledSondeDataIdRef, data);
        }
        else {
          transaction.set(this.disabledSondeDataIdRef, data);
        }
      });
    }).then(() => {
      m.redraw();
    }).catch(error => {
      console.log(`Cannot update disabled sonde data id list: ${error}`);
      alert(i18next.t("disabledDataUpdateError") + error);
    });
  }

  removeDisabledSondeDataId(id) {
    this.disabledSondeDataIdList = this.disabledSondeDataIdList.filter(value => value != id);

    return this.db.runTransaction(transaction => {
      return transaction.get(this.disabledSondeDataIdRef).then(doc => {
        if(doc.exists) {
          const data = doc.data()
          data.list = data.list.filter(value => value != id);
          this.disabledSondeDataIdList = data.list;
          transaction.update(this.disabledSondeDataIdRef, data);
        }
      })
    }).then(() => {
      m.redraw();
    }).catch(error => {
      console.log(`Cannot remove disabled sonde data id list: ${error}`);
      alert(i18next.t("disabledDataUpdateError") + error);
    });
  }
}

export default SystemSetting;