import Phaser from 'phaser';
import { COLORS, ENEMY, WORLD } from '../config/gameConfig';
import { Player } from './Player';

export class Enemy {
  public readonly radius = ENEMY.radius;
  public readonly position: Phaser.Math.Vector2;

  private readonly view: Phaser.GameObjects.Graphics;
  private readonly deathParticles: Phaser.GameObjects.Graphics[] = [];
  private health: number = ENEMY.maxHealth;
  private attackCooldownRemainingMs = Phaser.Math.Between(0, ENEMY.attackCooldownMs);
  private hitFlashRemainingMs = 0;
  private deathFadeRemainingMs = 0;
  private alive = true;
  private removed = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.position = new Phaser.Math.Vector2(x, y);
    this.view = scene.add.graphics({ x, y });
    this.draw();
  }

  get isAlive(): boolean {
    return this.alive;
  }

  get isRemoved(): boolean {
    return this.removed;
  }

  update(deltaMs: number, player: Player, canAttack: boolean): void {
    if (this.removed) {
      return;
    }

    if (!this.alive) {
      this.updateDeath(deltaMs);
      return;
    }

    this.attackCooldownRemainingMs = Math.max(0, this.attackCooldownRemainingMs - deltaMs);
    this.hitFlashRemainingMs = Math.max(0, this.hitFlashRemainingMs - deltaMs);

    const toPlayer = player.position.clone().subtract(this.position);
    const distanceToPlayer = toPlayer.length();

    if (distanceToPlayer <= ENEMY.detectionRange && distanceToPlayer > ENEMY.attackRange) {
      toPlayer.normalize();
      const seconds = deltaMs / 1000;
      this.position.x = Phaser.Math.Clamp(
        this.position.x + toPlayer.x * ENEMY.speed * seconds,
        this.radius,
        WORLD.width - this.radius,
      );
      this.position.y = Phaser.Math.Clamp(
        this.position.y + toPlayer.y * ENEMY.speed * seconds,
        this.radius,
        WORLD.height - this.radius,
      );
    }

    if (canAttack && distanceToPlayer <= ENEMY.attackRange && this.attackCooldownRemainingMs <= 0) {
      player.takeDamage(ENEMY.attackDamage);
      this.attackCooldownRemainingMs = ENEMY.attackCooldownMs;
    }

    this.view.setPosition(this.position.x, this.position.y);
    this.draw();
  }

  takeDamage(amount: number): boolean {
    if (!this.alive || this.removed) {
      return false;
    }

    this.health = Math.max(0, this.health - amount);
    this.hitFlashRemainingMs = ENEMY.hitFlashMs;

    if (this.health <= 0) {
      this.die();
      return true;
    }

    return false;
  }

  destroy(): void {
    this.removed = true;
    this.view.destroy();
    for (const particle of this.deathParticles) {
      particle.destroy();
    }
    this.deathParticles.length = 0;
  }

  private die(): void {
    this.alive = false;
    this.deathFadeRemainingMs = ENEMY.deathFadeMs;
    this.spawnDeathParticles();
  }

  private updateDeath(deltaMs: number): void {
    this.deathFadeRemainingMs = Math.max(0, this.deathFadeRemainingMs - deltaMs);
    const progress = this.deathFadeRemainingMs / ENEMY.deathFadeMs;
    this.view.setAlpha(progress);
    this.view.setScale(0.75 + progress * 0.25);

    for (const particle of this.deathParticles) {
      particle.setAlpha(progress);
      particle.setScale(1 + (1 - progress) * 0.8);
    }

    if (this.deathFadeRemainingMs <= 0) {
      this.destroy();
    }
  }

  private draw(): void {
    const healthRatio = this.health / ENEMY.maxHealth;
    const bodyColor = this.hitFlashRemainingMs > 0 ? COLORS.enemyHit : COLORS.enemy;

    this.view.clear();
    this.view.fillStyle(bodyColor, 1);
    this.view.fillCircle(0, 0, this.radius);
    this.view.lineStyle(3, COLORS.enemyStroke, 1);
    this.view.strokeCircle(0, 0, this.radius);

    this.view.fillStyle(0x111827, 1);
    this.view.fillRect(-this.radius, -this.radius - 10, this.radius * 2, 4);
    this.view.fillStyle(COLORS.enemyStroke, 1);
    this.view.fillRect(-this.radius, -this.radius - 10, this.radius * 2 * healthRatio, 4);
  }

  private spawnDeathParticles(): void {
    const scene = this.view.scene;

    for (let index = 0; index < 5; index += 1) {
      const angle = (Math.PI * 2 * index) / 5;
      const particle = scene.add.graphics({
        x: this.position.x + Math.cos(angle) * 14,
        y: this.position.y + Math.sin(angle) * 14,
      });
      particle.fillStyle(COLORS.particle, 0.8);
      particle.fillCircle(0, 0, 4);
      this.deathParticles.push(particle);
    }
  }
}
