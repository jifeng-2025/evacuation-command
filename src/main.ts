import Phaser from 'phaser';
import { MainScene } from './scenes/MainScene';
import './styles/global.css';

const GAME_WIDTH = 960;
const GAME_HEIGHT = 540;

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#0b1020',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [MainScene],
};

new Phaser.Game(config);
