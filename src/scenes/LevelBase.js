import Duck from '../utils/Duck.js';
import Duck2 from '../utils/Duck2.js';
import Duck3 from '../utils/Duck3.js';
import Player from '../utils/Player.js';

//heredamos de phaser escene para tener acceso a create,preload,update e init
//ademas de manejar input audio animaciones y transiciones 
export default class LevelBase extends Phaser.Scene {
  //le pasamos una key al contructor para que sepa que escena va a extender
  constructor(key) {
    super(key);
    this.levelKey = key;
  }

  init(data = {}) {
    //detectamos si se viene de una partida cargada
    this.hasLoadedData =
      data.hasOwnProperty('loadedScore') ||
      data.hasOwnProperty('loadedHits') ||
      data.hasOwnProperty('loadedAmmo') ||
      data.hasOwnProperty('loadedShots');

    //almacenamos los valores que vengan en data o le clavamos 0 si no existen
    this.loadedScore = data.loadedScore ?? 0;
    this.loadedHits = data.loadedHits ?? 0;
    this.loadedAmmo = data.loadedAmmo ?? 5;
    this.loadedShots = data.loadedShots ?? 0;
    //guardamos la key del nivel actual en el registry para acceso global para saber en que nivel estamos
    this.registry.set('currentLevel', this.levelKey);
  }

  create(levelConfig) {
    const config = levelConfig;

    // ---------- Música ----------
    //creamos un objeto de audio con la musica sacada del config del nivel 
    this.music = this.sound.add(config.music, { volume: 0.2, loop: true });
    //y la reproducimos
    this.music.play();

    // ---------- Fondo ----------
    //imagen que cubre toda la pantalla 
    this.background = this.add.image(0, 0, config.background)
      //empieza desde la esquina superior izquierda
      .setOrigin(0)
      //se adapta al tamaño de la ventana
      .setDisplaySize(window.innerWidth, window.innerHeight);

    // ---------- Mira ----------
    this.crosshair = this.add.image(400, 300, 'crosshair')
      //modifica el tamaño
      .setScale(0.3)
      //esto hace que se renderize arriba de todo
      .setDepth(10);
    //actualizamos la posicion segun la posicion del mouse
    this.input.on('pointermove', (p) => this.crosshair.setPosition(p.x, p.y));

    // ---------- Patos ----------
    //hacemos un grupo para podeer manejarlos en conjunto 
    this.ducks = this.add.group();

    //evento que se repite cada cierto tiempo para spawnear patos
    this.time.addEvent({
      //sacamos el delay de la config del nivel
      delay: config.spawnDelay,
      callback: () => {
        //numero random para las chances de spawn
        const duckType = Phaser.Math.Between(1, 100);
        let duck;

        if (duckType <= 60) {
          // 60% - Pato normal
          duck = new Duck(this, Phaser.Math.Between(100, window.innerWidth - 100), 550, config.duckSpeed);
        } else if (duckType <= 85) {
          // 25% - Pato con escudo
          duck = new Duck2(this, Phaser.Math.Between(100, window.innerWidth - 100), 550, config.duckSpeed);
        } else {
          // 15% - Pato evasivo (gris)
          duck = new Duck3(this, Phaser.Math.Between(100, window.innerWidth - 100), 550, config.duckSpeed * 1.1);
        }

        this.ducks.add(duck);
      },
      loop: true,
    });

    // ---------- Jugador ----------
    //creamos el jugador , recibe la escena para poder interactuar
    this.player = new Player(this);

    // ---------- Animaciones ----------
    //definimos la animacion de los patos
    this.anims.create({
      //nombre de la animacion
      key: 'fly',
      //basando en los frames del spritesheet del pato
      frames: this.anims.generateFrameNumbers('duck', { start: 0, end: 3 }),
      //velocidad de la animacion
      frameRate: 15,
      //que se repita indefinidamente
      repeat: -1,
    });

    // ---------- HUD ----------
    // Crear textos con valores por defecto primero
    this.scoreText = this.add.text(20, 20, `Puntos: 0`, {
      fontSize: '24px',
      fill: '#000',
      fontFamily: 'Arial, sans-serif'
    });
    this.hitsText = this.add.text(20, 50, `Aciertos: 0`, {
      fontSize: '24px',
      fill: '#000',
      fontFamily: 'Arial, sans-serif'
    });
    this.ammoText = this.add.text(20, 80, `Balas: 5`, {
      fontSize: '24px',
      fill: '#000',
      fontFamily: 'Arial, sans-serif'
    });
    this.timerText = this.add.text(20, 110, `Tiempo: ${config.duration / 1000}`, {
      fontSize: '24px',
      fill: '#000',
      fontFamily: 'Arial, sans-serif'
    });

    // ---------- Registry DESPUeS de crear textos ----------
    this.registry.set('score', this.hasLoadedData ? this.loadedScore : this.registry.get('score') ?? 0);
    this.registry.set('hits', this.hasLoadedData ? this.loadedHits : this.registry.get('hits') ?? 0);
    this.registry.set('ammo', this.hasLoadedData ? this.loadedAmmo : this.registry.get('ammo') ?? 5);
    this.registry.set('shots', this.hasLoadedData ? this.loadedShots : this.registry.get('shots') ?? 0); 
    this.registry.set('tiempo', config.duration / 1000);

    // Actualizar textos con los valores iniciales del registry
    this.scoreText.setText(`Puntos: ${this.registry.get('score')}`);
    this.hitsText.setText(`Aciertos: ${this.registry.get('hits')}`);
    this.ammoText.setText(`Balas: ${this.registry.get('ammo')}`);
    this.timerText.setText(`Tiempo: ${this.registry.get('tiempo')}`);

    // ---------- Listener Registry ----------
    this.registry.events.on('changedata', (parent, key, value) => {
      // Verificar que los textos existen antes de actualizar
      if (!this.scoreText || !this.hitsText || !this.ammoText || !this.timerText) {
        return;
      }
        //segun el key que haya cambiado actualizamos el texto correspondiente
      switch (key) {
        case 'score':
          this.scoreText.setText(`Puntos: ${value}`);
          break;
        case 'hits':
          this.hitsText.setText(`Aciertos: ${value}`);
          break;
        case 'ammo':
          this.ammoText.setText(`Balas: ${value}`);
          break;
        case 'tiempo':
          this.timerText.setText(`Tiempo: ${value}`);
          break;
      }
    });

    // ---------- Temporizador ----------
    //par que se vea por segundos
    this.levelTime = config.duration / 1000;
    this.timerEvent = this.time.addEvent({
      //cada 1 segundo
      delay: 1000,
      callback: () => {
        this.levelTime--;
        this.registry.set('tiempo', this.levelTime);
        if (this.levelTime <= 0) this.endLevel();
      },
      loop: true,
    });

    // ---------- Pausa con ESC ----------
    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.pause();
      this.scene.launch('PauseScene', {
        previousScene: this.scene.key,
        //le pasamos los datos a la pausa
        stats: {
          score: this.registry.get('score'),
          hits: this.registry.get('hits'),
          ammo: this.registry.get('ammo'),
          tiempo: this.registry.get('tiempo'),
        },
      });
    });
  }

  // ---------- Fin de nivel ----------
  endLevel() {
    // Limpiar eventos y listeners
    if (this.timerEvent) this.timerEvent.remove(false);
    if (this.music) this.music.stop();

    // Remover listener del registry
    if (this.registry.events) {
      this.registry.events.off('changedata');
    }

    const stats = {
      hits: this.registry.get('hits'),
      score: this.registry.get('score'),
      tiempo: this.registry.get('tiempo'),
    };

    this.scene.stop();
    //le pasamos stats para que los muestre en gameover
    this.scene.start('GameOverScene', { stats });
  }

  // ---------- Comprobar objetivo de puntuacion ----------
  checkLevelCompletion(targetScore, nextScene) {
    if (this.registry.get('score') >= targetScore) {
      if (this.music) this.music.stop();

      // Limpiar listener del registry
      if (this.registry.events) {
        this.registry.events.off('changedata');
      }

      // Obtener datos REALES del registry y calcular precisión
      const hits = this.registry.get('hits') || 0;
      const shots = this.registry.get('shots') || 0;
      const accuracy = shots > 0 ? (hits / shots) * 100 : 0;

      this.scene.start('LevelTransitionScene', {
        levelNumber: parseInt(this.levelKey.replace('Level', '')),
        nextScene,
        stats: {
          hits: hits,
          shots: shots,
          accuracy: accuracy,
          timeLeft: this.levelTime,
          score: this.registry.get('score') // Pasar score tambien por si acaso
        },
      });
    }
  }

  update() {
    // Cada nivel puede sobrescribir y llamar checkLevelCompletion()
  }

  // Método para limpiar recursos cuando la escena se apaga
  shutdown() {
    // Limpiar listeners
    if (this.registry.events) {
      this.registry.events.off('changedata');
    }

    if (this.input && this.input.keyboard) {
      this.input.keyboard.off('keydown-ESC');
    }

    if (this.music) {
      this.music.stop();
    }

    if (this.timerEvent) {
      this.timerEvent.remove();
    }
  }
}