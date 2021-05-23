import m from "mithril";
import UI from "./ui";
import i18next from "i18next";
import DonwloadDataList from "./models/download_data_list";

const DownloadPage = {
  oninit: vnode => {
    vnode.state.downloadDataList = new DonwloadDataList();
    vnode.state.downloadDataList.fetch();
  },

  view: vnode => {
    return [
      m(UI.NavBar, { title: i18next.t("menuDownload") }),
      m("main", [
        m(".container", [
          m(".columns.my-4.mx-2", [
            vnode.state.downloadDataList.isEmpty() ? m(NoDownloadFileView) : m(DownloadListView, {list: vnode.state.downloadDataList.list()}),
          ]),
        ]),
      ]),
    ];
  }
};

const NoDownloadFileView = {
  view: vnode => {
    return m(".column", [
      m(".message.is-info", [
        m(".message-body", [
          m("p", i18next.t("noDownloadFiless")),
        ]),
      ]),
    ]);
  }
};

const DownloadListView = {
  view: vnode => {
    return m(".column.is-half.is-offset-one-quarter", [
      m("ul.download-buttons", [
        vnode.attrs.list.map(item => {
          return m("li.mb-4", [
            m("a.button.is-link.is-fullwidth[target=_blank]", {
              href: item.url,
            }, item.name),
            m("p.has-text-right.mt-1", [
              m("span.timestamp", item.updated_at.toLocaleString()),
              m("span.filesize.ml-4", [item.size, "bytes"]),  
            ]),
          ]);
        }),
      ]),
    ]);
  }
};

export default DownloadPage;