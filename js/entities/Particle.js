export class Particle {
    constructor(x, y, vx, vy, size, color, lifetime, gravity = false) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.size = size;
        this.color = color;
        this.lifetime = lifetime;
        this.maxLifetime = lifetime;
        this.gravity = gravity;
        this.active = true;
    }

    get alpha() {
        return Math.max(0, this.lifetime / this.maxLifetime);
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        if (this.gravity) {
            this.vy += 400 * dt;
        }
        this.lifetime -= dt;
        if (this.lifetime <= 0) {
            this.active = false;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * this.alpha, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// 파티클 생성 헬퍼
export function createSteamParticles(x, y, count = 5) {
    const particles = [];
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(
            x + (Math.random() - 0.5) * 20,
            y + (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 40,
            -30 - Math.random() * 60,
            3 + Math.random() * 4,
            '#ECEFF1',
            0.5 + Math.random() * 0.5
        ));
    }
    return particles;
}

export function createWaterSplash(x, y, count = 8) {
    const particles = [];
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
        const speed = 80 + Math.random() * 80;
        particles.push(new Particle(
            x, y,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            2 + Math.random() * 3,
            '#4FC3F7',
            0.4 + Math.random() * 0.3,
            true
        ));
    }
    return particles;
}

export function createFireBurst(x, y, count = 10) {
    const particles = [];
    const colors = ['#FFEB3B', '#FF6B35', '#D32F2F'];
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        const speed = 60 + Math.random() * 100;
        particles.push(new Particle(
            x, y,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed - 30,
            3 + Math.random() * 4,
            colors[Math.floor(Math.random() * colors.length)],
            0.4 + Math.random() * 0.4
        ));
    }
    return particles;
}

export function createFreezeParticles(x, y, count = 20) {
    const particles = [];
    const colors = ['#E0F7FA', '#B3E5FC', '#80DEEA', '#FFFFFF'];
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
        const speed = 100 + Math.random() * 150;
        particles.push(new Particle(
            x + (Math.random() - 0.5) * 200,
            y + (Math.random() - 0.5) * 150,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed - 40,
            3 + Math.random() * 5,
            colors[Math.floor(Math.random() * colors.length)],
            0.6 + Math.random() * 0.6
        ));
    }
    return particles;
}

export function createSparkle(x, y, count = 6) {
    const particles = [];
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        const speed = 40 + Math.random() * 60;
        particles.push(new Particle(
            x, y,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed - 20,
            2 + Math.random() * 2,
            '#FFD700',
            0.6 + Math.random() * 0.4
        ));
    }
    return particles;
}
