import m from "mithril";
import i18next from 'i18next';
import UploadUI from "./upload-ui";
import { SondeData } from "../models/sonde_data";
import { toLocalTimeISOString } from "../time-lib";
import Locations from "./models/locations";
import agh from "agh.sprintf";

function isNumber(s) {
  return s.match(/^\-?\d+\.?\d*$/);
}

const UploadDataPage = {
  oninit: vnode => {
    vnode.state.sondeData = new SondeData();
    vnode.state.presetLocations = new Locations();
    vnode.state.presetLocations.fetch();
    vnode.state.selectedLocation = 0;
    vnode.state.measuredAt = toLocalTimeISOString(vnode.state.sondeData.measuredAt);
    vnode.state.lat = vnode.state.sondeData.lat;
    vnode.state.lng = vnode.state.sondeData.lng;
    vnode.state.mag = vnode.state.sondeData.magDeclination;
    vnode.state.msl = vnode.state.sondeData.groundMSL;
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
                  vnode.state.lat = e.target.value;
                  if(isNumber(vnode.state.lat)) {
                    sondeData.setLat(vnode.state.lat);
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
                  vnode.state.lng = e.target.value;
                  if(isNumber(vnode.state.lng)) {
                    sondeData.setLng(vnode.state.lng);
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
                  vnode.state.mag = e.target.value;
                  if(isNumber(vnode.state.mag)) {
                    sondeData.setMagDeclination(vnode.state.mag);
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
                  vnode.state.msl = e.target.value;
                  if(isNumber(vnode.state.msl)) {
                    sondeData.setGroundMSL(vnode.state.msl);
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
    ];
  },
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
            ]);
          }),
        ]),
      ]),
    ]);
  },
};

export default UploadDataPage;