import m from "mithril";

const DEFAULT_CHART_WIDTH = 350;
const DEFAULT_CHART_HEIGHT = 350;
const SCALE_CIRCLE_COUNT = 4.5;
const MARKER_RADIUS = 4;

const SvgLine = {
    view: vnode => {
        return m("line", {
            class: vnode.attrs.class,
            id: vnode.attrs.id,
            x1: vnode.attrs.from[0],
            y1: vnode.attrs.from[1],
            x2: vnode.attrs.to[0],
            y2: vnode.attrs.to[1],
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
        });
    }
};

const SvgMarker = {
    view: vnode => {
        return m("circle", {
            class: "marker",
            id: vnode.attrs.id,
            cx: vnode.attrs.pos[0],
            cy: vnode.attrs.pos[1],
            r: MARKER_RADIUS,
        });
    }
};

const BasicChartAxises = {
    view: vnode => {
        const w = vnode.attrs.width;
        const h = vnode.attrs.height;
        return [
            m(SvgLine, {
                class: "axis",
                from: [w/2, 0],
                to: [w/2, h],
            }),
            m(SvgLine, {
                class: "axis",
                from: [0, h/2],
                to: [w, h/2],
            }),
            m(SvgLine, {
                class: "axis",
                from: [0, 0],
                to: [w, h],
            }),
            m(SvgLine, {
                class: "axis",
                from: [0, h],
                to: [w, 0],
            }),
        ];
    }
};

const BasicChartScales = {
    view: vnode => {
        const rStep = (vnode.attrs.width/2) / SCALE_CIRCLE_COUNT;
        const center = [vnode.attrs.width/2, vnode.attrs.height/2];
        const circles = [];
        for(let i=1; i<SCALE_CIRCLE_COUNT; ++i) {
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
    oninit: vnode => {
        vnode.state.width = DEFAULT_CHART_WIDTH;
        vnode.state.height = DEFAULT_CHART_HEIGHT;
    },

    view: vnode => {
        const w = vnode.state.width;
        const h = vnode.state.height;
        return m("svg.chart", {
            width: vnode.state.width,
            height: vnode.state.height,
            class: vnode.attrs.class,
        }, [
            m(BasicChartAxises, {width: w, height: h}),
            m(BasicChartScales, {width: w, height: h}),
            vnode.children,
        ]);
    },
};

const DstChart = {
    view: vnode => {
        return m(BasicChart, {

        }, [
            
        ]);
    }
};

const SpdChart = {
    view: vnode => {
        return m(BasicChart, {
            class: "is-hidden-mobile"
        }, [
            
        ]);
    }
};

export {DstChart, SpdChart};