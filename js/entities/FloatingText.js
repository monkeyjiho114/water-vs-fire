// 데미지 숫자, 콤보, 점수 등 떠오르는 텍스트
export class FloatingText {
    constructor(x, y, text, options = {}) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.vx = options.vx !== undefined ? options.vx : (Math.random() - 0.5) * 40;
        this.vy = options.vy !== undefined ? options.vy : -90 - Math.random() * 30;
        this.lifetime = options.lifetime || 0.9;
        this.maxLifetime = this.lifetime;
        this.color = options.color || '#FFF';
        this.outline = options.outline !== undefined ? options.outline : true;
        this.outlineColor = options.outlineColor || '#000';
        this.size = options.size || 18;
        this.bold = options.bold !== undefined ? options.bold : true;
        this.gravity = options.gravity !== undefined ? options.gravity : 280;
        this.active = true;
        this.shake = options.shake || 0;
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.vy += this.gravity * dt;
        this.lifetime -= dt;
        if (this.lifetime <= 0) this.active = false;
    }

    draw(ctx) {
        const t = this.lifetime / this.maxLifetime;
        // 페이드아웃
        const alpha = t < 0.3 ? t / 0.3 : 1;
        // 스케일 팝
        const scale = t > 0.85 ? 1 + (t - 0.85) * 4 : 1;

        ctx.save();
        ctx.globalAlpha = alpha;
        const sx = this.shake > 0 ? (Math.random() - 0.5) * this.shake : 0;
        ctx.translate(this.x + sx, this.y);
        ctx.scale(scale, scale);
        ctx.font = `${this.bold ? 'bold ' : ''}${this.size}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (this.outline) {
            ctx.lineWidth = 3;
            ctx.strokeStyle = this.outlineColor;
            ctx.strokeText(this.text, 0, 0);
        }
        ctx.fillStyle = this.color;
        ctx.fillText(this.text, 0, 0);

        ctx.restore();
    }
}
