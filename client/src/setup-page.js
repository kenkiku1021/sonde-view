import m from "mithril";
import UI from "./ui";
import Setting from "./models/setting";
import i18next from 'i18next';
import Direction from "./models/direction";
import Unit from "./models/unit";

const SetupPage = {
    view: vnode => {
        return [
            m(UI.NavBar, {title: i18next.t("menuSetup")}),
            m("main", [
                m(".container.setting", [
                    m("h2", i18next.t("titleUnits")),

                    m(UI.SettingCard, {
                        title: i18next.t("msl"),
                    }, [
                        m(".buttons", [
                            m(UI.ToggleButton, {
                                selected: Setting.getMslAsMeter(),
                                onclick: e => {
                                    Setting.setMslAsMeter(!Setting.getMslAsMeter());
                                }
                            }, "m"),
                            m(UI.ToggleButton, {
                                selected: Setting.getMslAsFt(),
                                onclick: e => {
                                    Setting.setMslAsFt(!Setting.getMslAsFt());
                                },
                            }, "ft"),    
                        ]),
                    ]),

                    m(UI.SettingCard, {
                        title: i18next.t("agl"),
                    }, [
                        m(".buttons", [
                            m(UI.ToggleButton, {
                                selected: Setting.getAglAsMeter(),
                                onclick: e => {
                                    Setting.setAglAsMeter(!Setting.getAglAsMeter());
                                },
                            }, "m"),
                            m(UI.ToggleButton, {
                                selected: Setting.getAglAsFt(),
                                onclick: e => {
                                    Setting.setAglAsFt(!Setting.getAglAsFt());
                                },
                            }, "ft"),
                        ]),
                    ]),

                    m(UI.SettingCard, {
                        title: i18next.t("windDirection"),
                    }, [
                        m(".columns", [
                            m(".column.is-narrow", [
                                m(".buttons.has-addons", [
                                    m(UI.ToggleButton, {
                                        selected: Setting.getWindDirection() == Direction.DirectionEnum.FROM,
                                        onclick: e => {
                                            Setting.setWindDirection(Direction.DirectionEnum.FROM);
                                        }
                                    }, "From"),
                                    m(UI.ToggleButton, {
                                        selected: Setting.getWindDirection() == Direction.DirectionEnum.TO,
                                        onclick: e => {
                                            Setting.setWindDirection(Direction.DirectionEnum.TO);
                                        }
                                    }, "To"),
                                ]),
                            ]),
                            m(".column.is-narrow", [
                                m(".buttons.has-addons", [
                                    m(UI.ToggleButton, {
                                        selected: Setting.getMagDeclination() == Direction.MagDeclinationEnum.TRUE,
                                        onclick: e => {
                                            Setting.setMagDeclination(Direction.MagDeclinationEnum.TRUE);
                                        },
                                    }, "True"),
                                    m(UI.ToggleButton, {
                                        selected: Setting.getMagDeclination() == Direction.MagDeclinationEnum.MAG,
                                        onclick: e => {
                                            Setting.setMagDeclination(Direction.MagDeclinationEnum.MAG);
                                        }
                                    }, "Mag"),
                                ]),
                            ]),
                        ]),
                    ]),

                    m(UI.SettingCard, {
                        title: i18next.t("windSpeed"),
                    }, [
                        m(".buttons", [
                            m(UI.ToggleButton, {
                                selected: Setting.getWindSpeedAsMerterPerSec(),
                                onclick: e => {
                                    Setting.setWindSpeedAsMeterPerSec(!Setting.getWindSpeedAsMerterPerSec());
                                }
                            }, "m/s"),
                            m(UI.ToggleButton, {
                                selected: Setting.getWindSpeedAsKmPerHour(),
                                onclick: e => {
                                    Setting.setWindSpeedAsKmPerHour(!Setting.getWindSpeedAsKmPerHour());
                                }
                            }, "km/h"),
                            m(UI.ToggleButton, {
                                selected: Setting.getWindSpeedAsKt(),
                                onclick: e => {
                                    Setting.setWindSpeedAsKt(!Setting.getWindSpeedAsKt());
                                }
                            }, "kt"),
                        ]),
                    ]),

                    m(UI.SettingCard, {
                        title: i18next.t("temperature"),
                    }, [
                        m(UI.ToggleButton, {
                            selected: Setting.getTemperatureUnit() == Unit.TemperatureUnitEnum.CELSIUS,
                            onclick: e => {
                                Setting.toggleTemperatureUnit();
                            },
                        }, "℃"),
                    ]),

                    m("h2", i18next.t("titleView")),

                    m(UI.SettingCard, {
                        title: i18next.t("sortOrder"),
                    }, [
                        m(".buttons.has-addons", [
                            m(UI.ToggleButton, {
                                selected: Setting.isSortOrderAscend(),
                                onclick: e => {
                                    Setting.setSortOrderAscend();
                                },
                            }, i18next.t("ascend")),
                            m(UI.ToggleButton, {
                                selected: Setting.isSortOderDescend(),
                                onclick: e => {
                                    Setting.setSortOderDescend();
                                },
                            }, i18next.t("descend")),
                        ]),
                    ]),

                    m(UI.SettingCard, {
                        title: i18next.t("tableCharSize"),
                    }, [
                        m(".buttons", [
                            m(UI.ToggleButton, {
                                selected: Setting.getCharSize() == "S",
                                onclick: e => {
                                    Setting.setCharSize("S");
                                },
                            }, i18next.t("tableCharSizeS")),
                            m(UI.ToggleButton, {
                                selected: Setting.getCharSize() == "M",
                                onclick: e => {
                                    Setting.setCharSize("M");
                                },
                            }, i18next.t("tableCharSizeM")),
                            m(UI.ToggleButton, {
                                selected: Setting.getCharSize() == "L",
                                onclick: e => {
                                    Setting.setCharSize("L");
                                },
                            }, i18next.t("tableCharSizeL")),
                        ]),
                    ]),

                    m(UI.SettingCard, {
                        title: i18next.t("tableBackgroundColor"),
                    }, [
                        m(".buttons.has-addons", [
                            m(UI.ToggleButton, {
                                selected: Setting.isDataTableBackgroundColorNone(),
                                onclick: e => {
                                    Setting.setDataTableBackgroundColorNone();
                                },
                            }, i18next.t("tableBackgroundColorNone")),
                            m(UI.ToggleButton, {
                                selected: Setting.isDataTableBackgroundColorByDirection(),
                                onclick: e => {
                                    Setting.setDataTableBackgroundColorByDirection();
                                },
                            }, i18next.t("tableBackgroundColorByDirection")),
                        ]),
                    ]),

                    m("h2", i18next.t("titleOther")),
                    
                    m(UI.SettingCard, {
                        title: i18next.t("dataListDuration"),
                    }, [
                        m(".select", [
                            m("select", {
                                value: Setting.getDataListDuration(),
                                onchange: e => {
                                    Setting.setDataListDuration(e.target.value);
                                },
                            }, [
                                Setting.dataListDurationValues().map(value => m("option", {value: value}, [value, i18next.t("hour")])),
                            ]),
                        ]),
                    ]),
                ]),
            ]),
            m(UI.Footer),
        ];

    }
};

export default SetupPage;