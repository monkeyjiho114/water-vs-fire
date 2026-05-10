import { Entity } from './Entity.js';
import { BOSS_HP, BOSS_WIDTH, BOSS_HEIGHT, BOSS_SPEED, BASE_WIDTH, BASE_HEIGHT, GROUND_RATIO } from '../data/constants.js';

export class BossMonster extends Entity {
    constructor(game, diffMul) {
        super(BASE_WIDTH + 50, game.groundY - BOSS_HEIGHT, BOSS_WIDTH, BOSS_HEIGHT);
        this.game = game;
        this.sound = null;

        const mul = diffMul || { enemyHpMul: 1, enemySpeedMul: 1, enemyDmgMul: 1 };
        // 보스 강화 (이전 40 → 60으로 증가)
        this.maxHp = Math.ceil(60 * mul.enemyHpMul);
        this.hp = this.maxHp;
        this.speed = BOSS_SPEED * mul.enemySpeedMul;
        this.phase = 1;
        this.time = 0;
        this.hitFlash = 0;
        this.targetX = 0;

        this.attackTimer = 0;
        this.attackRate = 2.5;
        this.fireballs = [];
        this.firePillars = []; // 화염 기둥
        this.shockwaves = []; // 스톰프 쇼크웨이브

        this.state = 'entering';
        this.damage = Math.ceil(3 * mul.enemyDmgMul);

        this.frozen = false;
        this.frozenTimer = 0;
        this.attackAnim = 0;

        // 스톰프 점프
        this.stompPhase = 'idle'; // idle, jumping, falling, landed
        this.stompY = 0;
        this.stompVy = 0;
        this.stompTimer = 0; // 다음 스톰프까지

        // 어택 패턴 사이클 (페이즈 2~3에서 화염구/기둥/스톰프 순환)
        this.attackPattern = 0;

        // 페이즈 전환 짧은 무적 + 연출
        this.phaseTransitionTimer = 0;
        this.phaseShownThis = 1;
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
        if (this.phaseTransitionTimer > 0) this.phaseTransitionTimer -= dt;

        // 화염구
        for (const fb of this.fireballs) {
            fb.x += fb.vx * dt;
            fb.y += fb.vy * dt;
            fb.lifetime -= dt;
            if (fb.lifetime <= 0 || fb.x < -50 || fb.x > BASE_WIDTH + 50 || fb.y > BASE_HEIGHT) {
                fb.active = false;
            }
        }
        this.fireballs = this.fireballs.filter(fb => fb.active);

        // 화염 기둥 (지속 시간동안 존재, 데미지는 활성 시기에만)
        for (const fp of this.firePillars) {
            fp.lifetime -= dt;
            // 활성 데미지 구간 (warning 끝나고 0.4초간)
            fp.warning = fp.lifetime > fp.maxLifetime - 0.7;
            fp.activeDamage = !fp.warning && fp.lifetime > fp.maxLifetime - 1.1;
            if (fp.lifetime <= 0) fp.active = false;
        }
        this.firePillars = this.firePillars.filter(fp => fp.active);

        // 쇼크웨이브
        for (const sw of this.shockwaves) {
            sw.radius += sw.speed * dt;
            sw.lifetime -= dt;
            if (sw.lifetime <= 0 || sw.radius > BASE_WIDTH) sw.active = false;
        }
        this.shockwaves = this.shockwaves.filter(sw => sw.active);

        if (this.frozen) {
            this.frozenTimer -= dt;
            if (this.frozenTimer <= 0) this.frozen = false;
            return;
        }

        // 페이즈 전환
        const hpRatio = this.hp / this.maxHp;
        let newPhase = 1;
        if (hpRatio <= 0.33) newPhase = 3;
        else if (hpRatio <= 0.66) newPhase = 2;

        if (newPhase !== this.phase && newPhase > this.phase) {
            this.phase = newPhase;
            this.phaseTransitionTimer = 1.0; // 1초 무적 + 패턴 리셋
            this.phaseShownThis = newPhase;
            // 페이즈 전환 시 화염 폭발
            this._summonFirePillars(true);
            return;
        }

        // 페이즈 전환 중에는 행동 안함
        if (this.phaseTransitionTimer > 0) return;

        // 스톰프 점프 (모든 상태에서 우선)
        if (this.stompPhase === 'jumping' || this.stompPhase === 'falling') {
            this.stompY += this.stompVy * dt;
            this.stompVy += 1500 * dt;
            if (this.stompPhase === 'jumping' && this.stompVy >= 0) {
                this.stompPhase = 'falling';
            }
            if (this.stompPhase === 'falling' && this.stompY >= 0) {
                // 착지! 쇼크웨이브 발생
                this.stompY = 0;
                this.stompPhase = 'idle';
                this._stompLand();
            }
            return; // 점프 중엔 다른 행동 안 함
        }

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
        const moveSpeed = this.speed * (1 + (this.phase - 1) * 0.4);
        if (this.x > this.targetX + 100) {
            this.vx = -moveSpeed;
        } else {
            this.vx = 0;
        }

        this.attackTimer -= dt;
        if (this.attackTimer <= 0) {
            this._performAttack();
            // 페이즈가 높을수록 공격 빈도 증가
            this.attackTimer = this.attackRate / (1 + (this.phase - 1) * 0.5);
        }
    }

    _performAttack() {
        // 페이즈 1: 화염구만
        // 페이즈 2: 화염구 + 화염 기둥
        // 페이즈 3: 화염구 + 화염 기둥 + 스톰프
        const patterns = this.phase >= 3 ? ['fireball', 'pillars', 'stomp']
                       : this.phase === 2 ? ['fireball', 'pillars']
                       : ['fireball'];
        const pattern = patterns[this.attackPattern % patterns.length];
        this.attackPattern++;

        switch (pattern) {
            case 'fireball': this._fireAttack(); break;
            case 'pillars': this._summonFirePillars(false); break;
            case 'stomp': this._beginStomp(); break;
        }
    }

    _fireAttack() {
        const cx = this.x;
        const cy = this.cy;
        const speed = 220 + this.phase * 50;

        if (this.phase === 1) {
            this.fireballs.push(this._createFireball(cx, cy, -speed, 0));
        } else if (this.phase === 2) {
            this.fireballs.push(this._createFireball(cx, cy, -speed, -100));
            this.fireballs.push(this._createFireball(cx, cy, -speed, 0));
            this.fireballs.push(this._createFireball(cx, cy, -speed, 100));
        } else {
            // 페이즈 3: 5발 + 곡선
            for (let i = -2; i <= 2; i++) {
                this.fireballs.push(this._createFireball(cx, cy, -speed, i * 80));
            }
        }
        this.attackAnim = 0.4;
        if (this.sound) this.sound.playBossFireball();
    }

    _summonFirePillars(big = false) {
        // 플레이어 위치 근처에 기둥 (player ref가 없으니 화면 분포)
        const count = big ? 5 : (this.phase === 2 ? 2 : 3);
        for (let i = 0; i < count; i++) {
            // 화면 좌측 60% 영역에 분포 (집 보호 안 한 영역)
            const px = 100 + Math.random() * (BASE_WIDTH * 0.55);
            const groundY = BASE_HEIGHT * GROUND_RATIO;
            this.firePillars.push({
                x: px,
                groundY: groundY,
                width: 50,
                height: 130,
                damage: 2,
                lifetime: 1.5,
                maxLifetime: 1.5,
                warning: true,
                activeDamage: false,
                active: true,
            });
        }
        if (this.sound) this.sound.playBossFireball && this.sound.playBossFireball();
    }

    _beginStomp() {
        this.stompPhase = 'jumping';
        this.stompVy = -700; // 위로 빠르게 점프
        this.stompY = 0;
    }

    _stompLand() {
        // 양쪽으로 쇼크웨이브 발생
        this.shockwaves.push({
            x: this.cx,
            y: this.game.groundY,
            radius: 0,
            speed: 350,
            damage: 2,
            lifetime: 1.5,
            active: true,
            hitPlayer: false,
        });
        if (this.sound) this.sound.playBossAppear && this.sound.playBossAppear();
    }

    _createFireball(x, y, vx, vy) {
        return { x, y, vx, vy, width: 16, height: 16, damage: 1, lifetime: 4, active: true };
    }

    takeDamage(amount) {
        // 페이즈 전환 중 무적
        if (this.phaseTransitionTimer > 0) return;
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
            this.attackAnim = 0.5;
            return true;
        }
        return false;
    }

    // 보스 위치 보정 (스톰프 점프 중)
    get drawY() {
        return this.y + this.stompY;
    }

    draw(ctx, sprite, groundY) {
        if (groundY !== undefined) {
            sprite.drawShadow(ctx, this.cx, groundY, this.width * 1.0, 0.3);
        }

        // 페이즈 전환 시 진동 효과
        let drawX = this.x;
        let drawY = this.drawY;
        if (this.phaseTransitionTimer > 0) {
            drawX += (Math.random() - 0.5) * 6;
            drawY += (Math.random() - 0.5) * 6;
            // 빨간 글로우
            ctx.save();
            ctx.shadowColor = '#FF1744';
            ctx.shadowBlur = 30;
            sprite.drawBossMonster(ctx, drawX, drawY, this.width, this.height, this.phase, this.time, true, this.frozen, 0);
            ctx.restore();
        } else {
            sprite.drawBossMonster(ctx, drawX, drawY, this.width, this.height, this.phase, this.time, this.hitFlash > 0, this.frozen, this.attackAnim);
        }

        // 화염구
        for (const fb of this.fireballs) {
            sprite.drawFireball(ctx, fb.x, fb.y, fb.width);
        }

        // 화염 기둥
        for (const fp of this.firePillars) {
            this._drawFirePillar(ctx, fp);
        }

        // 쇼크웨이브
        for (const sw of this.shockwaves) {
            this._drawShockwave(ctx, sw);
        }

        // 보스 HP바 (개선된 디자인)
        const barW = 280;
        const barH = 14;
        const barX = (BASE_WIDTH - barW) / 2;
        const barY = 16;

        ctx.save();
        // 배경
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(barX - 4, barY - 4, barW + 8, barH + 8);

        ctx.fillStyle = '#222';
        ctx.fillRect(barX, barY, barW, barH);

        // HP 바 (페이즈에 따라 색상)
        const ratio = Math.max(0, this.hp / this.maxHp);
        const hpGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
        if (this.phase === 3) {
            hpGrad.addColorStop(0, '#B71C1C');
            hpGrad.addColorStop(1, '#FF1744');
        } else if (this.phase === 2) {
            hpGrad.addColorStop(0, '#D32F2F');
            hpGrad.addColorStop(1, '#FF6B35');
        } else {
            hpGrad.addColorStop(0, '#EF5350');
            hpGrad.addColorStop(1, '#FF8A65');
        }
        ctx.fillStyle = hpGrad;
        ctx.fillRect(barX, barY, barW * ratio, barH);

        // 페이즈 마커 (1/3, 2/3 지점)
        ctx.fillStyle = '#FFF';
        ctx.fillRect(barX + barW * 0.33, barY, 2, barH);
        ctx.fillRect(barX + barW * 0.66, barY, 2, barH);

        // 외곽선
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(barX, barY, barW, barH);

        // 보스 이름 + 페이즈
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 3;
        ctx.fillText(`불의 대마왕 — Phase ${this.phase}`, BASE_WIDTH / 2, barY + barH + 16);
        ctx.shadowBlur = 0;
        ctx.textAlign = 'left';
        ctx.restore();
    }

    _drawFirePillar(ctx, fp) {
        const groundY = fp.groundY;
        const t = fp.lifetime / fp.maxLifetime;

        if (fp.warning) {
            // 경고 표시 — 빨간 원
            const wt = (fp.lifetime - (fp.maxLifetime - 0.7)) / 0.7;
            const radius = fp.width * 0.5;
            const blink = Math.sin(this.time * 25) * 0.5 + 0.5;
            ctx.save();
            ctx.fillStyle = `rgba(255,50,50,${0.4 + blink * 0.3})`;
            ctx.beginPath();
            ctx.ellipse(fp.x, groundY - 2, radius, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#FF1744';
            ctx.lineWidth = 2;
            ctx.stroke();
            // 경고 마크
            ctx.fillStyle = '#FFF';
            ctx.font = 'bold 16px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('!', fp.x, groundY - 5);
            ctx.textAlign = 'left';
            ctx.restore();
        } else {
            // 화염 기둥 발사 (활성)
            ctx.save();
            const flicker = Math.sin(this.time * 30) * 4;
            const grad = ctx.createLinearGradient(fp.x, groundY, fp.x, groundY - fp.height);
            grad.addColorStop(0, '#FFEB3B');
            grad.addColorStop(0.4, '#FF6B35');
            grad.addColorStop(0.8, '#D32F2F');
            grad.addColorStop(1, 'rgba(211,47,47,0)');
            ctx.fillStyle = grad;

            // 흔들리는 기둥 모양
            ctx.beginPath();
            ctx.moveTo(fp.x - fp.width / 2, groundY);
            ctx.lineTo(fp.x - fp.width * 0.3 + flicker * 0.5, groundY - fp.height * 0.3);
            ctx.lineTo(fp.x - fp.width * 0.15 + flicker, groundY - fp.height * 0.6);
            ctx.lineTo(fp.x + flicker * 0.5, groundY - fp.height);
            ctx.lineTo(fp.x + fp.width * 0.15 - flicker, groundY - fp.height * 0.6);
            ctx.lineTo(fp.x + fp.width * 0.3 + flicker * 0.5, groundY - fp.height * 0.3);
            ctx.lineTo(fp.x + fp.width / 2, groundY);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
    }

    _drawShockwave(ctx, sw) {
        const t = 1 - sw.lifetime / 1.5;
        const alpha = 1 - t;
        ctx.save();
        // 외곽 링
        ctx.strokeStyle = `rgba(255,107,53,${alpha * 0.8})`;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, Math.PI, Math.PI * 2);
        ctx.stroke();

        // 안쪽 링
        ctx.strokeStyle = `rgba(255,235,59,${alpha})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius * 0.95, Math.PI, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
}
