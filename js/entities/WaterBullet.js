import { Entity } from './Entity.js';
import {
    BULLET_SPEED, BULLET_DAMAGE, BULLET_WIDTH, BULLET_HEIGHT,
    CANNON_DAMAGE, CANNON_BULLET_WIDTH, CANNON_BULLET_HEIGHT,
    POWERUP_DAMAGE, POWERUP_BULLET_WIDTH, POWERUP_BULLET_HEIGHT,
    BASE_WIDTH,
} from '../data/constants.js';

export class WaterBullet extends Entity {
    constructor(x, y, goingRight, isCannon, isPowerShot) {
        let w, h;
        if (isPowerShot) {
            w = POWERUP_BULLET_WIDTH;
            h = POWERUP_BULLET_HEIGHT;
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

        if (isPowerShot) {
            this.damage = POWERUP_DAMAGE;
        } else if (isCannon) {
            this.damage = CANNON_DAMAGE;
        } else {
            this.damage = BULLET_DAMAGE;
        }

        this.vx = goingRight ? BULLET_SPEED : -BULLET_SPEED;
        this.lifetime = 2;

        // 트레일 (잔상)
        this.trail = [];
        this.trailMax = isPowerShot ? 8 : isCannon ? 6 : 4;
    }

    update(dt) {
        // 트레일 기록 (이전 위치)
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
}
