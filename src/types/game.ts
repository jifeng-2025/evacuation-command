export type MovementKeys = {
  w: Phaser.Input.Keyboard.Key;
  a: Phaser.Input.Keyboard.Key;
  s: Phaser.Input.Keyboard.Key;
  d: Phaser.Input.Keyboard.Key;
  r: Phaser.Input.Keyboard.Key;
};

export type GamePhase = 'SEARCH_INTEL' | 'EXTRACT' | 'EXTRACTING' | 'SUCCESS' | 'FAILED';

export type FailureReason = 'death' | 'timeout';

export type MissionSnapshot = {
  phase: GamePhase;
  hasIntel: boolean;
  remainingMs: number;
  extractionProgress: number;
};
