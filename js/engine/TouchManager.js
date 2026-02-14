import { BASE_WIDTH, BASE_HEIGHT } from '../data/constants.js';

/**
 * 모바일 터치 컨트롤 매니저
 * - 왼쪽 하단: 가상 조이스틱 (이동)
 * - 오른쪽 하단: 액션 버튼들 (점프, 발사, 얼리기)
 * - 화면 상단 탭: 메뉴 전용 (확인/일시정지)
 */
export class TouchManager {
    constructor(canvas, game) {
        this.canvas = canvas;
        this.game = game;
        this.isMobile = this._detectMobile();

        // 가상 입력 상태
        this.touchLeft = false;
        this.touchRight = false;
        this.touchJump = false;
        this.touchShoot = false;
        this.touchFreeze = false;
        this.touchConfirm = false;
        this.touchPause = false;

        // 메뉴 전용: 난이도 터치 선택 (-1 = 없음, 0=easy, 1=normal, 2=hard)
        this.touchedDifficulty = -1;

        // justPressed 추적
        this._prevJump = false;
        this._prevFreeze = false;
        this._prevConfirm = false;
        this._prevPause = false;
        this.justJump = false;
        this.justFreeze = false;
        this.justConfirm = false;
        this.justPause = false;

        // 조이스틱 상태
        this.joystick = {
            active: false,
            touchId: null,
            baseX: 0,
            baseY: 0,
            stickX: 0,
            stickY: 0,
            radius: 50,
        };

        // 활성 터치 추적
        this.activeTouches = new Map();

        // 버튼 영역 (게임 좌표 기준, draw 시 업데이트)
        this.buttons = {};

        if (this.isMobile) {
            this._bindEvents();
        }
    }

    _detectMobile() {
        return 'ontouchstart' in window ||
            navigator.maxTouchPoints > 0 ||
            /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    _bindEvents() {
        const opts = { passive: false };

        this.canvas.addEventListener('touchstart', (e) => this._onTouchStart(e), opts);
        this.canvas.addEventListener('touchmove', (e) => this._onTouchMove(e), opts);
        this.canvas.addEventListener('touchend', (e) => this._onTouchEnd(e), opts);
        this.canvas.addEventListener('touchcancel', (e) => this._onTouchEnd(e), opts);
    }

    // 화면 좌표 → 게임 좌표 변환 (offset + scale 보정)
    _toGameCoords(touch) {
        const rect = this.canvas.getBoundingClientRect();
        const scale = this.game.scale;
        const offsetX = this.game.offsetX || 0;
        const offsetY = this.game.offsetY || 0;
        return {
            x: (touch.clientX - rect.left - offsetX) / scale,
            y: (touch.clientY - rect.top - offsetY) / scale,
        };
    }

    _onTouchStart(e) {
        e.preventDefault();
        for (const touch of e.changedTouches) {
            const pos = this._toGameCoords(touch);
            this.activeTouches.set(touch.identifier, pos);

            // 메뉴 난이도 터치 감지 (Y: 300~354 영역)
            if (pos.y >= 300 && pos.y <= 360) {
                const center = BASE_WIDTH / 2;
                for (let i = 0; i < 3; i++) {
                    const dx = center + (i - 1) * 130;
                    if (pos.x >= dx - 55 && pos.x <= dx + 55) {
                        this.touchedDifficulty = i;
                    }
                }
            }

            // 조이스틱 영역 (왼쪽 절반 하단)
            if (pos.x < BASE_WIDTH / 2 && pos.y > BASE_HEIGHT * 0.45 && !this.joystick.active) {
                this.joystick.active = true;
                this.joystick.touchId = touch.identifier;
                this.joystick.baseX = pos.x;
                this.joystick.baseY = pos.y;
                this.joystick.stickX = pos.x;
                this.joystick.stickY = pos.y;
            }
        }
        this._updateFromTouches();
    }

    _onTouchMove(e) {
        e.preventDefault();
        for (const touch of e.changedTouches) {
            const pos = this._toGameCoords(touch);
            this.activeTouches.set(touch.identifier, pos);

            // 조이스틱 이동
            if (this.joystick.active && touch.identifier === this.joystick.touchId) {
                this.joystick.stickX = pos.x;
                this.joystick.stickY = pos.y;
            }
        }
        this._updateFromTouches();
    }

    _onTouchEnd(e) {
        e.preventDefault();
        for (const touch of e.changedTouches) {
            this.activeTouches.delete(touch.identifier);

            if (this.joystick.active && touch.identifier === this.joystick.touchId) {
                this.joystick.active = false;
                this.joystick.touchId = null;
            }
        }
        this._updateFromTouches();
    }

    _updateFromTouches() {
        // 조이스틱 → 방향
        this.touchLeft = false;
        this.touchRight = false;

        if (this.joystick.active) {
            const dx = this.joystick.stickX - this.joystick.baseX;
            const dy = this.joystick.stickY - this.joystick.baseY;
            const deadzone = 12;

            if (dx < -deadzone) this.touchLeft = true;
            if (dx > deadzone) this.touchRight = true;
        }

        // 버튼 체크
        this.touchJump = false;
        this.touchShoot = false;
        this.touchFreeze = false;
        this.touchConfirm = false;
        this.touchPause = false;

        for (const [id, pos] of this.activeTouches) {
            if (this.joystick.active && id === this.joystick.touchId) continue;

            // 각 버튼 히트 테스트
            if (this._hitTest(pos, this.buttons.jump)) this.touchJump = true;
            if (this._hitTest(pos, this.buttons.shoot)) this.touchShoot = true;
            if (this._hitTest(pos, this.buttons.freeze)) this.touchFreeze = true;
            if (this._hitTest(pos, this.buttons.confirm)) this.touchConfirm = true;
            if (this._hitTest(pos, this.buttons.pause)) this.touchPause = true;

            // 게임 화면 상단 영역 탭 = 확인 (메뉴/전환 화면용)
            if (pos.y < BASE_HEIGHT * 0.4) {
                this.touchConfirm = true;
            }
        }
    }

    _hitTest(pos, btn) {
        if (!btn) return false;
        return pos.x >= btn.x && pos.x <= btn.x + btn.w &&
               pos.y >= btn.y && pos.y <= btn.y + btn.h;
    }

    // 매 프레임 호출 — justPressed 갱신
    update() {
        this.justJump = this.touchJump && !this._prevJump;
        this.justFreeze = this.touchFreeze && !this._prevFreeze;
        this.justConfirm = this.touchConfirm && !this._prevConfirm;
        this.justPause = this.touchPause && !this._prevPause;

        this._prevJump = this.touchJump;
        this._prevFreeze = this.touchFreeze;
        this._prevConfirm = this.touchConfirm;
        this._prevPause = this.touchPause;
    }

    // 버튼 영역 정의 (게임 상태에 따라 다름)
    updateButtonLayout(state, freezeEnabled) {
        const bSize = 56;
        const pad = 14;
        const rightBase = BASE_WIDTH - pad - bSize;
        const bottomBase = BASE_HEIGHT - pad - bSize;

        // 기본 액션 버튼 (오른쪽 하단)
        this.buttons.jump = {
            x: rightBase - bSize - pad,
            y: bottomBase - bSize - pad * 0.5,
            w: bSize, h: bSize,
            label: 'JUMP', color: '#4FC3F7'
        };
        this.buttons.shoot = {
            x: rightBase,
            y: bottomBase,
            w: bSize, h: bSize,
            label: 'FIRE', color: '#FF7043'
        };

        if (freezeEnabled) {
            this.buttons.freeze = {
                x: rightBase - bSize - pad,
                y: bottomBase,
                w: bSize, h: bSize,
                label: 'ICE', color: '#81D4FA'
            };
        } else {
            this.buttons.freeze = null;
        }

        // 일시정지 (오른쪽 상단)
        this.buttons.pause = {
            x: BASE_WIDTH - 48, y: 4,
            w: 44, h: 32,
            label: '| |', color: 'rgba(255,255,255,0.4)'
        };

        // 확인 버튼 (화면 중앙 하단 — 메뉴/전환 화면용)
        this.buttons.confirm = {
            x: BASE_WIDTH / 2 - 70,
            y: BASE_HEIGHT - 80,
            w: 140, h: 50,
            label: 'TAP', color: 'rgba(255,255,255,0.3)'
        };
    }

    // 터치 컨트롤 그리기
    draw(ctx, state, freezeEnabled) {
        if (!this.isMobile) return;

        ctx.save();
        ctx.globalAlpha = 0.5;

        const isPlaying = state === 'playing' || state === 'paused';

        if (isPlaying) {
            this._drawJoystick(ctx);
            this._drawButton(ctx, this.buttons.jump, this.touchJump);
            this._drawButton(ctx, this.buttons.shoot, this.touchShoot);
            if (freezeEnabled && this.buttons.freeze) {
                this._drawButton(ctx, this.buttons.freeze, this.touchFreeze);
            }
            this._drawPauseButton(ctx);
        }

        ctx.restore();
    }

    _drawJoystick(ctx) {
        const jx = this.joystick.active ? this.joystick.baseX : 100;
        const jy = this.joystick.active ? this.joystick.baseY : BASE_HEIGHT - 100;
        const r = this.joystick.radius;

        // 외곽 원
        ctx.beginPath();
        ctx.arc(jx, jy, r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 스틱
        let sx = jx, sy = jy;
        if (this.joystick.active) {
            const dx = this.joystick.stickX - this.joystick.baseX;
            const dy = this.joystick.stickY - this.joystick.baseY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = r * 0.7;
            if (dist > maxDist) {
                sx = jx + (dx / dist) * maxDist;
                sy = jy + (dy / dist) * maxDist;
            } else {
                sx = this.joystick.stickX;
                sy = this.joystick.stickY;
            }
        }

        ctx.beginPath();
        ctx.arc(sx, sy, 20, 0, Math.PI * 2);
        ctx.fillStyle = this.joystick.active ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.3)';
        ctx.fill();
    }

    _drawButton(ctx, btn, pressed) {
        if (!btn) return;

        // 버튼 배경
        ctx.fillStyle = pressed ? 'rgba(255,255,255,0.4)' : btn.color;
        ctx.globalAlpha = pressed ? 0.7 : 0.45;
        ctx.beginPath();
        ctx.arc(btn.x + btn.w / 2, btn.y + btn.h / 2, btn.w / 2, 0, Math.PI * 2);
        ctx.fill();

        // 테두리
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 레이블
        ctx.globalAlpha = pressed ? 0.9 : 0.7;
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(btn.label, btn.x + btn.w / 2, btn.y + btn.h / 2);
        ctx.textBaseline = 'alphabetic';
    }

    _drawPauseButton(ctx) {
        const btn = this.buttons.pause;
        if (!btn) return;

        ctx.globalAlpha = 0.4;
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath();
        // 둥근 사각형
        const r = 6;
        ctx.moveTo(btn.x + r, btn.y);
        ctx.lineTo(btn.x + btn.w - r, btn.y);
        ctx.quadraticCurveTo(btn.x + btn.w, btn.y, btn.x + btn.w, btn.y + r);
        ctx.lineTo(btn.x + btn.w, btn.y + btn.h - r);
        ctx.quadraticCurveTo(btn.x + btn.w, btn.y + btn.h, btn.x + btn.w - r, btn.y + btn.h);
        ctx.lineTo(btn.x + r, btn.y + btn.h);
        ctx.quadraticCurveTo(btn.x, btn.y + btn.h, btn.x, btn.y + btn.h - r);
        ctx.lineTo(btn.x, btn.y + r);
        ctx.quadraticCurveTo(btn.x, btn.y, btn.x + r, btn.y);
        ctx.closePath();
        ctx.fill();

        // || 아이콘
        ctx.fillStyle = '#FFF';
        ctx.globalAlpha = 0.6;
        const cx = btn.x + btn.w / 2;
        const cy = btn.y + btn.h / 2;
        ctx.fillRect(cx - 6, cy - 7, 4, 14);
        ctx.fillRect(cx + 2, cy - 7, 4, 14);
    }
}
