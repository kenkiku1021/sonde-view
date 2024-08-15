import m from "mithril";
import agh from "agh.sprintf";
import Setting from "./models/setting";
import Unit from "./models/unit";
import Direction from "./models/direction";
import i18next from "i18next";
import UI from "./ui";

const DEFAULT_CHART_WIDTH = 350;
const DEFAULT_CHART_HEIGHT = 350;
const DST_SCALE_CIRCLE_COUNT = 4;
const SPD_SCALE_CIRCLE_COUNT = 5;
const MARKER_RADIUS = 2;
const SPD_COLOR_MIN_H = -15;
const SPD_COLOR_MAX_H = 255;
const SPD_COLOR_SCALE_WIDTH = 10;
const SPD_COLOR_SCALE_X_OFFSET = 5;
const DST_MIN_ZOOM = 1;
const DST_MAX_ZOOM = 4;
const AXIS_COUNT = 12;

function getChartSize() {
    let size = 1344 / 2;
    if(window.innerWidth < 1024) {
        // small screen
        size = window.innerWidth;
    }
    else if(window.innerWidth < 1216) {
        size = 960 / 2;
    }
    else if(window.innerWidth < 1408) {
        size = 1152 / 2;
    }

    return size;
}

const SvgText = {
    view: vnode => {
        return m("text", {
            class: vnode.attrs.class,
            x: vnode.attrs.x,
            y: vnode.attrs.y,
        }, vnode.children);
    }
};

const SvgLine = {
    view: vnode => {
        return m("line", {
            class: vnode.attrs.class,
            stroke: vnode.attrs.stroke,
            id: vnode.attrs.id,
            x1: vnode.attrs.from[0],
            y1: vnode.attrs.from[1],
            x2: vnode.attrs.to[0],
            y2: vnode.attrs.to[1],
            onclick: vnode.attrs.onclick,
        });
    }
};

const SvgCircle = {
    view: vnode => {
        return m("circle", {
            class: vnode.attrs.class,
            id: vnode.attrs.id,
            cx: vnode.attrs.center[0],
            cy: vnode.attrs.center[1],
            r: vnode.attrs.r,
            onclick: vnode.attrs.onclick,
        });
    }
};

const SvgMarker = {
    view: vnode => {
        return m("circle", {
            class: "marker " + String(vnode.attrs.class),
            id: vnode.attrs.id,
            cx: vnode.attrs.pos[0],
            cy: vnode.attrs.pos[1],
            r: MARKER_RADIUS,
            onclick: vnode.attrs.onclick,
        });
    }
};

const BasicChartAxises = {
    view: vnode => {
        const w = vnode.attrs.width;
        const h = vnode.attrs.height;
        const x0 = w / 2.0;
        const y0 = h / 2.0;
        const r = Math.sqrt((w/2.0)*(w/2.0) + (h/2.0)*(h/2.0));
        const axises = [];

        for(let i=0; i<AXIS_COUNT; ++i) {
            const theta = i * 2 * Math.PI / AXIS_COUNT;
            const line = m(SvgLine, {
                class: "axis",
                from: [x0, y0],
                to: [x0 + (r * Math.cos(theta)), y0 + (r * Math.sin(theta))],
            });
            axises.push(line);
        }

        return axises;
    }
};

const BasicChartCircles = {
    view: vnode => {
        const rStep = (vnode.attrs.width/2) / (vnode.attrs.count + 0.5);
        const center = [vnode.attrs.width/2, vnode.attrs.height/2];
        const circles = [];
        for(let i=1; i<=vnode.attrs.count; ++i) {
            const circle = m(SvgCircle, {
                class: "scale-circle",
                center: center,
                r: rStep * i,
            });
            circles.push(circle);
        }

        return circles;
    }
};

const BasicChart = {
    view: vnode => {
        const w = vnode.attrs.width;
        const h = vnode.attrs.height;
        return m("svg.chart", {
            width: w,
            height: h,
            class: vnode.attrs.class,
        }, [
            m(BasicChartAxises, {width: w, height: h}),
            m(BasicChartCircles, {width: w, height: h, count: vnode.attrs.count}),
            vnode.children,
        ]);
    },
};

const DstChart = {
    oninit: vnode => {
        vnode.state.width = getChartSize();
        vnode.state.height = getChartSize();
        vnode.state.zoom = DST_MIN_ZOOM;
    },

    onbeforeupdate: vnode => {
        vnode.state.width = getChartSize();
        vnode.state.height = getChartSize();
    },

    view: vnode => {
        const center = [vnode.state.width/2, vnode.state.height/2];
        let maxCallback = (max, cur) => Math.max(max, cur);
        let allDstChartValues = vnode.attrs.dataList.list().map(data => {
            return data.dstChartValues();
        }).flat();
        const maxDst = Math.ceil(allDstChartValues.map(v => Math.sqrt(v[0]*v[0] + v[1]*v[1])).reduce(maxCallback, 0) / 1000) * 1000;
        const basicZoomRatio = vnode.state.zoom * (vnode.state.width / ((DST_SCALE_CIRCLE_COUNT + 0.5) * 2)) * DST_SCALE_CIRCLE_COUNT;
        const zoomRatio = basicZoomRatio / maxDst;
        const scaleStep = (maxDst / DST_SCALE_CIRCLE_COUNT) / vnode.state.zoom;
        const scaleTexts = [];
        for(let i=1; i<=DST_SCALE_CIRCLE_COUNT; ++i) {
            scaleTexts.push({
                label: agh.sprintf("%d [m]", scaleStep * i),
                x: center[0] + 5,
                y: center[1] + ((vnode.state.height / 2) / (DST_SCALE_CIRCLE_COUNT + 0.5)) * i + 10,
            });
        }

        return m(".dst-chart-wrapper.is-flex-shrink-1", {
            class: !Setting.isDstChartMode() ? "is-hidden-mobile" : "",
        }, [
            m(BasicChart, {
                width: vnode.state.width,
                height: vnode.state.height,
                count: DST_SCALE_CIRCLE_COUNT,
            }, [
                scaleTexts.map(v => {
                    return m(SvgText, {
                        class: "scale-text",
                        x: v.x,
                        y: v.y,
                    }, v.label);
                }),
                m(SvgText, {
                    class: "date-text",
                    x: 10,
                    y: 20,
                }, [
                    vnode.attrs.dataList.isFinished() ? i18next.t("finished") : i18next.t("updated"),
                    " ",
                    vnode.attrs.dataList.lastUpdatedAt(),
                ]),
                vnode.attrs.dataList.list().map((data, dataIdx) => {
                    const isLatest = dataIdx === 0;
                    const values = data.dstChartValues().map((val, valIdx) => {
                        return [
                            center[0] + (val[0] * zoomRatio),
                            center[1] + (val[1] * zoomRatio),
                            valIdx === 0 ? 0 : data.records()[valIdx-1].getHeightAsMeter(),
                            valIdx === 0 ? 0 : data.records()[valIdx-1].getWindHeadingForChart(),
                            valIdx === 0 ? 0 : data.records()[valIdx-1].getWindSpeedForChart(),
                        ];
                    });
                    const colorClass = `color-${dataIdx+1}`;
                    if(isLatest) {
                        const invertValues = data.dstChartValues(true).map((val, valIdx) => {
                            return [
                                center[0] + (val[0] * zoomRatio),
                                center[1] + (val[1] * zoomRatio),
                                0, 0, 0,
                            ];
                        });
                        return [
                            DstChart.plotDstChart(values, colorClass, isLatest),
                            Setting.getDstChartShowFrom() ? DstChart.plotDstChart(invertValues, "color-0", false) : "",
                        ];
                    }
                    else {
                        return DstChart.plotDstChart(values, colorClass, isLatest);
                    }
                }).reverse(),
            ]),
            m("button.button.is-small.from-to-button", {
                class: Setting.getDstChartShowFrom() ? "is-dark is-active" : "",
                onclick: e => {
                    Setting.setDstChartShowFrom(!Setting.getDstChartShowFrom());
                }
            }, i18next.t("btnFrom")),
            m("button.button.zoom-button", {
                onclick: e => {
                    vnode.state.zoom *= 2;
                    if(vnode.state.zoom > DST_MAX_ZOOM) {
                        vnode.state.zoom = DST_MIN_ZOOM;
                    }
                }
            }, m("i.fas.fa-search-plus")),
            m(".zoom-label", agh.sprintf("×%.1f", vnode.state.zoom)),
            vnode.attrs.dataList.selectedData() ? m(ChartMapLinkView, {data: vnode.attrs.dataList.selectedData()}) : "",
            vnode.attrs.dataList.selectedData() ? m(ChartLocationLabelView, {data: vnode.attrs.dataList.selectedData()}) : "",
        ]);
    },

    plotDstChart: (values, colorClass, isLatest) => {
        return values.map((val, valIdx) => {
            const pos = [val[0], val[1]];
            const height = val[2];
            const heading = val[3];
            const spd = val[4];
            return [
                m(SvgMarker, {
                    class: colorClass,
                    pos: pos,
                    onclick: e => {
                        if(isLatest) {
                            // show record info when latest data
                            const directionLabel = Setting.getWindDirection() == Direction.DirectionEnum.TO ? "To" : "From";
                            const msg = agh.sprintf("Height: %dm  %s: %d°  Spd: %.1fm/s", height, directionLabel, heading, spd);
                            alert(msg);    
                        }
                    },
                }),
                valIdx > 0 ? m(SvgLine, {
                    from: values[valIdx - 1],
                    to: pos,
                    class: `chart-line ${colorClass}`,
                }) : "",
            ];
        });
    },
};

const SpdChart = {
    oninit: vnode => {
        vnode.state.width = getChartSize();
        vnode.state.height = getChartSize();
    },

    onbeforeupdate: vnode => {
        vnode.state.width = getChartSize();
        vnode.state.height = getChartSize();
    },

    view: vnode => {
        const center = [vnode.state.width/2, vnode.state.height/2];
        const maxSpeed = vnode.attrs.data.maxSpeed();
        const basicZoomRatio = (vnode.state.width / ((SPD_SCALE_CIRCLE_COUNT + 0.5) * 2)) * SPD_SCALE_CIRCLE_COUNT ;
        const zoomRatio = basicZoomRatio / Math.ceil(maxSpeed);
        const scaleStep = Math.ceil(maxSpeed) / SPD_SCALE_CIRCLE_COUNT;
        const recordCount = vnode.attrs.data.records().length;
        const scaleTexts = [];
        const colorScaleY1 = (vnode.state.height / 2) + 10;
        const colorScaleY2 = (vnode.state.height / 2) - 20;
        let spdUnit = Unit.WindspeedUnitEnum.M_PER_SEC;
        if(Setting.getWindSpeedAsKmPerHour()) {
            spdUnit = Unit.WindspeedUnitEnum.KM_PER_HOUR;
        }
        else if(Setting.getWindSpeedAsKt()) {
            spdUnit = Unit.WindspeedUnitEnum.KT;
        }
        for(let i=1; i<=SPD_SCALE_CIRCLE_COUNT; ++i) {
            let label = "";
            const spd = scaleStep * i;
            switch(spdUnit) {
                case Unit.WindspeedUnitEnum.M_PER_SEC:
                    label = agh.sprintf("%.1f [m/s]", spd);
                    break;
                case Unit.WindspeedUnitEnum.KM_PER_HOUR:
                    label = agh.sprintf("%.1f [km/h]", Unit.conv_m_s_to_km_h(spd));
                    break;
                case Unit.WindspeedUnitEnum.KT:
                    label = agh.sprintf("%.1f [kt]", Unit.conv_m_s_to_kt(spd));
                    break;
            }

            scaleTexts.push({
                label: label,
                x: center[0] + 5,
                y: center[1] + ((vnode.state.height / 2) / (SPD_SCALE_CIRCLE_COUNT + 0.5)) * i + 10,
            });
        }

        return m(".spd-chart-wrapper.is-flex-shrink-1", {
            class: !Setting.isSpdChartMode() ? "is-hidden-mobile" : "",
        }, [
            m(BasicChart, {
                width: vnode.state.width,
                height: vnode.state.height,
                count: SPD_SCALE_CIRCLE_COUNT,
            }, [
                scaleTexts.map(v => {
                    return m(SvgText, {
                        class: "scale-text",
                        x: v.x,
                        y: v.y,
                    }, v.label);
                }),
                m(SvgText, {
                    class: "date-text",
                    x: 10,
                    y: 20,
                }, [
                    vnode.attrs.data.finished ? i18next.t("finished") : i18next.t("updated"),
                    " ",
                    vnode.attrs.data.updatedAt ? agh.sprintf("%02d:%02d", vnode.attrs.data.updatedAt.getHours(), vnode.attrs.data.updatedAt.getMinutes()) : "",
                ]),
                vnode.attrs.data.records().map((record, idx) => {
                    const spd = record.getWindSpeedForChart();
                    let heading = record.getWindHeadingForChart();
                    if(Setting.getSpdChartShowFrom()) {
                        heading += 180;
                    }
                    return m(SvgLine, {
                        class: "chart-line",
                        stroke: SpdChart.strokeColor(recordCount - idx, recordCount),
                        from: center,
                        to: [center[0] + Math.cos(Unit.degToRad(heading - 90)) * spd * zoomRatio ,
                                center[1] + Math.sin(Unit.degToRad(heading - 90)) * spd * zoomRatio ],
                        onclick: e => {
                            const directionLabel = Setting.getSpdChartShowFrom() ? i18next.t("btnFrom") : i18next.t("btnTo");
                            const msg = agh.sprintf("Height: %dm  %s: %d°  Spd: %.1fm/s", record.getHeightAsMeter(), directionLabel, heading, spd);
                            alert(msg);
                        }
                    });
                }),
                // height color scale
                m("defs", [ // gradient color definition
                    SpdChart.spdColorGradientScale(),
                ]),
                m("rect", { // color bar
                    class: "spd-color-scale",
                    fill: "url(#spd-color-scale)",
                    x: SPD_COLOR_SCALE_X_OFFSET,
                    y: colorScaleY1,
                    width: SPD_COLOR_SCALE_WIDTH,
                    height: colorScaleY2,
                }),
                m(SvgText, { // min height text
                    x: SPD_COLOR_SCALE_X_OFFSET + SPD_COLOR_SCALE_WIDTH,
                    y: colorScaleY1 + colorScaleY2 + 5,
                    class: "scale-text",
                }, [vnode.attrs.data.minHeight(), "m"]),
                m(SvgText, { // max height text
                    x: SPD_COLOR_SCALE_X_OFFSET + SPD_COLOR_SCALE_WIDTH,
                    y: colorScaleY1 + 5,
                    class: "scale-text",
                }, [vnode.attrs.data.maxHeight(), "m"]),
            ]),
            // From / To button
            m("button.button.is-dark.is-small.from-to-button", {
                onclick: e => {
                    Setting.setSpdChartShowFrom(!Setting.getSpdChartShowFrom());
                }
            }, Setting.getSpdChartShowFrom() ? i18next.t("btnFrom") : i18next.t("btnTo")),
            m(ChartMapLinkView, {data: vnode.attrs.data}),
            m(ChartLocationLabelView, {data: vnode.attrs.data}),
        ]);
    },

    // make stroke color for SpdChart by HSL color
    strokeColor: (idx, count) => {
        const x = (idx - 1)  / (count - 1);
        let h = SPD_COLOR_MIN_H + (SPD_COLOR_MAX_H - SPD_COLOR_MIN_H) * x;
        if(h < 0) {
            h += 360;
        }
        const s = "100%";
        const l = "50%";
        const color = `hsl(${h}, ${s}, ${l})`;
        return color;
    },

    // make SpdChart color scale gradation
    spdColorGradientScale: () => {
        const stopColorsCount = 10;
        const stopColors = [];
        for(let i=0; i<=stopColorsCount; ++i){
            const h = SPD_COLOR_MIN_H + ((SPD_COLOR_MAX_H - SPD_COLOR_MIN_H) / stopColorsCount) * i;
            stopColors[i] = [(i / stopColorsCount) * 100, `hsl(${h},100%,50%)`];
        }
        return m("linearGradient#spd-color-scale[x1=0][x2=0][y1=0][y2=1]", [
            stopColors.map(v => {
                return m(`stop[offset=${v[0]}%][stop-color=${v[1]}]`);
            }),
        ]);
    },
};

const ChartMapLinkView = {
    view: vnode => {
        return m(".map-link", [
            m("a[target=_blank]", {
                href: vnode.attrs.data.mapUrl(),
            }, [
                m("span.icon", m(UI.MapIcon)),
                " ",
                i18next.t("map")
            ]),
        ]);
    },
};

const ChartLocationLabelView = {
    view: vnode => {
        return m(".location-label", vnode.attrs.data.locationLabel());
    },
};

export {DstChart, SpdChart};