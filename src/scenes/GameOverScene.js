export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  init(data) {
    this.stats = data.stats || {};
  }

  create() {
    const { width, height } = this.sys.game.canvas;

    // Música de game over
    this.music = this.sound.add('gameover', { volume: 0.5 });
    this.music.play();

    this.background = this.add.image(0, 0, 'gameOver')
      .setOrigin(0)
      .setDisplaySize(window.innerWidth, window.innerHeight);

    // Título
    this.add.text(width / 2, height / 2 - 200, '🎯 GAME OVER 🎯', {
      fontSize: '56px',
      fill: '#ff4444',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6,
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);

    // Obtener datos del registry
    const score = this.registry.get('score') || 0;
    const hits = this.registry.get('hits') || 0;
    const shots = this.registry.get('shots') || 0;
    const tiempo = this.registry.get('tiempo') || 0;
    
    // Calcular precisión
    const accuracy = shots > 0 ? ((hits / shots) * 100).toFixed(1) : 0;

    // Estadísticas completas
    const textStyle = {
      fontSize: '24px',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      fontFamily: 'Arial, sans-serif',
      align: 'center'
    };

    const statsText = `
Puntaje total: ${score}
Patos acertados: ${hits}
Disparos realizados: ${shots}
Precisión: ${accuracy}%
Tiempo restante: ${tiempo} segundos
    `;

    this.add.text(width / 2, height / 2 - 50, statsText, {
      fontSize: '26px',
      fill: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      align: 'center',
      lineSpacing: 10
    }).setOrigin(0.5);

    // Botones de acción
    const buttonStyle = {
      fontSize: '22px',
      fill: '#ffff00',
      fontFamily: 'Arial, sans-serif'
    };

    // Reiniciar nivel actual
    const restartButton = this.add.text(width / 2, height / 2 + 100, '🔄 Reiniciar Nivel Actual', buttonStyle)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.restartCurrentLevel();
      })
      .on('pointerover', () => restartButton.setStyle({ fill: '#ffffff' }))
      .on('pointerout', () => restartButton.setStyle({ fill: '#ffff00' }));

    // Volver al menú
    const menuButton = this.add.text(width / 2, height / 2 + 150, '🏠 Volver al Menú', buttonStyle)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.goToMenu();
      })
      .on('pointerover', () => menuButton.setStyle({ fill: '#ffffff' }))
      .on('pointerout', () => menuButton.setStyle({ fill: '#ffff00' }));

    // Animación de botones
    this.tweens.add({
      targets: [restartButton, menuButton],
      alpha: { from: 1, to: 0.7 },
      duration: 1000,
      yoyo: true,
      repeat: -1
    });

    // Controles de teclado
    this.input.keyboard.once('keydown-SPACE', () => {
      this.restartCurrentLevel();
    });

    this.input.keyboard.once('keydown-ESC', () => {
      this.goToMenu();
    });

    // Texto de ayuda
    this.add.text(width / 2, height - 50, 
      'ESPACIO: Reiniciar • ESC: Menú', {
      fontSize: '16px',
      fill: '#aaaaaa',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);
  }

  restartCurrentLevel() {
    if (this.music) {
      this.music.stop();
    }
    
    // Obtener el nivel actual del registry o usar Level1 por defecto
    const currentLevel = this.registry.get('currentLevel') || 'Level1';
    
    // Resetear stats para el nuevo intento
    this.registry.set('ammo', 5);
    this.registry.set('hits', 0);
    this.registry.set('shots', 0);
    // Mantener el score acumulado o resetearlo según prefieras
    // this.registry.set('score', 0); // Descomenta si quieres resetear el score
    
    this.scene.start(currentLevel);
  }

  goToMenu() {
    if (this.music) {
      this.music.stop();
    }
    
    // Limpiar todas las escenas de nivel
    const levelScenes = ['Level1', 'Level2', 'Level3', 'Level4', 'Level5'];
    levelScenes.forEach(sceneKey => {
      if (this.scene.isActive(sceneKey) || this.scene.isPaused(sceneKey)) {
        this.scene.stop(sceneKey);
      }
    });

    // Resetear el registry para nuevo juego
    this.registry.set('score', 0);
    this.registry.set('hits', 0);
    this.registry.set('ammo', 5);
    this.registry.set('shots', 0);
    this.registry.set('tiempo', 0);
    
    this.scene.start('MenuScene');
  }

  shutdown() {
    if (this.music) {
      this.music.stop();
    }
    
    // Limpiar eventos de teclado
    if (this.input.keyboard) {
      this.input.keyboard.off('keydown-SPACE');
      this.input.keyboard.off('keydown-ESC');
    }
  }
}