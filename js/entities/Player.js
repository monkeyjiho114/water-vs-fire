import { Entity } from './Entity.js';
import { WaterBullet } from './WaterBullet.js';
import {
    PLAYER_SPEED, PLAYER_JUMP_FORCE, PLAYER_HP,
    PLAYER_WIDTH, PLAYER_HEIGHT, PLAYER_INVINCIBLE_TIME,
    GRAVITY, BASE_WIDTH, SHOOT_COOLDOWN, CANNON_SHOOT_COOLDOWN,
    FREEZE_COOLDOWN, POWERUP_DURATION, POWERUP_DAMAGE,
    POWERUP_BULLET_WIDTH, POWERUP_BULLET_HEIGHT, POWERUP_SHOOT_COOLDOWN,
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

        // 비주얼 효과
        this.muzzleFlashTime = 0; // 발사 시 짧은 플래시
        this.muzzleFlashIsCannon = false;
        this.muzzleFlashIsPower = false;
        this.knockbackVx = 0; // 피격 시 넉백
        this.squashTime = 0; // 착지 시 squash 애니메이션

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
    }

    activatePowerUp() {
        this.isPoweredUp = true;
        this.powerUpTimer = POWERUP_DURATION;
    }

    update(dt, input, cannonComplete, freezeEnabled, sound) {
        this.time += dt;
        const wasOnGround = this.isOnGround;

        // 무적 타이머
        if (this.invincibleTimer > 0) {
            this.invincibleTimer -= dt;
        }

        // 강화 물총 타이머
        if (this.powerUpTimer > 0) {
            this.powerUpTimer -= dt;
            if (this.powerUpTimer <= 0) {
                this.isPoweredUp = false;
            }
        }

        // 머즈 플래시 / 스쿼시 타이머
        if (this.muzzleFlashTime > 0) this.muzzleFlashTime -= dt;
        if (this.squashTime > 0) this.squashTime -= dt;

        // 넉백 감쇠
        if (Math.abs(this.knockbackVx) > 1) {
            this.knockbackVx *= Math.pow(0.001, dt); // 빠르게 감쇠
        } else {
            this.knockbackVx = 0;
        }

        // 좌우 이동
        this.vx = this.knockbackVx;
        if (input.left) {
            this.vx = -PLAYER_SPEED + this.knockbackVx;
            this.facingRight = false;
        }
        if (input.right) {
            this.vx = PLAYER_SPEED + this.knockbackVx;
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
            // 착지 효과음 + 스쿼시 (공중에서 착지했을 때만)
            if (!wasOnGround) {
                if (sound) sound.playLand();
                this.squashTime = 0.18;
            }
        }

        // 화면 경계
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > BASE_WIDTH) this.x = BASE_WIDTH - this.width;

        // 얼리기 쿨타임 (freezeEnabled가 true일 때만)
        if (this.freezeCooldown > 0) {
            this.freezeCooldown -= dt;
        }
        if (freezeEnabled && input.freeze && this.freezeCooldown <= 0) {
            this.freezeActive = true;
            this.freezeCooldown = FREEZE_COOLDOWN;
        }

        // 발사
        this.shootCooldown -= dt;
        let cooldown, isPowerShot = false;
        if (this.isPoweredUp) {
            cooldown = POWERUP_SHOOT_COOLDOWN;
            isPowerShot = true;
        } else if (cannonComplete) {
            cooldown = CANNON_SHOOT_COOLDOWN;
        } else {
            cooldown = SHOOT_COOLDOWN;
        }

        if (input.shoot && this.shootCooldown <= 0) {
            this.shootCooldown = cooldown;
            this._shoot(cannonComplete, isPowerShot);
            // 머즈 플래시 활성화
            this.muzzleFlashTime = 0.08;
            this.muzzleFlashIsCannon = cannonComplete;
            this.muzzleFlashIsPower = isPowerShot;
            // 발사 효과음
            if (sound) {
                if (isPowerShot) sound.playPowerShot();
                else if (cannonComplete) sound.playCannonShoot();
                else sound.playShoot();
            }
        }

        // 총알 업데이트
        for (const b of this.bullets) {
            b.update(dt);
        }
        this.bullets = this.bullets.filter(b => b.active);
    }

    _shoot(cannonComplete, isPowerShot) {
        const bx = this.facingRight ? this.x + this.width : this.x;
        const by = this.cy - 4;
        const bullet = new WaterBullet(bx, by, this.facingRight, cannonComplete, isPowerShot);
        this.bullets.push(bullet);
    }

    takeDamage(amount, sourceX) {
        if (this.invincibleTimer > 0) return;
        this.hp -= amount;
        this.invincibleTimer = PLAYER_INVINCIBLE_TIME;
        if (this.hp < 0) this.hp = 0;
        // 넉백 (피격원 방향과 반대로)
        if (sourceX !== undefined) {
            const dir = sourceX < this.cx ? 1 : -1;
            this.knockbackVx = dir * 220;
        }
    }

    draw(ctx, sprite, cannonComplete, skins) {
        // 그림자는 항상 그림 (무적 깜빡임 중에도)
        sprite.drawShadow(ctx, this.cx, this.groundY, this.width);

        // 무적 시 알파 깜빡임 (사라지지 않고 투명도만 변경)
        const isInvincible = this.invincibleTimer > 0;
        let alpha = 1;
        if (isInvincible) {
            // 8Hz로 깜빡이되 50%~100% 알파만 사용
            alpha = 0.5 + 0.5 * (Math.floor(this.invincibleTimer * 12) % 2);
        }

        ctx.save();
        ctx.globalAlpha = alpha;

        // 스쿼시 (착지 시)
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

        ctx.restore();

        // 머즈 플래시 (총알 발사 위치)
        if (this.muzzleFlashTime > 0) {
            const fx = this.facingRight ? this.x + this.width + 8 : this.x - 8;
            const fy = this.cy - 4 + Math.sin(this.time * 4) * 2; // bob과 맞춤
            sprite.drawMuzzleFlash(ctx, fx, fy, this.facingRight, cannonComplete, this.isPoweredUp, this.time);
        }

        // 총알 그리기
        for (const b of this.bullets) {
            sprite.drawBullet(ctx, b, bulletSkin);
        }
    }
}
