//escena intermedia entre el arranque del juego y la carga de assets
export default class BootScene extends Phaser.Scene {
  constructor() {
    //le asignamos un identificador a la escena para poder lanzarla desde donde sea
    super({ key: 'BootScene' });
  }
  preload() {
 
  }
  create() {
    //esto desactiva bootscene automaticamente y lanza preloadscene
    //utiliza scenemanager
    this.scene.start('PreloadScene');
  }
}
