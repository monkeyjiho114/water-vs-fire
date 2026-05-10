export const STAGES = [
    {
        id: 1,
        name: '마을 입구',
        background: 'village',
        materialIndex: 0, // 물대포 몸통
        waves: [
            { enemies: [{ type: 'basic', count: 3 }], delay: 0 },
            { enemies: [{ type: 'basic', count: 3 }, { type: 'fast', count: 1 }], delay: 11 },
            { enemies: [{ type: 'basic', count: 4 }, { type: 'fast', count: 2 }], delay: 22 },
        ],
        houseHp: 120,
        castleHp: 30,
        hardWaves: [
            { enemies: [{ type: 'flying', count: 2 }], delay: 16 },
        ],
    },
    {
        id: 2,
        name: '숲 속 마을',
        background: 'forest',
        materialIndex: 1, // 압축 펌프
        waves: [
            { enemies: [{ type: 'basic', count: 3 }, { type: 'fast', count: 2 }], delay: 0 },
            { enemies: [{ type: 'fast', count: 3 }, { type: 'shooter', count: 1 }], delay: 12 },
            { enemies: [{ type: 'basic', count: 3 }, { type: 'fast', count: 2 }, { type: 'shooter', count: 2 }], delay: 24 },
        ],
        houseHp: 130,
        castleHp: 38,
        hardWaves: [
            { enemies: [{ type: 'flying', count: 2 }, { type: 'shooter', count: 1 }], delay: 8 },
            { enemies: [{ type: 'flying', count: 2 }, { type: 'exploder', count: 1 }], delay: 20 },
        ],
    },
    {
        id: 3,
        name: '언덕 위 마을',
        background: 'hill',
        materialIndex: 2, // 물탱크
        waves: [
            { enemies: [{ type: 'basic', count: 4 }, { type: 'exploder', count: 1 }], delay: 0 },
            { enemies: [{ type: 'tank', count: 1 }, { type: 'shooter', count: 2 }], delay: 12 },
            { enemies: [{ type: 'fast', count: 3 }, { type: 'exploder', count: 2 }, { type: 'tank', count: 1 }], delay: 24 },
        ],
        houseHp: 140,
        castleHp: 45,
        hardWaves: [
            { enemies: [{ type: 'flying', count: 3 }], delay: 6 },
            { enemies: [{ type: 'charger', count: 1 }, { type: 'flying', count: 2 }], delay: 18 },
        ],
    },
    {
        id: 4,
        name: '강가 마을',
        background: 'river',
        materialIndex: 3, // 발사 노즐
        waves: [
            { enemies: [{ type: 'fast', count: 3 }, { type: 'shooter', count: 2 }, { type: 'tank', count: 1 }], delay: 0 },
            { enemies: [{ type: 'charger', count: 1 }, { type: 'exploder', count: 2 }, { type: 'fast', count: 2 }], delay: 13 },
            { enemies: [{ type: 'tank', count: 2 }, { type: 'shooter', count: 2 }, { type: 'exploder', count: 1 }], delay: 26 },
        ],
        houseHp: 130,
        castleHp: 55,
        hardWaves: [
            { enemies: [{ type: 'flying', count: 3 }, { type: 'shooter', count: 1 }], delay: 5 },
            { enemies: [{ type: 'flying', count: 2 }, { type: 'charger', count: 1 }], delay: 19 },
        ],
    },
    {
        id: 5,
        name: '불의 성',
        background: 'castle',
        isBossStage: true,
        waves: [
            { enemies: [{ type: 'basic', count: 3 }, { type: 'shooter', count: 1 }], delay: 0 },
            { enemies: [{ type: 'tank', count: 1 }, { type: 'exploder', count: 2 }], delay: 11 },
        ],
        bossDelay: 22,
        houseHp: 180,
        hardWaves: [
            { enemies: [{ type: 'flying', count: 3 }, { type: 'charger', count: 1 }], delay: 6 },
        ],
    },
];
