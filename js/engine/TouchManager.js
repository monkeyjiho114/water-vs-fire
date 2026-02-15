import { BASE_WIDTH, BASE_HEIGHT } from '../data/constants.js';

/**
 * 모바일 터치 컨트롤 매니저
 * - 왼쪽 하단: 가상 조이스틱 (이동)
 * - 오른쪽 하단: 액션 버튼들 (점프, 발사, 얼리기)
 * - 메뉴/전환 화면: 아무 곳이나 터치 = 확인
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
        this.touchShop = false;

        // 메뉴 전용: 난이도 터치 선택 (-1 = 없음, 0=easy, 1=normal, 2=hard)
        this.touchedDifficulty = -1;

        // 상점 전용: 터치된 아이템/탭/뒤로가기
        this.touchedShopItem = -1;
        this.touchedShopTab = -1;
        this.touchedShopBack = false;
        this.touchedShopBuy = false;

        // justPressed 추적
        this._prevJump = false;
        this._prevFreeze = false;
        this._prevConfirm = false;
        this._prevPause = false;
        this._prevShop = false;
        this.justJump = false;
        this.justFreeze = false;
        this.justConfirm = false;
        this.justPause = false;
        this.justShop = false;

        // 현재 게임 상태 (playing / menu)
        this.currentState = 'menu';

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

        // 버튼 영역 (게임 좌표 기준)
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

    // 화면 좌표 → 게임 좌표 변환 (독립 scaleX/scaleY 지원)
    _toGameCoords(touch) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.game.scaleX || this.game.scale || 1;
        const scaleY = this.game.scaleY || this.game.scale || 1;
        return {
            x: (touch.clientX - rect.left) / scaleX,
            y: (touch.clientY - rect.top) / scaleY,
        };
    }

    _onTouchStart(e) {
        e.preventDefault();
        for (const touch of e.changedTouches) {
            const pos = this._toGameCoords(touch);
            this.activeTouches.set(touch.identifier, pos);

            if (this.currentState === 'menu') {
                // 메뉴 난이도 터치 감지 (Y: 300~360 영역)
                if (pos.y >= 300 && pos.y <= 360) {
                    const center = BASE_WIDTH / 2;
                    for (let i = 0; i < 3; i++) {
                        const dx = center + (i - 1) * 130;
                        if (pos.x >= dx - 55 && pos.x <= dx + 55) {
                            this.touchedDifficulty = i;
                        }
                    }
                }
                // 상점 버튼 터치 감지 (메뉴 하단 영역)
                if (this.buttons.shop && this._hitTest(pos, this.buttons.shop)) {
                    this.touchShop = true;
                }
            }

            if (this.currentState === 'shop') {
                // 탭 터치 감지 (Y: 95~125)
                if (pos.y >= 95 && pos.y <= 125) {
                    for (let t = 0; t < 2; t++) {
                        const tx = BASE_WIDTH / 2 + (t - 0.5) * 200;
                        if (pos.x >= tx - 85 && pos.x <= tx + 85) {
                            this.touchedShopTab = t;
                        }
                    }
                }
                // 아이템 터치 감지 (Y: 140~ 영역, 아이템 높이 48px)
                const listY = 140;
                const itemH = 48;
                if (pos.y >= listY && pos.y <= listY + 8 * itemH && pos.x >= 80 && pos.x <= BASE_WIDTH - 80) {
                    this.touchedShopItem = Math.floor((pos.y - listY) / itemH);
                }
                // 뒤로가기 버튼
                if (this.buttons.shopBack && this._hitTest(pos, this.buttons.shopBack)) {
                    this.touchedShopBack = true;
                }
                // 구매/장착 버튼
                if (this.buttons.shopBuy && this._hitTest(pos, this.buttons.shopBuy)) {
                    this.touchedShopBuy = true;
                }
            }

            // 조이스틱 영역 (왼쪽 절반 하단, playing 상태일 때만)
            if (this.currentState === 'playing' &&
                pos.x < BASE_WIDTH / 2 && pos.y > BASE_HEIGHT * 0.45 && !this.joystick.active) {
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
        this.touchShop = false;

        for (const [id, pos] of this.activeTouches) {
            if (this.joystick.active && id === this.joystick.touchId) continue;

            if (this.currentState === 'playing') {
                // 플레이 중: 버튼 히트 테스트
                if (this._hitTest(pos, this.buttons.jump)) this.touchJump = true;
                if (this._hitTest(pos, this.buttons.shoot)) this.touchShoot = true;
                if (this._hitTest(pos, this.buttons.freeze)) this.touchFreeze = true;
                if (this._hitTest(pos, this.buttons.pause)) this.touchPause = true;
            } else if (this.currentState === 'menu') {
                // 메뉴: 상점 버튼 터치 확인
                if (this.buttons.shop && this._hitTest(pos, this.buttons.shop)) {
                    this.touchShop = true;
                } else {
                    this.touchConfirm = true;
                }
            } else if (this.currentState === 'shop') {
                // 상점: 터치 무시 (touchStart에서 처리)
            } else {
                // 기타 전환 화면: 아무 곳 터치 = confirm
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
        this.justShop = this.touchShop && !this._prevShop;

        this._prevJump = this.touchJump;
        this._prevFreeze = this.touchFreeze;
        this._prevConfirm = this.touchConfirm;
        this._prevPause = this.touchPause;
        this._prevShop = this.touchShop;
    }

    // 버튼 영역 정의 (게임 상태에 따라 다름)
    updateButtonLayout(state, freezeEnabled) {
        this.currentState = state;

        if (state === 'menu') {
            // 메뉴: 상점 버튼
            const btnW = 100;
            const btnH = 40;
            this.buttons.shop = {
                x: BASE_WIDTH / 2 - btnW / 2,
                y: 455,
                w: btnW, h: btnH,
                label: '상점', color: '#FFD54F'
            };
            return;
        }

        if (state === 'shop') {
            // 상점: 뒤로가기 & 구매/장착 버튼
            this.buttons.shopBack = {
                x: 20, y: BASE_HEIGHT - 55,
                w: 80, h: 36,
                label: '← 뒤로', color: 'rgba(255,255,255,0.3)'
            };
            this.buttons.shopBuy = {
                x: BASE_WIDTH - 130, y: BASE_HEIGHT - 55,
                w: 110, h: 36,
                label: '구매/장착', color: '#FFD54F'
            };
            return;
        }

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
    }

    // 터치 컨트롤 그리기
    draw(ctx, state, freezeEnabled) {
        if (!this.isMobile) return;

        ctx.save();
        ctx.globalAlpha = 0.5;

        if (state === 'playing') {
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
