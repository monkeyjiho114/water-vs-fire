import { BASE_WIDTH, BASE_HEIGHT, GROUND_RATIO, COLORS } from '../data/constants.js';

export class BackgroundRenderer {
    constructor() {
        this.time = 0;
        this.clouds = [];
        for (let i = 0; i < 6; i++) {
            this.clouds.push({
                x: Math.random() * BASE_WIDTH,
                y: 30 + Math.random() * 100,
                w: 60 + Math.random() * 70,
                speed: 8 + Math.random() * 18,
                layer: Math.random() < 0.5 ? 0 : 1, // 패럴랙스 레이어
            });
        }

        // 풀잎 (애니메이션용)
        this.grassBlades = [];
        for (let i = 0; i < 30; i++) {
            this.grassBlades.push({
                x: Math.random() * BASE_WIDTH,
                h: 5 + Math.random() * 8,
                phase: Math.random() * Math.PI * 2,
            });
        }

        // 별 (어두운 배경용)
        this.stars = [];
        for (let i = 0; i < 40; i++) {
            this.stars.push({
                x: Math.random() * BASE_WIDTH,
                y: Math.random() * BASE_HEIGHT * 0.6,
                size: 0.5 + Math.random() * 1.5,
                twinklePhase: Math.random() * Math.PI * 2,
            });
        }

        // 잎/재 (배경 분위기용)
        this.fallingItems = [];
        for (let i = 0; i < 8; i++) {
            this.fallingItems.push({
                x: Math.random() * BASE_WIDTH,
                y: Math.random() * BASE_HEIGHT,
                vy: 15 + Math.random() * 25,
                vx: -10 + Math.random() * 20,
                rot: Math.random() * Math.PI * 2,
                rotSpeed: -1 + Math.random() * 2,
                size: 3 + Math.random() * 4,
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

    _drawClouds(ctx, color = 'rgba(255,255,255,0.85)', backColor = 'rgba(255,255,255,0.45)') {
        for (const c of this.clouds) {
            c.x += c.speed * (1 / 60);
            if (c.x > BASE_WIDTH + 100) c.x = -c.w;
            ctx.fillStyle = c.layer === 0 ? backColor : color;
            this._drawCloud(ctx, c.x, c.y, c.w);
        }
    }

    _drawCloud(ctx, x, y, w) {
        const h = w * 0.4;
        ctx.beginPath();
        ctx.arc(x + w * 0.2, y, h * 0.5, 0, Math.PI * 2);
        ctx.arc(x + w * 0.4, y - h * 0.25, h * 0.65, 0, Math.PI * 2);
        ctx.arc(x + w * 0.6, y - h * 0.15, h * 0.55, 0, Math.PI * 2);
        ctx.arc(x + w * 0.8, y, h * 0.5, 0, Math.PI * 2);
        ctx.arc(x + w * 0.5, y + h * 0.15, h * 0.5, 0, Math.PI * 2);
        ctx.fill();
    }

    _drawGround(ctx, groundY, color1, color2, withGrass = true) {
        // 메인 땅 (그라데이션)
        const grad = ctx.createLinearGradient(0, groundY, 0, BASE_HEIGHT);
        grad.addColorStop(0, color1);
        grad.addColorStop(1, color2);
        ctx.fillStyle = grad;
        ctx.fillRect(0, groundY, BASE_WIDTH, BASE_HEIGHT - groundY);

        // 풀 라인
        ctx.fillStyle = color2;
        ctx.fillRect(0, groundY, BASE_WIDTH, 4);

        // 흩날리는 풀잎 (땅에 박힌)
        if (withGrass) {
            ctx.strokeStyle = color2;
            ctx.lineWidth = 1.5;
            ctx.lineCap = 'round';
            for (const g of this.grassBlades) {
                const sway = Math.sin(this.time * 2 + g.phase) * 1.5;
                ctx.beginPath();
                ctx.moveTo(g.x, groundY);
                ctx.lineTo(g.x + sway, groundY - g.h);
                ctx.stroke();
            }
            ctx.lineCap = 'butt';
        }
    }

    _drawSun(ctx, x, y, r, color) {
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r * 2);
        grad.addColorStop(0, color);
        grad.addColorStop(0.4, color.replace(')', ',0.5)').replace('rgb', 'rgba'));
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, r * 2, 0, Math.PI * 2);
        ctx.fill();
        // 본체
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    // === 마을 입구 (밝은 평원) ===
    _drawVillage(ctx, groundY) {
        this._drawSky(ctx, '#64B5F6', '#B3E5FC');
        // 태양
        this._drawSun(ctx, BASE_WIDTH - 100, 80, 28, '#FFEB3B');
        this._drawClouds(ctx);

        // 먼 산 (가장 뒤, 흐릿)
        ctx.fillStyle = '#90A4AE';
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        ctx.lineTo(80, groundY - 80);
        ctx.lineTo(180, groundY - 50);
        ctx.lineTo(280, groundY - 90);
        ctx.lineTo(380, groundY - 60);
        ctx.lineTo(500, groundY - 100);
        ctx.lineTo(620, groundY - 70);
        ctx.lineTo(BASE_WIDTH, groundY - 90);
        ctx.lineTo(BASE_WIDTH, groundY);
        ctx.fill();

        // 가까운 산 (녹색, 진한)
        ctx.fillStyle = '#81C784';
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        ctx.lineTo(120, groundY - 60);
        ctx.lineTo(250, groundY - 30);
        ctx.lineTo(400, groundY - 70);
        ctx.lineTo(550, groundY - 25);
        ctx.lineTo(700, groundY - 55);
        ctx.lineTo(BASE_WIDTH, groundY - 40);
        ctx.lineTo(BASE_WIDTH, groundY);
        ctx.fill();

        this._drawGround(ctx, groundY, COLORS.grass, COLORS.grassDark);
        this._drawFlowers(ctx, groundY);

        // 멀리 작은 집들
        for (let i = 0; i < 3; i++) {
            const hx = 250 + i * 150;
            const hy = groundY - 25;
            ctx.fillStyle = '#A1887F';
            ctx.fillRect(hx, hy, 18, 18);
            ctx.fillStyle = '#8D6E63';
            ctx.beginPath();
            ctx.moveTo(hx - 2, hy);
            ctx.lineTo(hx + 9, hy - 8);
            ctx.lineTo(hx + 20, hy);
            ctx.fill();
        }
    }

    // === 숲 속 마을 (어두운 숲) ===
    _drawForest(ctx, groundY) {
        this._drawSky(ctx, '#37474F', '#78909C');
        // 안개 (멀리 있는 나무 가리기)
        ctx.fillStyle = 'rgba(176,190,197,0.3)';
        ctx.fillRect(0, groundY - 80, BASE_WIDTH, 80);

        this._drawClouds(ctx, 'rgba(220,220,220,0.6)', 'rgba(180,180,180,0.4)');

        // 멀리 있는 나무 실루엣
        ctx.fillStyle = '#1B5E20';
        for (let i = 0; i < 12; i++) {
            const tx = i * 70 + 10;
            const th = 50 + (i % 3) * 15;
            ctx.beginPath();
            ctx.moveTo(tx, groundY);
            ctx.lineTo(tx + 18, groundY - th);
            ctx.lineTo(tx + 36, groundY);
            ctx.fill();
        }

        // 가까운 나무 (큰)
        ctx.fillStyle = '#2E7D32';
        for (let i = 0; i < 6; i++) {
            const tx = i * 140 + 30;
            ctx.beginPath();
            ctx.moveTo(tx, groundY);
            ctx.lineTo(tx + 28, groundY - 95);
            ctx.lineTo(tx + 56, groundY);
            ctx.fill();
            // 두 번째 층
            ctx.beginPath();
            ctx.moveTo(tx + 6, groundY - 30);
            ctx.lineTo(tx + 28, groundY - 75);
            ctx.lineTo(tx + 50, groundY - 30);
            ctx.fill();
        }

        // 떨어지는 잎
        for (const item of this.fallingItems) {
            item.y += item.vy * (1/60);
            item.x += item.vx * (1/60);
            item.rot += item.rotSpeed * (1/60);
            if (item.y > BASE_HEIGHT) {
                item.y = -10;
                item.x = Math.random() * BASE_WIDTH;
            }
            if (item.x < -10) item.x = BASE_WIDTH;
            if (item.x > BASE_WIDTH + 10) item.x = 0;

            ctx.save();
            ctx.translate(item.x, item.y);
            ctx.rotate(item.rot);
            ctx.fillStyle = '#558B2F';
            ctx.beginPath();
            ctx.ellipse(0, 0, item.size, item.size * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        this._drawGround(ctx, groundY, '#33691E', '#1B5E20');
    }

    // === 언덕 위 마을 (노을) ===
    _drawHill(ctx, groundY) {
        // 노을 하늘
        const grad = ctx.createLinearGradient(0, 0, 0, BASE_HEIGHT);
        grad.addColorStop(0, '#311B92');
        grad.addColorStop(0.4, '#FF7043');
        grad.addColorStop(0.8, '#FFAB91');
        grad.addColorStop(1, '#FFCCBC');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

        // 큰 태양
        this._drawSun(ctx, BASE_WIDTH * 0.7, BASE_HEIGHT * 0.45, 50, '#FFA726');

        this._drawClouds(ctx, 'rgba(255,200,150,0.85)', 'rgba(255,160,100,0.5)');

        // 산 (실루엣)
        ctx.fillStyle = '#3E2723';
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        ctx.lineTo(80, groundY - 70);
        ctx.lineTo(200, groundY - 110);
        ctx.lineTo(320, groundY - 50);
        ctx.lineTo(450, groundY - 100);
        ctx.lineTo(580, groundY - 60);
        ctx.lineTo(700, groundY - 95);
        ctx.lineTo(BASE_WIDTH, groundY - 70);
        ctx.lineTo(BASE_WIDTH, groundY);
        ctx.fill();

        // 가까운 언덕 (좀 더 밝은 색)
        ctx.fillStyle = '#5D4037';
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        ctx.lineTo(150, groundY - 30);
        ctx.lineTo(350, groundY - 50);
        ctx.lineTo(550, groundY - 35);
        ctx.lineTo(BASE_WIDTH, groundY - 45);
        ctx.lineTo(BASE_WIDTH, groundY);
        ctx.fill();

        this._drawGround(ctx, groundY, '#795548', '#5D4037');
    }

    // === 강가 마을 (밝은 푸른 호숫가) ===
    _drawRiver(ctx, groundY) {
        this._drawSky(ctx, '#03A9F4', '#B3E5FC');
        this._drawSun(ctx, 120, 70, 22, '#FFEB3B');
        this._drawClouds(ctx);

        // 멀리 산
        ctx.fillStyle = '#90A4AE';
        ctx.beginPath();
        ctx.moveTo(0, groundY - 30);
        ctx.lineTo(150, groundY - 80);
        ctx.lineTo(350, groundY - 50);
        ctx.lineTo(550, groundY - 90);
        ctx.lineTo(BASE_WIDTH, groundY - 60);
        ctx.lineTo(BASE_WIDTH, groundY);
        ctx.lineTo(0, groundY);
        ctx.fill();

        this._drawGround(ctx, groundY, COLORS.grass, COLORS.grassDark);

        // 강 (지면 근처)
        const riverY = groundY + 8;
        const riverGrad = ctx.createLinearGradient(0, riverY, 0, BASE_HEIGHT);
        riverGrad.addColorStop(0, 'rgba(79,195,247,0.5)');
        riverGrad.addColorStop(1, 'rgba(2,119,189,0.6)');
        ctx.fillStyle = riverGrad;
        ctx.fillRect(0, riverY, BASE_WIDTH, BASE_HEIGHT - riverY);

        // 물결
        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 12; i++) {
            const wx = i * 70 + Math.sin(this.time * 2 + i) * 12;
            const wy = riverY + 5 + (i % 3) * 8;
            ctx.beginPath();
            ctx.moveTo(wx, wy);
            ctx.quadraticCurveTo(wx + 18, wy - 4, wx + 36, wy);
            ctx.stroke();
        }

        // 반짝임
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        for (let i = 0; i < 6; i++) {
            const sx = (i * 130 + this.time * 20) % BASE_WIDTH;
            const sy = riverY + 8 + (i % 2) * 12;
            const sg = Math.sin(this.time * 4 + i) * 0.5 + 0.5;
            if (sg > 0.5) {
                ctx.beginPath();
                ctx.arc(sx, sy, 1.5 * sg, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        this._drawFlowers(ctx, groundY);
    }

    // === 불의 성 (보스) ===
    _drawCastle(ctx, groundY) {
        // 어두운 붉은 하늘
        const grad = ctx.createLinearGradient(0, 0, 0, BASE_HEIGHT);
        grad.addColorStop(0, '#000000');
        grad.addColorStop(0.4, '#3E0000');
        grad.addColorStop(0.7, '#7E0000');
        grad.addColorStop(1, '#BF360C');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

        // 별 (어두운 하늘에 반짝임)
        for (const s of this.stars) {
            const tw = Math.sin(this.time * 2 + s.twinklePhase) * 0.5 + 0.5;
            ctx.fillStyle = `rgba(255,200,150,${tw * 0.6})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fill();
        }

        // 멀리 있는 검은 산
        ctx.fillStyle = '#1A0000';
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        ctx.lineTo(100, groundY - 130);
        ctx.lineTo(220, groundY - 70);
        ctx.lineTo(360, groundY - 150);
        ctx.lineTo(BASE_WIDTH, groundY - 100);
        ctx.lineTo(BASE_WIDTH, groundY);
        ctx.fill();

        // 큰 성 실루엣 (배경)
        ctx.fillStyle = '#0F0000';
        // 메인 성
        ctx.fillRect(540, groundY - 130, 100, 130);
        // 양쪽 탑
        ctx.fillRect(520, groundY - 160, 30, 160);
        ctx.fillRect(630, groundY - 150, 30, 150);
        // 탑 지붕 (삼각형)
        ctx.beginPath();
        ctx.moveTo(515, groundY - 160);
        ctx.lineTo(535, groundY - 185);
        ctx.lineTo(555, groundY - 160);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(625, groundY - 150);
        ctx.lineTo(645, groundY - 175);
        ctx.lineTo(665, groundY - 150);
        ctx.fill();

        // 창문 (붉게 빛남)
        ctx.fillStyle = COLORS.fireOrange;
        const winFlicker = Math.sin(this.time * 5) * 0.3 + 0.7;
        ctx.globalAlpha = winFlicker;
        ctx.fillRect(560, groundY - 100, 8, 12);
        ctx.fillRect(580, groundY - 100, 8, 12);
        ctx.fillRect(600, groundY - 100, 8, 12);
        ctx.fillRect(620, groundY - 100, 8, 12);
        ctx.globalAlpha = 1;

        // 용암 강
        const lavaY = groundY - 6;
        const lavaGrad = ctx.createLinearGradient(0, lavaY, 0, lavaY + 20);
        lavaGrad.addColorStop(0, '#FFEB3B');
        lavaGrad.addColorStop(0.4, '#FF6B35');
        lavaGrad.addColorStop(1, '#B71C1C');
        ctx.fillStyle = lavaGrad;
        ctx.fillRect(0, lavaY, BASE_WIDTH, 20);

        // 용암 거품
        ctx.fillStyle = '#FFEB3B';
        for (let i = 0; i < 8; i++) {
            const lx = (i * 100 + this.time * 30) % BASE_WIDTH;
            const ly = lavaY + 4 + Math.sin(this.time * 3 + i) * 3;
            ctx.globalAlpha = 0.6 + Math.sin(this.time * 4 + i) * 0.4;
            ctx.beginPath();
            ctx.arc(lx, ly, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // 땅 (검은)
        ctx.fillStyle = '#1A0000';
        ctx.fillRect(0, groundY, BASE_WIDTH, BASE_HEIGHT - groundY);

        // 불꽃 파티클 배경
        for (let i = 0; i < 12; i++) {
            const fx = (this.time * 30 + i * 137) % BASE_WIDTH;
            const fy = groundY - 30 - (this.time * 80 + i * 50) % 200;
            const fa = 1 - ((this.time * 80 + i * 50) % 200) / 200;
            ctx.fillStyle = `rgba(255,107,53,${fa * 0.5})`;
            ctx.beginPath();
            ctx.arc(fx, fy, 2 + Math.sin(this.time * 3 + i), 0, Math.PI * 2);
            ctx.fill();
        }

        // 재 떨어지는 효과
        for (const item of this.fallingItems) {
            item.y += item.vy * (1/60) * 0.5;
            item.x += item.vx * (1/60) * 0.3;
            if (item.y > BASE_HEIGHT) {
                item.y = -10;
                item.x = Math.random() * BASE_WIDTH;
            }
            ctx.fillStyle = `rgba(150,150,150,0.5)`;
            ctx.beginPath();
            ctx.arc(item.x, item.y, item.size * 0.4, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    _drawFlowers(ctx, groundY) {
        const flowerColors = ['#F44336', '#E91E63', '#FFEB3B', '#FF9800', '#FFFFFF'];
        for (let i = 0; i < 12; i++) {
            const fx = (i * 73 + 20) % BASE_WIDTH;
            const fy = groundY + 5;
            const sway = Math.sin(this.time * 2 + i * 0.3) * 1.5;
            // 줄기
            ctx.strokeStyle = '#388E3C';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(fx, fy);
            ctx.lineTo(fx + sway, fy - 10);
            ctx.stroke();
            // 꽃
            ctx.fillStyle = flowerColors[i % flowerColors.length];
            ctx.beginPath();
            ctx.arc(fx + sway, fy - 11, 3.5, 0, Math.PI * 2);
            ctx.fill();
            // 꽃 가운데
            ctx.fillStyle = '#FFEB3B';
            ctx.beginPath();
            ctx.arc(fx + sway, fy - 11, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}
