export class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // --- Loading bar ---
        const { width, height } = this.cameras.main;
        const barBg = this.add.graphics();
        barBg.fillStyle(0x222222, 0.8);
        barBg.fillRect(width * 0.2, height / 2 - 20, width * 0.6, 40);
        const bar = this.add.graphics();
        this.load.on('progress', (value) => {
            bar.clear();
            bar.fillStyle(0x44aadd, 1);
            bar.fillRect(width * 0.2 + 4, height / 2 - 16, (width * 0.6 - 8) * value, 32);
        });

        // --- Player ---
        this.load.image('turtle', 'assets/characters/031-sea-turtle.png');

        // --- Terrain: sand top (a-h) ---
        const letters8 = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        for (const l of letters8) {
            this.load.image(`terrain_sand_top_${l}`, `assets/background/terrain_sand_top_${l}.png`);
        }

        // --- Terrain: sand fill (a-d) ---
        const letters4 = ['a', 'b', 'c', 'd'];
        for (const l of letters4) {
            this.load.image(`terrain_sand_${l}`, `assets/background/terrain_sand_${l}.png`);
        }

        // --- Far parallax: background rocks ---
        this.load.image('bg_rock_a', 'assets/background/background_rock_a.png');
        this.load.image('bg_rock_b', 'assets/background/background_rock_b.png');

        // --- Mid parallax: background seaweed (a-h) ---
        for (const l of letters8) {
            this.load.image(`bg_seaweed_${l}`, `assets/background/background_seaweed_${l}.png`);
        }

        // --- Floor decorations: seaweed green (a-d) ---
        for (const l of letters4) {
            this.load.image(`seaweed_green_${l}`, `assets/background/seaweed_green_${l}.png`);
        }

        // --- Floor decorations: seaweed pink (a-d) ---
        for (const l of letters4) {
            this.load.image(`seaweed_pink_${l}`, `assets/background/seaweed_pink_${l}.png`);
        }

        // --- Floor decorations: seaweed orange (a-b) ---
        this.load.image('seaweed_orange_a', 'assets/background/seaweed_orange_a.png');
        this.load.image('seaweed_orange_b', 'assets/background/seaweed_orange_b.png');

        // --- Floor decorations: seaweed grass (a-b) ---
        this.load.image('seaweed_grass_a', 'assets/background/seaweed_grass_a.png');
        this.load.image('seaweed_grass_b', 'assets/background/seaweed_grass_b.png');

        // --- Floor decorations: rocks ---
        this.load.image('rock_a', 'assets/background/rock_a.png');
        this.load.image('rock_b', 'assets/background/rock_b.png');

        // --- Floor decorations: coral, shells ---
        this.load.image('coral', 'assets/characters/003-coral.png');
        this.load.image('seashell', 'assets/characters/013-seashell.png');
        this.load.image('shell', 'assets/characters/027-shell.png');

        // --- Obstacles ---
        this.load.image('jellyfish', 'assets/characters/004-jellyfish.png');
        this.load.image('shark', 'assets/characters/028-shark.png');
        this.load.image('anchor', 'assets/characters/001-anchor.png');
        this.load.image('fish_hook', 'assets/characters/006-fish-hook.png');
        this.load.image('eel', 'assets/characters/016-eel.png');

        // --- Collectibles ---
        this.load.image('starfish', 'assets/characters/026-starfish.png');

        // --- HUD numbers (0-9) ---
        for (let i = 0; i <= 9; i++) {
            this.load.image(`hud_num_${i}`, `assets/misc/hud_number_${i}.png`);
        }

        // --- Decorative fish ---
        this.load.image('fish_orange', 'assets/characters/fish_orange.png');
        this.load.image('fish_blue', 'assets/characters/fish_blue.png');
        this.load.image('fish_pink', 'assets/characters/fish_pink.png');
        this.load.image('fish_green', 'assets/characters/fish_green.png');
        this.load.image('clown_fish', 'assets/characters/019-clown-fish.png');
        this.load.image('blue_tang', 'assets/characters/014-blue-tang-fish.png');
        this.load.image('seahorse', 'assets/characters/022-seahorse.png');

        // --- Ambient sea life ---
        this.load.image('whale', 'assets/characters/030-whale.png');
        this.load.image('dolphin', 'assets/characters/020-dolphin.png');
        this.load.image('octopus', 'assets/characters/012-octopus.png');
        this.load.image('crab', 'assets/characters/018-crab.png');
        this.load.image('shrimp', 'assets/characters/009-shrimp.png');
        this.load.image('blowfish', 'assets/characters/023-blowfish.png');
        this.load.image('stingray', 'assets/characters/005-stingray.png');

        // --- Mermaids ---
        this.load.image('mermaid_1', 'assets/characters/mermaid_1.png');
        this.load.image('mermaid_2', 'assets/characters/mermaid_2.png');
        this.load.image('mermaid_3', 'assets/characters/mermaid__3.png');

        // --- Additional decorative fish (Level 2) ---
        this.load.image('fish_brown', 'assets/characters/fish_brown.png');
        this.load.image('fish_grey', 'assets/characters/fish_grey.png');
        this.load.image('fish_grey_long_a', 'assets/characters/fish_grey_long_a.png');
        this.load.image('fish_grey_long_b', 'assets/characters/fish_grey_long_b.png');

        // --- Skeleton fish (Level 2) ---
        this.load.image('fish_blue_skeleton', 'assets/characters/fish_blue_skeleton.png');
        this.load.image('fish_orange_skeleton', 'assets/characters/fish_orange_skeleton.png');
        this.load.image('fish_pink_skeleton', 'assets/characters/fish_pink_skeleton.png');
        this.load.image('fish_green_skeleton', 'assets/characters/fish_green_skeleton.png');
        this.load.image('fish_red_skeleton', 'assets/characters/fish_red_skeleton.png');

        // --- Bubbles (Level 2) ---
        this.load.image('bubble_a', 'assets/misc/bubble_a.png');
        this.load.image('bubble_b', 'assets/misc/bubble_b.png');
        this.load.image('bubble_c', 'assets/misc/bubble_c.png');
    }

    create() {
        this.scene.start('TitleScene');
    }
}
