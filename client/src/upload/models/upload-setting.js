const UPLOAD_SETTING_KEY = "windview_upload_setting";
const ALTITUDE_TYPES = ["MSL", "AGL"];
const ALTITUDE_UNITS = ["ft", "m"];
const WIND_DIRECTION_TYPES = ["From", "To"];
const DEGREE_TYPES = ["True", "Mag"];
const WIND_SPEED_UNITS = ["m/s", "km/h", "kt"];

class UploadSetting {
  constructor() {
    this.altitudeType = ALTITUDE_TYPES[0];
    this.altitudeUnit = ALTITUDE_UNITS[0];
    this.windDirectionType = WIND_DIRECTION_TYPES[0];
    this.isTrueDeg = true;
    this.windspeedUnit = WIND_SPEED_UNITS[0];
    //this.useUnitInData = true;
  }

  load() {
    // load setting data from localStorage
    if(window.localStorage) {
      const value = window.localStorage.getItem(UPLOAD_SETTING_KEY);
      if(value) {
        const data = JSON.parse(value);
        this.altitudeType = data.altitudeType ? data.altitudeType : this.altitudeType;
        this.altitudeUnit = data.altitudeUnit ? data.altitudeUnit : this.altitudeUnit;
        this.windDirectionType = data.windDirectionType ? data.windDirectionType : this.windDirectionType;
        this.degreeType = data.degreeType !== null ? data.degreeType : this.degreeType;
        this.windspeedUnit = data.windspeedUnit ? data.windspeedUnit : this.windspeedUnit;
        //this.useUnitInData = data.useUnitInData !== null ? data.useUnitInData : this.useUnitInData;
      }
    }
  }

  save() {
    // save setting data to localStorage
    const data = {
      altitudeType: this.altitudeType,
      altitudeUnit: this.altitudeUnit,
      windDirectionType: this.windDirectionType,
      degreeType: this.degreeType,
      windspeedUnit: this.windspeedUnit,
      //useUnitInData: this.useUnitInData,
    };
    if(window.localStorage) {
      window.localStorage.setItem(UPLOAD_SETTING_KEY, JSON.stringify(data));
    }
  }

  setAltitudeType(value) {
    if(ALTITUDE_TYPES.includes(value)) {
      this.altitudeType = value;
      this.save();
    }
  }

  setAltitudeUnit(value) {
    if(ALTITUDE_UNITS.includes(value)) {
      this.altitudeUnit = value;
      this.save();
    }
  }

  setWindDirectionType(value) {
    if(WIND_DIRECTION_TYPES.includes(value)) {
      this.windDirectionType = value;
      this.save();
    }
  }

  setDegreeType(value) {
    if(DEGREE_TYPES.includes(value)) {
      this.degreeType = value;
      this.save();
    }
  }

  setWindspeedUnit(value) {
    if(WIND_SPEED_UNITS.includes(value)) {
      this.windspeedUnit = value;
      this.save();
    }
  }

  /*
  setUseUnitInData(value) {
    this.useUnitInData = (value === true);
    this.save();
  }
  */

  altitudeTypes() {
    return ALTITUDE_TYPES;
  }

  altitudeUnits() {
    return ALTITUDE_UNITS;
  }

  windDirectionTypes() {
    return WIND_DIRECTION_TYPES;
  }

  degreeTypes() {
    return DEGREE_TYPES;
  }

  windspeedUnits() {
    return WIND_SPEED_UNITS;
  }
}

export default UploadSetting;