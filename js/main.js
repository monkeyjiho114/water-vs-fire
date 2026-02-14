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

        // 화면을 꽉 채우도록 스케일 (가로모드 전용)
        const scaleX = w / BASE_WIDTH;
        const scaleY = h / BASE_HEIGHT;
        this.scale = Math.max(scaleX, scaleY); // max로 화면 꽉 채움

        const canvasW = w;
        const canvasH = h;

        // CSS 크기 = 화면 크기
        this.canvas.style.width = canvasW + 'px';
        this.canvas.style.height = canvasH + 'px';

        // 실제 캔버스 해상도 = CSS 크기 × devicePixelRatio (선명도 확보)
        this.canvas.width = canvasW * dpr;
        this.canvas.height = canvasH * dpr;

        // 내부에서 사용할 DPR 저장
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

        ctx.save();

        // DPR 보정 + 게임 스케일 적용
        ctx.scale(dpr * this.scale, dpr * this.scale);

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
