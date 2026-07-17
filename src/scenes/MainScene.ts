import Phaser from 'phaser';
import { COLORS, WORLD } from '../config/gameConfig';
import { Player } from '../entities/Player';
import { CombatSystem } from '../systems/CombatSystem';
import { Hud } from '../systems/Hud';
import { MissionSystem } from '../systems/MissionSystem';
import type { MovementKeys } from '../types/game';

export class MainScene extends Phaser.Scene {
  private player!: Player;
  private combat!: CombatSystem;
  private mission!: MissionSystem;
  private hud!: Hud;
  private keys!: MovementKeys;
  private resultShown = false;

  constructor() { super('MainScene'); }

  create(): void {
    this.resultShown = false;
    this.cameras.main.setBounds(0, 0, WORLD.width, WORLD.height);
    this.drawBackground();
    this.keys = this.createInput();
    this.player = new Player(this);
    this.combat = new CombatSystem(this);
    this.combat.spawnEnemies(this.player.position);
    this.mission = new MissionSystem(this);
    this.hud = new Hud(this);
    this.refreshHud();
  }

  update(_time: number, delta: number): void {
    if (Phaser.Input.Keyboard.JustDown(this.keys.r)) {
      this.combat.stopReinforcements();
      this.scene.restart();
      return;
    }
    const playing = !this.mission.isFinished;
    this.player.update(delta, this.keys, this.input.activePointer, playing);
    if (playing && this.input.activePointer.isDown) this.combat.tryShoot(this.player);
    this.combat.update(delta, this.player, playing && this.player.isAlive);

    const intelJustCollected = this.mission.update(delta, this.player);
    if (intelJustCollected) this.combat.enableReinforcements();
    if (this.mission.isFinished) {
      this.combat.stopReinforcements();
      this.showResult();
    }
    this.refreshHud();
  }

  private showResult(): void {
    if (this.resultShown) return;
    this.resultShown = true;
    const snapshot = this.mission.snapshot;
    this.hud.showResult(this, snapshot.phase === 'SUCCESS' ? 'SUCCESS' : 'FAILED', this.combat.killCount, this.mission.failureReason);
  }

  private refreshHud(): void {
    this.hud.update(this.player.healthPoints, this.combat.killCount, this.combat.remainingEnemies, this.mission.snapshot);
  }

  private drawBackground(): void {
    const background = this.add.graphics().fillStyle(COLORS.background, 1).fillRect(0, 0, WORLD.width, WORLD.height);
    background.lineStyle(2, COLORS.border, 1).strokeRect(WORLD.padding, WORLD.padding, WORLD.width - WORLD.padding * 2, WORLD.height - WORLD.padding * 2);
    background.lineStyle(1, COLORS.grid, 0.6);
    for (let x = 0; x <= WORLD.width; x += WORLD.gridSize) background.lineBetween(x, 0, x, WORLD.height);
    for (let y = 0; y <= WORLD.height; y += WORLD.gridSize) background.lineBetween(0, y, WORLD.width, y);
  }

  private createInput(): MovementKeys {
    if (!this.input.keyboard) throw new Error('Keyboard input is unavailable in this environment.');
    return this.input.keyboard.addKeys({ w: Phaser.Input.Keyboard.KeyCodes.W, a: Phaser.Input.Keyboard.KeyCodes.A, s: Phaser.Input.Keyboard.KeyCodes.S, d: Phaser.Input.Keyboard.KeyCodes.D, r: Phaser.Input.Keyboard.KeyCodes.R }) as MovementKeys;
  }
}
