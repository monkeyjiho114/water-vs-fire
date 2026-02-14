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
        this.scaleX = 1;
        this.scaleY = 1;
        this.dpr = 1;
        this.isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

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
                setTimeout(() => this._resize(), 150);
            });
        }
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this._resize(), 150);
        });

        this.loop = new GameLoop(
            (dt) => this._update(dt),
            () => this._draw()
        );
        this.loop.start();
    }

    _resize() {
        const dpr = window.devicePixelRatio || 1;
        const w = window.innerWidth;
        const h = window.innerHeight;

        if (this.isMobile) {
            // 모바일: 화면을 꽉 채움 (X, Y 독립 스케일)
            this.scaleX = w / BASE_WIDTH;
            this.scaleY = h / BASE_HEIGHT;
        } else {
            // PC: 비율 유지
            const s = Math.min(w / BASE_WIDTH, h / BASE_HEIGHT);
            this.scaleX = s;
            this.scaleY = s;
        }

        // 통합 scale (터치 좌표 변환 등에 사용)
        this.scale = this.scaleX;

        // 캔버스는 화면 전체 커버
        this.canvas.style.width = w + 'px';
        this.canvas.style.height = h + 'px';

        // 실제 캔버스 해상도 = 화면 크기 × DPR (선명도 확보)
        this.canvas.width = w * dpr;
        this.canvas.height = h * dpr;

        this.dpr = dpr;
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
        const dpr = this.dpr;

        // 전체 화면 클리어
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.save();

        // DPR 보정 → 화면 꽉 채우기 스케일 (X, Y 독립)
        ctx.scale(dpr * this.scaleX, dpr * this.scaleY);

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
