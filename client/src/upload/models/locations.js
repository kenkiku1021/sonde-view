import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import m from "mithril";

const LOCATIONS_COLLECTION = "locations";

class Locations {
  constructor() {
    this.db = firebase.firestore();
    this.locationsRef = this.db.collection(LOCATIONS_COLLECTION);
    this._list = [];
  }

  fetch() {
    let query = this.locationsRef.where("disabled", "!=", true);
    query.get().then(querySnapshot => {
      this._list = [
        {
          id: 0,
          label: null,
        }
      ];
      querySnapshot.forEach(doc => {
        const data = doc.data();
        this._list.push({
          id: doc.id,
          label: data.label,
          lat: data.lat,
          lng: data.lng,
          msl: data.msl,
          mag: data.mag,
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
}

export default Locations;
