import { Entity } from './Entity.js';
import { MONSTER_TYPES } from '../data/constants.js';

export class FireMonster extends Entity {
    constructor(x, y, type, diffMul) {
        const info = MONSTER_TYPES[type] || MONSTER_TYPES.basic;
        super(x, y, info.width, info.height);
        this.type = type;
        this.info = info;
        this.isFlying = !!info.flying;

        // 난이도 배율 적용
        const mul = diffMul || { enemyHpMul: 1, enemySpeedMul: 1, enemyDmgMul: 1 };
        this.maxHp = Math.ceil(info.hp * mul.enemyHpMul);
        this.hp = this.maxHp;
        this.speed = info.speed * mul.enemySpeedMul;
        this.damage = Math.ceil(info.damage * mul.enemyDmgMul);
        this.color = info.color;

        this.state = 'approaching'; // approaching, attacking, stunned
        this.stunTimer = 0;
        this.attackCooldown = 0;
        this.attackRate = 1.5;
        this.targetX = 0; // 집 위치
        this.time = 0;
        this.hitFlash = 0;
        this.frozen = false;
        this.frozenTimer = 0;

        // flying 전용: 높이 흔들림
        if (this.isFlying) {
            this.flyBaseY = y;
            this.flyPhase = Math.random() * Math.PI * 2;
        }
    }

    setTarget(houseX) {
        this.targetX = houseX;
    }

    freeze(duration) {
        this.frozen = true;
        this.frozenTimer = duration;
    }

    update(dt) {
        this.time += dt;
        if (this.hitFlash > 0) this.hitFlash -= dt;

        // 얼림 상태
        if (this.frozen) {
            this.frozenTimer -= dt;
            if (this.frozenTimer <= 0) {
                this.frozen = false;
            }
            return; // 얼려진 동안 행동 없음
        }

        switch (this.state) {
            case 'approaching':
                this.vx = -this.speed;
                if (this.x <= this.targetX + 60) {
                    this.state = 'attacking';
                    this.vx = 0;
                }
                break;

            case 'attacking':
                this.vx = 0;
                this.attackCooldown -= dt;
                break;

            case 'stunned':
                this.vx = 0;
                this.stunTimer -= dt;
                if (this.stunTimer <= 0) {
                    this.state = 'approaching';
                }
                break;
        }

        super.update(dt);

        // flying 위아래 흔들림
        if (this.isFlying) {
            this.y = this.flyBaseY + Math.sin(this.time * 3 + this.flyPhase) * 20;
        }
    }

    takeDamage(amount) {
        this.hp -= amount;
        this.hitFlash = 0.15;
        this.state = 'stunned';
        this.stunTimer = 0.3;
        if (this.hp <= 0) {
            this.active = false;
        }
    }

    canAttack() {
        if (this.frozen) return false;
        if (this.state !== 'attacking') return false;
        if (this.attackCooldown > 0) return false;
        this.attackCooldown = this.attackRate;
        return true;
    }

    draw(ctx, sprite) {
        sprite.drawFireMonster(ctx, this.x, this.y, this.width, this.height, this.type, this.time, this.hitFlash > 0, this.frozen, this.isFlying);
    }
}
