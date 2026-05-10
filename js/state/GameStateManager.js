import { STATES, BASE_WIDTH, BASE_HEIGHT, COLORS, TOTAL_MATERIALS, DIFFICULTIES, DIFFICULTY_KEYS, FREEZE_DURATION, BODY_SKINS, BULLET_SKINS } from '../data/constants.js';
import { STAGES } from '../data/stages.js';
import { StageManager } from './StageManager.js';
import { Player } from '../entities/Player.js';
import { CollisionManager } from '../engine/CollisionManager.js';
import { SoundManager } from '../engine/SoundManager.js';
import { SaveManager } from '../engine/SaveManager.js';
import { SpriteDrawer } from '../rendering/SpriteDrawer.js';
import { UIRenderer } from '../rendering/UIRenderer.js';
import { BackgroundRenderer } from '../rendering/BackgroundRenderer.js';
import { createFreezeParticles } from '../entities/Particle.js';

export class GameStateManager {
    constructor(game) {
        this.game = game;
        this.state = STATES.MENU;
        this.prevState = null;

        // 게임 데이터
        this.materialsCollected = 0;
        this.cannonComplete = false;
        this.score = 0;
        this.currentStageIndex = 0;

        // 콤보 시스템
        this.combo = 0;
        this.comboTimer = 0;
        this.comboMaxTimer = 1.8; // 1.8초 안에 다음 적 처치하면 콤보 유지
        this.maxCombo = 0;

        // 스테이지 시작 배너
        this.stageBannerTimer = 0;

        // 히트 스톱 (시간 정지 효과)
        this.hitPauseTime = 0;

        // 난이도
        this.difficultyIndex = 1;
        this.difficulty = 'normal';

        // 상점
        this.shopTab = 0;
        this.shopCursor = 0;

        // 매니저
        this.collision = new CollisionManager();
        this.sound = new SoundManager();
        this.save = new SaveManager();
        this.sprite = new SpriteDrawer();
        this.ui = new UIRenderer(this.sprite);
        this.bg = new BackgroundRenderer();

        // 엔티티
        this.player = null;
        this.stage = null;

        // 전환 타이머
        this.transitionTimer = 0;

        // 화면 흔들림
        this.shakeAmount = 0;
        this.shakeTimer = 0;
    }

    setState(newState) {
        this.prevState = this.state;
        this.state = newState;
        this.transitionTimer = 0;
        this._onEnterState(newState);
    }

    _onEnterState(state) {
        switch (state) {
            case STATES.PLAYING:
                if (this.prevState === STATES.MENU || this.prevState === STATES.TUTORIAL) {
                    this._startNewGame();
                } else if (this.prevState === STATES.STAGE_CLEAR || this.prevState === STATES.CANNON_COMPLETE || this.prevState === STATES.BOSS_INTRO) {
                    this._loadStage(this.currentStageIndex);
                } else if (this.prevState === STATES.GAME_OVER) {
                    this._loadStage(this.currentStageIndex);
                    this.player.reset();
                }
                this._playStageMusic();
                break;
            case STATES.MENU:
                this.sound.playBgm('menu');
                break;
            case STATES.CANNON_COMPLETE:
                this.cannonComplete = true;
                this.sound.playLevelUp();
                this.sound.stopBgm();
                break;
            case STATES.BOSS_INTRO:
                this.shakeAmount = 3;
                this.shakeTimer = 2;
                this.sound.playBossAppear();
                this.sound.stopBgm();
                break;
            case STATES.SHOP:
                this.shopTab = 0;
                this.shopCursor = 0;
                this.sound.playBgm('shop');
                break;
            case STATES.GAME_OVER:
                this.sound.stopBgm();
                break;
            case STATES.WIN:
                this.sound.playBgm('win');
                break;
            case STATES.STAGE_CLEAR:
                this.sound.stopBgm();
                break;
        }
    }

    _playStageMusic() {
        const bg = this.stage ? this.stage.getBackground() : 'village';
        const isHard = this.difficulty === 'hard';

        if (bg === 'castle') {
            // 보스전
            this.sound.playBgm(isHard ? 'boss_hard' : 'boss');
        } else if (isHard) {
            this.sound.playBgm('hard_' + bg);
        } else {
            this.sound.playBgm(bg);
        }
    }

    _startNewGame() {
        this.difficulty = DIFFICULTY_KEYS[this.difficultyIndex];
        this.materialsCollected = 0;
        this.cannonComplete = false;
        this.score = 0;
        this.combo = 0;
        this.comboTimer = 0;
        this.maxCombo = 0;
        this.currentStageIndex = 0;
        this.player = new Player(this.game);
        this._loadStage(0);
    }

    _loadStage(index) {
        this.currentStageIndex = index;
        this.stage = new StageManager(this.game, index, this.cannonComplete, this.difficulty);
        this.stage.sound = this.sound;
        // 스테이지 시작 배너
        this.stageBannerTimer = 2.5;
        // 콤보 초기화 (스테이지 새로 시작 시)
        this.combo = 0;
        this.comboTimer = 0;
    }

    shake(amount, duration) {
        this.shakeAmount = Math.max(this.shakeAmount, amount);
        this.shakeTimer = Math.max(this.shakeTimer, duration);
    }

    hitPause(duration) {
        this.hitPauseTime = Math.max(this.hitPauseTime, duration);
    }

    // === 게임 이벤트 콜백 (CollisionManager에서 호출) ===
    onHit(isBoss) {
        // 콤보 유지 (콤보 자체는 적이 죽었을 때만 증가)
        // 작은 흔들림 + 작은 hit pause
        this.shake(isBoss ? 2 : 1, 0.08);
        if (isBoss) this.hitPause(0.025);
    }

    onEnemyKilled(enemy) {
        this.combo++;
        if (this.combo > this.maxCombo) this.maxCombo = this.combo;
        this.comboTimer = this.comboMaxTimer;

        // 점수 (몬스터 종류별 + 콤보 보너스)
        const baseScore = enemy.maxHp * 10;
        const comboMul = 1 + Math.min(2, this.combo * 0.1);
        const earned = Math.ceil(baseScore * comboMul);
        this.score += earned;

        // 콤보 텍스트
        if (this.stage) {
            this.stage.showComboText(enemy.cx, enemy.y, this.combo);
            // 점수 표시 (적 죽으면)
            this.stage.addFloatingText(enemy.cx, enemy.cy + 20, `+${earned}`, {
                color: '#FFD700', outlineColor: '#5D4037', size: 13, vy: -50, lifetime: 0.7,
            });
        }

        this.shake(2, 0.12);
        this.hitPause(0.04);
    }

    onBossKilled() {
        this.score += 1000;
        this.shake(8, 0.6);
        this.hitPause(0.3);
    }

    onCastleDestroyed() {
        this.score += 500;
        this.shake(6, 0.5);
        this.hitPause(0.15);
    }

    onPlayerHit() {
        this.combo = 0;
        this.comboTimer = 0;
        this.shake(4, 0.25);
        this.hitPause(0.08);
    }

    onHouseHit() {
        this.shake(2, 0.12);
    }

    get activeSkins() {
        return {
            body: BODY_SKINS.find(s => s.id === this.save.activeBodySkin) || BODY_SKINS[0],
            bullet: BULLET_SKINS.find(s => s.id === this.save.activeBulletSkin) || BULLET_SKINS[0],
        };
    }

    update(dt) {
        // Hit pause: 플레이 중일 때만 게임 시간 정지
        if (this.hitPauseTime > 0 && this.state === STATES.PLAYING) {
            this.hitPauseTime -= dt;
            this.transitionTimer += dt;
            // 플레이어/스테이지 업데이트 스킵, 입력만 살아있음
            return;
        }
        if (this.hitPauseTime > 0) this.hitPauseTime -= dt;

        this.transitionTimer += dt;
        if (this.stageBannerTimer > 0) this.stageBannerTimer -= dt;

        if (this.shakeTimer > 0) {
            this.shakeTimer -= dt;
            if (this.shakeTimer <= 0) this.shakeAmount = 0;
        }

        // 콤보 타이머
        if (this.comboTimer > 0) {
            this.comboTimer -= dt;
            if (this.comboTimer <= 0) this.combo = 0;
        }

        const input = this.game.input;

        switch (this.state) {
            case STATES.MENU:
                if (input.isJustPressed('ArrowLeft') || input.isJustPressed('KeyA')) {
                    const prev = this.difficultyIndex;
                    this.difficultyIndex = Math.max(0, this.difficultyIndex - 1);
                    if (prev !== this.difficultyIndex) this.sound.playMenuSelect();
                }
                if (input.isJustPressed('ArrowRight') || input.isJustPressed('KeyD')) {
                    const prev = this.difficultyIndex;
                    this.difficultyIndex = Math.min(DIFFICULTY_KEYS.length - 1, this.difficultyIndex + 1);
                    if (prev !== this.difficultyIndex) this.sound.playMenuSelect();
                }
                // 모바일: 난이도 터치 선택
                if (this.game.touch && this.game.touch.touchedDifficulty >= 0) {
                    const td = this.game.touch.touchedDifficulty;
                    this.game.touch.touchedDifficulty = -1;
                    if (td !== this.difficultyIndex) {
                        this.difficultyIndex = td;
                        this.sound.init();
                        this.sound.playMenuSelect();
                    }
                }
                if (input.isJustPressed('KeyS') || (this.game.touch && this.game.touch.justShop)) {
                    this.sound.init();
                    this.sound.playMenuConfirm();
                    this.setState(STATES.SHOP);
                    break;
                }
                if (input.confirm) {
                    this.sound.init();
                    this.sound.playMenuConfirm();
                    this.setState(STATES.TUTORIAL);
                }
                break;

            case STATES.TUTORIAL:
                if (input.confirm && this.transitionTimer > 0.5) {
                    this.setState(STATES.PLAYING);
                }
                break;

            case STATES.PLAYING:
                if (input.pause) {
                    this.setState(STATES.PAUSED);
                    break;
                }
                this._updatePlaying(dt);
                break;

            case STATES.PAUSED:
                if (input.pause) {
                    this.setState(STATES.PLAYING);
                }
                // 나가기 버튼 (키보드 Q 또는 터치)
                if (input.isJustPressed('KeyQ') || (this.game.touch && this.game.touch.touchedQuit)) {
                    if (this.game.touch) this.game.touch.touchedQuit = false;
                    this.setState(STATES.CONFIRM_QUIT);
                }
                break;

            case STATES.CONFIRM_QUIT:
                this._updateConfirmQuit(input);
                break;

            case STATES.STAGE_CLEAR:
                if (input.confirm && this.transitionTimer > 1) {
                    if (this.materialsCollected >= TOTAL_MATERIALS && !this.cannonComplete) {
                        this.setState(STATES.CANNON_COMPLETE);
                    } else {
                        const nextIndex = this.currentStageIndex + 1;
                        this.currentStageIndex = nextIndex;
                        const nextStage = STAGES[nextIndex];
                        if (nextStage && nextStage.isBossStage) {
                            this.setState(STATES.BOSS_INTRO);
                        } else {
                            this.setState(STATES.PLAYING);
                        }
                    }
                }
                break;

            case STATES.CANNON_COMPLETE:
                if (input.confirm && this.transitionTimer > 2) {
                    this.currentStageIndex++;
                    this.setState(STATES.BOSS_INTRO);
                }
                break;

            case STATES.BOSS_INTRO:
                if (this.transitionTimer > 2.5) {
                    this.setState(STATES.PLAYING);
                }
                break;

            case STATES.GAME_OVER:
                if (input.confirm && this.transitionTimer > 1) {
                    this.setState(STATES.MENU);
                }
                break;

            case STATES.WIN:
                if (input.confirm && this.transitionTimer > 2) {
                    const coinReward = DIFFICULTIES[this.difficulty].coins;
                    this.save.addCoins(coinReward);
                    this.setState(STATES.MENU);
                }
                break;

            case STATES.SHOP:
                this._updateShop(input);
                break;
        }
    }

    _updateShop(input) {
        const touch = this.game.touch;
        let items = this.shopTab === 0 ? BODY_SKINS : BULLET_SKINS;

        if (input.isJustPressed('KeyQ')) {
            if (this.shopTab !== 0) { this.shopTab = 0; this.shopCursor = 0; this.sound.playMenuSelect(); }
        }
        if (input.isJustPressed('KeyE')) {
            if (this.shopTab !== 1) { this.shopTab = 1; this.shopCursor = 0; this.sound.playMenuSelect(); }
        }

        // 모바일: 탭 터치
        if (touch && touch.touchedShopTab >= 0) {
            const newTab = touch.touchedShopTab;
            touch.touchedShopTab = -1;
            if (this.shopTab !== newTab) {
                this.shopTab = newTab;
                this.shopCursor = 0;
                this.sound.playMenuSelect();
                items = this.shopTab === 0 ? BODY_SKINS : BULLET_SKINS;
            }
        }

        if (input.isJustPressed('ArrowUp') || input.isJustPressed('KeyW')) {
            const prev = this.shopCursor;
            this.shopCursor = Math.max(0, this.shopCursor - 1);
            if (prev !== this.shopCursor) this.sound.playMenuSelect();
        }
        if (input.isJustPressed('ArrowDown')) {
            const prev = this.shopCursor;
            this.shopCursor = Math.min(items.length - 1, this.shopCursor + 1);
            if (prev !== this.shopCursor) this.sound.playMenuSelect();
        }

        // 모바일: 아이템 터치 선택
        if (touch && touch.touchedShopItem >= 0) {
            const scrollOffset = Math.max(0, this.shopCursor - 7);
            const itemIndex = scrollOffset + touch.touchedShopItem;
            touch.touchedShopItem = -1;
            if (itemIndex >= 0 && itemIndex < items.length) {
                if (this.shopCursor !== itemIndex) {
                    this.shopCursor = itemIndex;
                    this.sound.playMenuSelect();
                }
            }
        }

        // 구매/장착 (키보드 Z 또는 모바일 구매 버튼)
        let buyAction = input.isJustPressed('KeyZ');
        if (touch && touch.touchedShopBuy) {
            touch.touchedShopBuy = false;
            buyAction = true;
        }

        if (buyAction) {
            const item = items[this.shopCursor];
            if (this.shopTab === 0) {
                if (this.save.ownsBodySkin(item.id)) {
                    this.save.setActiveBodySkin(item.id);
                    this.sound.playLevelUp();
                } else if (item.price > 0 && this.save.buyBodySkin(item.id, item.price)) {
                    this.sound.playBuy();
                }
            } else {
                if (this.save.ownsBulletSkin(item.id)) {
                    this.save.setActiveBulletSkin(item.id);
                    this.sound.playLevelUp();
                } else if (item.price > 0 && this.save.buyBulletSkin(item.id, item.price)) {
                    this.sound.playBuy();
                }
            }
        }

        // 뒤로가기 (ESC 또는 모바일 뒤로 버튼)
        let backAction = input.pause;
        if (touch && touch.touchedShopBack) {
            touch.touchedShopBack = false;
            backAction = true;
        }

        if (backAction) {
            this.setState(STATES.MENU);
        }
    }

    _updateConfirmQuit(input) {
        const touch = this.game.touch;

        // 예 (메인으로 돌아가기): 키보드 Z/Enter 또는 터치
        let yesAction = input.isJustPressed('KeyZ') || input.isJustPressed('Enter');
        if (touch && touch.touchedQuitYes) {
            touch.touchedQuitYes = false;
            yesAction = true;
        }

        // 아니오 (계속 플레이): ESC/X 또는 터치
        let noAction = input.isJustPressed('Escape') || input.isJustPressed('KeyX');
        if (touch && touch.touchedQuitNo) {
            touch.touchedQuitNo = false;
            noAction = true;
        }

        if (yesAction) {
            this.setState(STATES.MENU);
        } else if (noAction) {
            this.setState(STATES.PLAYING);
        }
    }

    _updatePlaying(dt) {
        const player = this.player;
        const stage = this.stage;
        const freezeEnabled = DIFFICULTIES[this.difficulty].freezeEnabled;

        player.update(dt, this.game.input, this.cannonComplete, freezeEnabled, this.sound);

        // 차지 샷 발사 시 화면 흔들림
        if (player.chargeReleaseRequest) {
            player.chargeReleaseRequest = false;
            const ratio = player.chargeReleaseRatio;
            this.shake(ratio >= 1 ? 5 : 2.5, 0.15);
        }

        stage.update(dt, player);
        this.collision.check(player, stage, this.sound, dt, this);

        // 얼리기 발동
        if (player.freezeActive) {
            player.freezeActive = false;
            if (freezeEnabled) {
                stage.freezeAllEnemies(FREEZE_DURATION);
                this.sound.playFreeze();
                stage.addParticles(createFreezeParticles(BASE_WIDTH / 2, BASE_HEIGHT / 2));
            }
        }

        // 승리
        if (stage.isCleared()) {
            if (stage.isBossStage()) {
                this.setState(STATES.WIN);
                this.sound.playStageClear();
            } else {
                this.materialsCollected++;
                this.sound.playStageClear();
                this.setState(STATES.STAGE_CLEAR);
            }
        }

        // 패배: 집 파괴
        if (stage.house && stage.house.hp <= 0) {
            this.setState(STATES.GAME_OVER);
            this.sound.playGameOver();
        }

        // 패배: 사망
        if (player.hp <= 0) {
            this.setState(STATES.GAME_OVER);
            this.sound.playGameOver();
        }
    }

    draw(ctx) {
        if (this.shakeAmount > 0) {
            const sx = (Math.random() - 0.5) * this.shakeAmount * 2;
            const sy = (Math.random() - 0.5) * this.shakeAmount * 2;
            ctx.translate(sx, sy);
        }

        const skins = this.activeSkins;

        switch (this.state) {
            case STATES.MENU:
                this.ui.drawMenu(ctx, this.transitionTimer, this.difficultyIndex, this.save.coins);
                break;
            case STATES.TUTORIAL:
                this.ui.drawTutorial(ctx, this.transitionTimer, this.difficulty);
                break;
            case STATES.PLAYING:
                this._drawPlaying(ctx, skins);
                break;
            case STATES.PAUSED:
                this._drawPlaying(ctx, skins);
                this.ui.drawPaused(ctx);
                break;
            case STATES.STAGE_CLEAR:
                this._drawPlaying(ctx, skins);
                this.ui.drawStageClear(ctx, this.currentStageIndex, this.materialsCollected, this.transitionTimer);
                break;
            case STATES.CANNON_COMPLETE:
                this.ui.drawCannonComplete(ctx, this.transitionTimer);
                break;
            case STATES.BOSS_INTRO:
                this.bg.draw(ctx, 'castle');
                this.ui.drawBossIntro(ctx, this.transitionTimer);
                break;
            case STATES.GAME_OVER:
                this._drawPlaying(ctx, skins);
                this.ui.drawGameOver(ctx, this.transitionTimer);
                break;
            case STATES.WIN: {
                const coinReward = DIFFICULTIES[this.difficulty].coins;
                this.ui.drawWin(ctx, this.score, this.transitionTimer, coinReward);
                break;
            }
            case STATES.CONFIRM_QUIT:
                this._drawPlaying(ctx, skins);
                this.ui.drawConfirmQuit(ctx);
                break;
            case STATES.SHOP:
                this.ui.drawShop(ctx, this.transitionTimer, this.shopTab, this.shopCursor, this.save, this.sprite);
                break;
        }
    }

    _drawPlaying(ctx, skins) {
        const bgTheme = this.stage ? this.stage.getBackground() : 'village';
        this.bg.draw(ctx, bgTheme);
        if (this.stage) this.stage.draw(ctx, this.sprite);
        if (this.player) this.player.draw(ctx, this.sprite, this.cannonComplete, skins);

        // Final Stand 모드 (집 HP < 30%)
        if (this.stage && this.stage.house) {
            const hr = this.stage.house.hpRatio;
            if (hr > 0 && hr <= 0.3) {
                this.ui.drawFinalStandOverlay(ctx, this.transitionTimer);
            }
        }

        if (this.stage && this.player) {
            this.ui.drawHUD(ctx, this.player, this.stage, this.materialsCollected, this.cannonComplete, this.currentStageIndex, this.difficulty, this.score, this.combo, this.comboTimer / this.comboMaxTimer);
        }

        // 웨이브 경고
        if (this.stage && this.stage.nextWaveWarning) {
            this.ui.drawWaveWarning(ctx, this.stage.nextWaveWarning);
        }

        // 스테이지 시작 배너
        if (this.stageBannerTimer > 0 && this.stage) {
            this.ui.drawStageBanner(ctx, this.currentStageIndex, this.stage.stageData.name, this.stageBannerTimer, this.difficulty);
        }
    }
}
