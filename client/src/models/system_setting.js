import m from "mithril";
import { db } from "../firebase-app";
import { doc, setDoc, getDoc, runTransaction } from "firebase/firestore";
import i18next from "i18next";

const SYSTEM_SETTING_COLLECTION = "system_setting";
const SONDE_DATA_DEFAULT_DISABLED_FLAG = "sonde_data_default_disabled_flag";
const DEFAULT_LOCATION = "default_location_id";

class SystemSetting {
  constructor() {
    this.sondeDataDefaultDisabledFlagRef = doc(db, SYSTEM_SETTING_COLLECTION, SONDE_DATA_DEFAULT_DISABLED_FLAG);
    this.sondeDataDefaultDisabledFlag = false;
    this.defaultLocationRef = doc(db, SYSTEM_SETTING_COLLECTION, DEFAULT_LOCATION);
    this.defaultLocation = null;
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

  async getDefaultLocation() {
    const docSnap = await getDoc(this.defaultLocationRef);
    this.defaultLocation = docSnap.exists() ? docSnap.data().location : null;
    console.log(this.defaultLocation)
    m.redraw();
  }

  setDefaultLocation(value) {
    this.defaultLocation = value;
    setDoc(this.defaultLocationRef, {location: this.defaultLocation});
  }
}

export default SystemSetting;