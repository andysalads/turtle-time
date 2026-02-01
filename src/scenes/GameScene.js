import { Turtle } from '../entities/Turtle.js';

const WORLD_WIDTH = 6000;
const WORLD_HEIGHT = 600;
const FLOOR_Y = 420;

const LEVEL_CONFIGS = {
    1: {
        bgGradient: ['#8ad4e8', '#3a98b9', '#1b5e7a'],
        decorativeFishKeys: [
            'fish_orange', 'fish_blue', 'fish_pink', 'fish_green',
            'clown_fish', 'blue_tang', 'seahorse'
        ],
        jellyfishBehavior: 'bob',
        showBubbles: false
    },
    2: {
        bgGradient: ['#4a9ab5', '#2a6e8a', '#0a3d5a'],
        decorativeFishKeys: [
            'fish_orange', 'fish_blue', 'fish_pink', 'fish_green',
            'clown_fish', 'blue_tang', 'seahorse',
            'fish_brown', 'fish_grey', 'fish_grey_long_a', 'fish_grey_long_b',
            'fish_blue_skeleton', 'fish_orange_skeleton', 'fish_pink_skeleton',
            'fish_green_skeleton', 'fish_red_skeleton'
        ],
        jellyfishBehavior: 'diagonal',
        showBubbles: true
    }
};

export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    init(data) {
        this.currentLevel = data.level || 1;
        this.levelConfig = LEVEL_CONFIGS[this.currentLevel];
    }

    create() {
        this.score = 0;
        this.streak = 0;
        this.bestStreak = 0;
        this.heartProgress = 0; // 0, 1 → 2 heart pickups = 1 full heart
        this.victoryTriggered = false;
        this.timeRemaining = 60;
        this.timeUpTriggered = false;
        this._audioCtx = null;

        // Physics world bounds
        this.physics.world.setBounds(0, 0, WORLD_WIDTH, FLOOR_Y);

        // Generate heart pickup texture
        this.createHeartTexture();

        this.createOceanGradient();
        this.createFarParallax();
        this.createMidParallax();
        this.createTerrain();
        this.createFloorDecorations();
        this.createBubbles();
        this.createAmbientLife();
        this.createDecorativeFish();
        this.createStarfish();
        this.createHeartPickups();
        this.createObstacles();
        this.createHUD();

        // --- Player ---
        this.turtle = new Turtle(this, 200, FLOOR_Y / 2);

        // Level 2: 25% speed boost
        if (this.currentLevel === 2) {
            this.turtle.sprite.setMaxVelocity(250, 333);
        }

        // --- Mobile controls ---
        this.createMobileControls();

        // --- Collisions ---
        this.physics.add.overlap(
            this.turtle.sprite, this.starfishGroup,
            this.onCollectStarfish, null, this
        );
        this.physics.add.overlap(
            this.turtle.sprite, this.heartPickupGroup,
            this.onCollectHeart, null, this
        );
        this.physics.add.overlap(
            this.turtle.sprite, this.obstacleGroup,
            this.onHitObstacle, null, this
        );

        // --- Camera ---
        this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        this.cameras.main.startFollow(this.turtle.sprite, true, 0.08, 0.08);
        this.cameras.main.setFollowOffset(-100, 0);
    }

    // ================================================================
    //  HEART PICKUP TEXTURE (generated programmatically)
    // ================================================================
    createHeartTexture() {
        if (this.textures.exists('heart_pickup')) return;

        const gfx = this.make.graphics({ x: 0, y: 0, add: false });
        // Draw a heart shape
        gfx.fillStyle(0xff4466);
        gfx.fillCircle(14, 12, 12);
        gfx.fillCircle(34, 12, 12);
        gfx.fillTriangle(2, 16, 46, 16, 24, 42);
        // Highlight
        gfx.fillStyle(0xff8899, 0.5);
        gfx.fillCircle(12, 10, 5);
        gfx.generateTexture('heart_pickup', 48, 44);
        gfx.destroy();
    }

    // ================================================================
    //  SOUND EFFECTS
    // ================================================================
    getAudioCtx() {
        if (!this._audioCtx) {
            this._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this._audioCtx.state === 'suspended') this._audioCtx.resume();
        return this._audioCtx;
    }

    playCollectSound() {
        try {
            const ctx = this.getAudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(523, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(1047, ctx.currentTime + 0.12);
            gain.gain.setValueAtTime(0.12, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
            osc.start();
            osc.stop(ctx.currentTime + 0.2);
        } catch (e) {}
    }

    playHeartSound() {
        try {
            const ctx = this.getAudioCtx();
            const notes = [523, 659, 784];
            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.connect(gain);
                gain.connect(ctx.destination);
                const t = ctx.currentTime + i * 0.1;
                osc.frequency.setValueAtTime(freq, t);
                gain.gain.setValueAtTime(0.1, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
                osc.start(t);
                osc.stop(t + 0.2);
            });
        } catch (e) {}
    }

    playHitSound() {
        try {
            const ctx = this.getAudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(220, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(60, ctx.currentTime + 0.25);
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
        } catch (e) {}
    }

    // ================================================================
    //  OCEAN GRADIENT
    // ================================================================
    createOceanGradient() {
        const bgKey = `ocean-bg-${this.currentLevel}`;
        if (!this.textures.exists(bgKey)) {
            const [c1, c2, c3] = this.levelConfig.bgGradient;
            const tex = this.textures.createCanvas(bgKey, 1, WORLD_HEIGHT);
            const ctx = tex.getContext();
            const grd = ctx.createLinearGradient(0, 0, 0, WORLD_HEIGHT);
            grd.addColorStop(0, c1);
            grd.addColorStop(0.5, c2);
            grd.addColorStop(1, c3);
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, 1, WORLD_HEIGHT);
            tex.refresh();
        }

        const bg = this.add.image(400, 300, bgKey);
        bg.setDisplaySize(800, WORLD_HEIGHT);
        bg.setScrollFactor(0);
        bg.setDepth(-100);
    }

    // ================================================================
    //  FAR PARALLAX
    // ================================================================
    createFarParallax() {
        const keys = ['bg_rock_a', 'bg_rock_b'];
        for (let x = 200; x < WORLD_WIDTH; x += Phaser.Math.Between(500, 900)) {
            const key = Phaser.Utils.Array.GetRandom(keys);
            const img = this.add.image(x, FLOOR_Y + 10, key);
            img.setOrigin(0.5, 1);
            img.setScrollFactor(0.25, 0.8);
            img.setAlpha(0.45);
            img.setDepth(-80);
            img.setScale(Phaser.Math.FloatBetween(1.0, 1.5));
        }
    }

    // ================================================================
    //  MID PARALLAX
    // ================================================================
    createMidParallax() {
        const keys = [];
        for (const l of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
            keys.push(`bg_seaweed_${l}`);
        }
        for (let x = 80; x < WORLD_WIDTH; x += Phaser.Math.Between(200, 450)) {
            const key = Phaser.Utils.Array.GetRandom(keys);
            const img = this.add.image(x, FLOOR_Y + 5, key);
            img.setOrigin(0.5, 1);
            img.setScrollFactor(0.55, 0.9);
            img.setAlpha(0.45);
            img.setDepth(-60);
            img.setScale(Phaser.Math.FloatBetween(0.9, 1.3));
        }
    }

    // ================================================================
    //  TERRAIN
    // ================================================================
    createTerrain() {
        const topSrc = this.textures.get('terrain_sand_top_a').getSourceImage();
        const tileW = topSrc.width;
        const tileH = topSrc.height;
        const fillSrc = this.textures.get('terrain_sand_a').getSourceImage();
        const fillW = fillSrc.width;
        const fillH = fillSrc.height;

        const topKeys = [];
        for (const l of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
            topKeys.push(`terrain_sand_top_${l}`);
        }
        const fillKeys = ['terrain_sand_a', 'terrain_sand_b', 'terrain_sand_c', 'terrain_sand_d'];

        for (let x = 0; x < WORLD_WIDTH; x += tileW) {
            const key = Phaser.Utils.Array.GetRandom(topKeys);
            this.add.image(x, FLOOR_Y, key).setOrigin(0, 0).setDepth(-10);
        }
        for (let y = FLOOR_Y + tileH; y < WORLD_HEIGHT + fillH; y += fillH) {
            for (let x = 0; x < WORLD_WIDTH; x += fillW) {
                const key = Phaser.Utils.Array.GetRandom(fillKeys);
                this.add.image(x, y, key).setOrigin(0, 0).setDepth(-10);
            }
        }
    }

    // ================================================================
    //  FLOOR DECORATIONS (zone-based variety)
    // ================================================================
    createFloorDecorations() {
        const zone1Keys = [];
        for (const l of ['a', 'b', 'c', 'd']) {
            zone1Keys.push(`seaweed_green_${l}`);
            zone1Keys.push(`seaweed_pink_${l}`);
        }
        const zone2Keys = [...zone1Keys, 'seaweed_orange_a', 'seaweed_orange_b', 'coral'];
        const zone3Keys = [...zone2Keys, 'seaweed_grass_a', 'seaweed_grass_b', 'seashell', 'shell'];

        const getKeysForX = (x) => {
            if (x < 2000) return zone1Keys;
            if (x < 4000) return zone2Keys;
            return zone3Keys;
        };

        for (let x = 60; x < WORLD_WIDTH; x += Phaser.Math.Between(100, 280)) {
            const keys = getKeysForX(x);
            const key = Phaser.Utils.Array.GetRandom(keys);
            const sw = this.add.image(x, FLOOR_Y + 8, key);
            sw.setOrigin(0.5, 1);
            sw.setDepth(-5);
            sw.setScale(Phaser.Math.FloatBetween(0.8, 1.2));

            this.tweens.add({
                targets: sw,
                angle: { from: -3, to: 3 },
                duration: Phaser.Math.Between(2000, 4000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
                delay: Phaser.Math.Between(0, 2000)
            });
        }

        for (let x = 300; x < WORLD_WIDTH; x += Phaser.Math.Between(400, 800)) {
            const key = Phaser.Math.Between(0, 1) === 0 ? 'rock_a' : 'rock_b';
            this.add.image(x, FLOOR_Y + 8, key).setOrigin(0.5, 1).setDepth(-5)
                .setScale(Phaser.Math.FloatBetween(0.9, 1.1));
        }
    }

    // ================================================================
    //  BUBBLES (Level 2)
    // ================================================================
    createBubbles() {
        if (!this.levelConfig.showBubbles) return;

        const bubbleKeys = ['bubble_a', 'bubble_b', 'bubble_c'];
        for (let x = 100; x < WORLD_WIDTH; x += Phaser.Math.Between(300, 600)) {
            const key = Phaser.Utils.Array.GetRandom(bubbleKeys);
            const bubble = this.add.image(x, FLOOR_Y - 20, key);
            bubble.setDepth(-15);
            bubble.setScale(Phaser.Math.FloatBetween(0.3, 0.6));
            bubble.setAlpha(0.6);

            this.tweens.add({
                targets: bubble,
                y: bubble.y - Phaser.Math.Between(180, 280),
                alpha: 0,
                duration: Phaser.Math.Between(3000, 5000),
                repeat: -1,
                delay: Phaser.Math.Between(0, 2000),
                onRepeat: () => {
                    bubble.y = FLOOR_Y - 20;
                    bubble.setAlpha(0.6);
                }
            });
        }
    }

    // ================================================================
    //  AMBIENT SEA LIFE
    // ================================================================
    createAmbientLife() {
        // Whale
        const whale = this.add.image(3500, 150, 'whale');
        whale.setDepth(-70).setAlpha(0.35).setScale(1.5);
        this.tweens.add({ targets: whale, x: whale.x - 800, duration: 40000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.tweens.add({ targets: whale, y: whale.y + 20, duration: 6000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

        // Dolphins
        for (const dx of [1500, 3800]) {
            const d = this.add.image(dx, 200, 'dolphin');
            d.setDepth(-25).setAlpha(0.6).setScale(0.7);
            this.tweens.add({ targets: d, x: d.x + 250, duration: 4000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', onYoyo: () => d.setFlipX(true), onRepeat: () => d.setFlipX(false) });
            this.tweens.add({ targets: d, y: d.y - 80, duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.easeOut' });
        }

        // Octopus
        for (const ox of [1000, 3200, 5000]) {
            const oct = this.add.image(ox, FLOOR_Y - 10, 'octopus');
            oct.setDepth(-4).setOrigin(0.5, 1).setScale(0.7).setAlpha(0.75);
            this.tweens.add({ targets: oct, y: oct.y - 8, scaleX: 0.73, duration: 2500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        }

        // Crabs
        for (const cx of [600, 2200, 3600, 4800]) {
            const crab = this.add.image(cx, FLOOR_Y + 2, 'crab');
            crab.setDepth(-4).setOrigin(0.5, 1).setScale(0.6);
            this.tweens.add({ targets: crab, x: crab.x + Phaser.Math.Between(40, 80), duration: Phaser.Math.Between(2000, 3500), yoyo: true, repeat: -1, ease: 'Sine.easeInOut', onYoyo: () => crab.setFlipX(true), onRepeat: () => crab.setFlipX(false) });
        }

        // Stingrays
        for (const sx of [1800, 4200]) {
            const ray = this.add.image(sx, Phaser.Math.Between(250, 350), 'stingray');
            ray.setDepth(-28).setAlpha(0.55).setScale(0.7);
            this.tweens.add({ targets: ray, x: ray.x + 300, duration: 8000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', onYoyo: () => ray.setFlipX(true), onRepeat: () => ray.setFlipX(false) });
            this.tweens.add({ targets: ray, y: ray.y + 30, duration: 4000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        }

        // Shrimp
        for (const shx of [900, 2600, 4400]) {
            const shrimp = this.add.image(shx, FLOOR_Y - 20, 'shrimp');
            shrimp.setDepth(-4).setScale(0.5).setAlpha(0.7);
            this.tweens.add({ targets: shrimp, x: shrimp.x + 30, y: shrimp.y - 10, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        }

        // Mermaids (friendly, non-harmful) — wave when turtle swims by
        this.mermaids = [];
        for (const mx of [1600, 3400, 5000]) {
            const mermaidKey = `mermaid_${Phaser.Math.Between(1, 3)}`;
            const mermaid = this.add.image(mx, Phaser.Math.Between(150, 300), mermaidKey);
            mermaid.setDepth(-20).setAlpha(0.75).setScale(0.15);
            mermaid.hasWaved = false;
            this.mermaids.push(mermaid);
            this.tweens.add({ targets: mermaid, x: mermaid.x + 120, duration: 6000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', onYoyo: () => mermaid.setFlipX(true), onRepeat: () => mermaid.setFlipX(false) });
            this.tweens.add({ targets: mermaid, y: mermaid.y + 25, duration: 3000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        }

        // Blowfish
        for (const bx of [1300, 3000, 5200]) {
            const blow = this.add.image(bx, Phaser.Math.Between(100, 300), 'blowfish');
            blow.setDepth(-26).setAlpha(0.6).setScale(0.6);
            this.tweens.add({ targets: blow, y: blow.y + 25, scaleX: 0.65, scaleY: 0.65, duration: 3000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        }
    }

    // ================================================================
    //  DECORATIVE FISH
    // ================================================================
    createDecorativeFish() {
        const fishKeys = this.levelConfig.decorativeFishKeys;

        for (let x = 400; x < WORLD_WIDTH; x += Phaser.Math.Between(450, 800)) {
            const key = Phaser.Utils.Array.GetRandom(fishKeys);
            const y = Phaser.Math.Between(60, FLOOR_Y - 60);
            const fish = this.add.image(x, y, key);
            fish.setDepth(-30).setAlpha(0.7).setScale(Phaser.Math.FloatBetween(0.4, 0.7));

            const facingLeft = Phaser.Math.Between(0, 1) === 0;
            fish.setFlipX(facingLeft);

            this.tweens.add({
                targets: fish,
                x: facingLeft ? fish.x - Phaser.Math.Between(60, 150) : fish.x + Phaser.Math.Between(60, 150),
                duration: Phaser.Math.Between(4000, 8000),
                yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
            });
            this.tweens.add({
                targets: fish,
                y: fish.y + Phaser.Math.Between(-20, 20),
                duration: Phaser.Math.Between(2000, 4000),
                yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
                delay: Phaser.Math.Between(0, 2000)
            });
        }
    }

    // ================================================================
    //  STARFISH (score only, progressive density)
    // ================================================================
    createStarfish() {
        this.starfishGroup = this.physics.add.group();

        const zones = [
            { start: 300,  end: 2000, minGap: 250, maxGap: 400 },
            { start: 2000, end: 4000, minGap: 350, maxGap: 550 },
            { start: 4000, end: 5700, minGap: 500, maxGap: 800 },
        ];

        for (const zone of zones) {
            for (let x = zone.start; x < zone.end; x += Phaser.Math.Between(zone.minGap, zone.maxGap)) {
                const y = Phaser.Math.Between(80, FLOOR_Y - 50);
                const star = this.starfishGroup.create(x, y, 'starfish');
                star.setDepth(2);
                star.setScale(0.67);
                star.body.setAllowGravity(false);
                star.body.setImmovable(true);

                this.tweens.add({
                    targets: star,
                    angle: 360,
                    duration: Phaser.Math.Between(4000, 7000),
                    repeat: -1, ease: 'Linear'
                });
            }
        }
    }

    // ================================================================
    //  HEART PICKUPS (floating hearts that restore life)
    // ================================================================
    createHeartPickups() {
        this.heartPickupGroup = this.physics.add.group();

        // Place hearts sparingly across the world
        for (let x = 800; x < WORLD_WIDTH - 300; x += Phaser.Math.Between(900, 1500)) {
            const y = Phaser.Math.Between(100, FLOOR_Y - 80);
            const heart = this.heartPickupGroup.create(x, y, 'heart_pickup');
            heart.setDepth(4);
            heart.body.setAllowGravity(false);
            heart.body.setImmovable(true);
            heart.setScale(0.8);

            // Gentle floating bob
            this.tweens.add({
                targets: heart,
                y: heart.y - 15,
                duration: Phaser.Math.Between(1500, 2500),
                yoyo: true, repeat: -1,
                ease: 'Sine.easeInOut'
            });

            // Soft glow pulse
            this.tweens.add({
                targets: heart,
                alpha: { from: 0.7, to: 1 },
                scaleX: { from: 0.8, to: 0.9 },
                scaleY: { from: 0.8, to: 0.9 },
                duration: 1000,
                yoyo: true, repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    // ================================================================
    //  OBSTACLES (progressive density + eels)
    // ================================================================
    createObstacles() {
        this.obstacleGroup = this.physics.add.group();

        // Jellyfish
        const jellyZones = [
            { start: 800,  end: 2000, minGap: 1350, maxGap: 2100 },
            { start: 2000, end: 4000, minGap: 900,  maxGap: 1500 },
            { start: 4000, end: 5700, minGap: 600,  maxGap: 1050 },
        ];
        for (const zone of jellyZones) {
            for (let x = zone.start; x < zone.end; x += Phaser.Math.Between(zone.minGap, zone.maxGap)) {
                const y = Phaser.Math.Between(100, 300);
                const jelly = this.obstacleGroup.create(x, y, 'jellyfish');
                jelly.setScale(0.75);
                jelly.setDepth(3);
                jelly.body.setAllowGravity(false);
                jelly.body.setImmovable(true);
                jelly.setScale(0.8);
                if (this.levelConfig.jellyfishBehavior === 'diagonal') {
                    const dir = Phaser.Math.Between(0, 1) === 0 ? 1 : -1;
                    this.tweens.add({
                        targets: jelly,
                        x: x + Phaser.Math.Between(80, 140) * dir,
                        y: y + Phaser.Math.Between(50, 90),
                        duration: Phaser.Math.Between(2500, 4000),
                        yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
                    });
                } else {
                    this.tweens.add({ targets: jelly, y: y + Phaser.Math.Between(50, 90), duration: Phaser.Math.Between(2000, 3500), yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
                }
            }
        }

        // Anchors
        const anchorZones = [
            { start: 1200, end: 2000, minGap: 1800, maxGap: 2700 },
            { start: 2000, end: 4000, minGap: 1200, maxGap: 1950 },
            { start: 4000, end: 5700, minGap: 900,  maxGap: 1500 },
        ];
        for (const zone of anchorZones) {
            for (let x = zone.start; x < zone.end; x += Phaser.Math.Between(zone.minGap, zone.maxGap)) {
                const anchor = this.obstacleGroup.create(x, FLOOR_Y - 30, 'anchor');
                anchor.setScale(0.75);
                anchor.setDepth(3);
                anchor.body.setAllowGravity(false);
                anchor.body.setImmovable(true);
                anchor.setOrigin(0.5, 1);
            }
        }

        // Fish hooks
        const hookZones = [
            { start: 1000, end: 2000, minGap: 2100, maxGap: 3000 },
            { start: 2000, end: 4000, minGap: 1050, maxGap: 1650 },
            { start: 4000, end: 5700, minGap: 750,  maxGap: 1200 },
        ];
        for (const zone of hookZones) {
            for (let x = zone.start; x < zone.end; x += Phaser.Math.Between(zone.minGap, zone.maxGap)) {
                const hookY = Phaser.Math.Between(30, 80);
                const hook = this.obstacleGroup.create(x, hookY, 'fish_hook');
                hook.setScale(0.75);
                hook.setDepth(3);
                hook.body.setAllowGravity(false);
                hook.body.setImmovable(true);
                this.tweens.add({ targets: hook, x: hook.x + Phaser.Math.Between(-20, 20), angle: { from: -8, to: 8 }, duration: Phaser.Math.Between(2500, 4000), yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
            }
        }

        // Sharks
        const sharkZones = [
            { start: 2000, end: 4000, minGap: 2250, maxGap: 3300 },
            { start: 4000, end: 5700, minGap: 1350, maxGap: 2100 },
        ];
        for (const zone of sharkZones) {
            for (let x = zone.start; x < zone.end; x += Phaser.Math.Between(zone.minGap, zone.maxGap)) {
                const y = Phaser.Math.Between(120, 280);
                const shark = this.obstacleGroup.create(x, y, 'shark');
                shark.setDepth(3);
                shark.body.setAllowGravity(false);
                shark.body.setImmovable(true);
                shark.setScale(0.675);
                const patrolDist = Phaser.Math.Between(150, 250);
                this.tweens.add({ targets: shark, x: x + patrolDist, duration: Phaser.Math.Between(3000, 5000), yoyo: true, repeat: -1, ease: 'Sine.easeInOut', onYoyo: () => shark.setFlipX(true), onRepeat: () => shark.setFlipX(false) });
            }
        }

        // Eels
        const eelZones = [
            { start: 2500, end: 4000, minGap: 1800, maxGap: 2700 },
            { start: 4000, end: 5700, minGap: 1200, maxGap: 1800 },
        ];
        for (const zone of eelZones) {
            for (let x = zone.start; x < zone.end; x += Phaser.Math.Between(zone.minGap, zone.maxGap)) {
                const eel = this.obstacleGroup.create(x, FLOOR_Y - 40, 'eel');
                eel.setDepth(3);
                eel.body.setAllowGravity(false);
                eel.body.setImmovable(true);
                eel.setScale(0.525).setAlpha(0.5);
                this.tweens.add({ targets: eel, y: eel.y - 30, alpha: 1, duration: 2000, yoyo: true, repeat: -1, hold: 1500, repeatDelay: 2000, ease: 'Sine.easeInOut' });
            }
        }
    }

    // ================================================================
    //  MOBILE CONTROLS (joystick left, direction indicator right)
    // ================================================================
    createMobileControls() {
        const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent)
            || (navigator.userAgent.includes('Macintosh') && 'ontouchend' in document);
        if (!isMobile) return;

        this.turtle.useMobileControls = true;
        this.joystickVector = { x: 0, y: 0 };
        this.joystickPointerId = null;

        const baseX = 110;
        const baseY = 540;
        const baseRadius = 65;
        const thumbRadius = 28;

        // Joystick base
        this.joystickBase = this.add.graphics();
        this.joystickBase.setScrollFactor(0).setDepth(100);
        this.joystickBase.fillStyle(0xffffff, 0.3);
        this.joystickBase.fillCircle(baseX, baseY, baseRadius);
        this.joystickBase.lineStyle(3, 0xffffff, 0.5);
        this.joystickBase.strokeCircle(baseX, baseY, baseRadius);

        // Joystick thumb
        this.joystickThumbGfx = this.add.graphics();
        this.joystickThumbGfx.setScrollFactor(0).setDepth(101);
        this.drawThumb(baseX, baseY, thumbRadius);

        // Right-side direction indicator
        const arrowX = 700;
        const arrowY = 540;
        const arrowRadius = 50;

        this.dirBase = this.add.graphics();
        this.dirBase.setScrollFactor(0).setDepth(100);
        this.dirBase.fillStyle(0xffffff, 0.25);
        this.dirBase.fillCircle(arrowX, arrowY, arrowRadius);
        this.dirBase.lineStyle(2, 0xffffff, 0.4);
        this.dirBase.strokeCircle(arrowX, arrowY, arrowRadius);

        // Arrow triangle (will be rotated)
        this.dirArrow = this.add.triangle(arrowX, arrowY, 0, -25, 15, 10, -15, 10, 0xffffff, 0.55);
        this.dirArrow.setScrollFactor(0).setDepth(101);
        this.dirArrow.setVisible(false);

        // Store constants
        this._joyBaseX = baseX;
        this._joyBaseY = baseY;
        this._joyBaseRadius = baseRadius;
        this._joyThumbRadius = thumbRadius;

        // Touch handling
        this.input.on('pointerdown', (pointer) => {
            if (pointer.x < this.cameras.main.width / 2 && this.joystickPointerId === null) {
                this.joystickPointerId = pointer.id;
                this.updateJoystick(pointer);
            }
        });

        this.input.on('pointermove', (pointer) => {
            if (pointer.id === this.joystickPointerId && pointer.isDown) {
                this.updateJoystick(pointer);
            }
        });

        this.input.on('pointerup', (pointer) => {
            if (pointer.id === this.joystickPointerId) {
                this.joystickPointerId = null;
                this.joystickVector.x = 0;
                this.joystickVector.y = 0;
                this.drawThumb(this._joyBaseX, this._joyBaseY, this._joyThumbRadius);
                this.dirArrow.setVisible(false);
            }
        });
    }

    updateJoystick(pointer) {
        const dx = pointer.x - this._joyBaseX;
        const dy = pointer.y - this._joyBaseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = this._joyBaseRadius;

        let thumbX, thumbY;
        if (dist > maxDist) {
            thumbX = this._joyBaseX + (dx / dist) * maxDist;
            thumbY = this._joyBaseY + (dy / dist) * maxDist;
        } else {
            thumbX = this._joyBaseX + dx;
            thumbY = this._joyBaseY + dy;
        }

        this.drawThumb(thumbX, thumbY, this._joyThumbRadius);

        const normDist = Math.min(dist, maxDist) / maxDist;
        if (dist > 8) {
            this.joystickVector.x = (dx / dist) * normDist;
            this.joystickVector.y = (dy / dist) * normDist;

            // Update direction arrow
            const angle = Math.atan2(dy, dx) + Math.PI / 2;
            this.dirArrow.setRotation(angle);
            this.dirArrow.setAlpha(0.3 + normDist * 0.5);
            this.dirArrow.setVisible(true);
        } else {
            this.joystickVector.x = 0;
            this.joystickVector.y = 0;
            this.dirArrow.setVisible(false);
        }
    }

    drawThumb(x, y, radius) {
        this.joystickThumbGfx.clear();
        this.joystickThumbGfx.fillStyle(0xffffff, 0.55);
        this.joystickThumbGfx.fillCircle(x, y, radius);
        this.joystickThumbGfx.lineStyle(2, 0xffffff, 0.7);
        this.joystickThumbGfx.strokeCircle(x, y, radius);
    }

    // ================================================================
    //  HUD
    // ================================================================
    createHUD() {
        // --- Hearts (top-left) ---
        this.heartIcons = [];
        for (let i = 0; i < 3; i++) {
            const heart = this.add.text(24 + i * 42, 20, '\u2764', {
                fontSize: '32px',
                color: '#ff4444',
                stroke: '#990000',
                strokeThickness: 3
            });
            heart.setScrollFactor(0).setDepth(50);
            this.heartIcons.push(heart);
        }

        // --- Starfish icon + score (top-right) ---
        this.hudStarfishIcon = this.add.image(710, 34, 'starfish');
        this.hudStarfishIcon.setScrollFactor(0).setDepth(50).setScale(0.55);

        this.scoreDigits = [];
        this.updateScoreDisplay();

        // --- Streak display (below score) ---
        this.streakText = this.add.text(775, 58, '', {
            fontSize: '16px',
            fontFamily: 'Verdana, Geneva, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            shadow: { offsetX: 1, offsetY: 1, color: 'rgba(0,0,0,0.5)', blur: 4, fill: true }
        });
        this.streakText.setScrollFactor(0).setDepth(50).setOrigin(1, 0);

        // --- Best streak (below streak) ---
        this.bestStreakText = this.add.text(775, 78, '', {
            fontSize: '14px',
            fontFamily: 'Verdana, Geneva, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            shadow: { offsetX: 1, offsetY: 1, color: 'rgba(0,0,0,0.5)', blur: 4, fill: true }
        });
        this.bestStreakText.setScrollFactor(0).setDepth(50).setOrigin(1, 0);

        this.updateStreakDisplay();

        // --- Timer (top-center) ---
        this.timerText = this.add.text(400, 20, '1:00', {
            fontSize: '28px',
            fontFamily: 'Verdana, Geneva, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            shadow: { offsetX: 1, offsetY: 1, color: 'rgba(0,0,0,0.5)', blur: 4, fill: true }
        });
        this.timerText.setScrollFactor(0).setDepth(50).setOrigin(0.5, 0);
    }

    updateScoreDisplay() {
        this.scoreDigits.forEach(d => d.destroy());
        this.scoreDigits = [];

        const scoreStr = String(this.score);
        const digitSpacing = 28;
        const rightEdge = 775;
        const startX = rightEdge - (scoreStr.length - 1) * digitSpacing;

        for (let i = 0; i < scoreStr.length; i++) {
            const digit = this.add.image(
                startX + i * digitSpacing, 34,
                `hud_num_${scoreStr[i]}`
            );
            digit.setScrollFactor(0).setDepth(50).setScale(0.8);
            this.scoreDigits.push(digit);
        }

        // Reposition starfish icon to sit just left of the digits
        if (this.hudStarfishIcon) {
            this.hudStarfishIcon.setX(startX - 32);
        }
    }

    updateStreakDisplay() {
        this.streakText.setText(`Streak: ${this.streak}`);
        this.bestStreakText.setText(`Best: ${this.bestStreak}`);
    }

    updateHeartsDisplay(animateIndex) {
        const health = this.turtle ? this.turtle.health : 3;
        const progress = this.heartProgress;

        for (let i = 0; i < this.heartIcons.length; i++) {
            const heart = this.heartIcons[i];
            if (i < health) {
                // Full heart
                heart.setVisible(true).setAlpha(1);
                heart.setStyle({ color: '#ff4444', stroke: '#990000' });
            } else if (i === health && progress > 0 && health < 3) {
                // Partial heart (1/2 progress)
                heart.setVisible(true);
                heart.setAlpha(0.5);
                heart.setStyle({ color: '#ff9999', stroke: '#994444' });
            } else {
                heart.setVisible(false);
            }
        }

        // Animate a heart turning full red
        if (animateIndex !== undefined && animateIndex < this.heartIcons.length) {
            const heart = this.heartIcons[animateIndex];
            heart.setVisible(true).setAlpha(1);
            heart.setStyle({ color: '#ff4444', stroke: '#990000' });
            this.tweens.add({
                targets: heart,
                scaleX: 1.5, scaleY: 1.5,
                duration: 200,
                yoyo: true,
                ease: 'Back.easeOut'
            });
        }
    }

    // ================================================================
    //  COLLISIONS
    // ================================================================
    onCollectStarfish(turtleSprite, starfish) {
        this.score++;
        this.streak++;
        if (this.streak > this.bestStreak) {
            this.bestStreak = this.streak;
        }
        this.playCollectSound();

        this.updateScoreDisplay();
        this.updateStreakDisplay();

        starfish.body.enable = false;
        this.tweens.add({
            targets: starfish,
            scaleX: 1.5, scaleY: 1.5, alpha: 0,
            duration: 300, ease: 'Power2',
            onComplete: () => starfish.destroy()
        });
    }

    onCollectHeart(turtleSprite, heartPickup) {
        // Already at full health with no room for progress
        if (this.turtle.health >= 3) return;

        heartPickup.body.enable = false;
        this.heartProgress++;
        this.playHeartSound();

        let animateIndex;
        if (this.heartProgress >= 2) {
            // 2 pickups collected → restore one full heart
            this.heartProgress = 0;
            this.turtle.health++;
            animateIndex = this.turtle.health - 1;
        }

        this.updateHeartsDisplay(animateIndex);

        // Pickup effect
        this.tweens.add({
            targets: heartPickup,
            scaleX: 1.4, scaleY: 1.4, alpha: 0, y: heartPickup.y - 30,
            duration: 400, ease: 'Power2',
            onComplete: () => heartPickup.destroy()
        });
    }

    onHitObstacle(turtleSprite, obstacle) {
        const wasHit = this.turtle.hit();
        if (!wasHit) return;

        this.playHitSound();
        this.streak = 0;
        this.heartProgress = 0;
        this.updateStreakDisplay();
        this.updateHeartsDisplay();

        if (this.turtle.health <= 0) {
            this.time.delayedCall(500, () => {
                this.scene.start('GameOverScene', { score: this.score, bestStreak: this.bestStreak, level: this.currentLevel });
            });
        }
    }

    // ================================================================
    //  UPDATE
    // ================================================================
    update(time, delta) {
        this.turtle.update(time, delta);

        // Countdown timer
        if (!this.victoryTriggered && !this.timeUpTriggered) {
            this.timeRemaining -= delta / 1000;
            if (this.timeRemaining < 0) this.timeRemaining = 0;

            const secs = Math.ceil(this.timeRemaining);
            const mins = Math.floor(secs / 60);
            const s = secs % 60;
            this.timerText.setText(`${mins}:${s < 10 ? '0' : ''}${s}`);

            if (this.timeRemaining <= 10) {
                this.timerText.setColor('#ff4444');
            }

            if (this.timeRemaining <= 0) {
                this.timeUpTriggered = true;
                this.cameras.main.fade(800, 0, 0, 0, false, (cam, progress) => {
                    if (progress === 1) {
                        this.scene.start('TimeUpScene', { score: this.score, bestStreak: this.bestStreak, level: this.currentLevel });
                    }
                });
            }
        }

        // Mermaids wave when turtle swims nearby
        const tx = this.turtle.sprite.x;
        const ty = this.turtle.sprite.y;
        for (const m of this.mermaids) {
            if (!m.hasWaved && Phaser.Math.Distance.Between(tx, ty, m.x, m.y) < 300) {
                m.hasWaved = true;
                // Wiggle rotation to simulate waving
                this.tweens.add({
                    targets: m,
                    angle: { from: -12, to: 12 },
                    duration: 200,
                    yoyo: true,
                    repeat: 3,
                    ease: 'Sine.easeInOut',
                    onComplete: () => { m.angle = 0; }
                });
                // Brief scale pop
                this.tweens.add({
                    targets: m,
                    scaleX: 0.19,
                    scaleY: 0.19,
                    duration: 300,
                    yoyo: true,
                    ease: 'Sine.easeOut'
                });
                // Brighten briefly
                this.tweens.add({
                    targets: m,
                    alpha: 1,
                    duration: 400,
                    yoyo: true,
                    ease: 'Sine.easeInOut'
                });
            }
        }

        if (!this.victoryTriggered && this.turtle.sprite.x > WORLD_WIDTH - 250) {
            this.victoryTriggered = true;
            this.cameras.main.fade(800, 255, 255, 255, false, (cam, progress) => {
                if (progress === 1) {
                    this.scene.start('VictoryScene', { score: this.score, bestStreak: this.bestStreak, level: this.currentLevel });
                }
            });
        }
    }
}
