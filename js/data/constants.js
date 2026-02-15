// 기본 해상도 (이 기준으로 스케일링)
export const BASE_WIDTH = 800;
export const BASE_HEIGHT = 600;

// 물리
export const GRAVITY = 1200;
export const GROUND_RATIO = 0.83; // 바닥 위치 비율 (캔버스 높이 대비)

// 플레이어
export const PLAYER_SPEED = 250;
export const PLAYER_JUMP_FORCE = -500;
export const PLAYER_HP = 5;
export const PLAYER_WIDTH = 40;
export const PLAYER_HEIGHT = 50;
export const PLAYER_INVINCIBLE_TIME = 1.5;

// 물총알 (기본)
export const BULLET_SPEED = 500;
export const BULLET_DAMAGE = 1;
export const BULLET_WIDTH = 12;
export const BULLET_HEIGHT = 10;
export const SHOOT_COOLDOWN = 0.35;

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
    basic:  { hp: 3, speed: 80,  damage: 1, width: 36, height: 40, color: '#FF6B35' },
    fast:   { hp: 2, speed: 150, damage: 1, width: 30, height: 34, color: '#FFA500' },
    tank:   { hp: 7, speed: 45,  damage: 2, width: 48, height: 52, color: '#D32F2F' },
    flying: { hp: 2, speed: 100, damage: 1, width: 32, height: 28, color: '#FF8F00', flying: true },
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
