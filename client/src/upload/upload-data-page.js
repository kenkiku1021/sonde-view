import m from "mithril";
import i18next from 'i18next';
import UploadUI from "./upload-ui";
import UI from "../ui";
import { SondeData } from "../models/sonde_data";
import { toLocalTimeISOString } from "../time-lib";
import Locations from "./models/locations";
import SystemSetting from "../models/system_setting";
import agh from "agh.sprintf";
import UploadSetting from "./models/upload-setting";

function isNumber(s) {
  return s.match(/^\-?\d+\.?\d*$/);
}

const UploadDataPage = {
  oninit: vnode => {
    vnode.state.setting = new SystemSetting();
    vnode.state.setting.getDefaultLocation();
    vnode.state.sondeData = new SondeData();
    vnode.state.presetLocations = new Locations();
    vnode.state.presetLocations.fetch();
    vnode.state.lat = vnode.state.sondeData.lat;
    vnode.state.lng = vnode.state.sondeData.lng;
    vnode.state.mag = vnode.state.sondeData.magDeclination;
    vnode.state.msl = vnode.state.sondeData.groundMSL;  
    vnode.state.measuredAt = toLocalTimeISOString(vnode.state.sondeData.measuredAt);
    vnode.state.uploadSetting = new UploadSetting();
    vnode.state.uploadSetting.load();
  },

  onbeforeupdate(vnode) {
    if(!vnode.state.selectedLocation || (vnode.state.selectedLocation === "0" && !vnode.state.lat && !vnode.state.lng)) {
      // 観測地点が未選択 → デフォルト観測地点を選択
      const defaultLocation = vnode.state.presetLocations.get(vnode.state.setting.defaultLocation);
      vnode.state.selectedLocation = defaultLocation ? defaultLocation.id : "0";
    }
    const location = vnode.state.presetLocations.get(vnode.state.selectedLocation);
    if(vnode.state.selectedLocation === "0") {
      vnode.state.lat = vnode.state.sondeData.lat;
      vnode.state.lng = vnode.state.sondeData.lng;
      vnode.state.mag = vnode.state.sondeData.magDeclination;
      vnode.state.msl = vnode.state.sondeData.groundMSL;  
    } 
    else {
      vnode.state.sondeData.setLat(location.lat);
      vnode.state.sondeData.setLng(location.lng);
      vnode.state.sondeData.setGroundMSL(location.msl);
      vnode.state.sondeData.setMagDeclination(location.mag);
      vnode.state.lat = vnode.state.sondeData.lat;
      vnode.state.lng = vnode.state.sondeData.lng;
      vnode.state.mag = vnode.state.sondeData.magDeclination;
      vnode.state.msl = vnode.state.sondeData.groundMSL;
    }
  },

  view: vnode => {
    const sondeData = vnode.state.sondeData;
    return [
      m(UploadUI.UploadNavBar),
      m("main", [
        m(".container.is-fluid.mt-4", [
          m(".columns", [
            m(".column.is-2", [
              m(UploadUI.Input, {
                id: "measuredAt",
                label: i18next.t("measuredAt"),
                type: "datetime-local",
                value: vnode.state.measuredAt,
                oninput: e => {
                  vnode.state.measuredAt = e.target.value;
                  sondeData.setMeasuredAtAsString(vnode.state.measuredAt);
                },
              }),
            ]),
            m(".column.is-2", [
              m(UploadUI.Input, {
                id: "lat",
                label: i18next.t("lat"),
                type: "text",
                value: vnode.state.lat,
                oninput: e => {
                  if(isNumber(e.target.value)) {
                    const value = Number(e.target.value);
                    sondeData.setLat(value);
                    vnode.state.lat = value;
                  }
                }
              }),
            ]),
            m(".column.is-2", [
              m(UploadUI.Input, {
                id: "lng",
                label: i18next.t("lng"),
                type: "text",
                value: vnode.state.lng,
                oninput: e => {
                  if(isNumber(e.target.value)) {
                    const value = Number(e.target.value);
                    sondeData.setLng(value);
                    vnode.state.lng = value;
                  }
                }
              }),
            ]),
            m(".column.is-2", [
              m(UploadUI.Input, {
                id: "mag",
                label: i18next.t("magDeclination"),
                type: "text",
                value: vnode.state.mag,
                oninput: e => {
                  if(isNumber(e.target.value)) {
                    const value = Number(e.target.value);
                    sondeData.setMagDeclination(value);
                    vnode.state.mag = value;
                    sondeData.parseDataText(vnode.state.measuredData);
                  }
                }
              }),
            ]),
            m(".column.is-2", [
              m(UploadUI.Input, {
                id: "ground_msl",
                label: i18next.t("groundMSL"),
                type: "text",
                value: vnode.state.msl,
                oninput: e => {
                  if(isNumber(e.target.value)) {
                    const value = Number(e.target.value);
                    sondeData.setGroundMSL(value);
                    vnode.state.msl = value;
                    sondeData.parseDataText(vnode.state.measuredData);
                  }
                }
              }),
            ]),
            m(".column.is-2", [
              m(UploadUI.Select, {
                id: "preset_locations",
                label: i18next.t("presetLocations"),
                value: vnode.state.selectedLocation,
                values: vnode.state.presetLocations.list().map(location => {
                  return [location.id, location.label];
                }),
                onchange: e => {
                  vnode.state.selectedLocation = e.target.value;
                  const location = vnode.state.presetLocations.get(vnode.state.selectedLocation);
                  if(location) {
                    sondeData.setLat(location.lat);
                    sondeData.setLng(location.lng);
                    sondeData.setGroundMSL(location.msl);
                    sondeData.setMagDeclination(location.mag);
                    vnode.state.lat = vnode.state.sondeData.lat;
                    vnode.state.lng = vnode.state.sondeData.lng;
                    vnode.state.mag = vnode.state.sondeData.magDeclination;
                    vnode.state.msl = vnode.state.sondeData.groundMSL;      
                    sondeData.parseDataText(vnode.state.measuredData);
                  }
                },
              }),
            ]),
          ]),
          m(UploadSettingView, {setting: vnode.state.uploadSetting}),
          m(".columns", [
            m(".column", [
              m(UploadUI.TextArea, {
                id: "records",
                label: i18next.t("measuredData"),
                value: vnode.state.measuredData,
                rows: 20,
                oninput: e => {
                  vnode.state.measuredData = e.target.value;
                  sondeData.parseDataText(vnode.state.measuredData);
                },
              })
            ]),
            m(".column", [
              i18next.t("preview"),
              sondeData.records().length > 0 ? m(UploadPreviewView, {sondeData: sondeData}) : "",
            ]),
          ]),
          m(".columns", [
            m(".column.is-half.is-offset-one-quarter", [
              m("button.button.is-primary.is-fullwidth", {
                onclick: e => {
                  sondeData.update();
                  alert(i18next.t("dataUpdateSuccessed"));
                }
              }, i18next.t("uploadBtn")),
            ]),
          ]),
        ]),
      ]),
      m(UI.Footer),
    ];
  },
};

const UploadSettingView = {
  view: vnode => {
    return [
      m(".columns", [
        m(".column.is-narrow", [
          m(UploadUI.Select, {
            id: "altitude_type",
            label: i18next.t("uploadDataSettingAltitudeType"),
            value: vnode.attrs.setting.altitudeType,
            values: vnode.attrs.setting.altitudeTypes().map(val => [val, val]),
            onchange: e => {
              vnode.attrs.setting.setAltitudeType(e.target.value);
            },
          }),
        ]),
        m(".column.is-narrow", [
          m(UploadUI.Select, {
            id: "altitude_unit",
            label: i18next.t("uploadDataSettingAltitudeUnit"),
            value: vnode.attrs.setting.altitudeUnit,
            values: vnode.attrs.setting.altitudeUnits().map(val => [val, val]),
            onchange: e => {
              vnode.attrs.setting.setAltitudeUnit(e.target.value);
            },
          }),
        ]),
        m(".column.is-narrow", [
          m(UploadUI.Select, {
            id: "winddirection_type",
            label: i18next.t("uploadDataSettingWindDirectionType"),
            value: vnode.attrs.setting.windDirectionType,
            values: vnode.attrs.setting.windDirectionTypes().map(val => [val, val]),
            onchange: e => {
              vnode.attrs.setting.setWindDirectionType(e.target.value);
            },
          }),
        ]),
        m(".column.is-narrow", [
          m(UploadUI.Select, {
            id: "true_mag",
            label: i18next.t("uploadDataSettingWindDirectionDegType"),
            value: vnode.attrs.setting.degreeType,
            values: vnode.attrs.setting.degreeTypes().map(val => [val, val]),
            onchange: e => {
              vnode.attrs.setting.setDegreeType(e.target.value);
            },
          }),
        ]),
        m(".column.is-narrow", [
          m(UploadUI.Select, {
            id: "windspeed_unit",
            label: i18next.t("uploadDataSettingWindSpeedUnit"),
            value: vnode.attrs.setting.windspeedUnit,
            values: vnode.attrs.setting.windspeedUnits().map(val => [val, val]),
            onchange: e => {
              vnode.attrs.setting.setWindspeedUnit(e.target.value);
            },
          }),
        ]),
      ]),
    ];
  }
};

const UploadPreviewView = {
  view: vnode => {
    return m(".preview", [
      m("table.table.is-bordered", [
        m("thead", [
          m("tr", [
            m("th", [i18next.t("agl"), "[m]"]),
            m("th", [i18next.t("msl"), "[m]"]),
            m("th", [i18next.t("tblWindDirectionFrom"), "(", i18next.t("tblMagDeclinationMag"), ")"]),
            m("th", [i18next.t("tblWindDirectionFrom"), "(", i18next.t("tblMagDeclinationTrue"), ")"]),
            m("th", [i18next.t("tblWindSpeed"), "[kt]"]),
            m("th", [i18next.t("tblWindSpeed"), "[m/s]"]),
            m("th", [i18next.t("tblWindSpeed"), "[km/h]"])
          ]),
        ]),
        m("tbody", [
          vnode.attrs.sondeData.records().map(data => {
            return m("tr", [
              m("td", agh.sprintf("%d", data.getHeightAsMeter())),
              m("td", agh.sprintf("%.1f", data.getAltitudeAsMeter())),
              m("td", agh.sprintf("%.1f", data.getWindMagFrom())),
              m("td", agh.sprintf("%.1f", data.getWindTrueFrom())),
              m("td", agh.sprintf("%.1f", data.getWindSpeedAsKt())),
              m("td", agh.sprintf("%.1f", data.getWindSpeedAsMerterPerSec())),
              m("td", agh.sprintf("%.1f", data.getWindSpeedAsKmPerHour())),
            ]);
          }),
        ]),
      ]),
    ]);
  },
};

export default UploadDataPage;