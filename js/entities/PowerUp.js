import { Entity } from './Entity.js';
import { POWERUP_SIZE } from '../data/constants.js';

export class PowerUp extends Entity {
    constructor(x, y) {
        super(x, y, POWERUP_SIZE, POWERUP_SIZE);
        this.time = 0;
        this.lifetime = 8; // 8초 후 사라짐
        this.baseY = y;
    }

    update(dt) {
        this.time += dt;
        // 위아래 떠다니는 효과
        this.y = this.baseY + Math.sin(this.time * 4) * 5;
        this.lifetime -= dt;
        if (this.lifetime <= 0) {
            this.active = false;
        }
    }

    draw(ctx, sprite) {
        sprite.drawPowerUp(ctx, this.x, this.y, this.width, this.height, this.time);
    }
}
