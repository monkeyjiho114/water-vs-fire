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

        // 모바일: 첫 터치 시 전체화면 요청
        if (this.isMobile) {
            this._setupFullscreen();
        }

        this.loop = new GameLoop(
            (dt) => this._update(dt),
            () => this._draw()
        );
        this.loop.start();
    }

    _setupFullscreen() {
        const el = document.documentElement;

        const requestFS = () => {
            const fs = el.requestFullscreen
                || el.webkitRequestFullscreen
                || el.mozRequestFullScreen
                || el.msRequestFullscreen;

            if (fs) {
                fs.call(el).then(() => {
                    // 가로모드 잠금 시도
                    if (screen.orientation && screen.orientation.lock) {
                        screen.orientation.lock('landscape').catch(() => {});
                    }
                    setTimeout(() => this._resize(), 200);
                }).catch(() => {});
            }
            // 한 번만 실행
            document.removeEventListener('touchstart', requestFS);
        };

        document.addEventListener('touchstart', requestFS, { once: true });

        // 전체화면 변경 시 리사이즈
        document.addEventListener('fullscreenchange', () => {
            setTimeout(() => this._resize(), 200);
        });
        document.addEventListener('webkitfullscreenchange', () => {
            setTimeout(() => this._resize(), 200);
        });
    }

    _resize() {
        const dpr = window.devicePixelRatio || 1;
        const w = window.innerWidth;
        const h = window.innerHeight;

        if (this.isMobile) {
            // 모바일: 화면을 꽉 채우되, 가로 비율 최대 1.25배까지만 허용
            const rawScaleX = w / BASE_WIDTH;
            const rawScaleY = h / BASE_HEIGHT;
            const maxStretch = 1.25; // 가로/세로 비율 차이 최대 25%
            const ratio = rawScaleX / rawScaleY;

            if (ratio > maxStretch) {
                // 가로가 너무 길면 → 세로 기준으로 맞추고 가로는 최대치로 제한
                this.scaleY = rawScaleY;
                this.scaleX = rawScaleY * maxStretch;
            } else {
                this.scaleX = rawScaleX;
                this.scaleY = rawScaleY;
            }
        } else {
            // PC: 비율 유지
            const s = Math.min(w / BASE_WIDTH, h / BASE_HEIGHT);
            this.scaleX = s;
            this.scaleY = s;
        }

        // 통합 scale (터치 좌표 변환 등에 사용)
        this.scale = this.scaleX;

        // 실제 게임 영역 크기
        const gameW = BASE_WIDTH * this.scaleX;
        const gameH = BASE_HEIGHT * this.scaleY;

        // 캔버스 크기 = 게임 영역 (넘치면 중앙 정렬)
        this.canvas.style.width = gameW + 'px';
        this.canvas.style.height = gameH + 'px';

        // 실제 캔버스 해상도 = 게임 영역 × DPR (선명도 확보)
        this.canvas.width = gameW * dpr;
        this.canvas.height = gameH * dpr;

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
