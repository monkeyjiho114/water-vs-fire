export class GameLoop {
    constructor(updateFn, drawFn) {
        this.updateFn = updateFn;
        this.drawFn = drawFn;
        this.lastTime = 0;
        this.running = false;
        this.paused = false;
        this._boundLoop = this._loop.bind(this);
    }

    start() {
        this.running = true;
        this.lastTime = performance.now();
        requestAnimationFrame(this._boundLoop);
    }

    stop() {
        this.running = false;
    }

    pause() {
        this.paused = true;
    }

    resume() {
        this.paused = false;
        this.lastTime = performance.now();
    }

    _loop(now) {
        if (!this.running) return;

        let dt = (now - this.lastTime) / 1000;
        this.lastTime = now;

        // deltaTime 제한 (탭 전환 시 큰 점프 방지)
        if (dt > 1 / 30) dt = 1 / 30;

        if (!this.paused) {
            this.updateFn(dt);
        }
        this.drawFn();

        requestAnimationFrame(this._boundLoop);
    }
}
