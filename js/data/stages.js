export const STAGES = [
    {
        id: 1,
        name: '마을 입구',
        background: 'village',
        materialIndex: 0, // 물대포 몸통
        waves: [
            { enemies: [{ type: 'basic', count: 3 }], delay: 0 },
            { enemies: [{ type: 'basic', count: 4 }], delay: 10 },
            { enemies: [{ type: 'basic', count: 5 }], delay: 20 },
        ],
        houseHp: 120,
        castleHp: 30,
        // 어려움 추가 웨이브
        hardWaves: [
            { enemies: [{ type: 'flying', count: 2 }], delay: 15 },
        ],
    },
    {
        id: 2,
        name: '숲 속 마을',
        background: 'forest',
        materialIndex: 1, // 압축 펌프
        waves: [
            { enemies: [{ type: 'basic', count: 3 }, { type: 'fast', count: 2 }], delay: 0 },
            { enemies: [{ type: 'fast', count: 4 }], delay: 12 },
            { enemies: [{ type: 'basic', count: 3 }, { type: 'fast', count: 3 }], delay: 22 },
        ],
        houseHp: 120,
        castleHp: 35,
        hardWaves: [
            { enemies: [{ type: 'flying', count: 3 }], delay: 8 },
            { enemies: [{ type: 'flying', count: 2 }], delay: 18 },
        ],
    },
    {
        id: 3,
        name: '언덕 위 마을',
        background: 'hill',
        materialIndex: 2, // 물탱크
        waves: [
            { enemies: [{ type: 'basic', count: 4 }, { type: 'fast', count: 2 }], delay: 0 },
            { enemies: [{ type: 'tank', count: 2 }], delay: 12 },
            { enemies: [{ type: 'basic', count: 3 }, { type: 'fast', count: 2 }, { type: 'tank', count: 1 }], delay: 22 },
        ],
        houseHp: 110,
        castleHp: 40,
        hardWaves: [
            { enemies: [{ type: 'flying', count: 3 }], delay: 6 },
            { enemies: [{ type: 'flying', count: 2 }, { type: 'fast', count: 2 }], delay: 16 },
        ],
    },
    {
        id: 4,
        name: '강가 마을',
        background: 'river',
        materialIndex: 3, // 발사 노즐
        waves: [
            { enemies: [{ type: 'fast', count: 4 }, { type: 'tank', count: 1 }], delay: 0 },
            { enemies: [{ type: 'basic', count: 5 }, { type: 'fast', count: 3 }], delay: 12 },
            { enemies: [{ type: 'tank', count: 2 }, { type: 'fast', count: 3 }], delay: 24 },
        ],
        houseHp: 100,
        castleHp: 45,
        hardWaves: [
            { enemies: [{ type: 'flying', count: 4 }], delay: 5 },
            { enemies: [{ type: 'flying', count: 3 }, { type: 'tank', count: 1 }], delay: 18 },
        ],
    },
    {
        id: 5,
        name: '불의 성',
        background: 'castle',
        isBossStage: true,
        waves: [
            { enemies: [{ type: 'basic', count: 3 }, { type: 'fast', count: 2 }], delay: 0 },
            { enemies: [{ type: 'tank', count: 2 }], delay: 10 },
            // 보스는 StageManager에서 별도 스폰
        ],
        bossDelay: 20,
        houseHp: 150,
        hardWaves: [
            { enemies: [{ type: 'flying', count: 3 }], delay: 5 },
        ],
    },
];
