import m from "mithril";
import AdminUI from "./admin-ui";
import AdminUsers from "./models/admin-users";
import i18next from 'i18next';

const NewUserView = {
  oninit: vnode => {
    vnode.state.newUser = "";
  },

  view: vnode => {
    return m(".field.has-addons", [
      m(".control", [
        m("a.button.is-static", i18next.t("newUser")),
      ]),
      m(".control", [
        m("input.input[type=email]", {
          value: vnode.state.newUser,
          oninput: e => {
            vnode.state.newUser = e.target.value;
          },
        }),
      ]),
      m(".control", [
        m("button.button.is-info", {
          onclick: e => {
            vnode.attrs.users.append(vnode.state.newUser).then(() => {
              vnode.state.newUser = "";
            });
          }
        }, i18next.t("appendNewUser")),
      ]),
    ]);
  },
};

const UsersTableView = {
  view: vnode => {
    return m("table.table", [
      m("thead", [
        m("tr", [
          m("th", i18next.t("email")),
          m("th", i18next.t("allow")),
          m("th", i18next.t("admin")),
          m("th", ""),
        ]),
      ]),
      m("tbody", [
        vnode.attrs.users.list().map(user => {
          return m("tr", [
            m("td.email", user.email),
            m("td.check", [
              m("label.checkbox", [
                m("input[type=checkbox]", {
                  checked: user.allow,
                  onclick: e => {
                    user.allow = e.target.checked;
                    vnode.attrs.users.update(user);
                  },
                }),
              ]),
            ]),
            m("td.check", [
              m("label.checkbox", [
                m("input[type=checkbox]", {
                  checked: user.admin,
                  onclick: e => {
                    user.admin = e.target.checked;
                    vnode.attrs.users.update(user);
                  },
                }),
              ]),
            ]),
            m("td", [
              m("button.button.is-danger.is-small[type=button]", {
                onclick: e => {
                  if(confirm(i18next.t("deleteUserConfirmation") + user.email)) {
                    vnode.attrs.users.delete(user.email);
                  }
                }
              }, i18next.t("deleteUser")),
            ]),
          ]);
        }),
      ])
    ]);
  }
};

const AdminUsersPage = {
  oninit: vnode => {
    vnode.state.users = new AdminUsers();
    vnode.state.users.fetch();
  },

  view: vnode => {
    return [
      m(AdminUI.AdminNavBar),
      m("main", [
        m(".container.mt-4", [
          m(NewUserView, {users: vnode.state.users}),
          m(UsersTableView, {users: vnode.state.users}),
        ]),
      ]),
    ];
  },
};

export default AdminUsersPage;