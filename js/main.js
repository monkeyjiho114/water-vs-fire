import { BASE_WIDTH, BASE_HEIGHT, STATES, GROUND_RATIO } from './data/constants.js';
import { GameLoop } from './engine/GameLoop.js';
import { InputManager } from './engine/InputManager.js';
import { TouchManager } from './engine/TouchManager.js';
import { GameStateManager } from './state/GameStateManager.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scale = 1;

        this.input = new InputManager();
        this.stateManager = new GameStateManager(this);

        // 터치 매니저 (모바일 감지 후 자동 활성화)
        this.touch = new TouchManager(this.canvas, this);
        this.input.touch = this.touch;

        this._resize();
        window.addEventListener('resize', () => this._resize());

        // 모바일 방향 전환 대응
        if (screen.orientation) {
            screen.orientation.addEventListener('change', () => {
                setTimeout(() => this._resize(), 100);
            });
        }

        this.loop = new GameLoop(
            (dt) => this._update(dt),
            () => this._draw()
        );
        this.loop.start();
    }

    _resize() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        // 800x600 비율을 유지하면서 전체화면에 맞춤
        const scaleX = w / BASE_WIDTH;
        const scaleY = h / BASE_HEIGHT;
        this.scale = Math.min(scaleX, scaleY);

        this.canvas.width = BASE_WIDTH * this.scale;
        this.canvas.height = BASE_HEIGHT * this.scale;
    }

    // 게임 좌표 기준 바닥 Y
    get groundY() {
        return BASE_HEIGHT * GROUND_RATIO;
    }

    _update(dt) {
        this.input.update();

        // 터치 버튼 레이아웃 업데이트
        const sm = this.stateManager;
        const isPlaying = sm.state === STATES.PLAYING || sm.state === STATES.PAUSED;
        const freezeEnabled = sm.difficulty === 'hard';
        this.touch.updateButtonLayout(isPlaying ? 'playing' : 'menu', freezeEnabled);

        this.stateManager.update(dt);
    }

    _draw() {
        const ctx = this.ctx;
        ctx.save();
        ctx.scale(this.scale, this.scale);

        // 화면 클리어
        ctx.clearRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

        this.stateManager.draw(ctx);

        // 터치 컨트롤 오버레이
        const sm = this.stateManager;
        const isPlaying = sm.state === STATES.PLAYING || sm.state === STATES.PAUSED;
        const freezeEnabled = sm.difficulty === 'hard';
        this.touch.draw(ctx, isPlaying ? 'playing' : 'menu', freezeEnabled);

        ctx.restore();
    }
}

// 게임 시작
new Game();
