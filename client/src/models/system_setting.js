import m from "mithril";
import { db } from "../firebase-app";
import { doc, setDoc, getDoc, runTransaction } from "firebase/firestore";
import i18next from "i18next";

const SYSTEM_SETTING_COLLECTION = "system_setting";
const SONDE_DATA_DEFAULT_DISABLED_FLAG = "sonde_data_default_disabled_flag";

class SystemSetting {
  constructor() {
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

}

export default SystemSetting;