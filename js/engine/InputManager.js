export class InputManager {
    constructor() {
        this.keys = new Set();
        this.justPressed = new Set();
        this.justReleased = new Set();
        this._prevKeys = new Set();

        // 터치 매니저 참조 (나중에 설정)
        this.touch = null;

        window.addEventListener('keydown', (e) => {
            // 게임에서 사용하는 키의 기본 동작 방지 (스크롤 등)
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyZ', 'KeyX', 'KeyS', 'KeyQ', 'KeyE', 'KeyW', 'KeyA', 'KeyD'].includes(e.code)) {
                e.preventDefault();
            }
            this.keys.add(e.code);
        });

        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.code);
        });

        // 탭 전환 시 키 상태 초기화
        window.addEventListener('blur', () => {
            this.keys.clear();
        });
    }

    // 키가 눌려있는지
    isDown(code) {
        return this.keys.has(code);
    }

    // 이번 프레임에 처음 눌렸는지
    isJustPressed(code) {
        return this.justPressed.has(code);
    }

    // 이번 프레임에 떼어졌는지
    isJustReleased(code) {
        return this.justReleased.has(code);
    }

    // 프레임 끝에 호출 — justPressed/justReleased 갱신
    update() {
        this.justPressed.clear();
        this.justReleased.clear();

        for (const key of this.keys) {
            if (!this._prevKeys.has(key)) {
                this.justPressed.add(key);
            }
        }
        for (const key of this._prevKeys) {
            if (!this.keys.has(key)) {
                this.justReleased.add(key);
            }
        }

        this._prevKeys = new Set(this.keys);

        // 터치 매니저 업데이트
        if (this.touch) {
            this.touch.update();
        }
    }

    // 편의 메서드: 방향 입력 (키보드 + 터치 통합)
    get left() {
        return this.isDown('ArrowLeft') || this.isDown('KeyA') ||
               (this.touch && this.touch.touchLeft);
    }
    get right() {
        return this.isDown('ArrowRight') || this.isDown('KeyD') ||
               (this.touch && this.touch.touchRight);
    }
    get up() { return this.isDown('ArrowUp') || this.isDown('KeyW'); }
    get down() { return this.isDown('ArrowDown') || this.isDown('KeyS'); }

    get jump() {
        return this.isJustPressed('Space') ||
               (this.touch && this.touch.justJump);
    }
    get shoot() {
        return this.isDown('KeyZ') ||
               (this.touch && this.touch.touchShoot);
    }
    get freeze() {
        return this.isJustPressed('KeyX') ||
               (this.touch && this.touch.justFreeze);
    }
    get pause() {
        return this.isJustPressed('Escape') ||
               (this.touch && this.touch.justPause);
    }
    get confirm() {
        return this.isJustPressed('Enter') || this.isJustPressed('Space') || this.isJustPressed('KeyZ') ||
               (this.touch && this.touch.justConfirm);
    }
}
