import { createSteamParticles, createWaterSplash } from '../entities/Particle.js';

export class CollisionManager {
    constructor() {
        this._houseHitSoundCD = 0;
        this._damageSoundCD = 0;
    }

    check(player, stage, sound, dt) {
        // 효과음 쿨다운 감소
        const tickDt = dt || 1/60;
        if (this._houseHitSoundCD > 0) this._houseHitSoundCD -= tickDt;
        if (this._damageSoundCD > 0) this._damageSoundCD -= tickDt;
        if (!player || !stage) return;

        const bullets = player.bullets;
        const enemies = stage.enemies;
        const boss = stage.boss;
        const house = stage.house;

        // 물총알 vs 일반 몬스터
        for (const bullet of bullets) {
            if (!bullet.active) continue;
            for (const enemy of enemies) {
                if (!enemy.active) continue;
                if (this._overlaps(bullet.getBounds(), enemy.getBounds())) {
                    enemy.takeDamage(bullet.damage);
                    bullet.active = false;
                    stage.addParticles(createSteamParticles(bullet.cx, bullet.cy));
                    if (sound) sound.playHit();
                    if (!enemy.active) {
                        stage.onEnemyKilled(enemy);
                        stage.tryDropPowerUp(enemy.cx, enemy.cy);
                        if (sound) sound.playMonsterDefeat();
                    }
                    break;
                }
            }
        }

        // 물총알 vs 보스
        if (boss && boss.active) {
            for (const bullet of bullets) {
                if (!bullet.active) continue;
                if (this._overlaps(bullet.getBounds(), boss.getBounds())) {
                    boss.takeDamage(bullet.damage);
                    bullet.active = false;
                    stage.addParticles(createSteamParticles(bullet.cx, bullet.cy));
                    if (sound) sound.playHit();
                    if (!boss.active) {
                        stage.onBossKilled();
                        if (sound) sound.playMonsterDefeat();
                    }
                    break;
                }
            }

            // 보스 화염구 vs 플레이어
            for (const fb of boss.fireballs) {
                if (!fb.active) continue;
                const fbBounds = { x: fb.x - fb.width / 2, y: fb.y - fb.height / 2, w: fb.width, h: fb.height };
                if (this._overlaps(player.getBounds(), fbBounds)) {
                    player.takeDamage(fb.damage);
                    fb.active = false;
                    if (sound && this._damageSoundCD <= 0) {
                        sound.playDamage();
                        this._damageSoundCD = 0.3;
                    }
                }
            }

            // 보스 vs 집
            if (house && house.hp > 0 && boss.canAttack()) {
                house.takeDamage(boss.damage);
                if (sound && this._houseHitSoundCD <= 0) {
                    sound.playHouseHit();
                    this._houseHitSoundCD = 0.5;
                }
            }
        }

        // 물총알 vs 악당 성
        if (stage.enemyCastle && stage.enemyCastle.active) {
            for (const bullet of bullets) {
                if (!bullet.active) continue;
                if (this._overlaps(bullet.getBounds(), stage.enemyCastle.getBounds())) {
                    stage.enemyCastle.takeDamage(bullet.damage);
                    bullet.active = false;
                    stage.addParticles(createSteamParticles(bullet.cx, bullet.cy));
                    if (sound) sound.playCastleHit();
                    if (!stage.enemyCastle.active) {
                        stage.onCastleDestroyed();
                        if (sound) sound.playCastleDestroy();
                    }
                    break;
                }
            }
        }

        // 몬스터 vs 집
        if (house && house.hp > 0) {
            for (const enemy of enemies) {
                if (!enemy.active) continue;
                if (enemy.canAttack()) {
                    house.takeDamage(enemy.damage);
                    if (sound && this._houseHitSoundCD <= 0) {
                        sound.playHouseHit();
                        this._houseHitSoundCD = 0.5;
                    }
                }
            }
        }

        // 몬스터 vs 플레이어
        for (const enemy of enemies) {
            if (!enemy.active) continue;
            if (this._overlaps(player.getBounds(), enemy.getBounds())) {
                player.takeDamage(enemy.damage);
                if (sound && this._damageSoundCD <= 0) {
                    sound.playDamage();
                    this._damageSoundCD = 0.3;
                }
            }
        }

        // 플레이어 vs 파워업 아이템
        for (const pu of stage.powerUps) {
            if (!pu.active) continue;
            if (this._overlaps(player.getBounds(), pu.getBounds())) {
                pu.active = false;
                player.activatePowerUp();
                stage.addParticles(createWaterSplash(pu.cx, pu.cy));
                if (sound) sound.playPowerUp();
            }
        }
    }

    _overlaps(a, b) {
        return a.x < b.x + b.w &&
               a.x + a.w > b.x &&
               a.y < b.y + b.h &&
               a.y + a.h > b.y;
    }
}
