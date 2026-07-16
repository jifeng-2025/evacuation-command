export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

export const WORLD = {
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  padding: 16,
  gridSize: 48,
} as const;

export const PLAYER = {
  radius: 18,
  speed: 260,
  maxHealth: 100,
  damageFlashMs: 140,
  muzzleFlashMs: 70,
  shootCooldownMs: 260,
} as const;

export const BULLET = {
  radius: 5,
  speed: 560,
  damage: 25,
  maxLifetimeMs: 1600,
} as const;

export const ENEMY = {
  count: 5,
  radius: 16,
  speed: 90,
  maxHealth: 50,
  detectionRange: 360,
  attackRange: 34,
  attackDamage: 15,
  attackCooldownMs: 850,
  hitFlashMs: 120,
  deathFadeMs: 180,
  minimumSpawnDistanceFromPlayer: 230,
} as const;

export const COLORS = {
  background: 0x0b1020,
  border: 0x1e293b,
  grid: 0x172033,
  player: 0x3b82f6,
  playerStroke: 0xbfdbfe,
  playerDamage: 0xef4444,
  enemy: 0xdc2626,
  enemyStroke: 0xfca5a5,
  enemyHit: 0xffffff,
  bullet: 0xfacc15,
  bulletStroke: 0xfef3c7,
  muzzle: 0xf97316,
  overlay: 0x020617,
  particle: 0xf87171,
} as const;
