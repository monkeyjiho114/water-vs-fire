import { Entity } from './Entity.js';
import {
    BULLET_SPEED, BULLET_DAMAGE, BULLET_WIDTH, BULLET_HEIGHT,
    CANNON_DAMAGE, CANNON_BULLET_WIDTH, CANNON_BULLET_HEIGHT,
    POWERUP_DAMAGE, POWERUP_BULLET_WIDTH, POWERUP_BULLET_HEIGHT,
    CHARGE_DAMAGE_MUL, CHARGE_BULLET_WIDTH, CHARGE_BULLET_HEIGHT, CHARGE_BULLET_SPEED,
    BASE_WIDTH,
} from '../data/constants.js';

export class WaterBullet extends Entity {
    constructor(x, y, goingRight, isCannon, isPowerShot, chargeRatio = 0) {
        // 차지 샷이면 크기 조정
        const isCharge = chargeRatio >= 0.5;
        let w, h;
        if (isPowerShot) {
            w = POWERUP_BULLET_WIDTH;
            h = POWERUP_BULLET_HEIGHT;
        } else if (isCharge) {
            w = CHARGE_BULLET_WIDTH;
            h = CHARGE_BULLET_HEIGHT;
        } else if (isCannon) {
            w = CANNON_BULLET_WIDTH;
            h = CANNON_BULLET_HEIGHT;
        } else {
            w = BULLET_WIDTH;
            h = BULLET_HEIGHT;
        }
        super(x - w / 2, y - h / 2, w, h);

        this.isCannon = isCannon;
        this.isPowerShot = isPowerShot;
        this.isCharge = isCharge;
        this.chargeRatio = chargeRatio;
        // 차지 샷은 관통 가능 (풀차지 시 최대 3마리)
        this.pierce = isCharge ? Math.floor(1 + chargeRatio * 2) : 0;
        this.hitCount = 0;

        if (isPowerShot) {
            this.damage = POWERUP_DAMAGE;
        } else if (isCharge) {
            // 0.5 차지: 2배, 풀 차지: 4배
            const baseDmg = isCannon ? CANNON_DAMAGE : BULLET_DAMAGE;
            this.damage = Math.ceil(baseDmg * (1 + chargeRatio * (CHARGE_DAMAGE_MUL - 1)));
        } else if (isCannon) {
            this.damage = CANNON_DAMAGE;
        } else {
            this.damage = BULLET_DAMAGE;
        }

        // 크리티컬 (Player의 _shoot에서 설정 가능)
        this.isCritical = false;

        const speed = isCharge ? CHARGE_BULLET_SPEED : BULLET_SPEED;
        this.vx = goingRight ? speed : -speed;
        this.lifetime = 2;

        // 트레일
        this.trail = [];
        this.trailMax = isCharge ? 12 : (isPowerShot ? 8 : isCannon ? 6 : 4);
    }

    update(dt) {
        // 트레일 기록
        this.trail.push({ x: this.cx, y: this.cy });
        if (this.trail.length > this.trailMax) {
            this.trail.shift();
        }

        super.update(dt);
        this.lifetime -= dt;
        if (this.lifetime <= 0 || this.x < -50 || this.x > BASE_WIDTH + 50) {
            this.active = false;
        }
    }

    // 충돌 시 호출 — 관통이 남아있으면 active 유지
    onHit() {
        this.hitCount++;
        if (this.hitCount > this.pierce) {
            this.active = false;
            return false; // 비활성화됨
        }
        return true; // 살아남음
    }
}
