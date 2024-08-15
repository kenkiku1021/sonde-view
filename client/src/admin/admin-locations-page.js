import m from "mithril";
import AdminUI from "./admin-ui";
import UI from "../ui";
import i18next from 'i18next';
import AdminLocations from "./models/admin-locations";
import SystemSetting from "../models/system_setting";

const NewLocationView = {
  oninit: vnode => {
    vnode.state.newId = "";
    vnode.state.newLabel = "";
    vnode.state.newLat = 0;
    vnode.state.newLng = 0;
    vnode.state.newMag = 0;
    vnode.state.newMsl = 0;
  },

  view: vnode => {
    return [
      m(".columns", [
        m(".column.is-narrow", [
          m(".field.has-addons", [
            m(".control", [
              m("a.button.is-static", i18next.t("newLocationId")),
            ]),
            m(".control", [
              m("input.input", {
                value: vnode.state.newId,
                oninput: e => {
                  vnode.state.newId = e.target.value;
                },
              }),
            ]),
          ]),   
        ]),
        m(".column.is-narrow", [
          m(".field.has-addons", [
            m(".control", [
              m("a.button.is-static", i18next.t("newLocationName")),
            ]),
            m(".control", [
              m("input.input", {
                value: vnode.state.newLabel,
                oninput: e => {
                  vnode.state.newLabel = e.target.value;
                },
              }),
            ]),
          ]),
        ]),
        m(".column.is-narrow", [
          m(".field.has-addons", [
            m(".control", [
              m("a.button.is-static", i18next.t("newLocationLat")),
            ]),
            m(".control", [
              m("input.input", {
                value: vnode.state.newLat,
                oninput: e => {
                  vnode.state.newLat = e.target.value;
                },
              }),
            ]),
          ]),
        ]),
        m(".column.is-narrow", [
          m(".field.has-addons", [
            m(".control", [
              m("a.button.is-static", i18next.t("newLocationLng")),
            ]),
            m(".control", [
              m("input.input", {
                value: vnode.state.newLng,
                oninput: e => {
                  vnode.state.newLng = e.target.value;
                },
              }),
            ]),
          ]),
        ]),
      ]),
      m(".columns", [
        m(".column.is-narrow", [
          m(".field.has-addons", [
            m(".control", [
              m("a.button.is-static", i18next.t("newLocationMag")),
            ]),
            m(".control", [
              m("input.input", {
                value: vnode.state.newMag,
                oninput: e => {
                  vnode.state.newMag = e.target.value;
                },
              }),
            ]),
          ]),
        ]),
        m(".column.is-narrow", [
          m(".field.has-addons", [
            m(".control", [
              m("a.button.is-static", i18next.t("newLocationMsl")),
            ]),
            m(".control", [
              m("input.input", {
                value: vnode.state.newMsl,
                oninput: e => {
                  vnode.state.newMsl = e.target.value;
                },
              }),
            ]),
          ]),
        ]),
        m(".column", [
          m("button[type=button].button.is-info", {
            onclick: e => {
              vnode.attrs.locations.append(vnode.state.newId, vnode.state.newLabel, vnode.state.newLat, vnode.state.newLng, vnode.state.newMag, vnode.state.newMsl)
                .then(() => {
                  vnode.state.newId = "";
                  vnode.state.newLabel = "";
                  vnode.state.newLat = 0;
                  vnode.state.newLng = 0;
                  vnode.state.newMag = 0;
                  vnode.state.newMsl = 0;
                });
            }
          }, i18next.t("addLocation")),
        ]),
      ]),
    ];
  },
};

const LocationsTableView = {
  oninit: vnode => {
    vnode.state.setting = new SystemSetting();
    vnode.state.setting.getDefaultLocation();
  },

  view: vnode => {
    return m("table.table", [
      m("thead", [
        m("tr", [
          m("th", i18next.t("locationId")),
          m("th", i18next.t("locationName")),
          m("th", i18next.t("locationLat")),
          m("th", i18next.t("locationLng")),
          m("th", i18next.t("locationMag")),
          m("th", i18next.t("locationMsl")),
          m("th", i18next.t("locationDisabled")),
          m("th", i18next.t("locationDefault")),
          m("th", ""),
        ]),
      ]),
      m("tbody", [
        vnode.attrs.locations.list().map(loc => {
          return m("tr", [
            m("td", [
              loc.id,
            ]),
            m("td", [
              m("input.input[type=text]", {
                value: loc.label,
                oninput: e => {
                  loc.label = e.target.value;
                },
              }),
            ]),
            m("td", [
              m("input.input[type=text]", {
                value: loc.lat,
                oninput: e => {
                  loc.lat = e.target.value;
                }
              }),
            ]),
            m("td", [
              m("input.input[type=text]", {
                value: loc.lng,
                oninput: e => {
                  loc.lng = e.target.value;
                }
              }),
            ]),
            m("td", [
              m("input.input[type=text]", {
                value: loc.mag,
                oninput: e => {
                  loc.mag = e.target.value;
                },
              }),
            ]),
            m("td", [
              m("input.input[type=text]", {
                value: loc.msl,
                oninput: e => {
                  loc.msl = e.target.value;
                }
              }),
            ]),
            m("td.check", [
              m("label.checkbox", [
                m("input[type=checkbox]", {
                  checked: loc.disabled,
                  onclick: e => {
                    loc.disabled = e.target.checked;
                  },
                }),
              ]),
            ]),
            m("td.check", [
              m("label.radio", [
                m("input[type=radio][name=default_location]", {
                  checked: loc.id === vnode.state.setting.defaultLocation,
                  onclick: e => {
                    if(e.target.checked && !loc.disabled) {
                      vnode.state.setting.setDefaultLocation(loc.id);
                    }
                  },
                }),
              ]),
            ]),
            m("td", [
              m("button.button.is-primary.is-small.mr-2[type=button]", {
                onclick: e => {
                  vnode.attrs.locations.update(loc);
                }
              }, i18next.t("updateLocation")),
              m("button.button.is-danger.is-small[type=button]", {
                onclick: e => {
                  if(confirm(i18next.t("deleteLocationConfirmation") + loc.label)) {
                    vnode.attrs.locations.delete(loc.id);
                  }
                }
              }, i18next.t("deleteLocation")),
            ]),
          ]);
        }),
      ]),
    ]);
  }
};

const AdminLocationsPage = {
  oninit: vnode => {
    vnode.state.locations = new AdminLocations();
    vnode.state.locations.fetch();
  },

  view: vnode => {
    return [
      m(AdminUI.AdminNavBar),
      m("main", [
        m(".container.mt-4", [
          m(NewLocationView, {
            locations: vnode.state.locations,
          }),
          m(LocationsTableView, {
            locations: vnode.state.locations,
          }),
        ]),
      ]),
      m(UI.Footer),
    ];
  }
};

export default AdminLocationsPage;