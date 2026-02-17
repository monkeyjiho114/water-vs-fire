import { Entity } from './Entity.js';
import { BOSS_HP, BOSS_WIDTH, BOSS_HEIGHT, BOSS_SPEED, BASE_WIDTH } from '../data/constants.js';

export class BossMonster extends Entity {
    constructor(game, diffMul) {
        super(BASE_WIDTH + 50, game.groundY - BOSS_HEIGHT, BOSS_WIDTH, BOSS_HEIGHT);
        this.game = game;
        this.sound = null; // SoundManager 참조

        const mul = diffMul || { enemyHpMul: 1, enemySpeedMul: 1, enemyDmgMul: 1 };
        this.maxHp = Math.ceil(BOSS_HP * mul.enemyHpMul);
        this.hp = this.maxHp;
        this.speed = BOSS_SPEED * mul.enemySpeedMul;
        this.phase = 1;
        this.time = 0;
        this.hitFlash = 0;
        this.targetX = 0;

        this.attackTimer = 0;
        this.attackRate = 3;
        this.fireballs = [];

        this.state = 'entering'; // entering, fighting
        this.damage = Math.ceil(3 * mul.enemyDmgMul);

        this.frozen = false;
        this.frozenTimer = 0;

        // 공격 애니메이션
        this.attackAnim = 0;
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
        if (this.attackAnim > 0) this.attackAnim -= dt;

        // 화염구는 얼려도 계속 날아감
        for (const fb of this.fireballs) {
            fb.x += fb.vx * dt;
            fb.y += fb.vy * dt;
            fb.lifetime -= dt;
            if (fb.lifetime <= 0 || fb.x < -50 || fb.x > BASE_WIDTH + 50) {
                fb.active = false;
            }
        }
        this.fireballs = this.fireballs.filter(fb => fb.active);

        // 얼림 상태
        if (this.frozen) {
            this.frozenTimer -= dt;
            if (this.frozenTimer <= 0) {
                this.frozen = false;
            }
            return;
        }

        // 페이즈 전환
        const hpRatio = this.hp / this.maxHp;
        if (hpRatio <= 0.33) this.phase = 3;
        else if (hpRatio <= 0.66) this.phase = 2;
        else this.phase = 1;

        switch (this.state) {
            case 'entering':
                this.vx = -this.speed * 2;
                if (this.x <= BASE_WIDTH - BOSS_WIDTH - 30) {
                    this.state = 'fighting';
                    this.vx = 0;
                }
                break;

            case 'fighting':
                this._fightingAI(dt);
                break;
        }

        super.update(dt);
    }

    _fightingAI(dt) {
        const moveSpeed = this.speed * (1 + (this.phase - 1) * 0.3);
        if (this.x > this.targetX + 100) {
            this.vx = -moveSpeed;
        } else {
            this.vx = 0;
        }

        this.attackTimer -= dt;
        if (this.attackTimer <= 0) {
            this._fireAttack();
            this.attackTimer = this.attackRate / this.phase;
        }
    }

    _fireAttack() {
        const cx = this.x;
        const cy = this.cy;
        const speed = 200 + this.phase * 50;

        if (this.phase === 1) {
            this.fireballs.push(this._createFireball(cx, cy, -speed, 0));
        } else if (this.phase === 2) {
            this.fireballs.push(this._createFireball(cx, cy, -speed, -80));
            this.fireballs.push(this._createFireball(cx, cy, -speed, 0));
            this.fireballs.push(this._createFireball(cx, cy, -speed, 80));
        } else {
            for (let i = -2; i <= 2; i++) {
                this.fireballs.push(this._createFireball(cx, cy, -speed, i * 70));
            }
        }

        // 화염구 발사 효과음
        if (this.sound) this.sound.playBossFireball();
    }

    _createFireball(x, y, vx, vy) {
        return { x, y, vx, vy, width: 16, height: 16, damage: 1, lifetime: 4, active: true };
    }

    takeDamage(amount) {
        this.hp -= amount;
        this.hitFlash = 0.15;
        if (this.hp <= 0) {
            this.hp = 0;
            this.active = false;
        }
    }

    canAttack() {
        if (this.frozen) return false;
        if (this.x <= this.targetX + 80) {
            this.attackAnim = 0.5; // 보스 공격 애니메이션 0.5초
            return true;
        }
        return false;
    }

    draw(ctx, sprite) {
        sprite.drawBossMonster(ctx, this.x, this.y, this.width, this.height, this.phase, this.time, this.hitFlash > 0, this.frozen, this.attackAnim);

        for (const fb of this.fireballs) {
            sprite.drawFireball(ctx, fb.x, fb.y, fb.width);
        }

        // 보스 HP바
        const barW = 200;
        const barH = 12;
        const barX = (BASE_WIDTH - barW) / 2;
        const barY = 16;
        ctx.fillStyle = '#333';
        ctx.fillRect(barX - 2, barY - 2, barW + 4, barH + 4);
        ctx.fillStyle = '#555';
        ctx.fillRect(barX, barY, barW, barH);
        const ratio = Math.max(0, this.hp / this.maxHp);
        ctx.fillStyle = ratio > 0.3 ? '#EF5350' : '#B71C1C';
        ctx.fillRect(barX, barY, barW * ratio, barH);

        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('보스', BASE_WIDTH / 2, barY + barH + 14);
        ctx.textAlign = 'left';
    }
}
