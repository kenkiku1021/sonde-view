import firebase from "firebase/app";
import "firebase/firestore";
import m from "mithril";
import i18next from "i18next";

const LOCATIONS_COLLECTION = "locations";

class AdminLocations {
  constructor() {
    this.db = firebase.firestore();
    this.locationsRef = this.db.collection(LOCATIONS_COLLECTION);
    this._list = [];
  }

  fetch() {
    let query = this.locationsRef;
    query.get().then(querySnapshot => {
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
    }).catch(err => {
        console.log("Cannot fetch locations list", err);
        alert("Cannot fetch locations");
    });
  }

  list() {
    return this._list;
  }

  get(id) {
    const filteredLocation = this._list.filter(location => id !== 0 && location.id === id);
    return filteredLocation.length > 0 ? filteredLocation[0] : null;
  }

  append(id, label, lat, lng, mag, msl) {
    return this.locationsRef.doc(id).set({
      label: label,
      lat: Number(lat),
      lng: Number(lng),
      msl: Number(msl),
      mag: Number(mag),
      disabled: false,
    }).then(() => {
      alert(i18next.t("locationAppended"));
      this.fetch();
    }).catch(err => {
      console.log(err);
      alert(i18next.t("locationUpdateError") + err);
    });
  }

  update(loc) {
    return this.locationsRef.doc(loc.id).set({
      label: loc.label,
      lat: Number(loc.lat),
      lng: Number(loc.lng),
      msl: Number(loc.msl),
      mag: Number(loc.mag),
      disabled: loc.disabled,
    }).then(() => {
      alert(i18next.t("locationUpdated"));
      this.fetch();
    }).catch(err => {
      console.log(err);
      alert(i18next.t("locationUpdateError") + err);
    });
  }

  delete(id) {
    return this.locationsRef.doc(id).delete().then(() => {
      this.fetch();
    }).catch(err => {
      console.log(err);
      alert(i18next.t("locationUpdateError") + err);
    });
  }

}

export default AdminLocations;
