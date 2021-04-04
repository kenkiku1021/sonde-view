const Direction = {
    DirectionEnum: {
        TO: 1,
        FROM: 2,
    },

    validDirection: d => {
        return d == DirectionEnum.TO || d == DirectionEnum.FROM;
    },

    MagDeclinationEnum: {
        // 偏角
        TRUE: 1, // 真方位
        MAG: 2, // 磁方位
    },

    validMagDeclination: d => {
        return d == MagDeclinationEnum.TRUE || d == MagDeclinationEnum.MAG;
    },
};

export default Direction;