//preparamos todos los assets del juego para que esten disponibles en memoria
export default class PreloadScene extends Phaser.Scene {
  constructor() { super({ key: 'PreloadScene' }); }
  //cargamos todos los recursos externos evita llamadas http  ineficientes durante el juego
  //utiliza Phaser.Loader.LoaderPlugin se cargan en una cola 
  preload() {
    //cargamos las imagenes asignamos key y ruta 
    this.load.image('background1', 'assets/images/background.png');
    this.load.image('background2', 'assets/images/background2.png');
    this.load.image('background3', 'assets/images/background3.png');
    this.load.image('menuBackground', 'assets/images/menuBackground.png');
    this.load.image('gameOver', 'assets/images/gameover.png');
    this.load.image('victory', 'assets/images/victory.png');
    this.load.image('crosshair', 'assets/images/crosshair.png');

    //cargamos spritesheets ,key,ruta,y configuracion de frame(el total dividido en filas y columnas 128x128)
    this.load.spritesheet('duck', 'assets/images/duck.png', { frameWidth: 640 / 5, frameHeight: 128 });

    //cargamos sonidos , key y ruta
    //AudioManager
    this.load.audio('shot', 'assets/sounds/shot.mp3');
    this.load.audio('hit', 'assets/sounds/quack.mp3');
    this.load.audio('reload', 'assets/sounds/reload.mp3');
    this.load.audio('bolt', 'assets/sounds/bolt.mp3');
    this.load.audio('level1music', 'assets/sounds/level1.mp3');
    this.load.audio('level2music', 'assets/sounds/level2.mp3');
    this.load.audio('level3music', 'assets/sounds/level3.mp3');
    this.load.audio('gameover', 'assets/sounds/gamover.mp3');
    this.load.audio('victory', 'assets/sounds/victory.mp3');

  }
  //solo se llama una vez se termina toda la cola
  create() {
    this.scene.start('MenuScene');
  }
}
