import { Entity } from './Entity.js';
import { HOUSE_HP, HOUSE_WIDTH, HOUSE_HEIGHT } from '../data/constants.js';

export class House extends Entity {
    constructor(x, groundY) {
        super(x, groundY - HOUSE_HEIGHT, HOUSE_WIDTH, HOUSE_HEIGHT);
        this.maxHp = HOUSE_HP;
        this.hp = HOUSE_HP;
        this.time = 0;
    }

    update(dt) {
        this.time += dt;
    }

    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp < 0) this.hp = 0;
    }

    get hpRatio() {
        return this.hp / this.maxHp;
    }

    draw(ctx, sprite) {
        sprite.drawHouse(ctx, this.x, this.y, this.width, this.height, this.hpRatio, this.time);
    }
}
