import firebase from "firebase/app";
import "firebase/firestore";
import m from "mithril";

const LOCATIONS_COLLECTION = "locations";

class Locations {
  constructor() {
    this.db = firebase.firestore();
    this.locationsRef = this.db.collection(LOCATIONS_COLLECTION);
    this._list = [];
  }

  fetch() {
    let query = this.locationsRef;
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
