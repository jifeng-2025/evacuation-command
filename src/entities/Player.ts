import Phaser from 'phaser';
import { COLORS, PLAYER, WORLD } from '../config/gameConfig';
import type { MovementKeys } from '../types/game';

export class Player {
  public readonly radius = PLAYER.radius;
  public readonly position = new Phaser.Math.Vector2(PLAYER.startX, PLAYER.startY);

  private readonly view: Phaser.GameObjects.Graphics;
  private readonly aimDirection = new Phaser.Math.Vector2(1, 0);
  private health: number = PLAYER.maxHealth;
  private damageFlashRemainingMs = 0;
  private muzzleFlashRemainingMs = 0;
  private shootCooldownRemainingMs = 0;

  constructor(scene: Phaser.Scene) {
    this.view = scene.add.graphics({ x: this.position.x, y: this.position.y });
    this.draw();
  }

  get healthPoints(): number {
    return this.health;
  }

  get isAlive(): boolean {
    return this.health > 0;
  }

  get aim(): Phaser.Math.Vector2 {
    return this.aimDirection.clone();
  }

  update(deltaMs: number, keys: MovementKeys, pointer: Phaser.Input.Pointer, movementEnabled: boolean): void {
    if (movementEnabled && this.isAlive) {
      this.updateMovement(deltaMs, keys);
    }

    this.updateAim(pointer);
    this.damageFlashRemainingMs = Math.max(0, this.damageFlashRemainingMs - deltaMs);
    this.muzzleFlashRemainingMs = Math.max(0, this.muzzleFlashRemainingMs - deltaMs);
    this.shootCooldownRemainingMs = Math.max(0, this.shootCooldownRemainingMs - deltaMs);
    this.view.setPosition(this.position.x, this.position.y);
    this.draw();
  }

  canShoot(): boolean {
    return this.isAlive && this.shootCooldownRemainingMs <= 0;
  }

  markShotFired(): void {
    this.shootCooldownRemainingMs = PLAYER.shootCooldownMs;
    this.muzzleFlashRemainingMs = PLAYER.muzzleFlashMs;
  }

  takeDamage(amount: number): void {
    if (!this.isAlive) {
      return;
    }

    this.health = Math.max(0, this.health - amount);
    this.damageFlashRemainingMs = PLAYER.damageFlashMs;
  }

  destroy(): void {
    this.view.destroy();
  }

  private updateMovement(deltaMs: number, keys: MovementKeys): void {
    const direction = new Phaser.Math.Vector2(0, 0);

    if (keys.w.isDown) {
      direction.y -= 1;
    }
    if (keys.s.isDown) {
      direction.y += 1;
    }
    if (keys.a.isDown) {
      direction.x -= 1;
    }
    if (keys.d.isDown) {
      direction.x += 1;
    }
    if (direction.lengthSq() > 0) {
      direction.normalize();
    }

    const seconds = deltaMs / 1000;
    this.position.x = Phaser.Math.Clamp(
      this.position.x + direction.x * PLAYER.speed * seconds,
      this.radius,
      WORLD.width - this.radius,
    );
    this.position.y = Phaser.Math.Clamp(
      this.position.y + direction.y * PLAYER.speed * seconds,
      this.radius,
      WORLD.height - this.radius,
    );
  }

  private updateAim(pointer: Phaser.Input.Pointer): void {
    const pointerWorld = new Phaser.Math.Vector2(pointer.worldX, pointer.worldY);
    const nextAim = pointerWorld.subtract(this.position);

    if (nextAim.lengthSq() > 0.001) {
      this.aimDirection.copy(nextAim.normalize());
    }
  }

  private draw(): void {
    const isDamaged = this.damageFlashRemainingMs > 0;
    const bodyColor = isDamaged ? COLORS.playerDamage : COLORS.player;
    const gunEndX = this.aimDirection.x * (this.radius + 16);
    const gunEndY = this.aimDirection.y * (this.radius + 16);

    this.view.clear();
    this.view.fillStyle(bodyColor, 1);
    this.view.fillCircle(0, 0, this.radius);
    this.view.lineStyle(3, COLORS.playerStroke, 1);
    this.view.strokeCircle(0, 0, this.radius);

    this.view.lineStyle(5, COLORS.playerStroke, 1);
    this.view.lineBetween(this.aimDirection.x * 6, this.aimDirection.y * 6, gunEndX, gunEndY);

    if (this.muzzleFlashRemainingMs > 0) {
      this.view.fillStyle(COLORS.muzzle, 0.9);
      this.view.fillCircle(gunEndX, gunEndY, 8);
    }
  }
}
