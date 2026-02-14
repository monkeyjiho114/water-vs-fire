import { STAGES } from '../data/stages.js';
import { BASE_WIDTH, MONSTER_TYPES, DIFFICULTIES, POWERUP_DROP_CHANCE, POWERUP_MAX_PER_GAME } from '../data/constants.js';
import { FireMonster } from '../entities/FireMonster.js';
import { BossMonster } from '../entities/BossMonster.js';
import { EnemyCastle } from '../entities/EnemyCastle.js';
import { PowerUp } from '../entities/PowerUp.js';
import { House } from '../entities/House.js';
import { createFireBurst, createSparkle } from '../entities/Particle.js';

export class StageManager {
    constructor(game, stageIndex, cannonComplete, difficulty) {
        this.game = game;
        this.sound = null; // SoundManager 참조
        this.stageIndex = stageIndex;
        this.stageData = STAGES[stageIndex] || STAGES[0];
        this.cannonComplete = cannonComplete;
        this.difficulty = difficulty || 'normal';
        this.diffMul = DIFFICULTIES[this.difficulty] || DIFFICULTIES.normal;

        // 집 (난이도 배율 적용)
        this.house = new House(30, game.groundY);
        this.house.maxHp = Math.ceil((this.stageData.houseHp || 100) * this.diffMul.houseHpMul);
        this.house.hp = this.house.maxHp;

        this.enemies = [];
        this.boss = null;
        this.particles = [];
        this.powerUps = [];
        this.powerUpsDropped = 0;

        // 악당 성 (보스 스테이지 제외)
        this.enemyCastle = null;
        if (!this.stageData.isBossStage && this.stageData.castleHp) {
            const castleHp = Math.ceil(this.stageData.castleHp * this.diffMul.enemyHpMul);
            this.enemyCastle = new EnemyCastle(game.groundY, castleHp);
        }

        // 웨이브 관리 (어려움이면 hardWaves 포함)
        this.waves = [...(this.stageData.waves || [])];
        if (this.difficulty === 'hard' && this.stageData.hardWaves) {
            this.waves.push(...this.stageData.hardWaves);
        }
        this.waves.sort((a, b) => a.delay - b.delay);

        this.currentWave = 0;
        this.waveTimer = 0;
        this.wavesSpawned = [];
        this.allWavesSpawned = false;

        // 보스
        this.bossSpawned = false;
        this.bossDelay = this.stageData.bossDelay || 999;
        this.bossKilled = false;

        this.time = 0;
        this.cleared = false;
    }

    get totalWaves() {
        return this.waves.length;
    }

    isBossStage() {
        return !!this.stageData.isBossStage;
    }

    getBackground() {
        return this.stageData.background || 'village';
    }

    isCleared() {
        return this.cleared;
    }

    freezeAllEnemies(duration) {
        for (const enemy of this.enemies) {
            if (enemy.active) enemy.freeze(duration);
        }
        if (this.boss && this.boss.active) {
            this.boss.freeze(duration);
        }
    }

    update(dt, player) {
        this.time += dt;
        this.waveTimer += dt;

        // 웨이브 스폰
        for (let i = 0; i < this.waves.length; i++) {
            if (this.wavesSpawned[i]) continue;
            if (this.waveTimer >= this.waves[i].delay) {
                this._spawnWave(this.waves[i]);
                this.wavesSpawned[i] = true;
                this.currentWave = i;
            }
        }

        // 모든 웨이브 스폰 완료 체크
        if (!this.allWavesSpawned && this.wavesSpawned.length === this.waves.length && this.wavesSpawned.every(Boolean)) {
            this.allWavesSpawned = true;
        }

        // 보스 스폰
        if (this.isBossStage() && !this.bossSpawned && this.waveTimer >= this.bossDelay) {
            this.boss = new BossMonster(this.game, this.diffMul);
            this.boss.sound = this.sound;
            this.boss.setTarget(this.house.x + this.house.width);
            this.bossSpawned = true;
        }

        // 엔티티 업데이트
        this.house.update(dt);

        if (this.enemyCastle && this.enemyCastle.active) {
            this.enemyCastle.update(dt);
        }

        for (const enemy of this.enemies) {
            enemy.update(dt);
        }
        this.enemies = this.enemies.filter(e => e.active);

        if (this.boss && this.boss.active) {
            this.boss.update(dt);
        }

        // 파워업 업데이트
        for (const pu of this.powerUps) {
            pu.update(dt);
        }
        this.powerUps = this.powerUps.filter(pu => pu.active);

        // 파티클 업데이트
        for (const p of this.particles) {
            p.update(dt);
        }
        this.particles = this.particles.filter(p => p.active);

        // 클리어 조건
        if (!this.cleared) {
            if (this.isBossStage()) {
                this.cleared = this.bossKilled;
            } else if (this.enemyCastle) {
                // 악당 성이 있으면: 성 파괴 필요
                this.cleared = !this.enemyCastle.active;
            } else {
                this.cleared = this.allWavesSpawned && this.enemies.length === 0;
            }
        }
    }

    _spawnWave(wave) {
        if (this.sound) this.sound.playWaveIncoming();
        for (const group of wave.enemies) {
            const type = group.type;
            const info = MONSTER_TYPES[type];
            for (let i = 0; i < group.count; i++) {
                let x, y;
                if (this.enemyCastle && this.enemyCastle.active) {
                    // 악당 성에서 스폰
                    x = this.enemyCastle.x + Math.random() * 20;
                } else {
                    x = BASE_WIDTH + 30 + i * 60;
                }

                if (info && info.flying) {
                    // 날아다니는 몬스터는 공중에서 스폰
                    y = this.game.groundY - 100 - Math.random() * 80;
                } else {
                    y = this.game.groundY - (info ? info.height : 40);
                }

                const enemy = new FireMonster(x, y, type, this.diffMul);
                enemy.setTarget(this.house.x + this.house.width);
                this.enemies.push(enemy);
            }
        }
    }

    tryDropPowerUp(x, y) {
        // 어려움에서만, 최대 횟수 이내, 확률 체크
        if (this.difficulty !== 'hard') return;
        if (this.powerUpsDropped >= POWERUP_MAX_PER_GAME) return;
        if (Math.random() > POWERUP_DROP_CHANCE) return;

        this.powerUpsDropped++;
        const pu = new PowerUp(x, y - 20);
        this.powerUps.push(pu);
    }

    onEnemyKilled(enemy) {
        this.addParticles(createFireBurst(enemy.cx, enemy.cy));
    }

    onBossKilled() {
        this.bossKilled = true;
        this.addParticles(createFireBurst(this.boss.cx, this.boss.cy, 20));
        this.addParticles(createSparkle(this.boss.cx, this.boss.cy, 15));
    }

    onCastleDestroyed() {
        this.addParticles(createFireBurst(this.enemyCastle.cx, this.enemyCastle.cy, 15));
        this.addParticles(createSparkle(this.enemyCastle.cx, this.enemyCastle.cy, 10));
    }

    addParticles(newParticles) {
        this.particles.push(...newParticles);
        if (this.particles.length > 150) {
            this.particles = this.particles.slice(-100);
        }
    }

    draw(ctx, sprite) {
        // 집
        this.house.draw(ctx, sprite);

        // 악당 성
        if (this.enemyCastle && this.enemyCastle.active) {
            this.enemyCastle.draw(ctx, sprite);
        }

        // 적
        for (const enemy of this.enemies) {
            enemy.draw(ctx, sprite);
        }

        // 보스
        if (this.boss && this.boss.active) {
            this.boss.draw(ctx, sprite);
        }

        // 파워업
        for (const pu of this.powerUps) {
            pu.draw(ctx, sprite);
        }

        // 파티클
        for (const p of this.particles) {
            p.draw(ctx);
        }
    }
}
