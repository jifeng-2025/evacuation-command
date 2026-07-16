import Phaser from 'phaser';
import { BULLET, ENEMY, WORLD } from '../config/gameConfig';
import { Bullet } from '../entities/Bullet';
import { Enemy } from '../entities/Enemy';
import { Player } from '../entities/Player';

export class CombatSystem {
  private readonly scene: Phaser.Scene;
  private readonly bullets: Bullet[] = [];
  private readonly enemies: Enemy[] = [];
  private kills = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  get killCount(): number {
    return this.kills;
  }

  get remainingEnemies(): number {
    return this.enemies.filter((enemy) => enemy.isAlive).length;
  }

  spawnEnemies(playerPosition: Phaser.Math.Vector2): void {
    this.enemies.length = 0;

    for (let index = 0; index < ENEMY.count; index += 1) {
      const spawn = this.findEnemySpawn(playerPosition);
      this.enemies.push(new Enemy(this.scene, spawn.x, spawn.y));
    }
  }

  tryShoot(player: Player): void {
    if (!player.canShoot()) {
      return;
    }

    const direction = player.aim;
    const muzzleX = player.position.x + direction.x * (player.radius + 14);
    const muzzleY = player.position.y + direction.y * (player.radius + 14);
    this.bullets.push(new Bullet(this.scene, muzzleX, muzzleY, direction));
    player.markShotFired();
  }

  update(deltaMs: number, player: Player, canEnemiesAttack: boolean): void {
    for (const bullet of this.bullets) {
      bullet.update(deltaMs);
    }

    for (const enemy of this.enemies) {
      enemy.update(deltaMs, player, canEnemiesAttack);
    }

    this.resolveBulletHits();
    this.removeInactiveEntities();
  }

  destroy(): void {
    for (const bullet of this.bullets) {
      bullet.destroy();
    }
    for (const enemy of this.enemies) {
      enemy.destroy();
    }
    this.bullets.length = 0;
    this.enemies.length = 0;
  }

  private resolveBulletHits(): void {
    for (const bullet of this.bullets) {
      if (!bullet.isActive) {
        continue;
      }

      for (const enemy of this.enemies) {
        if (!enemy.isAlive) {
          continue;
        }

        const hitDistance = bullet.radius + enemy.radius;
        const distanceSq = Phaser.Math.Distance.Squared(bullet.x, bullet.y, enemy.position.x, enemy.position.y);

        if (distanceSq <= hitDistance * hitDistance) {
          bullet.destroy();
          const enemyDied = enemy.takeDamage(BULLET.damage);
          if (enemyDied) {
            this.kills += 1;
          }
          break;
        }
      }
    }
  }

  private removeInactiveEntities(): void {
    for (let index = this.bullets.length - 1; index >= 0; index -= 1) {
      if (!this.bullets[index].isActive) {
        this.bullets.splice(index, 1);
      }
    }

    for (let index = this.enemies.length - 1; index >= 0; index -= 1) {
      if (this.enemies[index].isRemoved) {
        this.enemies.splice(index, 1);
      }
    }
  }

  private findEnemySpawn(playerPosition: Phaser.Math.Vector2): Phaser.Math.Vector2 {
    for (let attempt = 0; attempt < 80; attempt += 1) {
      const x = Phaser.Math.Between(ENEMY.radius + WORLD.padding, WORLD.width - ENEMY.radius - WORLD.padding);
      const y = Phaser.Math.Between(ENEMY.radius + WORLD.padding, WORLD.height - ENEMY.radius - WORLD.padding);
      const distance = Phaser.Math.Distance.Between(x, y, playerPosition.x, playerPosition.y);

      if (distance >= ENEMY.minimumSpawnDistanceFromPlayer) {
        return new Phaser.Math.Vector2(x, y);
      }
    }

    return new Phaser.Math.Vector2(WORLD.padding + ENEMY.radius, WORLD.padding + ENEMY.radius);
  }
}
