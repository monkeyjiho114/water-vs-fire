import { Entity } from './Entity.js';
import { ENEMY_CASTLE_WIDTH, ENEMY_CASTLE_HEIGHT, BASE_WIDTH } from '../data/constants.js';

export class EnemyCastle extends Entity {
    constructor(groundY, castleHp) {
        const x = BASE_WIDTH - ENEMY_CASTLE_WIDTH - 10;
        const y = groundY - ENEMY_CASTLE_HEIGHT;
        super(x, y, ENEMY_CASTLE_WIDTH, ENEMY_CASTLE_HEIGHT);
        this.maxHp = castleHp;
        this.hp = castleHp;
        this.time = 0;
        this.hitFlash = 0;
    }

    update(dt) {
        this.time += dt;
        if (this.hitFlash > 0) this.hitFlash -= dt;
    }

    takeDamage(amount) {
        this.hp -= amount;
        this.hitFlash = 0.15;
        if (this.hp <= 0) {
            this.hp = 0;
            this.active = false;
        }
    }

    draw(ctx, sprite) {
        sprite.drawEnemyCastle(ctx, this.x, this.y, this.width, this.height, this.hp / this.maxHp, this.time, this.hitFlash > 0);
    }
}
