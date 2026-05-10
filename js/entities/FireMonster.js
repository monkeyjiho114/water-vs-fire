import { Entity } from './Entity.js';
import { MONSTER_TYPES } from '../data/constants.js';

export class FireMonster extends Entity {
    constructor(x, y, type, diffMul) {
        const info = MONSTER_TYPES[type] || MONSTER_TYPES.basic;
        super(x, y, info.width, info.height);
        this.type = type;
        this.info = info;
        this.isFlying = !!info.flying;
        this.isShooter = !!info.shooter;
        this.isExploder = !!info.exploder;
        this.isCharger = !!info.charger;

        // 난이도 배율 적용
        const mul = diffMul || { enemyHpMul: 1, enemySpeedMul: 1, enemyDmgMul: 1 };
        this.maxHp = Math.ceil(info.hp * mul.enemyHpMul);
        this.hp = this.maxHp;
        this.baseSpeed = info.speed * mul.enemySpeedMul;
        this.speed = this.baseSpeed;
        this.damage = Math.ceil(info.damage * mul.enemyDmgMul);
        this.color = info.color;

        this.state = 'approaching'; // approaching, attacking, stunned, charging, shooting
        this.stunTimer = 0;
        this.attackCooldown = 0;
        this.attackRate = 1.5;
        this.targetX = 0; // 집 위치
        this.time = 0;
        this.hitFlash = 0;
        this.frozen = false;
        this.frozenTimer = 0;

        // 공격 애니메이션
        this.attackAnim = 0;

        // 슈터 전용
        if (this.isShooter) {
            this.shootRange = info.shootRange;
            this.shootCooldownTimer = 1 + Math.random() * 2;
            this.fireballs = []; // 적이 발사하는 화염구
        }

        // 차저 전용
        if (this.isCharger) {
            this.chargeSpeed = info.chargeSpeed * mul.enemySpeedMul;
            this.chargeTimer = info.chargeInterval + Math.random();
            this.chargeDuration = 0; // 돌진 중인 시간
        }

        // 폭발형 전용
        if (this.isExploder) {
            this.explodeRadius = info.explodeRadius;
            this.explodeDmg = Math.ceil(info.explodeDmg * mul.enemyDmgMul);
        }

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

        // 슈터: 화염구는 얼려도 계속 날아감
        if (this.fireballs) {
            for (const fb of this.fireballs) {
                fb.x += fb.vx * dt;
                fb.y += fb.vy * dt;
                fb.lifetime -= dt;
                if (fb.lifetime <= 0 || fb.x < -50 || fb.x > 900 || fb.y > 700) fb.active = false;
            }
            this.fireballs = this.fireballs.filter(fb => fb.active);
        }

        // 얼림 상태
        if (this.frozen) {
            this.frozenTimer -= dt;
            if (this.frozenTimer <= 0) this.frozen = false;
            return;
        }

        // 슈터: 사거리 내에 있으면 멈춰서 발사
        if (this.isShooter) {
            const distToTarget = Math.abs(this.cx - (this.targetX + 60));
            if (distToTarget < this.shootRange && this.x > this.targetX + 100) {
                this.state = 'shooting';
                this.vx = 0;
                this.shootCooldownTimer -= dt;
                if (this.shootCooldownTimer <= 0) {
                    this._fireProjectile();
                    this.shootCooldownTimer = this.info.shootCooldown;
                }
                if (this.attackAnim > 0) this.attackAnim -= dt;
                super.update(dt);
                if (this.isFlying) this.y = this.flyBaseY + Math.sin(this.time * 3 + this.flyPhase) * 20;
                return;
            }
        }

        // 차저: 주기적으로 돌진
        if (this.isCharger) {
            if (this.chargeDuration > 0) {
                this.chargeDuration -= dt;
                this.speed = this.chargeSpeed;
                if (this.chargeDuration <= 0) {
                    this.speed = this.baseSpeed;
                }
            } else {
                this.chargeTimer -= dt;
                if (this.chargeTimer <= 0) {
                    this.chargeDuration = 1.0; // 1초간 돌진
                    this.chargeTimer = this.info.chargeInterval + Math.random() * 1.5;
                }
            }
        }

        switch (this.state) {
            case 'approaching':
            case 'shooting':
                this.vx = -this.speed;
                if (this.x <= this.targetX + 60) {
                    this.state = 'attacking';
                    this.vx = 0;
                }
                break;

            case 'attacking':
                this.vx = 0;
                this.attackCooldown -= dt;
                if (this.attackAnim > 0) this.attackAnim -= dt;
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

        if (this.isFlying) {
            this.y = this.flyBaseY + Math.sin(this.time * 3 + this.flyPhase) * 20;
        }
    }

    _fireProjectile() {
        if (!this.fireballs) this.fireballs = [];
        const speed = 280;
        // 집 방향(왼쪽)으로 발사
        this.fireballs.push({
            x: this.x,
            y: this.cy,
            vx: -speed,
            vy: 0,
            width: 14,
            height: 14,
            damage: 1,
            lifetime: 4,
            active: true,
        });
        this.attackAnim = 0.3;
    }

    takeDamage(amount) {
        this.hp -= amount;
        this.hitFlash = 0.15;
        // 차저는 돌진 중에는 스턴 안 됨
        if (!this.isCharger || this.chargeDuration <= 0) {
            this.state = 'stunned';
            this.stunTimer = 0.3;
        }
        if (this.hp <= 0) {
            this.active = false;
        }
    }

    canAttack() {
        if (this.frozen) return false;
        if (this.state !== 'attacking') return false;
        if (this.attackCooldown > 0) return false;
        this.attackCooldown = this.attackRate;
        this.attackAnim = 0.4;
        return true;
    }

    draw(ctx, sprite, groundY) {
        // 그림자
        if (groundY !== undefined) {
            const heightAboveGround = groundY - (this.y + this.height);
            const shadowAlpha = Math.max(0.05, 0.22 - heightAboveGround * 0.001);
            const shadowScale = Math.max(0.4, 1 - heightAboveGround * 0.003);
            sprite.drawShadow(ctx, this.cx, groundY, this.width * shadowScale, shadowAlpha);
        }

        // 차저 돌진 중에는 잔상 효과
        if (this.isCharger && this.chargeDuration > 0) {
            ctx.save();
            ctx.globalAlpha = 0.4;
            sprite.drawFireMonster(ctx, this.x + 15, this.y, this.width, this.height, this.type, this.time, false, false, false, 0);
            ctx.globalAlpha = 0.6;
            sprite.drawFireMonster(ctx, this.x + 7, this.y, this.width, this.height, this.type, this.time, false, false, false, 0);
            ctx.restore();
        }

        sprite.drawFireMonster(ctx, this.x, this.y, this.width, this.height, this.type, this.time, this.hitFlash > 0, this.frozen, this.isFlying, this.attackAnim);

        // 적이 발사하는 화염구
        if (this.fireballs) {
            for (const fb of this.fireballs) {
                sprite.drawFireball(ctx, fb.x, fb.y, fb.width / 2 + 2);
            }
        }
    }
}
