import { createSteamParticles, createWaterSplash, createExplosion } from '../entities/Particle.js';
import { CRIT_CHANCE, CRIT_DAMAGE_MUL, FINAL_STAND_THRESHOLD, FINAL_STAND_DAMAGE_MUL } from '../data/constants.js';

export class CollisionManager {
    constructor() {
        this._houseHitSoundCD = 0;
        this._damageSoundCD = 0;
    }

    check(player, stage, sound, dt, gsm) {
        const tickDt = dt || 1/60;
        if (this._houseHitSoundCD > 0) this._houseHitSoundCD -= tickDt;
        if (this._damageSoundCD > 0) this._damageSoundCD -= tickDt;
        if (!player || !stage) return;

        const bullets = player.bullets;
        const enemies = stage.enemies;
        const boss = stage.boss;
        const house = stage.house;

        // Final Stand 데미지 배율
        const finalStandMul = (house && house.hp / house.maxHp <= FINAL_STAND_THRESHOLD)
            ? FINAL_STAND_DAMAGE_MUL : 1;

        // 물총알 vs 일반 몬스터 (관통 지원)
        for (const bullet of bullets) {
            if (!bullet.active) continue;
            for (const enemy of enemies) {
                if (!enemy.active) continue;
                if (this._overlaps(bullet.getBounds(), enemy.getBounds())) {
                    // 크리티컬 판정
                    const isCrit = Math.random() < CRIT_CHANCE;
                    let dmg = bullet.damage * finalStandMul;
                    if (isCrit) dmg = Math.ceil(dmg * CRIT_DAMAGE_MUL);
                    dmg = Math.ceil(dmg);

                    enemy.takeDamage(dmg);
                    stage.addParticles(createSteamParticles(bullet.cx, bullet.cy));
                    stage.showDamageNumber(enemy.cx, enemy.y, dmg, bullet.isPowerShot || bullet.isCharge, isCrit);
                    if (sound) sound.playHit();
                    if (gsm) gsm.onHit(false);

                    if (!enemy.active) {
                        stage.onEnemyKilled(enemy);
                        // 폭발형 적 처리
                        if (enemy.isExploder) {
                            this._handleExplosion(enemy, enemies, boss, player, stage, sound, gsm);
                        }
                        stage.tryDropPowerUp(enemy.cx, enemy.cy);
                        stage.tryDropHeal(enemy.cx, enemy.cy);
                        if (sound) sound.playMonsterDefeat();
                        if (gsm) gsm.onEnemyKilled(enemy);
                    }

                    // 관통 처리: 살아있으면 다른 적도 맞춤
                    if (bullet.onHit && bullet.onHit()) {
                        continue; // 같은 총알로 다른 적 검사
                    } else {
                        bullet.active = false;
                        break;
                    }
                }
            }
        }

        // 물총알 vs 보스
        if (boss && boss.active) {
            for (const bullet of bullets) {
                if (!bullet.active) continue;
                if (this._overlaps(bullet.getBounds(), boss.getBounds())) {
                    const isCrit = Math.random() < CRIT_CHANCE;
                    let dmg = bullet.damage * finalStandMul;
                    if (isCrit) dmg = Math.ceil(dmg * CRIT_DAMAGE_MUL);
                    dmg = Math.ceil(dmg);

                    boss.takeDamage(dmg);
                    stage.addParticles(createSteamParticles(bullet.cx, bullet.cy));
                    stage.showDamageNumber(bullet.cx, bullet.cy - 20, dmg, bullet.isPowerShot || bullet.isCharge, isCrit);
                    if (sound) sound.playHit();
                    if (gsm) gsm.onHit(true);

                    if (!boss.active) {
                        stage.onBossKilled();
                        if (sound) sound.playMonsterDefeat();
                        if (gsm) gsm.onBossKilled();
                    }

                    if (bullet.onHit && bullet.onHit()) {
                        // 보스에는 관통이 같은 곳을 또 때리지 않게 break
                        bullet.active = false;
                        break;
                    } else {
                        bullet.active = false;
                        break;
                    }
                }
            }

            // 보스 화염구 vs 플레이어
            for (const fb of boss.fireballs) {
                if (!fb.active) continue;
                const fbBounds = { x: fb.x - fb.width / 2, y: fb.y - fb.height / 2, w: fb.width, h: fb.height };
                if (this._overlaps(player.getBounds(), fbBounds)) {
                    const wasInv = player.invincibleTimer > 0;
                    player.takeDamage(fb.damage, fb.x);
                    fb.active = false;
                    if (!wasInv) {
                        if (sound && this._damageSoundCD <= 0) {
                            sound.playDamage();
                            this._damageSoundCD = 0.3;
                        }
                        if (gsm) gsm.onPlayerHit();
                    }
                }
            }

            // 보스 화염 기둥 vs 플레이어
            for (const fp of boss.firePillars) {
                if (!fp.active || !fp.activeDamage) continue;
                const pillarBounds = {
                    x: fp.x - fp.width / 2,
                    y: fp.groundY - fp.height,
                    w: fp.width,
                    h: fp.height,
                };
                if (this._overlaps(player.getBounds(), pillarBounds)) {
                    const wasInv = player.invincibleTimer > 0;
                    player.takeDamage(fp.damage, fp.x);
                    if (!wasInv) {
                        if (sound && this._damageSoundCD <= 0) {
                            sound.playDamage();
                            this._damageSoundCD = 0.3;
                        }
                        if (gsm) gsm.onPlayerHit();
                    }
                }
            }

            // 쇼크웨이브 vs 플레이어
            for (const sw of boss.shockwaves) {
                if (!sw.active || sw.hitPlayer) continue;
                const dx = player.cx - sw.x;
                const dy = (player.cy) - sw.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (Math.abs(dist - sw.radius) < 30 && Math.abs(dy) < 60) {
                    sw.hitPlayer = true;
                    const wasInv = player.invincibleTimer > 0;
                    player.takeDamage(sw.damage, sw.x);
                    if (!wasInv) {
                        if (sound) sound.playDamage();
                        if (gsm) gsm.onPlayerHit();
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
                if (gsm) gsm.onHouseHit();
            }
        }

        // 물총알 vs 악당 성
        if (stage.enemyCastle && stage.enemyCastle.active) {
            for (const bullet of bullets) {
                if (!bullet.active) continue;
                if (this._overlaps(bullet.getBounds(), stage.enemyCastle.getBounds())) {
                    const isCrit = Math.random() < CRIT_CHANCE;
                    let dmg = bullet.damage * finalStandMul;
                    if (isCrit) dmg = Math.ceil(dmg * CRIT_DAMAGE_MUL);
                    dmg = Math.ceil(dmg);
                    stage.enemyCastle.takeDamage(dmg);
                    stage.addParticles(createSteamParticles(bullet.cx, bullet.cy));
                    stage.showDamageNumber(bullet.cx, bullet.cy - 8, dmg, bullet.isPowerShot || bullet.isCharge, isCrit);
                    if (sound) sound.playCastleHit();
                    if (gsm) gsm.onHit(false);
                    if (!stage.enemyCastle.active) {
                        stage.onCastleDestroyed();
                        if (sound) sound.playCastleDestroy();
                        if (gsm) gsm.onCastleDestroyed();
                    }
                    bullet.active = false;
                    break;
                }
            }
        }

        // 적 발사체 (슈터) vs 플레이어 + 집
        for (const enemy of enemies) {
            if (!enemy.fireballs) continue;
            for (const fb of enemy.fireballs) {
                if (!fb.active) continue;
                const fbBounds = { x: fb.x - fb.width / 2, y: fb.y - fb.height / 2, w: fb.width, h: fb.height };
                // vs 플레이어
                if (this._overlaps(player.getBounds(), fbBounds)) {
                    const wasInv = player.invincibleTimer > 0;
                    player.takeDamage(fb.damage, fb.x);
                    fb.active = false;
                    if (!wasInv) {
                        if (sound && this._damageSoundCD <= 0) {
                            sound.playDamage();
                            this._damageSoundCD = 0.3;
                        }
                        if (gsm) gsm.onPlayerHit();
                    }
                    continue;
                }
                // vs 집
                if (house && house.hp > 0 && this._overlaps(house.getBounds(), fbBounds)) {
                    house.takeDamage(fb.damage);
                    fb.active = false;
                    if (sound && this._houseHitSoundCD <= 0) {
                        sound.playHouseHit();
                        this._houseHitSoundCD = 0.5;
                    }
                    if (gsm) gsm.onHouseHit();
                }
                // vs 물총알 (요격 가능!)
                for (const bullet of bullets) {
                    if (!bullet.active) continue;
                    if (this._overlaps(bullet.getBounds(), fbBounds)) {
                        fb.active = false;
                        bullet.active = false;
                        stage.addParticles(createSteamParticles(fb.x, fb.y, 8));
                        if (sound) sound.playHit();
                        break;
                    }
                }
            }
            enemy.fireballs = enemy.fireballs.filter(fb => fb.active);
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
                    if (gsm) gsm.onHouseHit();
                }
            }
        }

        // 몬스터 vs 플레이어 (폭발형은 접촉 시 자폭)
        for (const enemy of enemies) {
            if (!enemy.active) continue;
            if (this._overlaps(player.getBounds(), enemy.getBounds())) {
                if (enemy.isExploder) {
                    // 폭발형 적: 사망 처리 → 폭발
                    const wasInv = player.invincibleTimer > 0;
                    enemy.active = false;
                    this._handleExplosion(enemy, enemies, boss, player, stage, sound, gsm);
                    stage.onEnemyKilled(enemy);
                    if (gsm) gsm.onEnemyKilled(enemy);
                    if (sound) sound.playMonsterDefeat();
                    if (wasInv) continue;
                } else {
                    const wasInv = player.invincibleTimer > 0;
                    player.takeDamage(enemy.damage, enemy.cx);
                    if (!wasInv) {
                        if (sound && this._damageSoundCD <= 0) {
                            sound.playDamage();
                            this._damageSoundCD = 0.3;
                        }
                        if (gsm) gsm.onPlayerHit();
                    }
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
                stage.addFloatingText(pu.cx, pu.cy - 10, '강화!', {
                    color: '#FFD54F', outlineColor: '#E65100', size: 22, vy: -80, lifetime: 1,
                });
                if (sound) sound.playPowerUp();
            }
        }

        // 플레이어 vs 회복 아이템
        if (stage.healItems) {
            for (const hi of stage.healItems) {
                if (!hi.active) continue;
                if (this._overlaps(player.getBounds(), hi.getBounds())) {
                    if (player.hp < player.maxHp) {
                        player.heal(hi.healAmount);
                        hi.active = false;
                        stage.addFloatingText(player.cx, player.y - 10, '+1 HP', {
                            color: '#66BB6A', outlineColor: '#1B5E20', size: 20, vy: -80, lifetime: 1.0,
                        });
                        if (sound) sound.playPowerUp && sound.playPowerUp();
                    }
                }
            }
        }
    }

    // 폭발 처리: 주변 적에게도 데미지
    _handleExplosion(exploder, enemies, boss, player, stage, sound, gsm) {
        const radius = exploder.explodeRadius || 60;
        const dmg = exploder.explodeDmg || 2;

        stage.addParticles(createExplosion(exploder.cx, exploder.cy, 24, radius));
        if (gsm) gsm.shake(6, 0.3);
        if (sound) sound.playMonsterDefeat();

        // 주변 적
        for (const e of enemies) {
            if (!e.active || e === exploder) continue;
            const dx = e.cx - exploder.cx;
            const dy = e.cy - exploder.cy;
            if (Math.sqrt(dx*dx + dy*dy) <= radius) {
                e.takeDamage(dmg);
                stage.showDamageNumber(e.cx, e.y, dmg, true, false);
                if (!e.active) {
                    stage.onEnemyKilled(e);
                    if (gsm) gsm.onEnemyKilled(e);
                }
            }
        }

        // 보스
        if (boss && boss.active) {
            const dx = boss.cx - exploder.cx;
            const dy = boss.cy - exploder.cy;
            if (Math.sqrt(dx*dx + dy*dy) <= radius) {
                boss.takeDamage(dmg);
            }
        }

        // 플레이어
        const dx = player.cx - exploder.cx;
        const dy = player.cy - exploder.cy;
        if (Math.sqrt(dx*dx + dy*dy) <= radius) {
            const wasInv = player.invincibleTimer > 0;
            player.takeDamage(dmg, exploder.cx);
            if (!wasInv && gsm) gsm.onPlayerHit();
        }
    }

    _overlaps(a, b) {
        return a.x < b.x + b.w &&
               a.x + a.w > b.x &&
               a.y < b.y + b.h &&
               a.y + a.h > b.y;
    }
}
