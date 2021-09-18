import m from "mithril";
import i18next from 'i18next';
import UploadUI from "./upload-ui";
import { SondeData } from "../models/sonde_data";
import { toLocalTimeISOString } from "../time-lib";

const UploadDataPage = {
  oninit: vnode => {
    const sondeData = new SondeData();
    vnode.state.sondeData = sondeData;
  },

  view: vnode => {
    const sondeData = vnode.state.sondeData;
    return [
      m(UploadUI.UploadNavBar),
      m("main", [
        m(".container.mt-4", [
          m(".columns", [
            m(".column.is-one-fifth", [
              m(UploadUI.Input, {
                id: "measuredAt",
                label: i18next.t("measuredAt"),
                type: "datetime-local",
                value: toLocalTimeISOString(sondeData.measuredAt),
                oninput: e => {
                  sondeData.measuredAt.setTime(Date.parse(e.target.value));
                },
              }),
            ]),
            m(".column.is-one-fifth", [
              m(UploadUI.Input, {
                id: "lat",
                label: i18next.t("lat"),
                type: "number",
                min: -90,
                max: 90,
                value: sondeData.lat,
                oninput: e => {
                  console.log(e);
                  sondeData.setLat(e.target.value);
                }
              }),
            ]),
            m(".column.is-one-fifth", [
              m(UploadUI.Input, {
                id: "lng",
                label: i18next.t("lng"),
                type: "number",
                min: -180,
                max: 180,
                value: sondeData.lng,
                oninput: e => {
                  sondeData.setLng(e.target.value);
                }
              }),
            ]),
            m(".column.is-one-fifth", [
              m(UploadUI.Input, {
                id: "mag",
                label: i18next.t("magDeclination"),
                type: "number",
                min: -180,
                max: 180,
                value: sondeData.magDeclination,
                oninput: e => {
                  sondeData.setMagDeclination(e.target.value);
                }
              }),
            ]),
            m(".column.is-one-fifth", [
              m(UploadUI.Input, {
                id: "ground_msl",
                label: i18next.t("groundMSL"),
                type: "number",
                min: -100,
                max: 10000,
                value: sondeData.groundMSL,
                oninput: e => {
                  sondeData.setGroundMSL(e.target.value);
                }
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
                },
              })
            ]),
            m(".column", [
              i18next.t("preview"),
            ]),
          ]),
          m(".columns", [
            m(".column.is-half.is-offset-one-quarter", [
              m("button.button.is-primary.is-fullwidth", {
                onclick: e => {

                }
              }, i18next.t("uploadBtn")),
            ]),
          ]),
        ]),
      ]),
    ];
  },
};

export default UploadDataPage;