import m from "mithril";
import { db } from "../firebase-app";
import { doc, setDoc, getDoc, runTransaction } from "firebase/firestore";
import i18next from "i18next";

const SYSTEM_SETTING_COLLECTION = "system_setting";
const DISABLED_SONDE_DATA_ID_LIST_ID = "disabled_sonde_data_id";
const SONDE_DATA_DEFAULT_DISABLED_FLAG = "sonde_data_default_disabled_flag";

class SystemSetting {
  constructor() {
    this.disabledSondeDataIdRef = doc(db, SYSTEM_SETTING_COLLECTION, DISABLED_SONDE_DATA_ID_LIST_ID);
    this.disabledSondeDataIdList = [];
    this.sondeDataDefaultDisabledFlagRef = doc(db, SYSTEM_SETTING_COLLECTION, SONDE_DATA_DEFAULT_DISABLED_FLAG);
    this.sondeDataDefaultDisabledFlag = false;
  }

  async getSondeDataDefaultDisabledFlag() {
    const docSnap = await getDoc(this.sondeDataDefaultDisabledFlagRef);
    this.sondeDataDefaultDisabledFlag = docSnap.exists() ? docSnap.data().flag : false;
    m.redraw();
  }

  setSondeDataDefaultDisabledFlag(value) {
    this.sondeDataDefaultDisabledFlag = value;
    setDoc(this.sondeDataDefaultDisabledFlagRef, {flag: this.sondeDataDefaultDisabledFlag});
  }

  isDisabledSondeDataId(id) {
    return this.disabledSondeDataIdList.indexOf(id) != -1;
  }

  async getDisabledSondeDataIdList() {
    const docSnap = await getDoc(this.disabledSondeDataIdRef);
    if(docSnap.exists()) {
      this.disabledSondeDataIdList = docSnap.data().list;
    }
    else {
      this.disabledSondeDataIdList = [];
    }
    m.redraw();
  }

  async addDisabledSondeDataId(id) {
    this.disabledSondeDataIdList.push(id);

    try {
      await runTransaction(db, async (transaction) => {
        const docSnap = await transaction.get(this.disabledSondeDataIdRef);
        const data = docSnap.exists() ? docSnap.data() : {list: []};
        data.list.push(id);
        this.disabledSondeDataIdList = data.list;
        if(docSnap.exists()) {
          transaction.update(this.disabledSondeDataIdRef, data);
        }
        else {
          transaction.setDoc(this.disabledSondeDataIdRef, data);
        }
      });
      m.redraw();
    } catch(e) {
      console.log(`Cannot update disabled sonde data id list: ${error}`);
      alert(i18next.t("disabledDataUpdateError") + error);
    }
  }

  async removeDisabledSondeDataId(id) {
    this.disabledSondeDataIdList = this.disabledSondeDataIdList.filter(value => value != id);

    try {
      await runTransaction(db, async (transaction) => {
        const docSnap = await transaction.get(this.disabledSondeDataIdRef);
        if(docSnap.exists()) {
          const data = docSnap.data();
          data.list = data.list.filter(value => value != id);
          this.disabledSondeDataIdList = data.list;
          transaction.update(this.disabledSondeDataIdRef, data);
        }
      });
      m.redraw();
    } catch(e) {
      console.log(`Cannot remove disabled sonde data id list: ${error}`);
      alert(i18next.t("disabledDataUpdateError") + error);
    }
  }
}

export default SystemSetting;