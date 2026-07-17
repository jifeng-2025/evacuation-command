import Phaser from 'phaser';
import { COLORS, MISSION } from '../config/gameConfig';
import { Player } from '../entities/Player';
import type { FailureReason, GamePhase, MissionSnapshot } from '../types/game';

export class MissionSystem {
  private readonly scene: Phaser.Scene;
  private readonly intelView: Phaser.GameObjects.Graphics;
  private readonly extractionView: Phaser.GameObjects.Graphics;
  private phaseValue: GamePhase = 'SEARCH_INTEL';
  private remainingMsValue: number = MISSION.durationMs;
  private extractionElapsedMs = 0;
  private intelCollected = false;
  private pickupNotice?: Phaser.GameObjects.Text;
  private failureReasonValue?: FailureReason;
  private pulseElapsedMs = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.extractionView = scene.add.graphics().setDepth(5);
    this.intelView = scene.add.graphics({ x: MISSION.intelX, y: MISSION.intelY }).setDepth(10);
    this.drawIntel(0);
    this.drawExtraction();
  }

  get isFinished(): boolean {
    return this.phaseValue === 'SUCCESS' || this.phaseValue === 'FAILED';
  }

  get hasIntel(): boolean {
    return this.intelCollected;
  }

  get failureReason(): FailureReason | undefined {
    return this.failureReasonValue;
  }

  get snapshot(): MissionSnapshot {
    return {
      phase: this.phaseValue,
      hasIntel: this.intelCollected,
      remainingMs: this.remainingMsValue,
      extractionProgress: Phaser.Math.Clamp(this.extractionElapsedMs / MISSION.extractionDurationMs, 0, 1),
    };
  }

  update(deltaMs: number, player: Player): boolean {
    if (this.isFinished) {
      return false;
    }

    this.remainingMsValue = Math.max(0, this.remainingMsValue - deltaMs);
    if (this.remainingMsValue <= 0) {
      this.fail('timeout');
      return false;
    }
    if (!player.isAlive) {
      this.fail('death');
      return false;
    }

    this.pulseElapsedMs += deltaMs;
    if (!this.intelCollected) {
      this.drawIntel(this.pulseElapsedMs);
      if (Phaser.Math.Distance.Between(player.position.x, player.position.y, MISSION.intelX, MISSION.intelY) <= MISSION.intelPickupRadius + player.radius) {
        this.collectIntel();
        return true;
      }
      return false;
    }

    this.drawExtraction();
    const inside = Phaser.Geom.Rectangle.Contains(this.extractionBounds(), player.position.x, player.position.y);
    if (inside) {
      this.phaseValue = 'EXTRACTING';
      this.extractionElapsedMs = Math.min(MISSION.extractionDurationMs, this.extractionElapsedMs + deltaMs);
      if (this.extractionElapsedMs >= MISSION.extractionDurationMs) {
        this.phaseValue = 'SUCCESS';
      }
    } else {
      this.phaseValue = 'EXTRACT';
      this.extractionElapsedMs = 0;
    }
    return false;
  }

  private collectIntel(): void {
    if (this.intelCollected) return;
    this.intelCollected = true;
    this.phaseValue = 'EXTRACT';
    this.intelView.destroy();
    this.pickupNotice = this.scene.add.text(MISSION.intelX, MISSION.intelY - 42, '情报已获取！撤离点已激活', {
      color: '#fef08a', fontFamily: 'Arial, "Microsoft YaHei", sans-serif', fontSize: '22px',
    }).setOrigin(0.5).setDepth(110);
    this.scene.tweens.add({ targets: this.pickupNotice, y: MISSION.intelY - 76, alpha: 0, duration: 1200, onComplete: () => this.pickupNotice?.destroy() });
    this.drawExtraction();
  }

  private fail(reason: FailureReason): void {
    this.failureReasonValue = reason;
    this.phaseValue = 'FAILED';
    this.extractionElapsedMs = 0;
  }

  private extractionBounds(): Phaser.Geom.Rectangle {
    return new Phaser.Geom.Rectangle(MISSION.extractionX - MISSION.extractionWidth / 2, MISSION.extractionY - MISSION.extractionHeight / 2, MISSION.extractionWidth, MISSION.extractionHeight);
  }

  private drawIntel(elapsedMs: number): void {
    const scale = 1 + Math.sin(elapsedMs / 220) * 0.12;
    this.intelView.clear();
    this.intelView.fillStyle(COLORS.intel, 0.2).fillCircle(0, 0, 28 * scale);
    this.intelView.fillStyle(COLORS.intel, 1);
    this.intelView.fillPoints([{ x: 0, y: -14 }, { x: 14, y: 0 }, { x: 0, y: 14 }, { x: -14, y: 0 }], true);
  }

  private drawExtraction(): void {
    const active = this.intelCollected;
    const alpha = active ? 0.35 + (Math.sin(this.pulseElapsedMs / 250) + 1) * 0.12 : 0.18;
    const bounds = this.extractionBounds();
    this.extractionView.clear().fillStyle(active ? COLORS.extractionActive : COLORS.extractionLocked, alpha).fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
    this.extractionView.lineStyle(active ? 4 : 2, active ? COLORS.extractionActive : COLORS.extractionLocked, 0.9).strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
  }
}
