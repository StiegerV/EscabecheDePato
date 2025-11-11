export default class VictoryScene extends Phaser.Scene {
  constructor() {
    super('VictoryScene');
  }

  init(data) {
    this.stats = data.stats || {};
  }

  create() {
    const { width, height } = this.sys.game.canvas;

    // Música de victoria
    this.music = this.sound.add('victory', { volume: 0.5 });
    this.music.play();

    // Fondo estático
    this.background = this.add.image(0, 0, 'victory')
      .setOrigin(0)
      .setDisplaySize(window.innerWidth, window.innerHeight);

    // Título de victoria
    this.add.text(width / 2, 180, '🏆 ¡VICTORIA! 🏆', {
      fontSize: '64px',
      fill: '#ffd700',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 8,
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);

    // Mensaje de felicitación
    this.add.text(width / 2, 260, '¡Has completado todos los niveles!', {
      fontSize: '28px',
      fill: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Obtener datos del registry
    const finalScore = this.registry.get('score') || 0;
    const totalHits = this.registry.get('hits') || 0;
    const totalShots = this.registry.get('shots') || 0;
    const tiempoRestante = this.registry.get('tiempo') || 0;
    
    // Calcular precisión final
    const accuracy = totalShots > 0 ? ((totalHits / totalShots) * 100).toFixed(1) : 0;

    // Estadísticas finales - mejor espaciado
    const statsText = `Puntaje Final: ${finalScore}
Patos Derribados: ${totalHits}
Disparos Totales: ${totalShots}
Precisión: ${accuracy}%
Tiempo Restante: ${tiempoRestante} segundos`;

    this.add.text(width / 2, 380, statsText, {
      fontSize: '26px',
      fill: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      align: 'center',
      lineSpacing: 15,
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Botones de acción - mejor espaciado
    const buttonStyle = {
      fontSize: '24px',
      fill: '#00ff00',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#006600',
      padding: { x: 20, y: 10 },
      stroke: '#000000',
      strokeThickness: 2
    };

    // Jugar de nuevo
    const playAgainButton = this.add.text(width / 2, 520, '🔄 Jugar de Nuevo', buttonStyle)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.restartGame();
      })
      .on('pointerover', () => playAgainButton.setStyle({ 
        fill: '#ffffff', 
        backgroundColor: '#008800' 
      }))
      .on('pointerout', () => playAgainButton.setStyle({ 
        fill: '#00ff00', 
        backgroundColor: '#006600' 
      }));

    // Volver al menú
    const menuButton = this.add.text(width / 2, 580, '🏠 Menú Principal', {
      fontSize: '24px',
      fill: '#ffff00',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#666600',
      padding: { x: 20, y: 10 },
      stroke: '#000000',
      strokeThickness: 2
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.goToMenu();
      })
      .on('pointerover', () => menuButton.setStyle({ 
        fill: '#ffffff', 
        backgroundColor: '#888800' 
      }))
      .on('pointerout', () => menuButton.setStyle({ 
        fill: '#ffff00', 
        backgroundColor: '#666600' 
      }));

    // Animación sutil de botones
    this.tweens.add({
      targets: [playAgainButton, menuButton],
      scaleX: 1.02,
      scaleY: 1.02,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });

    // Controles de teclado
    this.input.keyboard.once('keydown-SPACE', () => {
      this.restartGame();
    });

    this.input.keyboard.once('keydown-ESC', () => {
      this.goToMenu();
    });

    // Texto de ayuda en la parte inferior
    this.add.text(width / 2, height - 30, 
      'ESPACIO: Jugar de Nuevo • ESC: Menú Principal', {
      fontSize: '16px',
      fill: '#cccccc',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);
  }

  restartGame() {
    if (this.music) {
      this.music.stop();
    }
    
    // Resetear completamente el juego
    this.registry.set('score', 0);
    this.registry.set('hits', 0);
    this.registry.set('ammo', 5);
    this.registry.set('shots', 0);
    this.registry.set('tiempo', 0);
    this.registry.set('currentLevel', 'Level1');
    
    // Limpiar todas las escenas
    const allScenes = ['Level1', 'Level2', 'Level3'];
    allScenes.forEach(sceneKey => {
      if (this.scene.isActive(sceneKey) || this.scene.isPaused(sceneKey)) {
        this.scene.stop(sceneKey);
      }
    });
    
    this.scene.start('Level1');
  }

  goToMenu() {
    if (this.music) {
      this.music.stop();
    }
    
    // Limpiar todas las escenas de nivel
    const levelScenes = ['Level1', 'Level2', 'Level3'];
    levelScenes.forEach(sceneKey => {
      if (this.scene.isActive(sceneKey) || this.scene.isPaused(sceneKey)) {
        this.scene.stop(sceneKey);
      }
    });

    // Resetear el registry
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