import LevelTransitionScene from './scenes/LevelTransitionScene.js';
import HUDScene from './scenes/HUDScene.js';
import PreloadScene from './scenes/PreloadScene.js';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import Level1 from './scenes/Level1.js';
import Level2 from './scenes/Level2.js';
import Level3 from './scenes/Level3.js';
import GameOverScene from './scenes/GameOverScene.js';
import PauseScene from './scenes/PauseScene.js';
import VictoryScene from './scenes/VictoryScene.js';

export default   {
  width: window.innerWidth,
  height: window.innerHeight,
  parent: 'game-container',
  backgroundColor: '#000000',
  physics: {
    default: 'arcade'
  },
  scene: [BootScene,PreloadScene,MenuScene,Level1, Level2, Level3,HUDScene,PauseScene,LevelTransitionScene,GameOverScene,VictoryScene]
};
