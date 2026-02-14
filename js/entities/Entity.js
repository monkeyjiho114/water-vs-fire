export class Entity {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.vx = 0;
        this.vy = 0;
        this.hp = 1;
        this.maxHp = 1;
        this.active = true;
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
    }

    getBounds() {
        return { x: this.x, y: this.y, w: this.width, h: this.height };
    }

    // 중심 좌표
    get cx() { return this.x + this.width / 2; }
    get cy() { return this.y + this.height / 2; }

    // 바닥 좌표
    get bottom() { return this.y + this.height; }
}
