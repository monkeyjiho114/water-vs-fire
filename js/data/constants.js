// 기본 해상도 (이 기준으로 스케일링)
export const BASE_WIDTH = 800;
export const BASE_HEIGHT = 600;

// 물리
export const GRAVITY = 1200;
export const GROUND_RATIO = 0.83; // 바닥 위치 비율 (캔버스 높이 대비)

// 플레이어
export const PLAYER_SPEED = 270;
export const PLAYER_JUMP_FORCE = -520;
export const PLAYER_HP = 6;
export const PLAYER_WIDTH = 40;
export const PLAYER_HEIGHT = 50;
export const PLAYER_INVINCIBLE_TIME = 1.5;

// 물총알 (기본)
export const BULLET_SPEED = 550;
export const BULLET_DAMAGE = 1;
export const BULLET_WIDTH = 12;
export const BULLET_HEIGHT = 10;
export const SHOOT_COOLDOWN = 0.28;

// 얼리기 특수능력
export const FREEZE_COOLDOWN = 15;
export const FREEZE_DURATION = 3;

// 물대포 (완성 후)
export const CANNON_DAMAGE = 4;
export const CANNON_BULLET_WIDTH = 24;
export const CANNON_BULLET_HEIGHT = 20;
export const CANNON_SHOOT_COOLDOWN = 0.3;

// 불 몬스터
export const MONSTER_TYPES = {
    basic:    { hp: 3, speed: 80,  damage: 1, width: 36, height: 40, color: '#FF6B35' },
    fast:     { hp: 2, speed: 150, damage: 1, width: 30, height: 34, color: '#FFA500' },
    tank:     { hp: 8, speed: 45,  damage: 2, width: 48, height: 52, color: '#D32F2F' },
    flying:   { hp: 2, speed: 100, damage: 1, width: 32, height: 28, color: '#FF8F00', flying: true },
    // 새 타입: 슈터 — 멀리서 화염구 발사
    shooter:  { hp: 4, speed: 50,  damage: 1, width: 38, height: 42, color: '#E91E63', shooter: true, shootRange: 280, shootCooldown: 2.5 },
    // 새 타입: 폭발형 — 빠르게 돌진 후 사망 시 폭발
    exploder: { hp: 2, speed: 130, damage: 2, width: 34, height: 38, color: '#7B1FA2', exploder: true, explodeRadius: 60, explodeDmg: 2 },
    // 새 타입: 차저 — 평소 느리지만 주기적으로 빠르게 돌진
    charger:  { hp: 5, speed: 60,  damage: 2, width: 40, height: 44, color: '#5D4037', charger: true, chargeSpeed: 280, chargeInterval: 3 },
};

// 보스
export const BOSS_HP = 40;
export const BOSS_WIDTH = 120;
export const BOSS_HEIGHT = 130;
export const BOSS_SPEED = 40;

// 집
export const HOUSE_HP = 100;
export const HOUSE_WIDTH = 70;
export const HOUSE_HEIGHT = 80;

// 강화 물총 (어려움 전용 파워업)
export const POWERUP_DURATION = 5;
export const POWERUP_DAMAGE = 3;
export const POWERUP_BULLET_WIDTH = 18;
export const POWERUP_BULLET_HEIGHT = 14;
export const POWERUP_SHOOT_COOLDOWN = 0.2;
export const POWERUP_SIZE = 24;
export const POWERUP_DROP_CHANCE = 0.15; // 적 처치 시 15% 확률
export const POWERUP_MAX_PER_GAME = 2;

// 차지 샷 (Z 길게 누르기)
export const CHARGE_TIME_FULL = 0.9; // 0.9초 차지
export const CHARGE_DAMAGE_MUL = 4; // 풀차지 시 4배 데미지
export const CHARGE_BULLET_WIDTH = 30;
export const CHARGE_BULLET_HEIGHT = 24;
export const CHARGE_BULLET_SPEED = 700;

// 크리티컬 히트
export const CRIT_CHANCE = 0.18; // 18% 확률
export const CRIT_DAMAGE_MUL = 2;

// 회복 아이템 (피격 시 일정 확률 드롭)
export const HEAL_DROP_CHANCE = 0.07; // 7% 확률
export const HEAL_AMOUNT = 1;
export const HEAL_SIZE = 22;
export const HEAL_LIFETIME = 10;

// Final Stand (집 HP 30% 이하)
export const FINAL_STAND_THRESHOLD = 0.3;
export const FINAL_STAND_DAMAGE_MUL = 1.6;

// 악당 성
export const ENEMY_CASTLE_HP = 30;
export const ENEMY_CASTLE_WIDTH = 60;
export const ENEMY_CASTLE_HEIGHT = 80;

// 재료 아이템
export const MATERIAL_SIZE = 32;
export const MATERIAL_NAMES = ['물대포 몸통', '압축 펌프', '물탱크', '발사 노즐'];
export const TOTAL_MATERIALS = 4;

// 색상 팔레트
export const COLORS = {
    waterLight: '#B3E5FC',
    waterMid: '#4FC3F7',
    waterDark: '#0288D1',
    fireYellow: '#FFEB3B',
    fireOrange: '#FF6B35',
    fireRed: '#D32F2F',
    sky: '#87CEEB',
    skyDark: '#1565C0',
    grass: '#4CAF50',
    grassDark: '#388E3C',
    ground: '#8D6E63',
    white: '#FFFFFF',
    black: '#333333',
    gold: '#FFD700',
    iceLight: '#E0F7FA',
    iceMid: '#80DEEA',
    hpGreen: '#66BB6A',
    hpRed: '#EF5350',
};

// 난이도
export const DIFFICULTY_KEYS = ['easy', 'normal', 'hard'];
export const DIFFICULTIES = {
    easy:   { label: '쉬움',   enemyHpMul: 0.7, enemySpeedMul: 0.8, enemyDmgMul: 0.8, houseHpMul: 1.3, freezeEnabled: false, coins: 1 },
    normal: { label: '보통',   enemyHpMul: 1.0, enemySpeedMul: 1.0, enemyDmgMul: 1.0, houseHpMul: 1.0, freezeEnabled: false, coins: 2 },
    hard:   { label: '어려움', enemyHpMul: 1.5, enemySpeedMul: 1.3, enemyDmgMul: 1.5, houseHpMul: 0.8, freezeEnabled: true,  coins: 3 },
};

// 스킨
export const BODY_SKINS = [
    { id: 'default',  name: '기본 물방울',   price: 0, colors: ['#E1F5FE', '#4FC3F7', '#0288D1'], shape: 'default' },
    { id: 'red',      name: '불꽃 물방울',   price: 3, colors: ['#FFCDD2', '#EF5350', '#C62828'], shape: 'default' },
    { id: 'green',    name: '독 물방울',     price: 3, colors: ['#C8E6C9', '#66BB6A', '#2E7D32'], shape: 'default' },
    { id: 'purple',   name: '마법 물방울',   price: 4, colors: ['#E1BEE7', '#AB47BC', '#6A1B9A'], shape: 'default' },
    { id: 'gold',     name: '황금 물방울',   price: 5, colors: ['#FFF8E1', '#FFD54F', '#FF8F00'], shape: 'default' },
    { id: 'snow',     name: '눈송이',        price: 6, colors: ['#FFFFFF', '#B3E5FC', '#4FC3F7'], shape: 'snowflake' },
    { id: 'slime',    name: '슬라임',        price: 7, colors: ['#C8E6C9', '#81C784', '#388E3C'], shape: 'slime' },
    { id: 'star',     name: '별똥별',        price: 8, colors: ['#FFF9C4', '#FFEE58', '#F9A825'], shape: 'star' },
];

export const BULLET_SKINS = [
    { id: 'default',  name: '기본 물총알',   price: 0, color: '#4FC3F7' },
    { id: 'pink',     name: '핑크 버블',     price: 3, color: '#F48FB1' },
    { id: 'green',    name: '독액',          price: 3, color: '#81C784' },
    { id: 'orange',   name: '용암탄',        price: 4, color: '#FF8A65' },
    { id: 'gold',     name: '황금탄',        price: 5, color: '#FFD54F' },
    { id: 'rainbow',  name: '무지개탄',      price: 8, color: 'rainbow' },
];

// 게임 상태
export const STATES = {
    MENU: 'MENU',
    TUTORIAL: 'TUTORIAL',
    PLAYING: 'PLAYING',
    STAGE_CLEAR: 'STAGE_CLEAR',
    CANNON_COMPLETE: 'CANNON_COMPLETE',
    BOSS_INTRO: 'BOSS_INTRO',
    GAME_OVER: 'GAME_OVER',
    WIN: 'WIN',
    PAUSED: 'PAUSED',
    SHOP: 'SHOP',
    CONFIRM_QUIT: 'CONFIRM_QUIT',
};
