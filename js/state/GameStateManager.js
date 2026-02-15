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
        this.currentStageIndex = 0;
        this.player = new Player(this.game);
        this._loadStage(0);
    }

    _loadStage(index) {
        this.currentStageIndex = index;
        this.stage = new StageManager(this.game, index, this.cannonComplete, this.difficulty);
        this.stage.sound = this.sound;
    }

    shake(amount, duration) {
        this.shakeAmount = amount;
        this.shakeTimer = duration;
    }

    get activeSkins() {
        return {
            body: BODY_SKINS.find(s => s.id === this.save.activeBodySkin) || BODY_SKINS[0],
            bullet: BULLET_SKINS.find(s => s.id === this.save.activeBulletSkin) || BULLET_SKINS[0],
        };
    }

    update(dt) {
        this.transitionTimer += dt;

        if (this.shakeTimer > 0) {
            this.shakeTimer -= dt;
            if (this.shakeTimer <= 0) this.shakeAmount = 0;
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
                    this.setState(STATES.PLAYING);
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

    _updatePlaying(dt) {
        const player = this.player;
        const stage = this.stage;
        const freezeEnabled = DIFFICULTIES[this.difficulty].freezeEnabled;

        player.update(dt, this.game.input, this.cannonComplete, freezeEnabled, this.sound);
        stage.update(dt, player);
        this.collision.check(player, stage, this.sound, dt);

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
        if (this.stage && this.player) {
            this.ui.drawHUD(ctx, this.player, this.stage, this.materialsCollected, this.cannonComplete, this.currentStageIndex, this.difficulty);
        }
    }
}
