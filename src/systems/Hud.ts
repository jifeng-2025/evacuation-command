import Phaser from 'phaser';
import { WORLD } from '../config/gameConfig';
import type { FailureReason, GamePhase, MissionSnapshot } from '../types/game';

export class Hud {
  private readonly statusText: Phaser.GameObjects.Text;
  private resultText?: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.statusText = scene.add.text(24, 24, '', {
      color: '#e5e7eb', fontFamily: 'Arial, "Microsoft YaHei", sans-serif', fontSize: '17px', lineSpacing: 5,
    }).setDepth(100);
  }

  update(health: number, kills: number, aliveEnemies: number, mission: MissionSnapshot): void {
    const seconds = Math.max(0, Math.ceil(mission.remainingMs / 1000));
    const time = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
    this.statusText.setText([
      'Evacuation Command',
      `生命值：${health}/100  ·  击杀数：${kills}  ·  当前存活敌人：${aliveEnemies}`,
      `当前任务：${this.objective(mission.phase)}`,
      `情报：${mission.hasIntel ? '已取得' : '未取得'}  ·  剩余时间：${time}`,
      `撤离进度：${Math.round(mission.extractionProgress * 100)}%`,
      '操作：WASD移动 · 鼠标瞄准 · 左键射击 · R重新开始',
    ].join('\n'));
  }

  showResult(scene: Phaser.Scene, phase: 'SUCCESS' | 'FAILED', kills: number, failureReason?: FailureReason): void {
    if (this.resultText) return;
    const title = phase === 'SUCCESS' ? '撤离成功' : failureReason === 'timeout' ? '任务超时，撤离失败' : '失败：玩家生命值归零';
    scene.add.rectangle(WORLD.width / 2, WORLD.height / 2, WORLD.width, WORLD.height, 0x020617, 0.68).setDepth(200);
    this.resultText = scene.add.text(WORLD.width / 2, WORLD.height / 2, `${title}\n本局击杀数：${kills}\n按 R 重新开始`, {
      align: 'center', color: phase === 'SUCCESS' ? '#99f6e4' : '#fecaca',
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif', fontSize: '32px', lineSpacing: 14,
    }).setOrigin(0.5).setDepth(201);
  }

  private objective(phase: GamePhase): string {
    if (phase === 'SEARCH_INTEL') return '前往地图中部获取情报';
    if (phase === 'EXTRACTING') return '正在撤离，请坚守区域';
    if (phase === 'EXTRACT') return '情报已获取，前往右上角撤离点';
    return phase === 'SUCCESS' ? '撤离完成' : '任务失败';
  }
}
