import Phaser from 'phaser';
import { BULLET, COLORS, WORLD } from '../config/gameConfig';

export class Bullet {
  public readonly radius = BULLET.radius;

  private readonly view: Phaser.GameObjects.Graphics;
  private readonly direction: Phaser.Math.Vector2;
  private readonly position: Phaser.Math.Vector2;
  private lifetimeMs = 0;
  private active = true;

  constructor(scene: Phaser.Scene, x: number, y: number, direction: Phaser.Math.Vector2) {
    this.position = new Phaser.Math.Vector2(x, y);
    this.direction = direction.clone().normalize();
    this.view = scene.add.graphics({ x, y });
    this.draw();
  }

  get x(): number {
    return this.position.x;
  }

  get y(): number {
    return this.position.y;
  }

  get isActive(): boolean {
    return this.active;
  }

  update(deltaMs: number): void {
    if (!this.active) {
      return;
    }

    const seconds = deltaMs / 1000;
    this.position.x += this.direction.x * BULLET.speed * seconds;
    this.position.y += this.direction.y * BULLET.speed * seconds;
    this.lifetimeMs += deltaMs;
    this.view.setPosition(this.position.x, this.position.y);

    if (
      this.position.x < -this.radius ||
      this.position.x > WORLD.width + this.radius ||
      this.position.y < -this.radius ||
      this.position.y > WORLD.height + this.radius ||
      this.lifetimeMs >= BULLET.maxLifetimeMs
    ) {
      this.destroy();
    }
  }

  destroy(): void {
    if (!this.active) {
      return;
    }

    this.active = false;
    this.view.destroy();
  }

  private draw(): void {
    this.view.clear();
    this.view.fillStyle(COLORS.bullet, 1);
    this.view.fillCircle(0, 0, this.radius);
    this.view.lineStyle(2, COLORS.bulletStroke, 1);
    this.view.strokeCircle(0, 0, this.radius);
  }
}
