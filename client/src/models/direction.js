const Direction = {
    DirectionEnum: {
        TO: 1,
        FROM: 2,
    },

    validDirection: d => {
        return d == Direction.DirectionEnum.TO || d == Direction.DirectionEnum.FROM;
    },

    MagDeclinationEnum: {
        // 偏角
        TRUE: 1, // 真方位
        MAG: 2, // 磁方位
    },

    validMagDeclination: d => {
        return d == Direction.MagDeclinationEnum.TRUE || d == Direction.MagDeclinationEnum.MAG;
    },

    DIRECTION_BG_COLOR_L_VALUE: 85,

    directionBackgroundColor: d => {
        const hslColor = `hsl(${d}, 100%, ${Direction.DIRECTION_BG_COLOR_L_VALUE}%)`;
        return hslColor;
    },

};

export default Direction;