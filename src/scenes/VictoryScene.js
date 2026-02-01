export class VictoryScene extends Phaser.Scene {
    constructor() {
        super('VictoryScene');
    }

    init(data) {
        this.finalScore = data.score || 0;
        this.bestStreak = data.bestStreak || 0;
        this.completedLevel = data.level || 1;
    }

    create() {
        const { width, height } = this.cameras.main;

        // Bright celebratory gradient
        if (!this.textures.exists('victory-bg')) {
            const tex = this.textures.createCanvas('victory-bg', 1, height);
            const ctx = tex.getContext();
            const grd = ctx.createLinearGradient(0, 0, 0, height);
            grd.addColorStop(0, '#5ec8e5');
            grd.addColorStop(0.5, '#48b0d4');
            grd.addColorStop(1, '#2a8ab0');
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, 1, height);
            tex.refresh();
        }
        this.add.image(width / 2, height / 2, 'victory-bg').setDisplaySize(width, height);

        // Celebratory fish swimming everywhere
        const fishKeys = [
            'fish_orange', 'fish_blue', 'fish_pink', 'fish_green',
            'clown_fish', 'blue_tang', 'seahorse', 'dolphin', 'blowfish'
        ];
        for (let i = 0; i < 14; i++) {
            const key = Phaser.Utils.Array.GetRandom(fishKeys);
            const startX = Phaser.Math.Between(-100, width + 100);
            const fy = Phaser.Math.Between(60, height - 80);
            const fish = this.add.image(startX, fy, key);
            fish.setScale(Phaser.Math.FloatBetween(0.3, 0.7));
            fish.setAlpha(0.6);

            const goingRight = Phaser.Math.Between(0, 1) === 0;
            fish.setFlipX(!goingRight);

            this.tweens.add({
                targets: fish,
                x: goingRight ? width + 150 : -150,
                y: fy + Phaser.Math.Between(-40, 40),
                duration: Phaser.Math.Between(5000, 10000),
                repeat: -1,
                onRepeat: () => {
                    fish.x = goingRight ? -150 : width + 150;
                    fish.y = Phaser.Math.Between(60, height - 80);
                }
            });
        }

        // Level subtitle
        this.add.text(width / 2, height * 0.12, `Level ${this.completedLevel} Complete!`, {
            fontFamily: 'Arial, sans-serif',
            fontSize: '28px',
            color: '#ffffff',
            stroke: '#2a6680',
            strokeThickness: 4
        }).setOrigin(0.5);

        // "You did it!" text
        const title = this.add.text(width / 2, height * 0.23, 'You Did It!', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '72px',
            fontStyle: 'bold',
            color: '#ffe566',
            stroke: '#a07800',
            strokeThickness: 8
        }).setOrigin(0.5);

        // Bounce the title
        this.tweens.add({
            targets: title,
            scaleX: 1.08,
            scaleY: 1.08,
            duration: 600,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Turtle mascot
        const turtleImg = this.add.image(width / 2, height * 0.44, 'turtle');
        turtleImg.setScale(1.6);
        this.tweens.add({
            targets: turtleImg,
            angle: { from: -6, to: 6 },
            y: turtleImg.y - 10,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Score
        this.add.text(width / 2, height * 0.59, `Starfish Collected: ${this.finalScore}`, {
            fontFamily: 'Arial, sans-serif',
            fontSize: '30px',
            color: '#ffffff',
            stroke: '#2a6680',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Best streak
        this.add.text(width / 2, height * 0.66, `Best Streak: ${this.bestStreak}`, {
            fontFamily: 'Arial, sans-serif',
            fontSize: '24px',
            color: '#ffe566',
            stroke: '#886600',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Play Again button
        const btnW = 260;
        const btnH = 64;
        const btnX = width / 2 - btnW / 2;
        const btnY = height * 0.73;

        const btnBg = this.add.graphics();
        const drawBtn = (fill) => {
            btnBg.clear();
            btnBg.fillStyle(fill, 1);
            btnBg.fillRoundedRect(btnX, btnY, btnW, btnH, 16);
            btnBg.lineStyle(4, 0x1a7a44, 1);
            btnBg.strokeRoundedRect(btnX, btnY, btnW, btnH, 16);
        };
        drawBtn(0x44bb55);

        const btnLabel = this.completedLevel === 1 ? 'Next Level' : 'Play Again';
        this.add.text(width / 2, btnY + btnH / 2, btnLabel, {
            fontFamily: 'Arial, sans-serif',
            fontSize: '34px',
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#1a6625',
            strokeThickness: 4
        }).setOrigin(0.5);

        const btnZone = this.add.zone(width / 2, btnY + btnH / 2, btnW, btnH)
            .setInteractive({ useHandCursor: true });

        btnZone.on('pointerover', () => drawBtn(0x55dd66));
        btnZone.on('pointerout', () => drawBtn(0x44bb55));
        btnZone.on('pointerdown', () => {
            if (this.completedLevel === 1) {
                this.scene.start('GameScene', { level: 2 });
            } else {
                this.scene.start('WinnerScene', { score: this.finalScore, bestStreak: this.bestStreak });
            }
        });

        // Play victory jingle
        this.playVictorySound();
    }

    playVictorySound() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const notes = [523, 659, 784, 1047];
            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.connect(gain);
                gain.connect(ctx.destination);
                const t = ctx.currentTime + i * 0.18;
                osc.frequency.setValueAtTime(freq, t);
                gain.gain.setValueAtTime(0.12, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
                osc.start(t);
                osc.stop(t + 0.35);
            });
        } catch (e) { /* audio not available */ }
    }
}
