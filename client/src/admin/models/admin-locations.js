import { db } from '../../firebase-app';
import { collection, query, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import m from "mithril";
import i18next from "i18next";

const LOCATIONS_COLLECTION = "locations";

class AdminLocations {
  constructor() {
    this.locationsRef = collection(db, LOCATIONS_COLLECTION);
    this._list = [];
  }

  async fetch() {
    const q = query(this.locationsRef);
    const querySnapshot = await getDocs(q);
    this._list = [];
    querySnapshot.forEach(doc => {
      const data = doc.data();
      this._list.push({
        id: doc.id,
        label: data.label,
        lat: data.lat,
        lng: data.lng,
        msl: data.msl,
        mag: data.mag,
        disabled: data.disabled,
      });
    });
    this._list.sort((a, b) => {
      const idA = String(a.id).toUpperCase();
      const idB = String(b.id).toUpperCase();
      if(idA < idB) {
        return -1;
      }
      else if(idA > idB) {
        return 1;
      }
      else {
        return 0;
      }
    });
    m.redraw();
  }

  list() {
    return this._list;
  }

  get(id) {
    const filteredLocation = this._list.filter(location => id !== 0 && location.id === id);
    return filteredLocation.length > 0 ? filteredLocation[0] : null;
  }

  async append(id, label, lat, lng, mag, msl) {
    try {
      await setDoc(doc(db, LOCATIONS_COLLECTION, id), {
        label: label,
        lat: Number(lat),
        lng: Number(lng),
        msl: Number(msl),
        mag: Number(mag),
        disabled: false,
      });
      alert(i18next.t("locationAppended"));
      this.fetch();  
    } catch(e) {
      console.log(err);
      alert(i18next.t("locationUpdateError") + err);  
    }
  }

  async update(loc) {
    try {
      await setDoc(doc(db, LOCATIONS_COLLECTION, loc.id), {
        label: loc.label,
        lat: Number(loc.lat),
        lng: Number(loc.lng),
        msl: Number(loc.msl),
        mag: Number(loc.mag),
        disabled: loc.disabled,  
      });
      alert(i18next.t("locationUpdated"));
      this.fetch();
    } catch(e) {
      console.log(err);
      alert(i18next.t("locationUpdateError") + err);
    }
  }

  async delete(id) {
    try {
      await deleteDoc(doc(db, LOCATIONS_COLLECTION, id));
      this.fetch();
    } catch(e) {
      console.log(err);
      alert(i18next.t("locationUpdateError") + err);
    }
  }

}

export default AdminLocations;
