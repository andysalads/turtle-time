export class Turtle {
    constructor(scene, x, y) {
        this.scene = scene;

        this.sprite = scene.physics.add.sprite(x, y, 'turtle');
        this.sprite.setDepth(10);
        this.sprite.setCollideWorldBounds(true);
        this.sprite.setDrag(400, 268);
        this.sprite.setMaxVelocity(200, 266);

        // Health & invincibility
        this.health = 3;
        this.invincible = false;

        // Bobbing state
        this.bobTimer = 0;

        // Keyboard input
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.wasd = {
            up: scene.input.keyboard.addKey('W'),
            down: scene.input.keyboard.addKey('S'),
            left: scene.input.keyboard.addKey('A'),
            right: scene.input.keyboard.addKey('D')
        };

        // Whether mobile controls are active (set by GameScene)
        this.useMobileControls = false;
    }

    hit() {
        if (this.invincible) return false;

        this.health--;
        this.invincible = true;

        this.sprite.setVelocity(
            -this.sprite.body.velocity.x * 0.6,
            -this.sprite.body.velocity.y * 0.6
        );

        this.scene.tweens.add({
            targets: this.sprite,
            alpha: 0.2,
            duration: 120,
            yoyo: true,
            repeat: 8,
            onComplete: () => {
                this.sprite.setAlpha(1);
                this.invincible = false;
            }
        });

        return true;
    }

    update(time, delta) {
        const accel = 500;
        let ax = 0;
        let ay = 0;

        // --- Keyboard input ---
        if (this.cursors.left.isDown || this.wasd.left.isDown) ax -= accel;
        if (this.cursors.right.isDown || this.wasd.right.isDown) ax += accel;
        if (this.cursors.up.isDown || this.wasd.up.isDown) ay -= accel;
        if (this.cursors.down.isDown || this.wasd.down.isDown) ay += accel;

        // --- Joystick input (mobile) ---
        if (ax === 0 && ay === 0 && this.useMobileControls && this.scene.joystickVector) {
            const jv = this.scene.joystickVector;
            if (jv.x !== 0 || jv.y !== 0) {
                ax = jv.x * accel;
                ay = jv.y * accel;
            }
        }

        // --- Mouse input (desktop only, hold to move) ---
        if (ax === 0 && ay === 0 && !this.useMobileControls) {
            const pointer = this.scene.input.activePointer;
            if (pointer.isDown) {
                const cam = this.scene.cameras.main;
                const worldX = pointer.x / cam.zoom + cam.scrollX;
                const worldY = pointer.y / cam.zoom + cam.scrollY;
                const dx = worldX - this.sprite.x;
                const dy = worldY - this.sprite.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist > 15) {
                    ax = (dx / dist) * accel;
                    ay = (dy / dist) * accel;
                }
            }
        }

        this.sprite.setAcceleration(ax, ay);

        const isMoving = ax !== 0 || ay !== 0;
        const vx = this.sprite.body.velocity.x;
        const vy = this.sprite.body.velocity.y;

        // --- Flip sprite based on horizontal direction ---
        if (vx < -10) {
            this.sprite.setFlipX(true);
        } else if (vx > 10) {
            this.sprite.setFlipX(false);
        }

        // --- Idle bobbing ---
        if (!isMoving && Math.abs(vx) < 5 && Math.abs(vy) < 5) {
            this.bobTimer += delta * 0.002;
            this.sprite.y += Math.sin(this.bobTimer) * 0.3;
            this.sprite.setRotation(Math.sin(this.bobTimer * 0.8) * 0.04);
        } else {
            const targetRot = vy * 0.0004;
            this.sprite.setRotation(
                Phaser.Math.Linear(this.sprite.rotation, targetRot, 0.1)
            );
            this.bobTimer = 0;
        }
    }
}
