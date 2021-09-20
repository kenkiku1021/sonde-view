import m from "mithril";
import i18next from 'i18next';
import UI from "../ui";

let menuActive = false;

const UploadUI = {
  UploadNavBar: {
    view: vnode => {
      return m("nav.navbar", {
        class: vnode.attrs.class ? vnode.attrs.class : "is-dark",
      }, [
        m(".navbar-brand", [
          m("a", {
            onclick: e => {
              e.preventDefault();
              m.route.set("/upload");
            },
            class: "navbar-item",
          }, i18next.t("appName")),
          m(".navbar-item.data-title", vnode.attrs.title),
        ]),
        m(".navbar-menu", {
          class: menuActive ? "is-active" : "",
        }, [
          m(".navbar-start", [
            m(UI.NavBarSignOutItem),
          ])
        ])
      ]);
    },
  },

  Input: {
    view: vnode => {
      return m(".field", [
        m("label", {
          for: vnode.attrs.id,
        }, vnode.attrs.label),
        m(".control", [
          m("input.input", {
            id: vnode.attrs.id,
            type: vnode.attrs.type ? vnode.attrs.type : "text",
            value: vnode.attrs.value,
            oninput: vnode.attrs.oninput,
            min: vnode.attrs.min ? vnode.attrs.min : null,
            max: vnode.attrs.max ? vnode.attrs.max : null,
          }),
        ]),
      ]);
    }
  },

  TextArea: {
    view: vnode => {
      return m(".field", [
        m("label", {
          for: vnode.attrs.id,
        }, vnode.attrs.label),
        m(".control", [
          m("textarea.textarea", {
            id: vnode.attrs.id,
            value: vnode.attrs.value,
            oninput: vnode.attrs.oninput,
            rows: vnode.attrs.rows,
            cols: vnode.attrs.cols,
          }),
        ]),
      ]);
    }
  },

  Select: {
    view: vnode => {
      return m(".field", [
        m("label", {
          for: vnode.attrs.id,
        }, vnode.attrs.label),
        m(".control", [
          m(".select", [
            m("select", {
              id: vnode.attrs.id,
              onchange: vnode.attrs.onchange,
            }, [
              vnode.attrs.values.map(value => {
                return m("option", {
                  value: value[0],
                  selected: vnode.attrs.value == value[0],
                }, value[1]);
              }),
            ]),  
          ]),
        ]),
      ]);
    }
  },
};

export default UploadUI;