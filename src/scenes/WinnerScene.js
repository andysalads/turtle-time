export class WinnerScene extends Phaser.Scene {
    constructor() {
        super('WinnerScene');
    }

    init(data) {
        this.finalScore = data.score || 0;
        this.bestStreak = data.bestStreak || 0;
    }

    create() {
        const { width, height } = this.cameras.main;

        // Bright celebratory gradient
        if (!this.textures.exists('winner-bg')) {
            const tex = this.textures.createCanvas('winner-bg', 1, height);
            const ctx = tex.getContext();
            const grd = ctx.createLinearGradient(0, 0, 0, height);
            grd.addColorStop(0, '#6ed8f0');
            grd.addColorStop(0.4, '#50c0e0');
            grd.addColorStop(1, '#2890b8');
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, 1, height);
            tex.refresh();
        }
        this.add.image(width / 2, height / 2, 'winner-bg').setDisplaySize(width, height);

        // Lots of celebratory fish
        const fishKeys = [
            'fish_orange', 'fish_blue', 'fish_pink', 'fish_green',
            'clown_fish', 'blue_tang', 'seahorse', 'dolphin', 'blowfish'
        ];
        for (let i = 0; i < 18; i++) {
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

        // "You Win!" title
        const title = this.add.text(width / 2, height * 0.15, 'You Win!', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '80px',
            fontStyle: 'bold',
            color: '#ffe566',
            stroke: '#a07800',
            strokeThickness: 8
        }).setOrigin(0.5);

        this.tweens.add({
            targets: title,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Happy turtle
        const turtleImg = this.add.image(width / 2, height * 0.4, 'turtle');
        turtleImg.setScale(1.8);
        this.tweens.add({
            targets: turtleImg,
            angle: { from: -8, to: 8 },
            y: turtleImg.y - 14,
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Score
        this.add.text(width / 2, height * 0.58, `Starfish Collected: ${this.finalScore}`, {
            fontFamily: 'Arial, sans-serif',
            fontSize: '30px',
            color: '#ffffff',
            stroke: '#2a6680',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Best streak
        this.add.text(width / 2, height * 0.65, `Best Streak: ${this.bestStreak}`, {
            fontFamily: 'Arial, sans-serif',
            fontSize: '24px',
            color: '#ffe566',
            stroke: '#886600',
            strokeThickness: 3
        }).setOrigin(0.5);

        // "Tap to play again" prompt
        const prompt = this.add.text(width / 2, height * 0.78, 'Tap or Press Any Key to Play Again', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '28px',
            color: '#ffffff',
            stroke: '#1a5570',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.tweens.add({
            targets: prompt,
            alpha: 0.3,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Any input restarts from level 1
        this.input.once('pointerdown', () => this.scene.start('GameScene', { level: 1 }));
        this.input.keyboard.once('keydown', () => this.scene.start('GameScene', { level: 1 }));

        // Victory fanfare
        this.playWinSound();
    }

    playWinSound() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const notes = [523, 659, 784, 1047, 1319];
            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.connect(gain);
                gain.connect(ctx.destination);
                const t = ctx.currentTime + i * 0.16;
                osc.frequency.setValueAtTime(freq, t);
                gain.gain.setValueAtTime(0.12, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
                osc.start(t);
                osc.stop(t + 0.4);
            });
        } catch (e) { /* audio not available */ }
    }
}
