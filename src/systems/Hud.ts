import Phaser from 'phaser';
import { WORLD } from '../config/gameConfig';
import type { CombatResult } from '../types/game';

export class Hud {
  private readonly statusText: Phaser.GameObjects.Text;
  private overlay?: Phaser.GameObjects.Rectangle;
  private resultText?: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.statusText = scene.add
      .text(24, 24, '', {
        color: '#e5e7eb',
        fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
        fontSize: '18px',
        lineSpacing: 7,
      })
      .setDepth(100);
  }

  update(health: number, kills: number, remainingEnemies: number): void {
    this.statusText.setText(
      [
        'Evacuation Command',
        `生命值：${health}/100`,
        `击杀数：${kills}`,
        `剩余敌人：${remainingEnemies}`,
        '操作：WASD移动 · 鼠标瞄准 · 左键射击 · R重新开始',
      ].join('\n'),
    );
  }

  showResult(scene: Phaser.Scene, result: Exclude<CombatResult, 'playing'>, kills: number): void {
    if (this.resultText) {
      return;
    }

    const isVictory = result === 'victory';
    const title = isVictory ? '成功：所有敌人已被消灭' : '失败：玩家生命值归零';
    const color = isVictory ? '#bbf7d0' : '#fecaca';

    this.overlay = scene.add
      .rectangle(WORLD.width / 2, WORLD.height / 2, WORLD.width, WORLD.height, 0x020617, 0.68)
      .setDepth(200);
    this.resultText = scene.add
      .text(WORLD.width / 2, WORLD.height / 2, `${title}\n本局击杀数：${kills}\n按 R 重新开始`, {
        align: 'center',
        color,
        fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
        fontSize: '32px',
        lineSpacing: 14,
      })
      .setOrigin(0.5)
      .setDepth(201);
  }

  destroy(): void {
    this.statusText.destroy();
    this.overlay?.destroy();
    this.resultText?.destroy();
  }
}
