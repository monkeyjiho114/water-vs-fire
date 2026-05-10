import { Entity } from './Entity.js';
import { HEAL_SIZE, HEAL_AMOUNT, HEAL_LIFETIME } from '../data/constants.js';

export class HealItem extends Entity {
    constructor(x, y) {
        super(x - HEAL_SIZE / 2, y - HEAL_SIZE / 2, HEAL_SIZE, HEAL_SIZE);
        this.healAmount = HEAL_AMOUNT;
        this.time = 0;
        this.lifetime = HEAL_LIFETIME;
        this.baseY = y - HEAL_SIZE / 2;
    }

    update(dt) {
        this.time += dt;
        // 둥둥 떠다니기
        this.y = this.baseY + Math.sin(this.time * 4) * 5;
        this.lifetime -= dt;
        if (this.lifetime <= 0) this.active = false;
    }

    draw(ctx, sprite) {
        // 곧 사라질 때 깜빡임
        if (this.lifetime < 2 && Math.floor(this.lifetime * 8) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }
        sprite.drawHealItem(ctx, this.x, this.y, this.width, this.time);
        ctx.globalAlpha = 1;
    }
}
