import { BASE_WIDTH, BASE_HEIGHT, GROUND_RATIO, COLORS } from '../data/constants.js';

export class BackgroundRenderer {
    constructor() {
        this.time = 0;
        this.clouds = [];
        for (let i = 0; i < 5; i++) {
            this.clouds.push({
                x: Math.random() * BASE_WIDTH,
                y: 40 + Math.random() * 80,
                w: 50 + Math.random() * 60,
                speed: 10 + Math.random() * 15,
            });
        }
    }

    draw(ctx, theme) {
        this.time += 1 / 60;
        const groundY = BASE_HEIGHT * GROUND_RATIO;

        switch (theme) {
            case 'village': this._drawVillage(ctx, groundY); break;
            case 'forest': this._drawForest(ctx, groundY); break;
            case 'hill': this._drawHill(ctx, groundY); break;
            case 'river': this._drawRiver(ctx, groundY); break;
            case 'castle': this._drawCastle(ctx, groundY); break;
            default: this._drawVillage(ctx, groundY);
        }
    }

    _drawSky(ctx, topColor, bottomColor) {
        const grad = ctx.createLinearGradient(0, 0, 0, BASE_HEIGHT);
        grad.addColorStop(0, topColor);
        grad.addColorStop(1, bottomColor);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);
    }

    _drawClouds(ctx, color = 'rgba(255,255,255,0.8)') {
        ctx.fillStyle = color;
        for (const c of this.clouds) {
            c.x += c.speed * (1 / 60);
            if (c.x > BASE_WIDTH + 80) c.x = -c.w;
            this._drawCloud(ctx, c.x, c.y, c.w);
        }
    }

    _drawCloud(ctx, x, y, w) {
        const h = w * 0.4;
        ctx.beginPath();
        ctx.arc(x + w * 0.3, y, h * 0.5, 0, Math.PI * 2);
        ctx.arc(x + w * 0.5, y - h * 0.2, h * 0.6, 0, Math.PI * 2);
        ctx.arc(x + w * 0.7, y, h * 0.45, 0, Math.PI * 2);
        ctx.fill();
    }

    _drawGround(ctx, groundY, color1, color2) {
        ctx.fillStyle = color1;
        ctx.fillRect(0, groundY, BASE_WIDTH, BASE_HEIGHT - groundY);
        // 풀 라인
        ctx.fillStyle = color2;
        ctx.fillRect(0, groundY, BASE_WIDTH, 4);
    }

    _drawVillage(ctx, groundY) {
        this._drawSky(ctx, '#87CEEB', '#B2EBF2');
        this._drawClouds(ctx);
        // 먼 산
        ctx.fillStyle = '#A5D6A7';
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        ctx.lineTo(100, groundY - 60);
        ctx.lineTo(250, groundY - 30);
        ctx.lineTo(400, groundY - 70);
        ctx.lineTo(550, groundY - 25);
        ctx.lineTo(700, groundY - 55);
        ctx.lineTo(BASE_WIDTH, groundY);
        ctx.fill();
        this._drawGround(ctx, groundY, COLORS.grass, COLORS.grassDark);
        // 꽃
        this._drawFlowers(ctx, groundY);
    }

    _drawForest(ctx, groundY) {
        this._drawSky(ctx, '#546E7A', '#78909C');
        this._drawClouds(ctx, 'rgba(200,200,200,0.5)');
        // 나무 실루엣
        ctx.fillStyle = '#2E7D32';
        for (let i = 0; i < 6; i++) {
            const tx = i * 140 + 30;
            const ty = groundY;
            ctx.beginPath();
            ctx.moveTo(tx, ty);
            ctx.lineTo(tx + 25, ty - 80);
            ctx.lineTo(tx + 50, ty);
            ctx.fill();
        }
        ctx.fillStyle = '#1B5E20';
        for (let i = 0; i < 5; i++) {
            const tx = i * 160 + 80;
            ctx.beginPath();
            ctx.moveTo(tx, groundY);
            ctx.lineTo(tx + 20, groundY - 60);
            ctx.lineTo(tx + 40, groundY);
            ctx.fill();
        }
        this._drawGround(ctx, groundY, '#33691E', '#1B5E20');
    }

    _drawHill(ctx, groundY) {
        // 노을 하늘
        const grad = ctx.createLinearGradient(0, 0, 0, BASE_HEIGHT);
        grad.addColorStop(0, '#1565C0');
        grad.addColorStop(0.4, '#FF8A65');
        grad.addColorStop(0.7, '#FFAB91');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

        this._drawClouds(ctx, 'rgba(255,200,150,0.6)');

        // 산
        ctx.fillStyle = '#5D4037';
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        ctx.lineTo(200, groundY - 100);
        ctx.lineTo(400, groundY - 40);
        ctx.lineTo(600, groundY - 90);
        ctx.lineTo(BASE_WIDTH, groundY);
        ctx.fill();

        this._drawGround(ctx, groundY, '#795548', '#5D4037');
    }

    _drawRiver(ctx, groundY) {
        this._drawSky(ctx, '#4FC3F7', '#B3E5FC');
        this._drawClouds(ctx);

        // 강
        ctx.fillStyle = 'rgba(79,195,247,0.4)';
        ctx.fillRect(0, groundY - 15, BASE_WIDTH, 15);
        // 물결
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 8; i++) {
            const wx = i * 100 + Math.sin(this.time * 2 + i) * 10;
            ctx.beginPath();
            ctx.moveTo(wx, groundY - 8);
            ctx.quadraticCurveTo(wx + 25, groundY - 12, wx + 50, groundY - 8);
            ctx.stroke();
        }

        this._drawGround(ctx, groundY, COLORS.grass, COLORS.grassDark);
        this._drawFlowers(ctx, groundY);
    }

    _drawCastle(ctx, groundY) {
        // 어두운 붉은 하늘
        const grad = ctx.createLinearGradient(0, 0, 0, BASE_HEIGHT);
        grad.addColorStop(0, '#1A0000');
        grad.addColorStop(0.5, '#4E0000');
        grad.addColorStop(1, '#BF360C');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

        // 성 실루엣
        ctx.fillStyle = '#1A0000';
        ctx.fillRect(550, groundY - 120, 40, 120);
        ctx.fillRect(630, groundY - 100, 40, 100);
        ctx.fillRect(540, groundY - 130, 60, 15);
        ctx.fillRect(620, groundY - 110, 60, 15);
        ctx.fillRect(560, groundY - 80, 80, 80);

        // 용암 반짝임
        const fl = Math.sin(this.time * 3) * 0.2 + 0.3;
        ctx.fillStyle = `rgba(255,107,53,${fl})`;
        ctx.fillRect(0, groundY - 5, BASE_WIDTH, 5);

        this._drawGround(ctx, groundY, '#3E2723', '#1A0000');

        // 불꽃 파티클 배경
        ctx.fillStyle = 'rgba(255,107,53,0.3)';
        for (let i = 0; i < 6; i++) {
            const fx = (this.time * 30 + i * 137) % BASE_WIDTH;
            const fy = groundY - 20 - Math.sin(this.time * 2 + i) * 30;
            ctx.beginPath();
            ctx.arc(fx, fy, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    _drawFlowers(ctx, groundY) {
        const flowerColors = ['#F44336', '#E91E63', '#FFEB3B', '#FF9800'];
        for (let i = 0; i < 10; i++) {
            const fx = (i * 83 + 20) % BASE_WIDTH;
            const fy = groundY + 5;
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(fx, fy - 8, 2, 8);
            ctx.fillStyle = flowerColors[i % flowerColors.length];
            ctx.beginPath();
            ctx.arc(fx + 1, fy - 10, 4, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}
