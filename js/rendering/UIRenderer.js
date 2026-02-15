import { BASE_WIDTH, BASE_HEIGHT, COLORS, TOTAL_MATERIALS, MATERIAL_NAMES, DIFFICULTIES, DIFFICULTY_KEYS, FREEZE_COOLDOWN, BODY_SKINS, BULLET_SKINS } from '../data/constants.js';

export class UIRenderer {
    constructor(sprite) {
        this.sprite = sprite;
        this.isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    // === 메인 메뉴 ===
    drawMenu(ctx, time, difficultyIndex, coins) {
        // 배경
        const grad = ctx.createLinearGradient(0, 0, 0, BASE_HEIGHT);
        grad.addColorStop(0, '#0D47A1');
        grad.addColorStop(1, '#4FC3F7');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

        // 타이틀
        const bounce = Math.sin(time * 3) * 8;
        ctx.save();
        ctx.textAlign = 'center';

        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 52px sans-serif';
        ctx.fillText('Water', BASE_WIDTH / 2, 160 + bounce);

        ctx.fillStyle = COLORS.fireOrange;
        ctx.font = 'bold 32px sans-serif';
        ctx.fillText('vs', BASE_WIDTH / 2, 200 + bounce);

        ctx.fillStyle = COLORS.fireRed;
        ctx.font = 'bold 52px sans-serif';
        ctx.fillText('Fire', BASE_WIDTH / 2, 248 + bounce);

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

        // 코인 표시
        ctx.fillStyle = COLORS.gold;
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`코인: ${coins}`, BASE_WIDTH - 20, 30);

        ctx.textAlign = 'center';

        // 시작 안내
        if (Math.floor(time * 2) % 2 === 0) {
            ctx.fillStyle = '#FFF';
            ctx.font = '20px sans-serif';
            ctx.fillText(this.isMobile ? '터치해서 시작!' : '아무 키나 눌러서 시작!', BASE_WIDTH / 2, 430);
        }

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
        this._roundRect(ctx, 100, 60, 600, 320, 20);
        ctx.fill();
        ctx.strokeStyle = COLORS.waterDark;
        ctx.lineWidth = 3;
        this._roundRect(ctx, 100, 60, 600, 320, 20);
        ctx.stroke();

        ctx.fillStyle = '#333';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText('불 몬스터가 마을을 공격하고 있어!', BASE_WIDTH / 2, 110);

        ctx.font = '18px sans-serif';
        ctx.fillText('각 마을의 물방울 집을 지키면서', BASE_WIDTH / 2, 155);
        ctx.fillText('악당 성을 부수고 물대포 재료를 모아야 해!', BASE_WIDTH / 2, 185);

        ctx.fillStyle = COLORS.fireRed;
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText('재료 4개를 모으면 물대포 완성!', BASE_WIDTH / 2, 225);

        // 조작법
        ctx.fillStyle = '#333';
        ctx.font = '16px sans-serif';
        if (this.isMobile) {
            ctx.fillText('조이스틱  이동', BASE_WIDTH / 2, 270);
            ctx.fillText('JUMP 버튼  점프', BASE_WIDTH / 2, 295);
            ctx.fillText('FIRE 버튼  물총 발사', BASE_WIDTH / 2, 320);
        } else {
            ctx.fillText('⬅ ➡  이동', BASE_WIDTH / 2, 270);
            ctx.fillText('Space  점프', BASE_WIDTH / 2, 295);
            ctx.fillText('Z  물총 발사', BASE_WIDTH / 2, 320);
        }

        // 어려움 전용 조작법
        if (difficulty === 'hard') {
            ctx.fillStyle = COLORS.waterDark;
            ctx.font = 'bold 16px sans-serif';
            ctx.fillText(this.isMobile ? 'ICE 버튼  얼리기 (쿨타임 15초)' : 'X  얼리기 (쿨타임 15초)', BASE_WIDTH / 2, 350);
        }

        if (time > 0.5 && Math.floor(time * 2) % 2 === 0) {
            ctx.fillStyle = COLORS.waterDark;
            ctx.font = 'bold 20px sans-serif';
            ctx.fillText(this.isMobile ? '터치해서 출발!' : '아무 키나 눌러서 출발!', BASE_WIDTH / 2, 440);
        }

        ctx.restore();
    }

    // === HUD ===
    drawHUD(ctx, player, stage, materialsCollected, cannonComplete, stageIndex, difficulty) {
        ctx.save();

        // 플레이어 HP (하트)
        for (let i = 0; i < player.maxHp; i++) {
            const hx = 16 + i * 22;
            const hy = 16;
            if (i < player.hp) {
                this._drawHeart(ctx, hx, hy, 10, COLORS.hpRed);
            } else {
                this._drawHeart(ctx, hx, hy, 10, '#555');
            }
        }

        // 스테이지 정보
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 16px sans-serif';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 3;
        ctx.fillText(`Stage ${stageIndex + 1}`, BASE_WIDTH / 2, 24);

        const stageNames = ['마을 입구', '숲 속 마을', '언덕 위 마을', '강가 마을', '불의 성'];
        ctx.font = '12px sans-serif';
        ctx.fillText(stageNames[stageIndex] || '', BASE_WIDTH / 2, 42);
        ctx.shadowBlur = 0;

        // 웨이브 정보
        if (stage.totalWaves > 1) {
            ctx.font = '12px sans-serif';
            ctx.fillText(`Wave ${stage.currentWave + 1}/${stage.totalWaves}`, BASE_WIDTH / 2, 58);
        }

        // 난이도 표시
        const diffLabel = DIFFICULTIES[difficulty] ? DIFFICULTIES[difficulty].label : '';
        if (diffLabel) {
            ctx.textAlign = 'left';
            ctx.fillStyle = difficulty === 'hard' ? COLORS.fireRed : difficulty === 'easy' ? '#81C784' : '#FFF';
            ctx.font = 'bold 12px sans-serif';
            ctx.fillText(diffLabel, 16, 58);
        }

        // 재료 수집 현황 (오른쪽 상단)
        ctx.textAlign = 'right';
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 13px sans-serif';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 2;
        ctx.fillText('물대포 재료', BASE_WIDTH - 16, 20);
        ctx.shadowBlur = 0;

        for (let i = 0; i < TOTAL_MATERIALS; i++) {
            const mx = BASE_WIDTH - 16 - (TOTAL_MATERIALS - 1 - i) * 26;
            const my = 28;
            ctx.fillStyle = i < materialsCollected ? COLORS.gold : '#555';
            ctx.strokeStyle = i < materialsCollected ? '#FF8F00' : '#333';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(mx, my + 8, 9, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            if (i < materialsCollected) {
                ctx.fillStyle = '#FFF';
                ctx.font = 'bold 10px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('✓', mx, my + 12);
            }
        }

        // 물대포 완성 표시
        if (cannonComplete) {
            ctx.textAlign = 'right';
            ctx.fillStyle = COLORS.gold;
            ctx.font = 'bold 12px sans-serif';
            ctx.fillText('물대포 완성!', BASE_WIDTH - 16, 58);
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

    // === 스테이지 클리어 ===
    drawStageClear(ctx, stageIndex, materialsCollected, time) {
        this._drawOverlay(ctx, 0.6);

        ctx.save();
        ctx.textAlign = 'center';

        const slideIn = Math.min(1, time * 2);

        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 40px sans-serif';
        ctx.fillText('Stage Clear!', BASE_WIDTH / 2, 180 * slideIn + 50 * (1 - slideIn));

        // 재료 획득 연출
        if (time > 0.5) {
            ctx.fillStyle = COLORS.gold;
            ctx.font = 'bold 22px sans-serif';
            const matName = MATERIAL_NAMES[materialsCollected - 1] || '재료';
            ctx.fillText(`"${matName}" 획득!`, BASE_WIDTH / 2, 250);

            ctx.fillStyle = '#FFF';
            ctx.font = '16px sans-serif';
            ctx.fillText(`재료: ${materialsCollected} / ${TOTAL_MATERIALS}`, BASE_WIDTH / 2, 290);
        }

        if (time > 1 && Math.floor(time * 2) % 2 === 0) {
            ctx.fillStyle = '#FFF';
            ctx.font = '18px sans-serif';
            ctx.fillText('아무 키나 눌러서 계속', BASE_WIDTH / 2, 380);
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
        this._drawOverlay(ctx, 0.7);

        ctx.save();
        ctx.textAlign = 'center';

        ctx.fillStyle = COLORS.hpRed;
        ctx.font = 'bold 44px sans-serif';
        ctx.fillText('게임 오버', BASE_WIDTH / 2, BASE_HEIGHT / 2 - 30);

        ctx.fillStyle = '#FFF';
        ctx.font = '18px sans-serif';
        ctx.fillText('집이 불타버렸어...', BASE_WIDTH / 2, BASE_HEIGHT / 2 + 10);

        if (time > 1 && Math.floor(time * 2) % 2 === 0) {
            ctx.fillText(this.isMobile ? '터치해서 메인으로!' : '아무 키나 눌러서 메인으로!', BASE_WIDTH / 2, BASE_HEIGHT / 2 + 60);
        }

        ctx.restore();
    }

    // === 승리 ===
    drawWin(ctx, score, time, coinReward) {
        const grad = ctx.createLinearGradient(0, 0, 0, BASE_HEIGHT);
        grad.addColorStop(0, '#1565C0');
        grad.addColorStop(1, '#4FC3F7');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

        ctx.save();
        ctx.textAlign = 'center';

        // 축하 반짝이
        ctx.fillStyle = COLORS.gold;
        for (let i = 0; i < 20; i++) {
            const sx = (Math.sin(time * 2 + i * 1.3) * 0.5 + 0.5) * BASE_WIDTH;
            const sy = (Math.cos(time * 1.7 + i * 0.9) * 0.5 + 0.5) * BASE_HEIGHT;
            ctx.beginPath();
            ctx.arc(sx, sy, 2 + Math.sin(time * 5 + i) * 2, 0, Math.PI * 2);
            ctx.fill();
        }

        const bounce = Math.sin(time * 3) * 5;
        ctx.fillStyle = COLORS.gold;
        ctx.font = 'bold 52px sans-serif';
        ctx.fillText('승리!', BASE_WIDTH / 2, 180 + bounce);

        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText('불 몬스터를 물리쳤다!', BASE_WIDTH / 2, 240);

        ctx.font = '18px sans-serif';
        ctx.fillText('마을에 다시 평화가 찾아왔어!', BASE_WIDTH / 2, 280);

        // 코인 보상
        if (coinReward && time > 1) {
            ctx.fillStyle = COLORS.gold;
            ctx.font = 'bold 20px sans-serif';
            ctx.fillText(`+${coinReward} 코인 획득!`, BASE_WIDTH / 2, 330);
        }

        if (time > 2 && Math.floor(time * 2) % 2 === 0) {
            ctx.fillStyle = '#FFF';
            ctx.font = '18px sans-serif';
            ctx.fillText('아무 키나 눌러서 처음으로', BASE_WIDTH / 2, 400);
        }

        ctx.restore();
    }

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
