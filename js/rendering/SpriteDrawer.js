import { COLORS, ENEMY_CASTLE_WIDTH, ENEMY_CASTLE_HEIGHT, POWERUP_SIZE } from '../data/constants.js';

export class SpriteDrawer {

    // === 물방울 주인공 ===
    drawPlayer(ctx, x, y, w, h, facingRight, cannonComplete, time, isPoweredUp, bodySkin) {
        ctx.save();
        const bob = Math.sin(time * 4) * 2;
        const drawY = y + bob;

        // 스킨 색상 (기본값: 물방울)
        const skinColors = bodySkin && bodySkin.colors ? bodySkin.colors : ['#E1F5FE', COLORS.waterMid, COLORS.waterDark];
        const skinShape = bodySkin && bodySkin.shape ? bodySkin.shape : 'default';
        const cLight = skinColors[0];
        const cMid = skinColors[1];
        const cDark = skinColors[2];

        ctx.save();
        if (!facingRight) {
            ctx.translate(x + w, 0);
            ctx.scale(-1, 1);
            ctx.translate(-x, 0);
        }

        // 강화 상태 글로우
        if (isPoweredUp) {
            ctx.shadowColor = cMid;
            ctx.shadowBlur = 15 + Math.sin(time * 8) * 5;
        }

        // 물방울 그라데이션
        const grad = ctx.createRadialGradient(x + w * 0.4, drawY + h * 0.4, 2, x + w / 2, drawY + h / 2, w * 0.7);
        grad.addColorStop(0, cLight);
        grad.addColorStop(0.5, cMid);
        grad.addColorStop(1, cDark);

        // 형태별 몸체 그리기
        if (skinShape === 'slime') {
            // 슬라임 형태: 납작하고 둥근
            ctx.beginPath();
            ctx.moveTo(x + w * 0.1, drawY + h * 0.85);
            ctx.quadraticCurveTo(x + w * 0.1, drawY + h * 0.3, x + w * 0.5, drawY + h * 0.2);
            ctx.quadraticCurveTo(x + w * 0.9, drawY + h * 0.3, x + w * 0.9, drawY + h * 0.85);
            ctx.quadraticCurveTo(x + w * 0.5, drawY + h + 4, x + w * 0.1, drawY + h * 0.85);
            ctx.fillStyle = grad;
            ctx.fill();
            ctx.strokeStyle = cDark;
            ctx.lineWidth = 1.5;
            ctx.stroke();
        } else if (skinShape === 'star') {
            // 별 형태
            ctx.beginPath();
            const cx = x + w / 2, cy = drawY + h / 2;
            for (let i = 0; i < 5; i++) {
                const outerAngle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
                const innerAngle = outerAngle + Math.PI / 5;
                const outerR = w * 0.55;
                const innerR = w * 0.25;
                if (i === 0) ctx.moveTo(cx + Math.cos(outerAngle) * outerR, cy + Math.sin(outerAngle) * outerR);
                else ctx.lineTo(cx + Math.cos(outerAngle) * outerR, cy + Math.sin(outerAngle) * outerR);
                ctx.lineTo(cx + Math.cos(innerAngle) * innerR, cy + Math.sin(innerAngle) * innerR);
            }
            ctx.closePath();
            ctx.fillStyle = grad;
            ctx.fill();
            ctx.strokeStyle = cDark;
            ctx.lineWidth = 1.5;
            ctx.stroke();
        } else if (skinShape === 'snowflake') {
            // 눈송이: 물방울 + 결정 장식
            ctx.beginPath();
            ctx.moveTo(x + w / 2, drawY);
            ctx.bezierCurveTo(x + w * 0.8, drawY + h * 0.25, x + w, drawY + h * 0.5, x + w * 0.85, drawY + h * 0.8);
            ctx.quadraticCurveTo(x + w / 2, drawY + h + 2, x + w * 0.15, drawY + h * 0.8);
            ctx.bezierCurveTo(x, drawY + h * 0.5, x + w * 0.2, drawY + h * 0.25, x + w / 2, drawY);
            ctx.fillStyle = grad;
            ctx.fill();
            ctx.strokeStyle = cDark;
            ctx.lineWidth = 1.5;
            ctx.stroke();
            // 결정 장식
            ctx.strokeStyle = 'rgba(255,255,255,0.6)';
            ctx.lineWidth = 1;
            const scx = x + w / 2, scy = drawY + h / 2;
            for (let i = 0; i < 6; i++) {
                const a = (Math.PI * 2 * i) / 6 + time * 0.5;
                ctx.beginPath();
                ctx.moveTo(scx, scy);
                ctx.lineTo(scx + Math.cos(a) * w * 0.45, scy + Math.sin(a) * h * 0.45);
                ctx.stroke();
            }
        } else {
            // 기본 물방울 형태
            ctx.beginPath();
            ctx.moveTo(x + w / 2, drawY);
            ctx.bezierCurveTo(x + w * 0.8, drawY + h * 0.25, x + w, drawY + h * 0.5, x + w * 0.85, drawY + h * 0.8);
            ctx.quadraticCurveTo(x + w / 2, drawY + h + 2, x + w * 0.15, drawY + h * 0.8);
            ctx.bezierCurveTo(x, drawY + h * 0.5, x + w * 0.2, drawY + h * 0.25, x + w / 2, drawY);
            ctx.fillStyle = grad;
            ctx.fill();
            ctx.strokeStyle = cDark;
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }

        ctx.shadowBlur = 0;

        // 하이라이트
        ctx.beginPath();
        ctx.ellipse(x + w * 0.35, drawY + h * 0.3, 4, 6, -0.3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fill();

        // 눈
        const eyeY = drawY + h * 0.45;
        ctx.beginPath();
        ctx.ellipse(x + w * 0.35, eyeY, 4, 5, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#333';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + w * 0.37, eyeY - 1.5, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = '#FFF';
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(x + w * 0.65, eyeY, 4, 5, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#333';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + w * 0.67, eyeY - 1.5, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = '#FFF';
        ctx.fill();

        // 입
        ctx.beginPath();
        ctx.arc(x + w * 0.5, drawY + h * 0.58, 5, 0.1, Math.PI - 0.1);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 물대포/물총
        const gunX = x + w * 0.8;
        const gunY = drawY + h * 0.5;
        if (isPoweredUp) {
            // 강화 물총
            ctx.fillStyle = '#E65100';
            ctx.fillRect(gunX, gunY - 5, 16, 10);
            ctx.fillStyle = '#FF6F00';
            ctx.fillRect(gunX + 12, gunY - 7, 8, 14);
            ctx.fillStyle = '#FFD54F';
            ctx.beginPath();
            ctx.arc(gunX + 20, gunY, 4, 0, Math.PI * 2);
            ctx.fill();
        } else if (cannonComplete) {
            ctx.fillStyle = '#01579B';
            ctx.fillRect(gunX, gunY - 6, 18, 12);
            ctx.fillStyle = '#0277BD';
            ctx.fillRect(gunX + 14, gunY - 8, 8, 16);
            ctx.fillStyle = cMid;
            ctx.beginPath();
            ctx.arc(gunX + 22, gunY, 5, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = '#0277BD';
            ctx.fillRect(gunX, gunY - 3, 12, 6);
            ctx.fillStyle = cMid;
            ctx.beginPath();
            ctx.arc(gunX + 12, gunY, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();

        // 머리 위 "워드" 텍스트
        const wardY = drawY - 14;
        const wardX = x + w / 2;
        // 배경 박스
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        const wardW = 36, wardH = 16;
        this._roundRect(ctx, wardX - wardW / 2, wardY - wardH / 2, wardW, wardH, 4);
        ctx.fill();
        // 텍스트
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('워드', wardX, wardY);

        ctx.restore();
    }

    _roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    // === 물총알 ===
    drawBullet(ctx, bullet, bulletSkin) {
        ctx.save();
        // 스킨 색상 결정
        const skinColor = bulletSkin && bulletSkin.color ? bulletSkin.color : COLORS.waterMid;
        const isRainbow = skinColor === 'rainbow';

        if (bullet.isPowerShot) {
            // 강화 총알 — 오렌지 글로우 (강화 상태는 스킨 무관)
            const grad = ctx.createRadialGradient(bullet.cx, bullet.cy, 1, bullet.cx, bullet.cy, bullet.width / 2);
            grad.addColorStop(0, '#FFF9C4');
            grad.addColorStop(0.5, '#FFD54F');
            grad.addColorStop(1, '#FF8F00');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.ellipse(bullet.cx, bullet.cy, bullet.width / 2, bullet.height / 2, 0, 0, Math.PI * 2);
            ctx.fill();
        } else if (bullet.isCannon) {
            const grad = ctx.createRadialGradient(bullet.cx, bullet.cy, 1, bullet.cx, bullet.cy, bullet.width / 2);
            if (isRainbow) {
                const hue = (Date.now() / 10 + bullet.x * 2) % 360;
                const mid = `hsl(${hue}, 80%, 60%)`;
                const dark = `hsl(${hue}, 80%, 40%)`;
                grad.addColorStop(0, '#FFF');
                grad.addColorStop(0.6, mid);
                grad.addColorStop(1, dark);
            } else {
                grad.addColorStop(0, '#E1F5FE');
                grad.addColorStop(0.6, skinColor);
                grad.addColorStop(1, COLORS.waterDark);
            }
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.ellipse(bullet.cx, bullet.cy, bullet.width / 2, bullet.height / 2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.beginPath();
            ctx.arc(bullet.cx - 3, bullet.cy - 2, 3, 0, Math.PI * 2);
            ctx.fill();
        } else {
            if (isRainbow) {
                const hue = (Date.now() / 10 + bullet.x * 2) % 360;
                ctx.fillStyle = `hsl(${hue}, 80%, 60%)`;
            } else {
                ctx.fillStyle = skinColor;
            }
            ctx.beginPath();
            ctx.ellipse(bullet.cx, bullet.cy, bullet.width / 2, bullet.height / 2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.beginPath();
            ctx.arc(bullet.cx - 1, bullet.cy - 1, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    // === 불 몬스터 ===
    drawFireMonster(ctx, x, y, w, h, type, time, flashing, frozen, isFlying) {
        ctx.save();
        if (flashing) ctx.globalAlpha = 0.5;

        const flicker1 = frozen ? 0 : Math.sin(time * 10) * 3;
        const flicker2 = frozen ? 0 : Math.cos(time * 12) * 2;

        // 날아다니는 몬스터 날개
        if (isFlying) {
            const wingFlap = Math.sin(time * 12) * 8;
            ctx.fillStyle = frozen ? '#90CAF9' : '#FF8F00';
            ctx.globalAlpha = flashing ? 0.3 : 0.6;
            // 왼쪽 날개
            ctx.beginPath();
            ctx.moveTo(x + 2, y + h * 0.3);
            ctx.quadraticCurveTo(x - 14, y - 5 + wingFlap, x - 8, y + h * 0.5);
            ctx.closePath();
            ctx.fill();
            // 오른쪽 날개
            ctx.beginPath();
            ctx.moveTo(x + w - 2, y + h * 0.3);
            ctx.quadraticCurveTo(x + w + 14, y - 5 + wingFlap, x + w + 8, y + h * 0.5);
            ctx.closePath();
            ctx.fill();
            ctx.globalAlpha = flashing ? 0.5 : 1;
        }

        let grad;
        if (frozen) {
            grad = ctx.createRadialGradient(x + w / 2, y + h * 0.6, 2, x + w / 2, y + h / 2, w * 0.7);
            grad.addColorStop(0, '#E0F7FA');
            grad.addColorStop(0.5, '#80DEEA');
            grad.addColorStop(1, '#0097A7');
        } else {
            grad = ctx.createRadialGradient(x + w / 2, y + h * 0.6, 2, x + w / 2, y + h / 2, w * 0.7);
            grad.addColorStop(0, COLORS.fireYellow);
            grad.addColorStop(0.5, COLORS.fireOrange);
            grad.addColorStop(1, COLORS.fireRed);
        }

        ctx.beginPath();
        ctx.moveTo(x + w / 2, y + flicker1);
        ctx.bezierCurveTo(x + w * 0.8, y + h * 0.15, x + w + 3, y + h * 0.4, x + w * 0.85, y + h * 0.7);
        ctx.quadraticCurveTo(x + w * 0.7, y + h, x + w / 2, y + h);
        ctx.quadraticCurveTo(x + w * 0.3, y + h, x + w * 0.15, y + h * 0.7);
        ctx.bezierCurveTo(x - 3, y + h * 0.4, x + w * 0.2, y + h * 0.15, x + w / 2, y + flicker1);
        ctx.fillStyle = grad;
        ctx.fill();

        if (!frozen) {
            // 작은 불꽃
            ctx.beginPath();
            ctx.moveTo(x + w * 0.35, y + h * 0.15);
            ctx.quadraticCurveTo(x + w * 0.3, y - 8 + flicker2, x + w * 0.4, y + h * 0.05);
            ctx.fillStyle = COLORS.fireOrange;
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(x + w * 0.65, y + h * 0.15);
            ctx.quadraticCurveTo(x + w * 0.7, y - 6 + flicker1, x + w * 0.6, y + h * 0.05);
            ctx.fill();
        }

        // 화난 눈
        const eyeY = y + h * 0.45;
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.ellipse(x + w * 0.33, eyeY, 5, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = frozen ? '#0097A7' : '#333';
        ctx.beginPath();
        ctx.arc(x + w * 0.33, eyeY + 1, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.ellipse(x + w * 0.67, eyeY, 5, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = frozen ? '#0097A7' : '#333';
        ctx.beginPath();
        ctx.arc(x + w * 0.67, eyeY + 1, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // 눈썹
        ctx.strokeStyle = frozen ? '#0097A7' : '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + w * 0.2, eyeY - 6);
        ctx.lineTo(x + w * 0.4, eyeY - 3);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + w * 0.8, eyeY - 6);
        ctx.lineTo(x + w * 0.6, eyeY - 3);
        ctx.stroke();

        // 입
        const mouthY = y + h * 0.65;
        ctx.fillStyle = frozen ? '#0097A7' : '#333';
        ctx.beginPath();
        ctx.moveTo(x + w * 0.3, mouthY);
        ctx.lineTo(x + w * 0.38, mouthY + 5);
        ctx.lineTo(x + w * 0.46, mouthY);
        ctx.lineTo(x + w * 0.54, mouthY + 5);
        ctx.lineTo(x + w * 0.62, mouthY);
        ctx.lineTo(x + w * 0.7, mouthY + 5);
        ctx.closePath();
        ctx.fill();

        if (type === 'tank') {
            ctx.strokeStyle = frozen ? '#006064' : '#B71C1C';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // 얼음 결정 (frozen)
        if (frozen) {
            ctx.strokeStyle = 'rgba(255,255,255,0.8)';
            ctx.lineWidth = 1.5;
            const cx = x + w / 2, cy = y + h / 2;
            for (let i = 0; i < 6; i++) {
                const a = (Math.PI * 2 * i) / 6;
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.lineTo(cx + Math.cos(a) * w * 0.35, cy + Math.sin(a) * h * 0.35);
                ctx.stroke();
            }
        }

        ctx.restore();
    }

    // === 보스 몬스터 ===
    drawBossMonster(ctx, x, y, w, h, phase, time, flashing, frozen) {
        ctx.save();
        if (flashing) ctx.globalAlpha = 0.5;

        const flicker = frozen ? 0 : Math.sin(time * 8) * 5;

        let grad;
        if (frozen) {
            grad = ctx.createRadialGradient(x + w / 2, y + h * 0.6, 5, x + w / 2, y + h / 2, w * 0.6);
            grad.addColorStop(0, '#E0F7FA');
            grad.addColorStop(0.4, '#80DEEA');
            grad.addColorStop(1, '#006064');
        } else {
            grad = ctx.createRadialGradient(x + w / 2, y + h * 0.6, 5, x + w / 2, y + h / 2, w * 0.6);
            grad.addColorStop(0, '#FFF176');
            grad.addColorStop(0.4, COLORS.fireOrange);
            grad.addColorStop(1, '#B71C1C');
        }

        ctx.beginPath();
        ctx.moveTo(x + w / 2, y + flicker);
        ctx.bezierCurveTo(x + w * 0.85, y + h * 0.1, x + w + 10, y + h * 0.35, x + w * 0.9, y + h * 0.75);
        ctx.quadraticCurveTo(x + w * 0.7, y + h + 5, x + w / 2, y + h);
        ctx.quadraticCurveTo(x + w * 0.3, y + h + 5, x + w * 0.1, y + h * 0.75);
        ctx.bezierCurveTo(x - 10, y + h * 0.35, x + w * 0.15, y + h * 0.1, x + w / 2, y + flicker);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = frozen ? '#006064' : '#B71C1C';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 뿔
        ctx.fillStyle = frozen ? '#455A64' : '#5D4037';
        ctx.beginPath();
        ctx.moveTo(x + w * 0.25, y + h * 0.15);
        ctx.lineTo(x + w * 0.15, y - 20 + flicker);
        ctx.lineTo(x + w * 0.35, y + h * 0.2);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x + w * 0.75, y + h * 0.15);
        ctx.lineTo(x + w * 0.85, y - 20 + flicker);
        ctx.lineTo(x + w * 0.65, y + h * 0.2);
        ctx.closePath();
        ctx.fill();

        // 눈
        const eyeY = y + h * 0.4;
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.ellipse(x + w * 0.33, eyeY, 10, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = frozen ? '#0097A7' : '#D32F2F';
        ctx.beginPath();
        ctx.arc(x + w * 0.33, eyeY + 1, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(x + w * 0.33, eyeY + 1, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.ellipse(x + w * 0.67, eyeY, 10, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = frozen ? '#0097A7' : '#D32F2F';
        ctx.beginPath();
        ctx.arc(x + w * 0.67, eyeY + 1, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(x + w * 0.67, eyeY + 1, 3, 0, Math.PI * 2);
        ctx.fill();

        // 눈썹
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x + w * 0.15, eyeY - 12);
        ctx.lineTo(x + w * 0.42, eyeY - 5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + w * 0.85, eyeY - 12);
        ctx.lineTo(x + w * 0.58, eyeY - 5);
        ctx.stroke();

        // 입
        const mouthY = y + h * 0.6;
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.moveTo(x + w * 0.25, mouthY);
        for (let i = 0; i < 6; i++) {
            ctx.lineTo(x + w * (0.25 + i * 0.1), i % 2 === 0 ? mouthY : mouthY + 10);
        }
        ctx.closePath();
        ctx.fill();

        // 무기
        const staffX = x - 15;
        const staffY = y + h * 0.2;
        ctx.strokeStyle = frozen ? '#455A64' : '#5D4037';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(staffX, staffY);
        ctx.lineTo(staffX - 10, staffY + h * 0.6);
        ctx.stroke();
        ctx.fillStyle = frozen ? '#80DEEA' : COLORS.fireOrange;
        ctx.beginPath();
        ctx.arc(staffX, staffY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = frozen ? '#E0F7FA' : COLORS.fireYellow;
        ctx.beginPath();
        ctx.arc(staffX, staffY, 4, 0, Math.PI * 2);
        ctx.fill();

        // 얼음 결정 (frozen)
        if (frozen) {
            ctx.strokeStyle = 'rgba(255,255,255,0.7)';
            ctx.lineWidth = 2;
            const cx = x + w / 2, cy = y + h / 2;
            for (let i = 0; i < 8; i++) {
                const a = (Math.PI * 2 * i) / 8;
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.lineTo(cx + Math.cos(a) * w * 0.4, cy + Math.sin(a) * h * 0.4);
                ctx.stroke();
            }
        }

        ctx.restore();
    }

    // === 화염구 ===
    drawFireball(ctx, x, y, size) {
        ctx.save();
        const grad = ctx.createRadialGradient(x, y, 1, x, y, size);
        grad.addColorStop(0, COLORS.fireYellow);
        grad.addColorStop(0.6, COLORS.fireOrange);
        grad.addColorStop(1, 'rgba(211,47,47,0.5)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // === 악당 성 ===
    drawEnemyCastle(ctx, x, y, w, h, hpRatio, time, flashing) {
        ctx.save();
        if (flashing) ctx.globalAlpha = 0.6;

        // 성 몸체
        const grad = ctx.createLinearGradient(x, y, x, y + h);
        grad.addColorStop(0, '#5D4037');
        grad.addColorStop(1, '#3E2723');
        ctx.fillStyle = grad;
        ctx.fillRect(x, y + h * 0.2, w, h * 0.8);

        // 성탑 (위 세 개)
        const towerW = w * 0.2;
        ctx.fillStyle = '#4E342E';
        ctx.fillRect(x, y, towerW, h * 0.3);
        ctx.fillRect(x + (w - towerW) / 2, y - h * 0.05, towerW, h * 0.35);
        ctx.fillRect(x + w - towerW, y, towerW, h * 0.3);

        // 불 장식
        const fl = Math.sin(time * 8) * 3;
        ctx.fillStyle = COLORS.fireOrange;
        ctx.beginPath();
        ctx.arc(x + towerW / 2, y - 4 + fl, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + w / 2, y - h * 0.05 - 4 + fl, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + w - towerW / 2, y - 4 + fl, 5, 0, Math.PI * 2);
        ctx.fill();

        // 문
        ctx.fillStyle = '#1B0000';
        const doorW = w * 0.3;
        const doorH = h * 0.35;
        ctx.beginPath();
        ctx.arc(x + w / 2, y + h * 0.6, doorW / 2, Math.PI, 0);
        ctx.lineTo(x + w / 2 + doorW / 2, y + h * 0.6 + doorH);
        ctx.lineTo(x + w / 2 - doorW / 2, y + h * 0.6 + doorH);
        ctx.closePath();
        ctx.fill();

        // HP 바
        const barW = w + 10;
        const barH = 5;
        const barX = x - 5;
        const barY = y - 12;
        ctx.fillStyle = '#555';
        ctx.fillRect(barX, barY, barW, barH);
        ctx.fillStyle = hpRatio > 0.3 ? '#EF5350' : '#B71C1C';
        ctx.fillRect(barX, barY, barW * Math.max(0, hpRatio), barH);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barW, barH);

        ctx.restore();
    }

    // === 파워업 아이템 ===
    drawPowerUp(ctx, x, y, w, h, time) {
        ctx.save();
        const glow = Math.sin(time * 6) * 0.3 + 0.7;
        ctx.shadowColor = '#FFD54F';
        ctx.shadowBlur = 8 * glow;

        // 외곽 글로우
        ctx.fillStyle = `rgba(255,213,79,${0.3 * glow})`;
        ctx.beginPath();
        ctx.arc(x + w / 2, y + h / 2, w * 0.7, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;

        // 물총 아이콘
        const cx = x + w / 2;
        const cy = y + h / 2;
        ctx.fillStyle = '#FF6F00';
        ctx.fillRect(cx - 8, cy - 3, 16, 6);
        ctx.fillStyle = '#FFD54F';
        ctx.beginPath();
        ctx.arc(cx + 8, cy, 4, 0, Math.PI * 2);
        ctx.fill();

        // 위/아래 화살표
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('↑', cx, y + 4);

        ctx.restore();
    }

    // === 물방울 집 ===
    drawHouse(ctx, x, y, w, h, hpRatio, time) {
        ctx.save();

        const grad = ctx.createLinearGradient(x, y, x, y + h);
        grad.addColorStop(0, '#E1F5FE');
        grad.addColorStop(1, COLORS.waterLight);

        ctx.beginPath();
        ctx.moveTo(x + w / 2, y);
        ctx.bezierCurveTo(x + w * 0.8, y + h * 0.2, x + w, y + h * 0.45, x + w * 0.9, y + h * 0.75);
        ctx.quadraticCurveTo(x + w / 2, y + h + 5, x + w * 0.1, y + h * 0.75);
        ctx.bezierCurveTo(x, y + h * 0.45, x + w * 0.2, y + h * 0.2, x + w / 2, y);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = COLORS.waterDark;
        ctx.lineWidth = 2;
        ctx.stroke();

        // 문
        ctx.fillStyle = '#0277BD';
        ctx.fillRect(x + (w - 14) / 2, y + h * 0.65, 14, 20);

        // 창문
        ctx.fillStyle = '#E1F5FE';
        ctx.strokeStyle = COLORS.waterDark;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x + w / 2, y + h * 0.4, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 표정
        const faceY = y + h * 0.4;
        ctx.strokeStyle = COLORS.waterDark;
        ctx.lineWidth = 1.5;
        if (hpRatio > 0.75) {
            ctx.beginPath();
            ctx.arc(x + w / 2, faceY + 12, 4, 0.1, Math.PI - 0.1);
            ctx.stroke();
        } else if (hpRatio > 0.5) {
            ctx.beginPath();
            ctx.arc(x + w / 2, faceY + 15, 3, Math.PI + 0.3, -0.3);
            ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.arc(x + w / 2, faceY + 16, 4, Math.PI + 0.2, -0.2);
            ctx.stroke();
            ctx.fillStyle = COLORS.waterMid;
            ctx.beginPath();
            ctx.ellipse(x + w * 0.35, faceY + 6, 1.5, 3, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // 불타는 효과
        if (hpRatio < 0.5) {
            const fl = Math.sin(time * 10) * 3;
            ctx.fillStyle = 'rgba(255,107,53,0.4)';
            ctx.beginPath();
            ctx.ellipse(x + w * 0.3, y + h * 0.3 + fl, 8, 12, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(255,235,59,0.3)';
            ctx.beginPath();
            ctx.ellipse(x + w * 0.7, y + h * 0.2 + fl, 6, 10, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // HP 바
        const barW = w;
        const barH = 6;
        const barX = x;
        const barY = y + h + 6;
        ctx.fillStyle = '#555';
        ctx.fillRect(barX, barY, barW, barH);
        ctx.fillStyle = hpRatio > 0.3 ? COLORS.hpGreen : COLORS.hpRed;
        ctx.fillRect(barX, barY, barW * Math.max(0, hpRatio), barH);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barW, barH);

        ctx.restore();
    }

    // === 재료 아이템 ===
    drawMaterial(ctx, x, y, size, index, time) {
        ctx.save();

        const glow = Math.sin(time * 5) * 0.3 + 0.7;
        ctx.shadowColor = COLORS.gold;
        ctx.shadowBlur = 10 * glow;

        ctx.fillStyle = `rgba(255,215,0,${0.3 * glow})`;
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size * 0.7, 0, Math.PI * 2);
        ctx.fill();

        const cx = x + size / 2;
        const cy = y + size / 2;
        ctx.shadowBlur = 0;

        const icons = ['#0277BD', '#4CAF50', '#0288D1', '#FF6F00'];
        ctx.fillStyle = icons[index] || COLORS.waterDark;

        switch (index) {
            case 0:
                ctx.fillRect(cx - 8, cy - 5, 16, 10);
                ctx.fillStyle = '#01579B';
                ctx.fillRect(cx - 6, cy - 3, 12, 6);
                break;
            case 1:
                ctx.beginPath();
                ctx.arc(cx, cy, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(cx, cy - 8);
                ctx.lineTo(cx, cy + 8);
                ctx.stroke();
                break;
            case 2:
                ctx.beginPath();
                ctx.moveTo(cx, cy - 10);
                ctx.bezierCurveTo(cx + 8, cy - 4, cx + 10, cy + 4, cx, cy + 10);
                ctx.bezierCurveTo(cx - 10, cy + 4, cx - 8, cy - 4, cx, cy - 10);
                ctx.fill();
                break;
            case 3:
                ctx.beginPath();
                ctx.moveTo(cx - 8, cy + 6);
                ctx.lineTo(cx + 8, cy);
                ctx.lineTo(cx - 8, cy - 6);
                ctx.closePath();
                ctx.fill();
                break;
        }

        ctx.fillStyle = COLORS.gold;
        const sa = time * 3;
        for (let i = 0; i < 3; i++) {
            const a = sa + (Math.PI * 2 * i) / 3;
            ctx.beginPath();
            ctx.arc(cx + Math.cos(a) * 14, cy + Math.sin(a) * 14, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}
