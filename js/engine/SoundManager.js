export class SoundManager {
    constructor() {
        this.ctx = null;
        this.initialized = false;
        // BGM
        this._bgmInterval = null;
        this._currentBgm = null;
        this._bgmVolume = 0.12;
    }

    init() {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
        } catch (e) {}
    }

    // ========== 기본 사운드 엔진 ==========

    _play(freq, type, duration, volume = 0.3) {
        if (!this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            gain.gain.setValueAtTime(volume, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {}
    }

    _playNote(freq, type, startTime, duration, volume = 0.3) {
        if (!this.ctx) return null;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, startTime);
            gain.gain.setValueAtTime(volume, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(startTime);
            osc.stop(startTime + duration);
            return osc;
        } catch (e) { return null; }
    }

    _playNoise(duration, volume = 0.1) {
        if (!this.ctx) return;
        try {
            const bufferSize = this.ctx.sampleRate * duration;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            const source = this.ctx.createBufferSource();
            source.buffer = buffer;
            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(volume, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 3000;
            source.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);
            source.start();
        } catch (e) {}
    }

    _playFilteredNoise(duration, volume, filterFreq, filterType = 'bandpass') {
        if (!this.ctx) return;
        try {
            const bufferSize = this.ctx.sampleRate * duration;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            const source = this.ctx.createBufferSource();
            source.buffer = buffer;
            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(volume, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
            const filter = this.ctx.createBiquadFilter();
            filter.type = filterType;
            filter.frequency.value = filterFreq;
            source.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);
            source.start();
        } catch (e) {}
    }

    // ========== BGM 시스템 ==========

    stopBgm() {
        if (this._bgmInterval) {
            clearInterval(this._bgmInterval);
            this._bgmInterval = null;
        }
        this._currentBgm = null;
    }

    playBgm(name) {
        if (this._currentBgm === name) return;
        this.stopBgm();
        this._currentBgm = name;

        switch (name) {
            case 'menu': this._bgmMenu(); break;
            case 'village': this._bgmVillage(); break;
            case 'forest': this._bgmForest(); break;
            case 'hill': this._bgmHill(); break;
            case 'river': this._bgmRiver(); break;
            case 'boss': this._bgmBoss(); break;
            case 'boss_hard': this._bgmBossHard(); break;
            case 'hard_village': this._bgmHardVillage(); break;
            case 'hard_forest': this._bgmHardForest(); break;
            case 'hard_hill': this._bgmHardHill(); break;
            case 'hard_river': this._bgmHardRiver(); break;
            case 'shop': this._bgmShop(); break;
            case 'win': this._bgmWin(); break;
        }
    }

    _loopBgm(callback, intervalMs) {
        callback();
        this._bgmInterval = setInterval(() => {
            if (this._currentBgm) callback();
        }, intervalMs);
    }

    // --- 메뉴 BGM: 평화로운 멜로디 ---
    _bgmMenu() {
        const v = this._bgmVolume;
        const notes = [523, 587, 659, 784, 659, 587, 523, 440];
        this._loopBgm(() => {
            const t = this.ctx.currentTime;
            notes.forEach((n, i) => {
                this._playNote(n, 'sine', t + i * 0.5, 0.45, v * 0.8);
                if (i % 2 === 0) this._playNote(n / 2, 'triangle', t + i * 0.5, 0.45, v * 0.4);
            });
        }, 4000);
    }

    // --- 상점 BGM: 가벼운 재즈풍 ---
    _bgmShop() {
        const v = this._bgmVolume;
        const notes = [392, 440, 523, 587, 523, 440, 494, 392];
        this._loopBgm(() => {
            const t = this.ctx.currentTime;
            notes.forEach((n, i) => {
                this._playNote(n, 'triangle', t + i * 0.4, 0.35, v * 0.7);
                if (i % 2 === 0) this._playNote(n * 1.5, 'sine', t + i * 0.4 + 0.1, 0.2, v * 0.3);
            });
            [196, 220, 262, 196].forEach((n, i) => {
                this._playNote(n, 'sine', t + i * 0.8, 0.7, v * 0.5);
            });
        }, 3200);
    }

    // --- 마을 입구: 밝고 희망적 ---
    _bgmVillage() {
        const v = this._bgmVolume;
        const melody = [523, 587, 659, 784, 880, 784, 659, 587];
        const bass = [262, 330, 392, 262];
        this._loopBgm(() => {
            const t = this.ctx.currentTime;
            melody.forEach((n, i) => {
                this._playNote(n, 'sine', t + i * 0.4, 0.35, v);
            });
            bass.forEach((n, i) => {
                this._playNote(n, 'triangle', t + i * 0.8, 0.75, v * 0.5);
            });
            for (let i = 0; i < 4; i++) {
                setTimeout(() => this._playFilteredNoise(0.05, v * 0.3, 8000, 'highpass'), i * 800);
            }
        }, 3200);
    }

    // --- 숲 속 마을: 신비롭고 약간 긴장감 ---
    _bgmForest() {
        const v = this._bgmVolume;
        const melody = [440, 494, 523, 440, 392, 440, 523, 494];
        const bass = [220, 262, 196, 220];
        this._loopBgm(() => {
            const t = this.ctx.currentTime;
            melody.forEach((n, i) => {
                this._playNote(n, 'triangle', t + i * 0.45, 0.4, v * 0.9);
                this._playNote(n, 'sine', t + i * 0.45 + 0.15, 0.3, v * 0.3);
            });
            bass.forEach((n, i) => {
                this._playNote(n, 'sine', t + i * 0.9, 0.85, v * 0.5);
            });
        }, 3600);
    }

    // --- 언덕 위 마을: 결의에 찬 행진곡 ---
    _bgmHill() {
        const v = this._bgmVolume;
        const melody = [392, 440, 523, 523, 587, 523, 494, 440];
        const bass = [196, 262, 196, 220];
        this._loopBgm(() => {
            const t = this.ctx.currentTime;
            melody.forEach((n, i) => {
                this._playNote(n, 'square', t + i * 0.35, 0.3, v * 0.5);
                this._playNote(n, 'sine', t + i * 0.35, 0.3, v * 0.6);
            });
            bass.forEach((n, i) => {
                this._playNote(n, 'triangle', t + i * 0.7, 0.65, v * 0.6);
            });
            for (let i = 0; i < 8; i++) {
                setTimeout(() => {
                    this._playFilteredNoise(0.06, v * 0.4, i % 2 === 0 ? 200 : 6000, i % 2 === 0 ? 'lowpass' : 'highpass');
                }, i * 350);
            }
        }, 2800);
    }

    // --- 강가 마을: 물 흐르는 느낌, 긴박한 템포 ---
    _bgmRiver() {
        const v = this._bgmVolume;
        const melody = [659, 784, 880, 784, 659, 587, 523, 587];
        const bass = [330, 392, 262, 330];
        this._loopBgm(() => {
            const t = this.ctx.currentTime;
            melody.forEach((n, i) => {
                this._playNote(n, 'sine', t + i * 0.35, 0.3, v);
                this._playNote(n * 2, 'sine', t + i * 0.35 + 0.05, 0.1, v * 0.2);
            });
            bass.forEach((n, i) => {
                this._playNote(n, 'triangle', t + i * 0.7, 0.65, v * 0.5);
            });
            for (let i = 0; i < 8; i++) {
                setTimeout(() => this._playFilteredNoise(0.03, v * 0.2, 10000, 'highpass'), i * 350);
            }
        }, 2800);
    }

    // --- 보스전: 긴박하고 공포스러운 ---
    _bgmBoss() {
        const v = this._bgmVolume;
        // 단조 + 반음 진행으로 불안감 조성
        const melody = [330, 311, 294, 330, 349, 330, 294, 277];
        // 옥타브 낮은 묵직한 베이스 (반음씩 내려가는 위협적 패턴)
        const bass = [110, 104, 98, 93];
        // 불안한 고음 트레몰로
        const tension = [659, 622, 659, 698, 659, 622, 587, 622];
        this._loopBgm(() => {
            const t = this.ctx.currentTime;
            // 메인 멜로디 — sawtooth로 날카롭게
            melody.forEach((n, i) => {
                this._playNote(n, 'sawtooth', t + i * 0.25, 0.22, v * 0.45);
                // 5도 아래 더블링으로 두꺼운 사운드
                this._playNote(n * 0.75, 'square', t + i * 0.25 + 0.02, 0.18, v * 0.2);
            });
            // 묵직한 베이스 — 길게 울리며 압박감
            bass.forEach((n, i) => {
                this._playNote(n, 'sawtooth', t + i * 0.5, 0.48, v * 0.7);
                this._playNote(n / 2, 'sine', t + i * 0.5, 0.48, v * 0.5);
            });
            // 고음 트레몰로 — 짧고 빠르게 깔림
            tension.forEach((n, i) => {
                this._playNote(n, 'sine', t + i * 0.25, 0.1, v * 0.15);
            });
            // 심장박동 드럼 — 쿵쿵 패턴
            for (let i = 0; i < 4; i++) {
                setTimeout(() => {
                    this._play(55, 'sine', 0.15, v * 0.7);  // 킥
                    this._playFilteredNoise(0.04, v * 0.3, 300, 'lowpass');
                }, i * 500);
                setTimeout(() => {
                    this._play(45, 'sine', 0.1, v * 0.4);   // 2번째 킥 (심장 두근)
                }, i * 500 + 150);
                // 하이햇
                setTimeout(() => {
                    this._playFilteredNoise(0.03, v * 0.25, 9000, 'highpass');
                }, i * 500 + 250);
            }
            // 긴장 고조 — 마지막에 상승하는 노이즈
            setTimeout(() => {
                this._playFilteredNoise(0.2, v * 0.15, 4000, 'bandpass');
            }, 1600);
        }, 2000);
    }

    // --- 보스전 (어려움): 광기와 절박함 ---
    _bgmBossHard() {
        const v = this._bgmVolume;
        // 반음계 하강 — 더 어둡고 미친 느낌
        const melody = [440, 415, 392, 370, 349, 370, 415, 440, 466, 440, 415, 392];
        // 초저음 베이스 — 공포감
        const bass = [82, 78, 73, 69, 82, 87];
        // 날카로운 경고음
        const alarm = [880, 831, 880, 932, 880, 831];
        this._loopBgm(() => {
            const t = this.ctx.currentTime;
            // 빠른 멜로디 — 질주감
            melody.forEach((n, i) => {
                this._playNote(n, 'sawtooth', t + i * 0.167, 0.15, v * 0.45);
                this._playNote(n * 1.5, 'square', t + i * 0.167 + 0.03, 0.08, v * 0.15);
            });
            // 초저음 베이스
            bass.forEach((n, i) => {
                this._playNote(n, 'sawtooth', t + i * 0.333, 0.3, v * 0.75);
                this._playNote(n / 2, 'sine', t + i * 0.333, 0.3, v * 0.5);
            });
            // 경고 사이렌 — 높은 음에서 삐삐
            alarm.forEach((n, i) => {
                this._playNote(n, 'square', t + i * 0.333, 0.08, v * 0.12);
            });
            // 맹렬한 드럼 — 더블 타임
            for (let i = 0; i < 8; i++) {
                setTimeout(() => {
                    this._play(50, 'sine', 0.1, v * 0.65);
                    this._playFilteredNoise(0.03, v * 0.3, 250, 'lowpass');
                }, i * 250);
                // 엇박 스네어
                setTimeout(() => {
                    this._playFilteredNoise(0.04, v * 0.35, 5000, 'bandpass');
                }, i * 250 + 125);
                // 빠른 하이햇
                setTimeout(() => {
                    this._playFilteredNoise(0.02, v * 0.2, 10000, 'highpass');
                }, i * 250 + 60);
            }
            // 공포 상승 톤
            setTimeout(() => {
                this._playFilteredNoise(0.3, v * 0.2, 3000, 'bandpass');
                this._play(40, 'sine', 0.25, v * 0.4);
            }, 1500);
        }, 2000);
    }

    // --- 어려움 마을 입구: 긴장감 추가 ---
    _bgmHardVillage() {
        const v = this._bgmVolume;
        const melody = [523, 587, 659, 784, 880, 784, 659, 587];
        const bass = [262, 330, 294, 262];
        this._loopBgm(() => {
            const t = this.ctx.currentTime;
            melody.forEach((n, i) => {
                this._playNote(n, 'square', t + i * 0.3, 0.25, v * 0.4);
                this._playNote(n, 'sine', t + i * 0.3, 0.25, v * 0.7);
            });
            bass.forEach((n, i) => {
                this._playNote(n, 'sawtooth', t + i * 0.6, 0.55, v * 0.4);
            });
            for (let i = 0; i < 8; i++) {
                setTimeout(() => {
                    this._play(80, 'sine', 0.06, v * 0.35);
                    if (i % 2 === 1) this._playFilteredNoise(0.03, v * 0.25, 7000, 'highpass');
                }, i * 300);
            }
        }, 2400);
    }

    // --- 어려움 숲 속: 어둡고 위협적 ---
    _bgmHardForest() {
        const v = this._bgmVolume;
        const melody = [392, 415, 440, 392, 349, 392, 440, 415];
        const bass = [196, 208, 175, 196];
        this._loopBgm(() => {
            const t = this.ctx.currentTime;
            melody.forEach((n, i) => {
                this._playNote(n, 'sawtooth', t + i * 0.35, 0.3, v * 0.35);
                this._playNote(n, 'triangle', t + i * 0.35 + 0.1, 0.25, v * 0.4);
            });
            bass.forEach((n, i) => {
                this._playNote(n, 'sine', t + i * 0.7, 0.65, v * 0.6);
            });
            for (let i = 0; i < 4; i++) {
                setTimeout(() => this._play(55, 'sine', 0.12, v * 0.4), i * 700);
            }
        }, 2800);
    }

    // --- 어려움 언덕: 무거운 행진 ---
    _bgmHardHill() {
        const v = this._bgmVolume;
        const melody = [349, 392, 440, 523, 440, 392, 349, 330];
        const bass = [175, 196, 147, 165];
        this._loopBgm(() => {
            const t = this.ctx.currentTime;
            melody.forEach((n, i) => {
                this._playNote(n, 'square', t + i * 0.3, 0.25, v * 0.45);
                this._playNote(n, 'sawtooth', t + i * 0.3, 0.25, v * 0.3);
            });
            bass.forEach((n, i) => {
                this._playNote(n, 'sawtooth', t + i * 0.6, 0.55, v * 0.55);
            });
            for (let i = 0; i < 8; i++) {
                setTimeout(() => {
                    this._play(55, 'sine', 0.08, v * 0.5);
                    this._playFilteredNoise(0.04, v * 0.3, 6000, 'highpass');
                }, i * 300);
            }
        }, 2400);
    }

    // --- 어려움 강가: 격렬한 물결 ---
    _bgmHardRiver() {
        const v = this._bgmVolume;
        const melody = [587, 659, 784, 880, 784, 659, 587, 523];
        const bass = [294, 330, 262, 294];
        this._loopBgm(() => {
            const t = this.ctx.currentTime;
            melody.forEach((n, i) => {
                this._playNote(n, 'sawtooth', t + i * 0.25, 0.2, v * 0.4);
                this._playNote(n * 2, 'sine', t + i * 0.25 + 0.03, 0.08, v * 0.15);
            });
            bass.forEach((n, i) => {
                this._playNote(n, 'triangle', t + i * 0.5, 0.45, v * 0.55);
            });
            for (let i = 0; i < 8; i++) {
                setTimeout(() => {
                    this._play(65, 'sine', 0.06, v * 0.4);
                    this._playFilteredNoise(0.03, v * 0.25, 10000, 'highpass');
                }, i * 250);
            }
        }, 2000);
    }

    // --- 승리 BGM: 축제 분위기 ---
    _bgmWin() {
        const v = this._bgmVolume;
        const melody = [523, 659, 784, 1047, 784, 659, 784, 1047];
        this._loopBgm(() => {
            const t = this.ctx.currentTime;
            melody.forEach((n, i) => {
                this._playNote(n, 'sine', t + i * 0.4, 0.35, v);
                this._playNote(n / 2, 'triangle', t + i * 0.4, 0.35, v * 0.4);
            });
            [784, 880, 1047, 1175].forEach((n, i) => {
                this._playNote(n, 'sine', t + i * 0.8 + 0.2, 0.15, v * 0.3);
            });
        }, 3200);
    }

    // ========== 효과음 ==========

    playShoot() {
        this._play(800, 'sine', 0.08, 0.12);
        setTimeout(() => this._play(500, 'sine', 0.04, 0.08), 20);
    }

    playCannonShoot() {
        this._play(400, 'sine', 0.12, 0.2);
        this._play(200, 'triangle', 0.15, 0.12);
        this._playFilteredNoise(0.08, 0.06, 2000, 'lowpass');
    }

    playPowerShot() {
        this._play(600, 'sawtooth', 0.08, 0.12);
        this._play(900, 'sine', 0.06, 0.1);
        setTimeout(() => this._play(400, 'sine', 0.04, 0.08), 30);
    }

    playHit() {
        this._playNoise(0.1, 0.12);
        this._play(300, 'square', 0.05, 0.08);
    }

    playMonsterDefeat() {
        this._play(600, 'square', 0.08, 0.12);
        setTimeout(() => this._play(400, 'square', 0.1, 0.08), 60);
        setTimeout(() => this._play(200, 'sine', 0.15, 0.06), 120);
    }

    playDamage() {
        this._play(150, 'sine', 0.12, 0.18);
        this._play(100, 'square', 0.08, 0.1);
        this._playFilteredNoise(0.1, 0.08, 1000, 'lowpass');
    }

    playJump() {
        if (!this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(300, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.15);
        } catch (e) {}
    }

    playLand() {
        this._playFilteredNoise(0.06, 0.06, 400, 'lowpass');
    }

    playCastleHit() {
        this._play(120, 'sine', 0.15, 0.15);
        this._playFilteredNoise(0.1, 0.1, 600, 'lowpass');
    }

    playCastleDestroy() {
        this._play(80, 'sine', 0.4, 0.2);
        setTimeout(() => this._play(60, 'sine', 0.3, 0.15), 150);
        this._playFilteredNoise(0.3, 0.15, 500, 'lowpass');
        setTimeout(() => this._playFilteredNoise(0.2, 0.1, 800, 'lowpass'), 200);
    }

    playHouseHit() {
        this._play(200, 'triangle', 0.12, 0.12);
        this._play(120, 'sine', 0.1, 0.08);
    }

    playLevelUp() {
        this._play(523, 'sine', 0.15, 0.18);
        setTimeout(() => this._play(659, 'sine', 0.15, 0.18), 150);
        setTimeout(() => this._play(784, 'sine', 0.3, 0.22), 300);
    }

    playBossAppear() {
        this._play(80, 'sine', 1.0, 0.25);
        this._play(160, 'sine', 1.0, 0.12);
        this._play(100, 'sawtooth', 0.8, 0.08);
        setTimeout(() => this._play(60, 'sine', 0.5, 0.2), 500);
    }

    playStageClear() {
        const notes = [523, 587, 659, 784, 1047];
        notes.forEach((n, i) => {
            setTimeout(() => {
                this._play(n, 'sine', 0.2, 0.18);
                this._play(n / 2, 'triangle', 0.2, 0.08);
            }, i * 130);
        });
    }

    playGameOver() {
        const notes = [392, 349, 330, 294];
        notes.forEach((n, i) => {
            setTimeout(() => this._play(n, 'sine', 0.35, 0.18), i * 200);
        });
        setTimeout(() => this._play(147, 'triangle', 0.6, 0.12), 800);
    }

    playFreeze() {
        this._play(1200, 'sine', 0.25, 0.15);
        setTimeout(() => this._play(900, 'sine', 0.2, 0.12), 80);
        setTimeout(() => this._play(600, 'sine', 0.35, 0.1), 160);
        setTimeout(() => this._playFilteredNoise(0.15, 0.08, 8000, 'highpass'), 100);
    }

    playPowerUp() {
        this._play(440, 'sine', 0.1, 0.15);
        setTimeout(() => this._play(660, 'sine', 0.1, 0.15), 80);
        setTimeout(() => this._play(880, 'sine', 0.15, 0.2), 160);
        setTimeout(() => this._play(1100, 'sine', 0.2, 0.15), 240);
    }

    playBuy() {
        this._play(523, 'sine', 0.08, 0.15);
        setTimeout(() => this._play(784, 'sine', 0.15, 0.18), 100);
    }

    playMenuSelect() {
        this._play(600, 'sine', 0.06, 0.1);
    }

    playMenuConfirm() {
        this._play(523, 'sine', 0.08, 0.12);
        setTimeout(() => this._play(784, 'sine', 0.12, 0.12), 80);
    }

    playWaveIncoming() {
        this._play(440, 'triangle', 0.15, 0.1);
        setTimeout(() => this._play(523, 'triangle', 0.15, 0.1), 150);
        setTimeout(() => this._play(440, 'triangle', 0.15, 0.08), 300);
    }

    playBossFireball() {
        this._play(200, 'sawtooth', 0.15, 0.1);
        this._playFilteredNoise(0.1, 0.06, 2000, 'lowpass');
    }
}
