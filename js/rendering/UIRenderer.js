import { BASE_WIDTH, BASE_HEIGHT, COLORS, TOTAL_MATERIALS, MATERIAL_NAMES, DIFFICULTIES, DIFFICULTY_KEYS, FREEZE_COOLDOWN, BODY_SKINS, BULLET_SKINS } from '../data/constants.js';

export class UIRenderer {
    constructor(sprite) {
        this.sprite = sprite;
        this.isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    // === 메인 메뉴 ===
    drawMenu(ctx, time, difficultyIndex, coins) {
        // 배경 (그라데이션 하늘)
        const grad = ctx.createLinearGradient(0, 0, 0, BASE_HEIGHT);
        grad.addColorStop(0, '#01579B');
        grad.addColorStop(0.5, '#0277BD');
        grad.addColorStop(1, '#4FC3F7');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

        // 떠다니는 물방울 배경 효과
        for (let i = 0; i < 12; i++) {
            const dx = ((i * 137 + time * 30) % (BASE_WIDTH + 40)) - 20;
            const dy = ((i * 89 + time * 50) % (BASE_HEIGHT + 40)) - 20;
            const ds = 4 + (i % 3) * 2;
            ctx.fillStyle = `rgba(179,229,252,${0.15 + (i % 3) * 0.1})`;
            ctx.beginPath();
            ctx.arc(dx, dy, ds, 0, Math.PI * 2);
            ctx.fill();
        }

        // 떨어지는 불꽃 효과
        for (let i = 0; i < 8; i++) {
            const fx = ((i * 211 + time * 40) % (BASE_WIDTH + 30)) - 15;
            const fy = ((i * 167 + time * 80) % (BASE_HEIGHT + 30)) - 15;
            ctx.fillStyle = `rgba(255,140,0,${0.2 + Math.sin(time * 3 + i) * 0.15})`;
            ctx.beginPath();
            ctx.ellipse(fx, fy, 3, 5, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // 타이틀
        const bounce = Math.sin(time * 3) * 8;
        ctx.save();
        ctx.textAlign = 'center';

        // 타이틀 그림자
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 10;

        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 60px sans-serif';
        ctx.fillText('Water', BASE_WIDTH / 2, 150 + bounce);

        ctx.fillStyle = COLORS.fireOrange;
        ctx.font = 'bold 32px sans-serif';
        ctx.fillText('VS', BASE_WIDTH / 2, 195 + bounce);

        ctx.fillStyle = COLORS.fireRed;
        ctx.font = 'bold 60px sans-serif';
        ctx.fillText('Fire', BASE_WIDTH / 2, 250 + bounce);
        ctx.shadowBlur = 0;

        // 부제
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = 'italic 14px sans-serif';
        ctx.fillText('— 물방울 용사의 모험 —', BASE_WIDTH / 2, 280 + bounce);

        // 난이도 선택
        const diffY = 310;
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText(this.isMobile ? '난이도 선택 (터치)' : '난이도 선택 (← →)', BASE_WIDTH / 2, diffY - 10);

        for (let i = 0; i < DIFFICULTY_KEYS.length; i++) {
            const key = DIFFICULTY_KEYS[i];
            const diff = DIFFICULTIES[key];
            const dx = BASE_WIDTH / 2 + (i - 1) * 130;
            const isSelected = i === difficultyIndex;

            // 배경 박스
            ctx.fillStyle = isSelected ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)';
            this._roundRect(ctx, dx - 50, diffY, 100, 44, 8);
            ctx.fill();
            if (isSelected) {
                ctx.strokeStyle = '#FFF';
                ctx.lineWidth = 2;
                this._roundRect(ctx, dx - 50, diffY, 100, 44, 8);
                ctx.stroke();
            }

            ctx.fillStyle = isSelected ? '#FFF' : 'rgba(255,255,255,0.6)';
            ctx.font = isSelected ? 'bold 18px sans-serif' : '16px sans-serif';
            ctx.fillText(diff.label, dx, diffY + 28);
        }

        // 어려움일 때 얼리기 알림
        if (difficultyIndex === 2) {
            ctx.fillStyle = COLORS.iceMid;
            ctx.font = 'bold 14px sans-serif';
            ctx.fillText('얼리기 능력 사용 가능!', BASE_WIDTH / 2, diffY + 65);
        }

        // 코인 표시 (멋진 박스)
        const coinBoxW = 110;
        const coinBoxH = 36;
        const coinBoxX = BASE_WIDTH - coinBoxW - 12;
        const coinBoxY = 12;
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        this._roundRect(ctx, coinBoxX, coinBoxY, coinBoxW, coinBoxH, 8);
        ctx.fill();
        ctx.strokeStyle = COLORS.gold;
        ctx.lineWidth = 1.5;
        this._roundRect(ctx, coinBoxX, coinBoxY, coinBoxW, coinBoxH, 8);
        ctx.stroke();

        // 코인 아이콘
        const coinIconX = coinBoxX + 22;
        const coinIconY = coinBoxY + coinBoxH / 2;
        const coinSpin = Math.sin(time * 3);
        ctx.save();
        ctx.translate(coinIconX, coinIconY);
        ctx.scale(Math.abs(coinSpin), 1);
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(0, 0, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFA000';
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.textAlign = 'left';
        ctx.fillStyle = COLORS.gold;
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText(coins.toString(), coinBoxX + 38, coinBoxY + 24);

        ctx.textAlign = 'center';

        // 시작 안내 (강조된 박스)
        const startPulse = Math.sin(time * 4) * 0.3 + 0.7;
        ctx.globalAlpha = startPulse;
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 22px sans-serif';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 6;
        ctx.fillText(this.isMobile ? '▶ 터치해서 시작 ▶' : '▶ 아무 키나 눌러서 시작 ▶', BASE_WIDTH / 2, 430);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        // 상점 안내
        if (this.isMobile) {
            // 모바일: 상점 버튼 그리기
            const btnW = 100;
            const btnH = 40;
            const btnX = BASE_WIDTH / 2 - btnW / 2;
            const btnY = 455;
            ctx.fillStyle = 'rgba(255,215,79,0.25)';
            this._roundRect(ctx, btnX, btnY, btnW, btnH, 10);
            ctx.fill();
            ctx.strokeStyle = '#FFD54F';
            ctx.lineWidth = 2;
            this._roundRect(ctx, btnX, btnY, btnW, btnH, 10);
            ctx.stroke();
            ctx.fillStyle = '#FFD54F';
            ctx.font = 'bold 16px sans-serif';
            ctx.fillText('상점', BASE_WIDTH / 2, btnY + 26);
        } else {
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.font = '14px sans-serif';
            ctx.fillText('S: 상점', BASE_WIDTH / 2, 470);
        }

        // 조작법 미리보기
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '14px sans-serif';
        ctx.fillText(this.isMobile ? '조이스틱: 이동 | 버튼: 점프/발사' : '방향키: 이동 | Space: 점프 | Z: 발사', BASE_WIDTH / 2, 520);

        ctx.restore();
    }

    // === 상점 ===
    drawShop(ctx, time, shopTab, shopCursor, save, sprite) {
        // 배경
        const grad = ctx.createLinearGradient(0, 0, 0, BASE_HEIGHT);
        grad.addColorStop(0, '#1A237E');
        grad.addColorStop(1, '#283593');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

        ctx.save();
        ctx.textAlign = 'center';

        // 타이틀
        ctx.fillStyle = COLORS.gold;
        ctx.font = 'bold 32px sans-serif';
        ctx.fillText('상점', BASE_WIDTH / 2, 50);

        // 코인
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText(`코인: ${save.coins}`, BASE_WIDTH / 2, 80);

        // 탭
        const tabNames = this.isMobile ? ['몸 스킨', '총알 스킨'] : ['몸 스킨 (Q)', '총알 스킨 (E)'];
        for (let t = 0; t < 2; t++) {
            const tx = BASE_WIDTH / 2 + (t - 0.5) * 200;
            const isActive = t === shopTab;
            ctx.fillStyle = isActive ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.08)';
            this._roundRect(ctx, tx - 85, 95, 170, 30, 6);
            ctx.fill();
            ctx.fillStyle = isActive ? '#FFF' : 'rgba(255,255,255,0.5)';
            ctx.font = isActive ? 'bold 14px sans-serif' : '14px sans-serif';
            ctx.fillText(tabNames[t], tx, 115);
        }

        // 아이템 목록
        const items = shopTab === 0 ? BODY_SKINS : BULLET_SKINS;
        const listY = 140;
        const itemH = 48;
        const maxVisible = 8;
        const scrollOffset = Math.max(0, shopCursor - maxVisible + 1);

        ctx.textAlign = 'left';
        for (let i = scrollOffset; i < Math.min(items.length, scrollOffset + maxVisible); i++) {
            const item = items[i];
            const iy = listY + (i - scrollOffset) * itemH;
            const isSelected = i === shopCursor;

            // 배경
            ctx.fillStyle = isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)';
            this._roundRect(ctx, 80, iy, BASE_WIDTH - 160, itemH - 4, 6);
            ctx.fill();
            if (isSelected) {
                ctx.strokeStyle = COLORS.gold;
                ctx.lineWidth = 2;
                this._roundRect(ctx, 80, iy, BASE_WIDTH - 160, itemH - 4, 6);
                ctx.stroke();
            }

            // 색상 프리뷰
            if (shopTab === 0) {
                const pColors = item.colors || ['#CCC', '#999', '#666'];
                const previewGrad = ctx.createRadialGradient(110, iy + 22, 2, 110, iy + 22, 14);
                previewGrad.addColorStop(0, pColors[0]);
                previewGrad.addColorStop(0.5, pColors[1]);
                previewGrad.addColorStop(1, pColors[2]);
                ctx.fillStyle = previewGrad;
                ctx.beginPath();
                ctx.arc(110, iy + 22, 14, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillStyle = item.color === 'rainbow' ? '#FF6B35' : item.color;
                ctx.beginPath();
                ctx.ellipse(110, iy + 22, 10, 7, 0, 0, Math.PI * 2);
                ctx.fill();
                if (item.color === 'rainbow') {
                    ctx.fillStyle = '#4FC3F7';
                    ctx.beginPath();
                    ctx.ellipse(110, iy + 22, 6, 4, 0, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            // 이름
            ctx.fillStyle = '#FFF';
            ctx.font = '15px sans-serif';
            ctx.fillText(item.name, 140, iy + 27);

            // 상태/가격 (오른쪽)
            ctx.textAlign = 'right';
            const owned = shopTab === 0 ? save.ownsBodySkin(item.id) : save.ownsBulletSkin(item.id);
            const isActive = shopTab === 0
                ? save.activeBodySkin === item.id
                : save.activeBulletSkin === item.id;

            if (isActive) {
                ctx.fillStyle = '#66BB6A';
                ctx.font = 'bold 14px sans-serif';
                ctx.fillText('장착중', BASE_WIDTH - 100, iy + 27);
            } else if (owned) {
                ctx.fillStyle = 'rgba(255,255,255,0.6)';
                ctx.font = '14px sans-serif';
                ctx.fillText('보유 (Z: 장착)', BASE_WIDTH - 100, iy + 27);
            } else if (item.price === 0) {
                ctx.fillStyle = '#66BB6A';
                ctx.font = 'bold 14px sans-serif';
                ctx.fillText('기본', BASE_WIDTH - 100, iy + 27);
            } else {
                const canBuy = save.coins >= item.price;
                ctx.fillStyle = canBuy ? COLORS.gold : '#EF5350';
                ctx.font = 'bold 14px sans-serif';
                ctx.fillText(`${item.price} 코인 (Z: 구매)`, BASE_WIDTH - 100, iy + 27);
            }
            ctx.textAlign = 'left';
        }

        // 하단 안내
        ctx.textAlign = 'center';
        if (this.isMobile) {
            // 뒤로가기 버튼
            ctx.fillStyle = 'rgba(255,255,255,0.15)';
            this._roundRect(ctx, 20, BASE_HEIGHT - 55, 80, 36, 8);
            ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.font = 'bold 14px sans-serif';
            ctx.fillText('← 뒤로', 60, BASE_HEIGHT - 32);

            // 구매/장착 버튼
            ctx.fillStyle = 'rgba(255,215,79,0.25)';
            this._roundRect(ctx, BASE_WIDTH - 130, BASE_HEIGHT - 55, 110, 36, 8);
            ctx.fill();
            ctx.strokeStyle = '#FFD54F';
            ctx.lineWidth = 1.5;
            this._roundRect(ctx, BASE_WIDTH - 130, BASE_HEIGHT - 55, 110, 36, 8);
            ctx.stroke();
            ctx.fillStyle = '#FFD54F';
            ctx.font = 'bold 14px sans-serif';
            ctx.fillText('구매/장착', BASE_WIDTH - 75, BASE_HEIGHT - 32);
        } else {
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.font = '13px sans-serif';
            ctx.fillText('↑↓: 선택 | Z: 구매/장착 | ESC: 나가기', BASE_WIDTH / 2, BASE_HEIGHT - 20);
        }

        ctx.restore();
    }

    // === 튜토리얼 ===
    drawTutorial(ctx, time, difficulty) {
        const grad = ctx.createLinearGradient(0, 0, 0, BASE_HEIGHT);
        grad.addColorStop(0, '#0277BD');
        grad.addColorStop(1, '#4FC3F7');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

        ctx.save();
        ctx.textAlign = 'center';

        // 말풍선
        ctx.fillStyle = '#FFF';
        this._roundRect(ctx, 80, 40, 640, 380, 20);
        ctx.fill();
        ctx.strokeStyle = COLORS.waterDark;
        ctx.lineWidth = 3;
        this._roundRect(ctx, 80, 40, 640, 380, 20);
        ctx.stroke();

        ctx.fillStyle = '#333';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText('불 몬스터가 마을을 공격하고 있어!', BASE_WIDTH / 2, 85);

        ctx.font = '17px sans-serif';
        ctx.fillText('악당 성을 부수고 물대포 재료를 모아!', BASE_WIDTH / 2, 125);

        ctx.fillStyle = COLORS.fireRed;
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText('★ 재료 4개를 모으면 초강력 물대포 완성! ★', BASE_WIDTH / 2, 160);

        // 적 종류 소개
        ctx.fillStyle = '#0277BD';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText('새 적: 슈터(원거리), 폭발형(자폭), 차저(돌진), 비행(어려움)', BASE_WIDTH / 2, 200);

        // 조작법
        ctx.fillStyle = '#333';
        ctx.font = '15px sans-serif';
        if (this.isMobile) {
            ctx.fillText('조이스틱  이동 / JUMP  점프', BASE_WIDTH / 2, 240);
            ctx.fillText('FIRE 짧게 — 일반 발사', BASE_WIDTH / 2, 265);
            ctx.fillStyle = '#01579B';
            ctx.font = 'bold 15px sans-serif';
            ctx.fillText('FIRE 길게 — 차지 샷 (강력! 관통!)', BASE_WIDTH / 2, 290);
            ctx.fillStyle = '#333';
            ctx.font = '15px sans-serif';
        } else {
            ctx.fillText('⬅ ➡  이동 | Space  점프 | Z 짧게 — 일반 발사', BASE_WIDTH / 2, 240);
            ctx.fillStyle = '#01579B';
            ctx.font = 'bold 15px sans-serif';
            ctx.fillText('Z 길게 누르기 — 차지 샷 (강력! 관통!)', BASE_WIDTH / 2, 270);
            ctx.fillStyle = '#333';
            ctx.font = '15px sans-serif';
        }
        ctx.fillStyle = '#D32F2F';
        ctx.font = '13px sans-serif';
        ctx.fillText('💥 18% 크리티컬 (1.5배) | ❤️ 회복 아이템 드롭 | ⚠ 집 HP 30%↓ = FINAL STAND!', BASE_WIDTH / 2, 318);

        // 어려움 전용 조작법
        if (difficulty === 'hard') {
            ctx.fillStyle = COLORS.waterDark;
            ctx.font = 'bold 14px sans-serif';
            ctx.fillText(this.isMobile ? '❄ ICE 버튼  얼리기 (쿨타임 15초)' : '❄ X  얼리기 (쿨타임 15초)', BASE_WIDTH / 2, 345);
        }

        if (time > 0.5 && Math.floor(time * 2) % 2 === 0) {
            ctx.fillStyle = COLORS.waterDark;
            ctx.font = 'bold 22px sans-serif';
            ctx.fillText(this.isMobile ? '▶ 터치해서 출발 ▶' : '▶ 아무 키나 눌러서 출발 ▶', BASE_WIDTH / 2, 460);
        }

        ctx.restore();
    }

    // === HUD ===
    drawHUD(ctx, player, stage, materialsCollected, cannonComplete, stageIndex, difficulty, score, combo, comboRatio) {
        ctx.save();

        // === 좌상단 패널 (HP, 난이도) ===
        const panelX = 8;
        const panelY = 8;
        const panelW = 200;
        const panelH = 56;

        // 반투명 패널 배경
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        this._roundRect(ctx, panelX, panelY, panelW, panelH, 10);
        ctx.fill();

        // 플레이어 HP (하트)
        for (let i = 0; i < player.maxHp; i++) {
            const hx = panelX + 18 + i * 22;
            const hy = panelY + 14;
            if (i < player.hp) {
                this._drawHeart(ctx, hx, hy, 10, COLORS.hpRed);
                // 살짝 글로우
                ctx.save();
                ctx.shadowColor = COLORS.hpRed;
                ctx.shadowBlur = 6;
                this._drawHeart(ctx, hx, hy, 10, COLORS.hpRed);
                ctx.restore();
            } else {
                this._drawHeart(ctx, hx, hy, 10, 'rgba(120,120,120,0.6)');
            }
        }

        // 난이도 표시 (좌측 패널 하단)
        const diffLabel = DIFFICULTIES[difficulty] ? DIFFICULTIES[difficulty].label : '';
        if (diffLabel) {
            ctx.textAlign = 'left';
            ctx.fillStyle = difficulty === 'hard' ? '#FF7043' : difficulty === 'easy' ? '#81C784' : '#FFD54F';
            ctx.font = 'bold 11px sans-serif';
            ctx.fillText(`난이도: ${diffLabel}`, panelX + 12, panelY + 46);
        }

        // === 중앙 상단 (스테이지/웨이브) ===
        ctx.textAlign = 'center';
        const stageNames = ['마을 입구', '숲 속 마을', '언덕 위 마을', '강가 마을', '불의 성'];

        // 스테이지 패널 배경
        const sPanelW = 180, sPanelH = 50;
        const sPanelX = BASE_WIDTH / 2 - sPanelW / 2;
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        this._roundRect(ctx, sPanelX, 8, sPanelW, sPanelH, 10);
        ctx.fill();

        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText(`STAGE ${stageIndex + 1}`, BASE_WIDTH / 2, 26);

        ctx.fillStyle = COLORS.waterLight;
        ctx.font = '12px sans-serif';
        ctx.fillText(stageNames[stageIndex] || '', BASE_WIDTH / 2, 42);

        // 웨이브 정보
        if (stage.totalWaves > 1) {
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.font = '11px sans-serif';
            ctx.fillText(`Wave ${stage.currentWave + 1}/${stage.totalWaves}`, BASE_WIDTH / 2, 56);
        }

        // === 우상단 (재료 + 점수) ===
        const rPanelW = 200, rPanelH = 56;
        const rPanelX = BASE_WIDTH - rPanelW - 8;
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        this._roundRect(ctx, rPanelX, 8, rPanelW, rPanelH, 10);
        ctx.fill();

        // 재료 수집 현황
        ctx.textAlign = 'right';
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('재료', rPanelX + rPanelW - 12, 22);

        for (let i = 0; i < TOTAL_MATERIALS; i++) {
            const mx = rPanelX + 22 + i * 26;
            const my = 28;
            const collected = i < materialsCollected;
            ctx.fillStyle = collected ? COLORS.gold : 'rgba(80,80,80,0.6)';
            ctx.strokeStyle = collected ? '#FF8F00' : 'rgba(50,50,50,0.8)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(mx, my + 6, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            if (collected) {
                ctx.fillStyle = '#FFF';
                ctx.font = 'bold 10px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('✓', mx, my + 10);
                ctx.textAlign = 'right';
            }
        }

        // 점수 표시
        ctx.textAlign = 'right';
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 13px sans-serif';
        const scoreStr = (score || 0).toLocaleString('en-US');
        ctx.fillText(`점수: ${scoreStr}`, rPanelX + rPanelW - 12, 56);

        // 물대포 완성 표시 (재료 영역 옆)
        if (cannonComplete) {
            ctx.textAlign = 'left';
            ctx.fillStyle = COLORS.gold;
            ctx.font = 'bold 11px sans-serif';
            ctx.shadowColor = '#FF6F00';
            ctx.shadowBlur = 4;
            ctx.fillText('★ 물대포 완성!', rPanelX + 14, 56);
            ctx.shadowBlur = 0;
        }

        // === 콤보 (좌상단 패널 아래) ===
        if (combo && combo >= 2) {
            ctx.textAlign = 'left';
            const cx = panelX + 12;
            const cy = panelY + panelH + 8;
            // 콤보 텍스트
            let comboColor = '#FFEB3B';
            if (combo >= 5) comboColor = '#FF9800';
            if (combo >= 10) comboColor = '#F44336';

            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            this._roundRect(ctx, cx - 4, cy - 2, 130, 28, 6);
            ctx.fill();

            ctx.fillStyle = comboColor;
            ctx.font = `bold ${15 + Math.min(8, combo - 2)}px sans-serif`;
            ctx.shadowColor = '#000';
            ctx.shadowBlur = 3;
            ctx.fillText(`× ${combo}`, cx, cy + 18);
            ctx.shadowBlur = 0;

            // 콤보 게이지
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            ctx.fillRect(cx + 50, cy + 8, 70, 6);
            ctx.fillStyle = comboColor;
            ctx.fillRect(cx + 50, cy + 8, 70 * Math.max(0, comboRatio || 0), 6);
        }

        // 얼리기 쿨타임 (어려움에서만)
        if (difficulty === 'hard') {
            const freezeRatio = Math.max(0, 1 - player.freezeCooldown / FREEZE_COOLDOWN);
            const barX = 16;
            const barY = BASE_HEIGHT - 40;
            const barW = 80;
            const barH = 10;

            ctx.fillStyle = '#333';
            ctx.fillRect(barX, barY, barW, barH);
            ctx.fillStyle = freezeRatio >= 1 ? COLORS.iceMid : '#455A64';
            ctx.fillRect(barX, barY, barW * freezeRatio, barH);
            ctx.strokeStyle = '#555';
            ctx.lineWidth = 1;
            ctx.strokeRect(barX, barY, barW, barH);

            ctx.textAlign = 'left';
            ctx.fillStyle = freezeRatio >= 1 ? '#FFF' : 'rgba(255,255,255,0.5)';
            ctx.font = 'bold 11px sans-serif';
            ctx.fillText('X 얼리기', barX, barY - 4);

            // 사용 가능 시 반짝임
            if (freezeRatio >= 1 && Math.floor(player.time * 3) % 2 === 0) {
                ctx.fillStyle = COLORS.iceMid;
                ctx.fillRect(barX, barY, barW, barH);
            }
        }

        // 강화 물총 타이머 (활성일 때)
        if (player.isPoweredUp) {
            ctx.textAlign = 'left';
            const puBarX = 16;
            const puBarY = difficulty === 'hard' ? BASE_HEIGHT - 60 : BASE_HEIGHT - 40;
            const puBarW = 80;
            const puBarH = 8;
            const puRatio = player.powerUpTimer / 5;

            ctx.fillStyle = '#333';
            ctx.fillRect(puBarX, puBarY, puBarW, puBarH);
            ctx.fillStyle = '#FFD54F';
            ctx.fillRect(puBarX, puBarY, puBarW * Math.max(0, puRatio), puBarH);
            ctx.strokeStyle = '#555';
            ctx.lineWidth = 1;
            ctx.strokeRect(puBarX, puBarY, puBarW, puBarH);

            ctx.fillStyle = '#FFD54F';
            ctx.font = 'bold 11px sans-serif';
            ctx.fillText('강화!', puBarX, puBarY - 4);
        }

        ctx.restore();
    }

    // === 웨이브 경고 ===
    drawWaveWarning(ctx, warning) {
        if (!warning) return;
        const remaining = warning.remaining;
        const isBoss = warning.wave && warning.wave.isBoss;
        const blink = Math.sin(Date.now() / 100) * 0.5 + 0.5;

        ctx.save();
        ctx.textAlign = 'center';

        // 화면 우측에서 화살표 표시
        const arrowX = BASE_WIDTH - 60;
        const arrowY = BASE_HEIGHT * 0.4;
        const arrowAlpha = 0.5 + blink * 0.5;

        // 위험 띠 (우측 가장자리)
        ctx.fillStyle = isBoss ? `rgba(255,23,68,${0.15 + blink * 0.15})` : `rgba(255,107,53,${0.1 + blink * 0.1})`;
        ctx.fillRect(BASE_WIDTH - 100, 0, 100, BASE_HEIGHT);

        // 큰 경고 화살표
        ctx.fillStyle = isBoss ? '#FF1744' : '#FFD54F';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.moveTo(arrowX + 30, arrowY);
        ctx.lineTo(arrowX, arrowY - 20);
        ctx.lineTo(arrowX, arrowY + 20);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        // 텍스트
        ctx.fillStyle = isBoss ? '#FF1744' : '#FFD54F';
        ctx.font = 'bold 16px sans-serif';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 4;
        ctx.fillText(isBoss ? '⚠ BOSS ⚠' : 'WAVE!', BASE_WIDTH - 50, arrowY - 35);
        ctx.font = 'bold 28px sans-serif';
        ctx.fillStyle = '#FFF';
        ctx.fillText(Math.ceil(remaining).toString(), BASE_WIDTH - 50, arrowY + 60);
        ctx.shadowBlur = 0;

        ctx.restore();
    }

    // === Final Stand 오버레이 ===
    drawFinalStandOverlay(ctx, time) {
        // 빨간 비네팅 펄스
        const pulse = Math.sin(time * 4) * 0.15 + 0.35;
        const grad = ctx.createRadialGradient(
            BASE_WIDTH / 2, BASE_HEIGHT / 2, BASE_WIDTH * 0.2,
            BASE_WIDTH / 2, BASE_HEIGHT / 2, BASE_WIDTH * 0.7
        );
        grad.addColorStop(0, 'rgba(255,0,0,0)');
        grad.addColorStop(1, `rgba(255,0,0,${pulse})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

        // 상단 경고 텍스트
        ctx.save();
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 6;
        const blink = Math.sin(time * 6);
        ctx.fillStyle = blink > 0 ? '#FF1744' : '#FFEB3B';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText('⚠ FINAL STAND! ⚠', BASE_WIDTH / 2, 90);
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('데미지 +60% — 집을 지켜라!', BASE_WIDTH / 2, 110);
        ctx.restore();
    }

    // === 스테이지 시작 배너 ===
    drawStageBanner(ctx, stageIndex, stageName, timer, difficulty) {
        // timer는 2.5에서 0으로 감소
        const T = 2.5;
        const t = T - timer; // 0 → 2.5
        if (t < 0 || t > T) return;

        const stageNames = stageName || ['마을 입구', '숲 속 마을', '언덕 위 마을', '강가 마을', '불의 성'][stageIndex];

        // 슬라이드 인 / 아웃
        let progress;
        if (t < 0.4) {
            progress = t / 0.4; // 슬라이드 인
        } else if (t < T - 0.4) {
            progress = 1; // 유지
        } else {
            progress = (T - t) / 0.4; // 슬라이드 아웃
        }

        const ease = 1 - Math.pow(1 - progress, 3);
        const slideOffset = (1 - ease) * BASE_WIDTH;

        ctx.save();

        const bannerY = BASE_HEIGHT * 0.35;
        const bannerH = 80;

        // 배너 배경 (사선 줄무늬)
        ctx.fillStyle = `rgba(0,0,0,${0.5 * ease})`;
        ctx.fillRect(0, bannerY, BASE_WIDTH, bannerH);

        // 위/아래 강조 라인
        ctx.fillStyle = `rgba(255,215,79,${ease})`;
        ctx.fillRect(0, bannerY - 2, BASE_WIDTH, 2);
        ctx.fillRect(0, bannerY + bannerH, BASE_WIDTH, 2);

        // 텍스트 (슬라이드 인)
        ctx.translate(-slideOffset, 0);
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 6;

        ctx.fillStyle = COLORS.gold;
        ctx.font = 'bold 38px sans-serif';
        ctx.fillText(`STAGE ${stageIndex + 1}`, BASE_WIDTH / 2, bannerY + 38);

        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText(stageNames, BASE_WIDTH / 2, bannerY + 68);

        ctx.shadowBlur = 0;
        ctx.restore();
    }

    // === 스테이지 클리어 ===
    drawStageClear(ctx, stageIndex, materialsCollected, time) {
        this._drawOverlay(ctx, 0.55);

        ctx.save();
        ctx.textAlign = 'center';

        // 반짝이 배경
        for (let i = 0; i < 18; i++) {
            const sx = (Math.sin(time * 1.5 + i * 1.3) * 0.5 + 0.5) * BASE_WIDTH;
            const sy = 100 + (Math.cos(time * 1.2 + i * 0.7) * 0.5 + 0.5) * 280;
            ctx.fillStyle = `rgba(255,215,79,${0.5 + Math.sin(time * 4 + i) * 0.5})`;
            ctx.beginPath();
            ctx.arc(sx, sy, 1.5 + Math.sin(time * 5 + i) * 1.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // 메인 박스
        const boxW = 480, boxH = 280;
        const boxX = (BASE_WIDTH - boxW) / 2;
        const boxY = 130;
        const slideIn = Math.min(1, time * 2.5);
        const ease = 1 - Math.pow(1 - slideIn, 3);
        ctx.translate(0, (1 - ease) * -50);
        ctx.globalAlpha = ease;

        // 박스 배경
        const grad = ctx.createLinearGradient(boxX, boxY, boxX, boxY + boxH);
        grad.addColorStop(0, 'rgba(13, 71, 161, 0.95)');
        grad.addColorStop(1, 'rgba(2, 119, 189, 0.95)');
        ctx.fillStyle = grad;
        this._roundRect(ctx, boxX, boxY, boxW, boxH, 16);
        ctx.fill();
        ctx.strokeStyle = COLORS.gold;
        ctx.lineWidth = 3;
        this._roundRect(ctx, boxX, boxY, boxW, boxH, 16);
        ctx.stroke();

        // 타이틀
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 4;
        ctx.fillStyle = COLORS.gold;
        ctx.font = 'bold 44px sans-serif';
        ctx.fillText('★ STAGE CLEAR ★', BASE_WIDTH / 2, boxY + 60);
        ctx.shadowBlur = 0;

        // 재료 획득 연출
        if (time > 0.5) {
            ctx.fillStyle = '#FFF';
            ctx.font = 'bold 18px sans-serif';
            ctx.fillText('새 재료를 얻었어요!', BASE_WIDTH / 2, boxY + 100);

            // 재료 이미지
            const matSize = 48;
            const matX = BASE_WIDTH / 2 - matSize / 2;
            const matY = boxY + 115;
            const popScale = time < 0.7 ? 0.5 + (time - 0.5) * 2.5 : 1 + Math.sin(time * 4) * 0.05;
            ctx.save();
            ctx.translate(matX + matSize / 2, matY + matSize / 2);
            ctx.scale(popScale, popScale);
            this.sprite.drawMaterial(ctx, -matSize / 2, -matSize / 2, matSize, materialsCollected - 1, time);
            ctx.restore();

            ctx.fillStyle = COLORS.gold;
            ctx.font = 'bold 22px sans-serif';
            const matName = MATERIAL_NAMES[materialsCollected - 1] || '재료';
            ctx.fillText(`"${matName}"`, BASE_WIDTH / 2, boxY + 200);

            // 진행도 바
            const barW = 300;
            const barH = 12;
            const barX = BASE_WIDTH / 2 - barW / 2;
            const barY = boxY + 220;
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            this._roundRect(ctx, barX, barY, barW, barH, 6);
            ctx.fill();
            const fillW = barW * (materialsCollected / TOTAL_MATERIALS);
            const barGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
            barGrad.addColorStop(0, '#FFD700');
            barGrad.addColorStop(1, '#FF8F00');
            ctx.fillStyle = barGrad;
            this._roundRect(ctx, barX, barY, fillW, barH, 6);
            ctx.fill();

            ctx.fillStyle = '#FFF';
            ctx.font = 'bold 13px sans-serif';
            ctx.fillText(`${materialsCollected} / ${TOTAL_MATERIALS}`, BASE_WIDTH / 2, barY + 30);
        }

        ctx.globalAlpha = 1;
        ctx.translate(0, -(1 - ease) * -50);

        if (time > 1 && Math.floor(time * 2) % 2 === 0) {
            ctx.fillStyle = '#FFF';
            ctx.font = 'bold 16px sans-serif';
            ctx.fillText(this.isMobile ? '터치해서 계속' : '아무 키나 눌러서 계속', BASE_WIDTH / 2, boxY + boxH + 30);
        }

        ctx.restore();
    }

    // === 물대포 완성 ===
    drawCannonComplete(ctx, time) {
        const grad = ctx.createLinearGradient(0, 0, 0, BASE_HEIGHT);
        grad.addColorStop(0, '#01579B');
        grad.addColorStop(1, '#0288D1');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

        ctx.save();
        ctx.textAlign = 'center';

        // 재료들이 모이는 연출
        ctx.fillStyle = COLORS.gold;
        ctx.font = 'bold 36px sans-serif';
        ctx.fillText('물대포 완성!', BASE_WIDTH / 2, 160);

        // 4개 재료 표시
        if (time > 0.5) {
            for (let i = 0; i < TOTAL_MATERIALS; i++) {
                const delay = 0.5 + i * 0.3;
                if (time > delay) {
                    const alpha = Math.min(1, (time - delay) * 3);
                    ctx.globalAlpha = alpha;
                    const mx = BASE_WIDTH / 2 - 80 + i * 50;
                    this.sprite.drawMaterial(ctx, mx, 200, 32, i, time);
                    ctx.globalAlpha = 1;
                }
            }
        }

        // 합체 화살표
        if (time > 2) {
            ctx.fillStyle = '#FFF';
            ctx.font = '30px sans-serif';
            ctx.fillText('⬇', BASE_WIDTH / 2, 280);

            ctx.fillStyle = '#E1F5FE';
            ctx.font = 'bold 24px sans-serif';
            ctx.fillText('초강력 물대포!', BASE_WIDTH / 2, 330);

            // 물대포 이미지
            ctx.fillStyle = '#01579B';
            ctx.fillRect(BASE_WIDTH / 2 - 30, 350, 60, 20);
            ctx.fillStyle = '#0277BD';
            ctx.fillRect(BASE_WIDTH / 2 + 20, 345, 20, 30);
            ctx.fillStyle = COLORS.waterMid;
            ctx.beginPath();
            ctx.arc(BASE_WIDTH / 2 + 40, 360, 10, 0, Math.PI * 2);
            ctx.fill();
        }

        if (time > 2 && Math.floor(time * 2) % 2 === 0) {
            ctx.fillStyle = '#FFF';
            ctx.font = '18px sans-serif';
            ctx.fillText('아무 키나 눌러서 최종 결전!', BASE_WIDTH / 2, 450);
        }

        ctx.restore();
    }

    // === 보스 등장 ===
    drawBossIntro(ctx, time) {
        this._drawOverlay(ctx, 0.7);

        ctx.save();
        ctx.textAlign = 'center';

        if (time < 1) {
            ctx.fillStyle = COLORS.fireRed;
            ctx.font = 'bold 50px sans-serif';
            ctx.globalAlpha = Math.min(1, time * 2);
            ctx.fillText('WARNING!', BASE_WIDTH / 2, BASE_HEIGHT / 2 - 20);
        } else {
            ctx.fillStyle = COLORS.fireOrange;
            ctx.font = 'bold 36px sans-serif';
            ctx.fillText('보스 등장!', BASE_WIDTH / 2, BASE_HEIGHT / 2 - 20);
            ctx.fillStyle = '#FFF';
            ctx.font = '18px sans-serif';
            ctx.fillText('불의 대마왕이 나타났다!', BASE_WIDTH / 2, BASE_HEIGHT / 2 + 20);
        }

        ctx.restore();
    }

    // === 일시정지 ===
    drawPaused(ctx) {
        this._drawOverlay(ctx, 0.5);
        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 36px sans-serif';
        ctx.fillText('일시정지', BASE_WIDTH / 2, BASE_HEIGHT / 2 - 40);
        ctx.font = '18px sans-serif';
        ctx.fillText(this.isMobile ? '|| 버튼을 눌러서 계속' : 'ESC를 눌러서 계속', BASE_WIDTH / 2, BASE_HEIGHT / 2);

        // 나가기 버튼
        const quitBtnW = 120;
        const quitBtnH = 40;
        const quitBtnX = BASE_WIDTH / 2 - quitBtnW / 2;
        const quitBtnY = BASE_HEIGHT / 2 + 30;
        ctx.fillStyle = 'rgba(255,80,80,0.25)';
        this._roundRect(ctx, quitBtnX, quitBtnY, quitBtnW, quitBtnH, 10);
        ctx.fill();
        ctx.strokeStyle = '#EF5350';
        ctx.lineWidth = 2;
        this._roundRect(ctx, quitBtnX, quitBtnY, quitBtnW, quitBtnH, 10);
        ctx.stroke();
        ctx.fillStyle = '#EF5350';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText(this.isMobile ? '나가기' : 'Q: 나가기', BASE_WIDTH / 2, quitBtnY + 26);

        ctx.restore();
    }

    // === 나가기 확인 ===
    drawConfirmQuit(ctx) {
        this._drawOverlay(ctx, 0.7);
        ctx.save();
        ctx.textAlign = 'center';

        // 대화상자 배경
        const boxW = 340;
        const boxH = 180;
        const boxX = BASE_WIDTH / 2 - boxW / 2;
        const boxY = BASE_HEIGHT / 2 - boxH / 2;
        ctx.fillStyle = 'rgba(30,30,60,0.95)';
        this._roundRect(ctx, boxX, boxY, boxW, boxH, 16);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 2;
        this._roundRect(ctx, boxX, boxY, boxW, boxH, 16);
        ctx.stroke();

        // 질문
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText('정말 나가시겠습니까?', BASE_WIDTH / 2, boxY + 50);

        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '14px sans-serif';
        ctx.fillText('진행 상황이 사라집니다', BASE_WIDTH / 2, boxY + 78);

        // 예 버튼
        const btnW = 110;
        const btnH = 42;
        const btnY = boxY + boxH - 60;
        const yesBtnX = BASE_WIDTH / 2 - btnW - 10;
        ctx.fillStyle = 'rgba(255,80,80,0.3)';
        this._roundRect(ctx, yesBtnX, btnY, btnW, btnH, 10);
        ctx.fill();
        ctx.strokeStyle = '#EF5350';
        ctx.lineWidth = 2;
        this._roundRect(ctx, yesBtnX, btnY, btnW, btnH, 10);
        ctx.stroke();
        ctx.fillStyle = '#EF5350';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText(this.isMobile ? '예' : '예 (Z)', yesBtnX + btnW / 2, btnY + 27);

        // 아니오 버튼
        const noBtnX = BASE_WIDTH / 2 + 10;
        ctx.fillStyle = 'rgba(100,200,100,0.3)';
        this._roundRect(ctx, noBtnX, btnY, btnW, btnH, 10);
        ctx.fill();
        ctx.strokeStyle = '#66BB6A';
        ctx.lineWidth = 2;
        this._roundRect(ctx, noBtnX, btnY, btnW, btnH, 10);
        ctx.stroke();
        ctx.fillStyle = '#66BB6A';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText(this.isMobile ? '아니오' : '아니오 (ESC)', noBtnX + btnW / 2, btnY + 27);

        ctx.restore();
    }

    // === 게임오버 ===
    drawGameOver(ctx, time) {
        // 빨간 비네팅 효과
        const fadeIn = Math.min(1, time * 2);
        ctx.fillStyle = `rgba(0,0,0,${0.7 * fadeIn})`;
        ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);
        const vignette = ctx.createRadialGradient(BASE_WIDTH / 2, BASE_HEIGHT / 2, 100, BASE_WIDTH / 2, BASE_HEIGHT / 2, BASE_WIDTH / 2);
        vignette.addColorStop(0, 'rgba(180,0,0,0)');
        vignette.addColorStop(1, `rgba(180,0,0,${0.5 * fadeIn})`);
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

        ctx.save();
        ctx.textAlign = 'center';

        // 메인 박스
        const boxW = 420, boxH = 200;
        const boxX = (BASE_WIDTH - boxW) / 2;
        const boxY = BASE_HEIGHT / 2 - boxH / 2;
        ctx.fillStyle = `rgba(20,0,0,${0.9 * fadeIn})`;
        this._roundRect(ctx, boxX, boxY, boxW, boxH, 14);
        ctx.fill();
        ctx.strokeStyle = `rgba(239,83,80,${fadeIn})`;
        ctx.lineWidth = 3;
        this._roundRect(ctx, boxX, boxY, boxW, boxH, 14);
        ctx.stroke();

        // 흔들리는 텍스트
        const shakeX = (Math.random() - 0.5) * 2 * Math.max(0, 1 - time);
        ctx.translate(shakeX, 0);

        ctx.shadowColor = '#000';
        ctx.shadowBlur = 6;
        ctx.fillStyle = COLORS.fireRed;
        ctx.font = 'bold 50px sans-serif';
        ctx.fillText('GAME OVER', BASE_WIDTH / 2, boxY + 70);
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#FFCDD2';
        ctx.font = '17px sans-serif';
        ctx.fillText('집이 불타버렸어...', BASE_WIDTH / 2, boxY + 110);

        if (time > 1 && Math.floor(time * 2) % 2 === 0) {
            ctx.fillStyle = '#FFF';
            ctx.font = 'bold 16px sans-serif';
            ctx.fillText(this.isMobile ? '터치해서 메인으로!' : '아무 키나 눌러서 메인으로!', BASE_WIDTH / 2, boxY + 160);
        }

        ctx.restore();
    }

    // === 승리 ===
    drawWin(ctx, score, time, coinReward) {
        const grad = ctx.createLinearGradient(0, 0, 0, BASE_HEIGHT);
        grad.addColorStop(0, '#0D47A1');
        grad.addColorStop(0.5, '#1976D2');
        grad.addColorStop(1, '#4FC3F7');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

        ctx.save();
        ctx.textAlign = 'center';

        // 폭죽 (승리 직후)
        if (time < 4) {
            for (let i = 0; i < 5; i++) {
                const fwTime = (time + i * 0.7) % 2.5;
                if (fwTime < 1.2) {
                    const fwX = ((i * 173) % BASE_WIDTH);
                    const fwY = 200 + Math.sin(i * 2) * 60;
                    const numParticles = 16;
                    const colors = ['#FFD700', '#FF6B35', '#F44336', '#4FC3F7', '#9C27B0'];
                    const color = colors[i % colors.length];
                    for (let p = 0; p < numParticles; p++) {
                        const angle = (Math.PI * 2 * p) / numParticles;
                        const dist = fwTime * 80;
                        const px = fwX + Math.cos(angle) * dist;
                        const py = fwY + Math.sin(angle) * dist + fwTime * fwTime * 30;
                        ctx.fillStyle = `rgba(${this._hexR(color)},${this._hexG(color)},${this._hexB(color)},${1 - fwTime})`;
                        ctx.beginPath();
                        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }
        }

        // 별 반짝이
        ctx.fillStyle = COLORS.gold;
        for (let i = 0; i < 30; i++) {
            const sx = (Math.sin(time * 1.5 + i * 1.3) * 0.5 + 0.5) * BASE_WIDTH;
            const sy = (Math.cos(time * 1.2 + i * 0.9) * 0.5 + 0.5) * BASE_HEIGHT;
            const size = 1 + (Math.sin(time * 3 + i) + 1) * 1.5;
            ctx.fillStyle = `rgba(255,215,0,${0.6 + Math.sin(time * 4 + i) * 0.4})`;
            ctx.beginPath();
            ctx.arc(sx, sy, size, 0, Math.PI * 2);
            ctx.fill();
        }

        const bounce = Math.sin(time * 3) * 8;
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 8;
        ctx.fillStyle = COLORS.gold;
        ctx.font = 'bold 64px sans-serif';
        ctx.fillText('★ VICTORY ★', BASE_WIDTH / 2, 160 + bounce);
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText('불 몬스터를 물리쳤다!', BASE_WIDTH / 2, 230);

        ctx.fillStyle = COLORS.waterLight;
        ctx.font = '18px sans-serif';
        ctx.fillText('마을에 다시 평화가 찾아왔어!', BASE_WIDTH / 2, 265);

        // 점수 박스
        if (time > 0.8) {
            const sBoxW = 280, sBoxH = 120;
            const sBoxX = BASE_WIDTH / 2 - sBoxW / 2;
            const sBoxY = 295;
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            this._roundRect(ctx, sBoxX, sBoxY, sBoxW, sBoxH, 10);
            ctx.fill();
            ctx.strokeStyle = COLORS.gold;
            ctx.lineWidth = 2;
            this._roundRect(ctx, sBoxX, sBoxY, sBoxW, sBoxH, 10);
            ctx.stroke();

            ctx.fillStyle = '#FFD54F';
            ctx.font = 'bold 14px sans-serif';
            ctx.fillText('FINAL SCORE', BASE_WIDTH / 2, sBoxY + 26);

            ctx.fillStyle = '#FFF';
            ctx.font = 'bold 28px sans-serif';
            ctx.fillText((score || 0).toLocaleString('en-US'), BASE_WIDTH / 2, sBoxY + 60);

            // 코인 보상
            if (coinReward) {
                ctx.fillStyle = COLORS.gold;
                ctx.font = 'bold 18px sans-serif';
                ctx.fillText(`+${coinReward} 코인 획득!`, BASE_WIDTH / 2, sBoxY + 95);
            }
        }

        if (time > 2 && Math.floor(time * 2) % 2 === 0) {
            ctx.fillStyle = '#FFF';
            ctx.font = 'bold 16px sans-serif';
            ctx.fillText(this.isMobile ? '터치해서 메인으로' : '아무 키나 눌러서 메인으로', BASE_WIDTH / 2, 460);
        }

        ctx.restore();
    }

    _hexR(h) { return parseInt(h.substr(1, 2), 16); }
    _hexG(h) { return parseInt(h.substr(3, 2), 16); }
    _hexB(h) { return parseInt(h.substr(5, 2), 16); }

    // --- 헬퍼 ---

    _drawOverlay(ctx, alpha) {
        ctx.fillStyle = `rgba(0,0,0,${alpha})`;
        ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);
    }

    _drawHeart(ctx, x, y, size, color) {
        ctx.save();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x, y + size * 0.3);
        ctx.bezierCurveTo(x, y, x - size * 0.5, y, x - size * 0.5, y + size * 0.3);
        ctx.bezierCurveTo(x - size * 0.5, y + size * 0.6, x, y + size * 0.8, x, y + size);
        ctx.bezierCurveTo(x, y + size * 0.8, x + size * 0.5, y + size * 0.6, x + size * 0.5, y + size * 0.3);
        ctx.bezierCurveTo(x + size * 0.5, y, x, y, x, y + size * 0.3);
        ctx.fill();
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
}
