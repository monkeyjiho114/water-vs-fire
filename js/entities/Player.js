import { Entity } from './Entity.js';
import { WaterBullet } from './WaterBullet.js';
import {
    PLAYER_SPEED, PLAYER_JUMP_FORCE, PLAYER_HP,
    PLAYER_WIDTH, PLAYER_HEIGHT, PLAYER_INVINCIBLE_TIME,
    GRAVITY, BASE_WIDTH, SHOOT_COOLDOWN, CANNON_SHOOT_COOLDOWN,
    FREEZE_COOLDOWN, POWERUP_DURATION, POWERUP_DAMAGE,
    POWERUP_BULLET_WIDTH, POWERUP_BULLET_HEIGHT, POWERUP_SHOOT_COOLDOWN,
    CHARGE_TIME_FULL, CHARGE_DAMAGE_MUL,
} from '../data/constants.js';

export class Player extends Entity {
    constructor(game) {
        const groundY = game.groundY;
        super(100, groundY - PLAYER_HEIGHT, PLAYER_WIDTH, PLAYER_HEIGHT);
        this.game = game;
        this.maxHp = PLAYER_HP;
        this.hp = PLAYER_HP;
        this.facingRight = true;
        this.isOnGround = true;
        this.shootCooldown = 0;
        this.invincibleTimer = 0;
        this.bullets = [];
        this.time = 0;
        this.freezeCooldown = 0;
        this.freezeActive = false;

        // 강화 물총
        this.powerUpTimer = 0;
        this.isPoweredUp = false;

        // 차지 샷
        this.chargeTime = 0; // Z 누른 시간
        this.shootKeyHeld = false;
        this.chargeReleaseRequest = false; // 차지 해제 요청 플래그
        this.chargeReleaseRatio = 0;

        // 비주얼 효과
        this.muzzleFlashTime = 0;
        this.muzzleFlashIsCannon = false;
        this.muzzleFlashIsPower = false;
        this.muzzleFlashIsCharge = false;
        this.knockbackVx = 0;
        this.squashTime = 0;

        this.groundY = groundY;
    }

    reset() {
        this.hp = this.maxHp;
        this.x = 100;
        this.y = this.groundY - PLAYER_HEIGHT;
        this.vx = 0;
        this.vy = 0;
        this.invincibleTimer = 0;
        this.bullets = [];
        this.freezeCooldown = 0;
        this.freezeActive = false;
        this.powerUpTimer = 0;
        this.isPoweredUp = false;
        this.muzzleFlashTime = 0;
        this.knockbackVx = 0;
        this.squashTime = 0;
        this.chargeTime = 0;
        this.shootKeyHeld = false;
    }

    activatePowerUp() {
        this.isPoweredUp = true;
        this.powerUpTimer = POWERUP_DURATION;
    }

    heal(amount) {
        this.hp = Math.min(this.maxHp, this.hp + amount);
    }

    update(dt, input, cannonComplete, freezeEnabled, sound) {
        this.time += dt;
        const wasOnGround = this.isOnGround;

        // 무적 타이머
        if (this.invincibleTimer > 0) this.invincibleTimer -= dt;

        // 강화 물총 타이머
        if (this.powerUpTimer > 0) {
            this.powerUpTimer -= dt;
            if (this.powerUpTimer <= 0) this.isPoweredUp = false;
        }

        // 머즈 플래시 / 스쿼시 타이머
        if (this.muzzleFlashTime > 0) this.muzzleFlashTime -= dt;
        if (this.squashTime > 0) this.squashTime -= dt;

        // 넉백 감쇠
        if (Math.abs(this.knockbackVx) > 1) {
            this.knockbackVx *= Math.pow(0.001, dt);
        } else {
            this.knockbackVx = 0;
        }

        // 좌우 이동 (차지 중에는 속도 약간 감소)
        const isCharging = this.chargeTime > 0.15 && !this.isPoweredUp;
        const moveMul = isCharging ? 0.6 : 1;

        this.vx = this.knockbackVx;
        if (input.left) {
            this.vx = -PLAYER_SPEED * moveMul + this.knockbackVx;
            this.facingRight = false;
        }
        if (input.right) {
            this.vx = PLAYER_SPEED * moveMul + this.knockbackVx;
            this.facingRight = true;
        }

        // 점프
        if (input.jump && this.isOnGround) {
            this.vy = PLAYER_JUMP_FORCE;
            this.isOnGround = false;
            if (sound) sound.playJump();
        }

        // 중력
        if (!this.isOnGround) {
            this.vy += GRAVITY * dt;
        }

        // 위치 업데이트
        super.update(dt);

        // 바닥 충돌
        if (this.y + this.height >= this.groundY) {
            this.y = this.groundY - this.height;
            this.vy = 0;
            this.isOnGround = true;
            if (!wasOnGround) {
                if (sound) sound.playLand();
                this.squashTime = 0.18;
            }
        }

        // 화면 경계
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > BASE_WIDTH) this.x = BASE_WIDTH - this.width;

        // 얼리기 쿨타임
        if (this.freezeCooldown > 0) this.freezeCooldown -= dt;
        if (freezeEnabled && input.freeze && this.freezeCooldown <= 0) {
            this.freezeActive = true;
            this.freezeCooldown = FREEZE_COOLDOWN;
        }

        // 발사 / 차지
        this.shootCooldown -= dt;
        const shootDown = input.shoot;

        if (this.isPoweredUp) {
            // 강화 상태: 누르면 연사 (차지 없음)
            if (shootDown && this.shootCooldown <= 0) {
                this._shoot(cannonComplete, true, 0);
                this.shootCooldown = POWERUP_SHOOT_COOLDOWN;
                this.muzzleFlashTime = 0.08;
                this.muzzleFlashIsCannon = cannonComplete;
                this.muzzleFlashIsPower = true;
                this.muzzleFlashIsCharge = false;
                if (sound) sound.playPowerShot();
            }
            // 강화 시 차지 상태 리셋
            this.chargeTime = 0;
            this.shootKeyHeld = false;
        } else {
            // 일반 모드: 누르고 있는 동안 차지
            if (shootDown && this.shootCooldown <= 0) {
                this.chargeTime += dt;
                this.shootKeyHeld = true;
            } else if (!shootDown && this.shootKeyHeld) {
                // 키 떼면 발사 (차지량에 따라)
                this._releaseChargeShot(cannonComplete, sound);
            }
        }

        // 총알 업데이트
        for (const b of this.bullets) {
            b.update(dt);
        }
        this.bullets = this.bullets.filter(b => b.active);
    }

    _releaseChargeShot(cannonComplete, sound) {
        const ratio = Math.min(1, this.chargeTime / CHARGE_TIME_FULL);
        // 30% 이상 차지면 차지샷 (그 미만은 일반 샷)
        const isCharge = ratio >= 0.3;
        this._shoot(cannonComplete, false, isCharge ? ratio : 0);
        this.shootCooldown = isCharge ? 0.35 : (cannonComplete ? CANNON_SHOOT_COOLDOWN : SHOOT_COOLDOWN);
        this.muzzleFlashTime = isCharge ? 0.15 : 0.08;
        this.muzzleFlashIsCannon = cannonComplete;
        this.muzzleFlashIsPower = false;
        this.muzzleFlashIsCharge = isCharge;
        // 차지 해제 정보 (GameStateManager가 화면 흔들림에 사용)
        this.chargeReleaseRequest = isCharge;
        this.chargeReleaseRatio = ratio;

        // 사운드
        if (sound) {
            if (isCharge) sound.playChargeShot && sound.playChargeShot();
            else if (cannonComplete) sound.playCannonShoot();
            else sound.playShoot();
        }
        this.chargeTime = 0;
        this.shootKeyHeld = false;
    }

    _shoot(cannonComplete, isPowerShot, chargeRatio) {
        const bx = this.facingRight ? this.x + this.width : this.x;
        const by = this.cy - 4;
        const bullet = new WaterBullet(bx, by, this.facingRight, cannonComplete, isPowerShot, chargeRatio || 0);
        this.bullets.push(bullet);
    }

    takeDamage(amount, sourceX) {
        if (this.invincibleTimer > 0) return;
        this.hp -= amount;
        this.invincibleTimer = PLAYER_INVINCIBLE_TIME;
        if (this.hp < 0) this.hp = 0;
        // 차지 취소
        this.chargeTime = 0;
        this.shootKeyHeld = false;
        if (sourceX !== undefined) {
            const dir = sourceX < this.cx ? 1 : -1;
            this.knockbackVx = dir * 220;
        }
    }

    draw(ctx, sprite, cannonComplete, skins) {
        sprite.drawShadow(ctx, this.cx, this.groundY, this.width);

        const isInvincible = this.invincibleTimer > 0;
        let alpha = 1;
        if (isInvincible) {
            alpha = 0.5 + 0.5 * (Math.floor(this.invincibleTimer * 12) % 2);
        }

        ctx.save();
        ctx.globalAlpha = alpha;

        if (this.squashTime > 0) {
            const t = this.squashTime / 0.18;
            const scaleX = 1 + (1 - t) * 0.15;
            const scaleY = 1 - (1 - t) * 0.15;
            ctx.translate(this.cx, this.y + this.height);
            ctx.scale(scaleX, scaleY);
            ctx.translate(-this.cx, -(this.y + this.height));
        }

        const bodySkin = skins ? skins.body : null;
        const bulletSkin = skins ? skins.bullet : null;
        sprite.drawPlayer(ctx, this.x, this.y, this.width, this.height, this.facingRight, cannonComplete, this.time, this.isPoweredUp, bodySkin);

        // 차지 샷 글로우 (캐릭터 주변)
        if (this.chargeTime > 0.15) {
            const ratio = Math.min(1, this.chargeTime / CHARGE_TIME_FULL);
            sprite.drawChargeAura(ctx, this.cx, this.cy, this.width, ratio, this.time);
        }

        ctx.restore();

        // 머즈 플래시
        if (this.muzzleFlashTime > 0) {
            const fx = this.facingRight ? this.x + this.width + 8 : this.x - 8;
            const fy = this.cy - 4 + Math.sin(this.time * 4) * 2;
            sprite.drawMuzzleFlash(ctx, fx, fy, this.facingRight, cannonComplete, this.isPoweredUp || this.muzzleFlashIsCharge, this.time);
        }

        // 총알 그리기
        for (const b of this.bullets) {
            sprite.drawBullet(ctx, b, bulletSkin);
        }
    }
}
