import Phaser from 'phaser';
import { COLORS, ENEMY, WORLD } from '../config/gameConfig';
import { Player } from '../entities/Player';
import { CombatSystem } from '../systems/CombatSystem';
import { Hud } from '../systems/Hud';
import type { CombatResult, MovementKeys } from '../types/game';

export class MainScene extends Phaser.Scene {
  private player!: Player;
  private combat!: CombatSystem;
  private hud!: Hud;
  private keys!: MovementKeys;
  private result: CombatResult = 'playing';

  constructor() {
    super('MainScene');
  }

  create(): void {
    this.result = 'playing';
    this.cameras.main.setBounds(0, 0, WORLD.width, WORLD.height);

    this.drawBackground();
    this.keys = this.createInput();
    this.player = new Player(this);
    this.combat = new CombatSystem(this);
    this.combat.spawnEnemies(this.player.position);
    this.hud = new Hud(this);
    this.hud.update(this.player.healthPoints, this.combat.killCount, this.combat.remainingEnemies);
  }

  update(_time: number, delta: number): void {
    if (Phaser.Input.Keyboard.JustDown(this.keys.r)) {
      this.scene.restart();
      return;
    }

    const isPlaying = this.result === 'playing';
    this.player.update(delta, this.keys, this.input.activePointer, isPlaying);

    if (isPlaying && this.input.activePointer.isDown) {
      this.combat.tryShoot(this.player);
    }

    this.combat.update(delta, this.player, isPlaying && this.player.isAlive);
    this.updateResult();
    this.hud.update(this.player.healthPoints, this.combat.killCount, this.combat.remainingEnemies);
  }

  private updateResult(): void {
    if (this.result !== 'playing') {
      return;
    }

    if (!this.player.isAlive) {
      this.result = 'defeat';
      this.hud.showResult(this, this.result, this.combat.killCount);
      return;
    }

    if (this.combat.killCount >= ENEMY.count) {
      this.result = 'victory';
      this.hud.showResult(this, this.result, this.combat.killCount);
    }
  }

  private drawBackground(): void {
    const background = this.add.graphics();
    background.fillStyle(COLORS.background, 1);
    background.fillRect(0, 0, WORLD.width, WORLD.height);

    background.lineStyle(2, COLORS.border, 1);
    background.strokeRect(WORLD.padding, WORLD.padding, WORLD.width - WORLD.padding * 2, WORLD.height - WORLD.padding * 2);

    background.lineStyle(1, COLORS.grid, 0.6);
    for (let x = 0; x <= WORLD.width; x += WORLD.gridSize) {
      background.lineBetween(x, 0, x, WORLD.height);
    }
    for (let y = 0; y <= WORLD.height; y += WORLD.gridSize) {
      background.lineBetween(0, y, WORLD.width, y);
    }
  }

  private createInput(): MovementKeys {
    const keyboard = this.input.keyboard;

    if (!keyboard) {
      throw new Error('Keyboard input is unavailable in this environment.');
    }

    return keyboard.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      r: Phaser.Input.Keyboard.KeyCodes.R,
    }) as MovementKeys;
  }
}
