export class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    init(data) {
        this.finalScore = data.score || 0;
        this.bestStreak = data.bestStreak || 0;
        this.level = data.level || 1;
    }

    create() {
        const { width, height } = this.cameras.main;

        // Dark ocean gradient
        if (!this.textures.exists('gameover-bg')) {
            const tex = this.textures.createCanvas('gameover-bg', 1, height);
            const ctx = tex.getContext();
            const grd = ctx.createLinearGradient(0, 0, 0, height);
            grd.addColorStop(0, '#3a6a80');
            grd.addColorStop(1, '#0e2e3e');
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, 1, height);
            tex.refresh();
        }
        this.add.image(width / 2, height / 2, 'gameover-bg').setDisplaySize(width, height);

        // Sad turtle
        const turtleImg = this.add.image(width / 2, height * 0.28, 'turtle');
        turtleImg.setScale(1.4);
        turtleImg.setAngle(-15);
        this.tweens.add({
            targets: turtleImg,
            y: turtleImg.y + 6,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // "Oh no!" text
        this.add.text(width / 2, height * 0.48, 'Oh no!', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '60px',
            fontStyle: 'bold',
            color: '#ffe066',
            stroke: '#a87800',
            strokeThickness: 6
        }).setOrigin(0.5);

        // Score
        this.add.text(width / 2, height * 0.57, `Starfish: ${this.finalScore}`, {
            fontFamily: 'Arial, sans-serif',
            fontSize: '30px',
            color: '#ffffff',
            stroke: '#333333',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Best streak
        this.add.text(width / 2, height * 0.64, `Best Streak: ${this.bestStreak}`, {
            fontFamily: 'Arial, sans-serif',
            fontSize: '24px',
            color: '#aaddff',
            stroke: '#333333',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Try Again button
        const btnW = 260;
        const btnH = 64;
        const btnX = width / 2 - btnW / 2;
        const btnY = height * 0.72;

        const btnBg = this.add.graphics();
        const drawBtn = (fill) => {
            btnBg.clear();
            btnBg.fillStyle(fill, 1);
            btnBg.fillRoundedRect(btnX, btnY, btnW, btnH, 16);
            btnBg.lineStyle(4, 0x228833, 1);
            btnBg.strokeRoundedRect(btnX, btnY, btnW, btnH, 16);
        };
        drawBtn(0x44bb55);

        this.add.text(width / 2, btnY + btnH / 2, 'Try Again?', {
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
        btnZone.on('pointerdown', () => this.scene.start('GameScene', { level: this.level }));

        // Bump sound
        this.playBumpSound();
    }

    playBumpSound() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(300, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.4);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
            osc.start();
            osc.stop(ctx.currentTime + 0.4);
        } catch (e) { /* audio not available */ }
    }
}
