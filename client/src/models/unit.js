const Unit = {
    degToRad:(v) => {
        return Math.PI * 2 * v / 360;
    },    

    WindspeedUnitEnum: {
        // 風速の単位
        NONE: 0, // 非表示
        M_PER_SEC: 1, // [m/s]
        KM_PER_HOUR: 2, // [km/h]
        KT: 3, // [kt]
    },

    validWindspeedUnit: u => {
        return u == WindspeedUnitEnum.NONE || u == WindspeedUnitEnum.M_PER_SEC || u == WindspeedUnitEnum.KM_PER_HOUR || u == WindspeedUnitEnum.KT;
    },

    conv_m_s_to_kt: v => {
        return v * 1.9438
    },

    conv_m_s_to_km_h: v => {
        return v * 3600.0 / 1000.0;
    },

    windspeedUnitText: u => {
        switch(u) {
            case Unit.WindspeedUnitEnum.M_PER_SEC:
                return "m/s";
                break;
            case Unit.WindspeedUnitEnum.KM_PER_HOUR:
                return "km/h";
            case Unit.WindspeedUnitEnum.KT:
                return "kt";
            default:
                return "";
        }
    },

    AltitudeUnitEnum: {
        // 高度の単位
        NONE: 0, // 非表示
        M: 1, // [m]
        FT: 2, // [ft]
    },

    validAltitudeUnit: u => {
        return u == AltitudeUnitEnum.NONE || u ==  AltitudeUnitEnum.M || u == AltitudeUnitEnum.FT;
    },

    conv_ft_to_m: v => {
        return v * 0.3048;
    },

    conv_m_to_ft: v => {
        return v / 0.3048;
    },

    altitudeUnitText: u => {
        switch(u) {
            case Unit.AltitudeUnitEnum.M:
                return "m";
                break;
            case Unit.AltitudeUnitEnum.FT:
                return "ft";
                break;
            default:
                return "";
        }
    },

    TemperatureUnitEnum: {
        // 気温の単位
        NONE: 0, // 非表示
        CELSIUS: 1, // ℃
    },

    validTemperatureUnit: u => {
        return u == TemperatureUnitEnum.NONE || u == TemperatureUnitEnum.CELSIUS;
    },
};

export default Unit;