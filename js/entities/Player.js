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

        // 좌우 이동
        this.vx = 0;
        if (input.left) {
            this.vx = -PLAYER_SPEED;
            this.facingRight = false;
        }
        if (input.right) {
            this.vx = PLAYER_SPEED;
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
            // 착지 효과음 (공중에서 착지했을 때만)
            if (!wasOnGround && sound) sound.playLand();
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

    takeDamage(amount) {
        if (this.invincibleTimer > 0) return;
        this.hp -= amount;
        this.invincibleTimer = PLAYER_INVINCIBLE_TIME;
        if (this.hp < 0) this.hp = 0;
    }

    draw(ctx, sprite, cannonComplete, skins) {
        // 무적 시 깜빡임
        if (this.invincibleTimer > 0 && Math.floor(this.invincibleTimer * 10) % 2 === 0) {
            return;
        }
        const bodySkin = skins ? skins.body : null;
        const bulletSkin = skins ? skins.bullet : null;
        sprite.drawPlayer(ctx, this.x, this.y, this.width, this.height, this.facingRight, cannonComplete, this.time, this.isPoweredUp, bodySkin);

        // 총알 그리기
        for (const b of this.bullets) {
            sprite.drawBullet(ctx, b, bulletSkin);
        }
    }
}
