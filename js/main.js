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
        this.dpr = 1;
        this.offsetX = 0;
        this.offsetY = 0;

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

        // 비율 유지하면서 화면에 맞춤 (잘리지 않게 min 사용)
        const scaleX = w / BASE_WIDTH;
        const scaleY = h / BASE_HEIGHT;
        this.scale = Math.min(scaleX, scaleY);

        // 게임 영역을 화면 중앙에 배치
        const gameW = BASE_WIDTH * this.scale;
        const gameH = BASE_HEIGHT * this.scale;
        this.offsetX = (w - gameW) / 2;
        this.offsetY = (h - gameH) / 2;

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

        // 전체 화면 클리어 (검은 배경 = 레터박스)
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.save();

        // DPR 보정 → 오프셋으로 중앙 배치 → 게임 스케일 적용
        ctx.scale(dpr, dpr);
        ctx.translate(this.offsetX, this.offsetY);
        ctx.scale(this.scale, this.scale);

        // 게임 영역 클리핑 (게임 밖으로 그려지는 것 방지)
        ctx.beginPath();
        ctx.rect(0, 0, BASE_WIDTH, BASE_HEIGHT);
        ctx.clip();

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
