export class TitleScene extends Phaser.Scene {
    constructor() {
        super('TitleScene');
    }

    create() {
        const { width, height } = this.cameras.main;

        // Ocean gradient background
        if (!this.textures.exists('title-bg')) {
            const tex = this.textures.createCanvas('title-bg', 1, height);
            const ctx = tex.getContext();
            const grd = ctx.createLinearGradient(0, 0, 0, height);
            grd.addColorStop(0, '#8ad4e8');
            grd.addColorStop(0.5, '#3a98b9');
            grd.addColorStop(1, '#1b5e7a');
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, 1, height);
            tex.refresh();
        }
        this.add.image(width / 2, height / 2, 'title-bg').setDisplaySize(width, height);

        // Decorative background fish
        const fishKeys = ['fish_orange', 'fish_blue', 'fish_pink', 'fish_green', 'clown_fish', 'blue_tang'];
        for (let i = 0; i < 8; i++) {
            const key = Phaser.Utils.Array.GetRandom(fishKeys);
            const fx = Phaser.Math.Between(50, width - 50);
            const fy = Phaser.Math.Between(80, height - 100);
            const fish = this.add.image(fx, fy, key);
            fish.setAlpha(0.3);
            fish.setScale(Phaser.Math.FloatBetween(0.3, 0.6));
            fish.setFlipX(Phaser.Math.Between(0, 1) === 0);

            this.tweens.add({
                targets: fish,
                x: fish.x + Phaser.Math.Between(-80, 80),
                y: fish.y + Phaser.Math.Between(-30, 30),
                duration: Phaser.Math.Between(3000, 6000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }

        // Title text
        this.add.text(width / 2, height * 0.22, 'Turtle Time', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '72px',
            fontStyle: 'bold',
            color: '#ffe566',
            stroke: '#a07800',
            strokeThickness: 8
        }).setOrigin(0.5);

        // Turtle mascot
        const turtleImg = this.add.image(width / 2, height * 0.5, 'turtle');
        turtleImg.setScale(1.8);

        // Gentle bobbing
        this.tweens.add({
            targets: turtleImg,
            y: turtleImg.y - 12,
            angle: { from: -4, to: 4 },
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // "Tap to Play" prompt
        const prompt = this.add.text(width / 2, height * 0.78, 'Tap or Press Any Key to Play', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '28px',
            color: '#ffffff',
            stroke: '#1a5570',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Pulsing prompt
        this.tweens.add({
            targets: prompt,
            alpha: 0.3,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Start on any input
        this.input.once('pointerdown', () => this.startGame());
        this.input.keyboard.once('keydown', () => this.startGame());
    }

    startGame() {
        this.scene.start('GameScene', { level: 1 });
    }
}
