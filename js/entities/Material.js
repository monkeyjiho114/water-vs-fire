import { Entity } from './Entity.js';
import { MATERIAL_SIZE, MATERIAL_NAMES } from '../data/constants.js';

export class Material extends Entity {
    constructor(x, y, index) {
        super(x - MATERIAL_SIZE / 2, y - MATERIAL_SIZE / 2, MATERIAL_SIZE, MATERIAL_SIZE);
        this.index = index;
        this.name = MATERIAL_NAMES[index] || '재료';
        this.time = 0;
        this.collected = false;
    }

    update(dt) {
        this.time += dt;
        // 위아래로 둥둥 떠다니는 효과
        this.floatY = Math.sin(this.time * 3) * 5;
    }

    draw(ctx, sprite) {
        if (this.collected) return;
        sprite.drawMaterial(ctx, this.x, this.y + (this.floatY || 0), this.width, this.index, this.time);
    }
}
