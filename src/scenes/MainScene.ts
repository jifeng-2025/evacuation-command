import Phaser from 'phaser';

const WORLD_WIDTH = 960;
const WORLD_HEIGHT = 540;
const PLAYER_RADIUS = 18;
const PLAYER_SPEED = 260;
const PLAYER_COLOR = 0x3b82f6;
const PLAYER_STROKE = 0xbfdbfe;

type MovementKeys = {
  w: Phaser.Input.Keyboard.Key;
  a: Phaser.Input.Keyboard.Key;
  s: Phaser.Input.Keyboard.Key;
  d: Phaser.Input.Keyboard.Key;
  r: Phaser.Input.Keyboard.Key;
};

export class MainScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Graphics;
  private cursors!: MovementKeys;
  private playerPosition = new Phaser.Math.Vector2(WORLD_WIDTH / 2, WORLD_HEIGHT / 2);

  constructor() {
    super('MainScene');
  }

  create(): void {
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    this.drawBackground();
    this.createPlayer();
    this.createHud();
    this.createInput();
  }

  update(_time: number, delta: number): void {
    const direction = new Phaser.Math.Vector2(0, 0);

    if (this.cursors.w.isDown) {
      direction.y -= 1;
    }

    if (this.cursors.s.isDown) {
      direction.y += 1;
    }

    if (this.cursors.a.isDown) {
      direction.x -= 1;
    }

    if (this.cursors.d.isDown) {
      direction.x += 1;
    }

    if (Phaser.Input.Keyboard.JustDown(this.cursors.r)) {
      this.scene.restart();
      return;
    }

    if (direction.lengthSq() > 0) {
      direction.normalize();
    }

    const seconds = delta / 1000;
    this.playerPosition.x = Phaser.Math.Clamp(
      this.playerPosition.x + direction.x * PLAYER_SPEED * seconds,
      PLAYER_RADIUS,
      WORLD_WIDTH - PLAYER_RADIUS,
    );
    this.playerPosition.y = Phaser.Math.Clamp(
      this.playerPosition.y + direction.y * PLAYER_SPEED * seconds,
      PLAYER_RADIUS,
      WORLD_HEIGHT - PLAYER_RADIUS,
    );

    this.player.setPosition(this.playerPosition.x, this.playerPosition.y);
  }

  private drawBackground(): void {
    const background = this.add.graphics();
    background.fillStyle(0x0b1020, 1);
    background.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    background.lineStyle(2, 0x1e293b, 1);
    background.strokeRect(16, 16, WORLD_WIDTH - 32, WORLD_HEIGHT - 32);

    background.lineStyle(1, 0x172033, 0.6);
    for (let x = 0; x <= WORLD_WIDTH; x += 48) {
      background.lineBetween(x, 0, x, WORLD_HEIGHT);
    }
    for (let y = 0; y <= WORLD_HEIGHT; y += 48) {
      background.lineBetween(0, y, WORLD_WIDTH, y);
    }
  }

  private createPlayer(): void {
    this.playerPosition.set(WORLD_WIDTH / 2, WORLD_HEIGHT / 2);
    this.player = this.add.graphics({ x: this.playerPosition.x, y: this.playerPosition.y });
    this.player.fillStyle(PLAYER_COLOR, 1);
    this.player.fillCircle(0, 0, PLAYER_RADIUS);
    this.player.lineStyle(3, PLAYER_STROKE, 1);
    this.player.strokeCircle(0, 0, PLAYER_RADIUS);
  }

  private createHud(): void {
    this.add
      .text(24, 24, 'Evacuation Command\nWASD 移动 · R 重新开始', {
        color: '#e5e7eb',
        fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
        fontSize: '20px',
        lineSpacing: 8,
      })
      .setDepth(10);
  }

  private createInput(): void {
    const keyboard = this.input.keyboard;

    if (!keyboard) {
      throw new Error('Keyboard input is unavailable in this environment.');
    }

    this.cursors = keyboard.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      r: Phaser.Input.Keyboard.KeyCodes.R,
    }) as MovementKeys;
  }
}
