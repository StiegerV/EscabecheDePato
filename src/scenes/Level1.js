import LevelBase from './LevelBase.js';
import LevelConfig from '../utils/LevelConfig.js';

export default class Level1 extends LevelBase {
  constructor() { super('Level1'); }

  create() {
    super.create(LevelConfig[0]);
  }

  update() {
    this.checkLevelCompletion(LevelConfig[0].targetScore, 'Level2');
  }
}


/*import Duck from '../utils/Duck.js';
import Player from '../utils/Player.js';
import LevelConfig from '../utils/LevelConfig.js';

export default class Level1 extends Phaser.Scene {
  constructor() {
    super('Level1');
  }

  init(data = {}) {
    this.hasLoadedData =
      Object.prototype.hasOwnProperty.call(data, 'loadedScore') ||
      Object.prototype.hasOwnProperty.call(data, 'loadedHits') ||
      Object.prototype.hasOwnProperty.call(data, 'loadedAmmo');

    this.loadedScore = data.loadedScore;
    this.loadedHits = data.loadedHits;
    this.loadedAmmo = data.loadedAmmo;
  }

  create() {
    const config = LevelConfig[0];

    // 🔹 Score acumulativo
    const totalScore = this.hasLoadedData
      ? (this.loadedScore ?? this.registry.get('score') ?? 0)
      : (this.registry.get('score') ?? 0);
    this.registry.set('score', totalScore);
    this.registry.set('hits', this.loadedHits ?? this.registry.get('hits') ?? 0);
    this.registry.set('ammo', this.loadedAmmo ?? this.registry.get('ammo') ?? 5);
    this.registry.set('tiempo', config.duration / 1000);

    // --- Música ---
    this.music = this.sound.add(config.music, { volume: 0.1, loop: true });
    this.music.play();

    // --- Fondo ---
    this.background = this.add
      .image(0, 0, config.background)
      .setOrigin(0)
      .setDisplaySize(window.innerWidth, window.innerHeight);

    // --- Mira ---
    this.crosshair = this.add.image(400, 300, 'crosshair').setScale(0.3).setDepth(10);
    this.input.on('pointermove', (p) => this.crosshair.setPosition(p.x, p.y));

    // --- Patos ---
    this.ducks = this.add.group();
    this.time.addEvent({
      delay: config.spawnDelay,
      loop: true,
      callback: () => {
        const duck = new Duck(
          this,
          Phaser.Math.Between(100, window.innerWidth - window.innerWidth * 0.15),
          550,
          config.duckSpeed
        );
        this.ducks.add(duck);
      }
    });

    // --- Jugador ---
    this.player = new Player(this);

    // --- Animación ---
    this.anims.create({
      key: 'fly',
      frames: this.anims.generateFrameNumbers('duck', { start: 0, end: 3 }),
      frameRate: 15,
      repeat: -1,
    });

    // --- HUD ---
    if (!this.scene.isActive('HudScene')) this.scene.launch('HudScene');

    // --- Temporizador ---
    this.levelTime = config.duration / 1000;
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        this.levelTime--;
        this.registry.set('tiempo', this.levelTime);
        if (this.levelTime <= 0) this.endLevel();
      }
    });

    // --- Pausa con ESC ---
    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.pause();
      this.scene.launch('PauseScene', {
        previousScene: this.scene.key,
        stats: {
          score: this.registry.get('score'),
          hits: this.registry.get('hits'),
          ammo: this.registry.get('ammo'),
          tiempo: this.registry.get('tiempo'),
        },
      });
    });
  }

  endLevel() {
    if (this.timerEvent) this.timerEvent.remove(false);
    this.music.stop();
    const stats = {
      hits: this.registry.get('hits'),
      score: this.registry.get('score'),
      tiempo: this.registry.get('tiempo'),
    };
    this.scene.stop('HudScene');
    this.scene.start('GameOverScene', { stats });
  }

  update() {
    const score = this.registry.get('score');
    if (score >= LevelConfig[0].targetScore) {
      this.music.stop();
      this.scene.stop('HudScene');
      this.scene.start('LevelTransitionScene', {
        levelNumber: 1,
        nextScene: 'Level2',
        stats: {
          hits: this.player.hits,
          shots: this.player.shots,
          accuracy: (this.player.hits / this.player.shots) * 100 || 0,
          timeLeft: this.levelTime,
          score: this.registry.get('score')  // pasar score acumulado
        },
      });
    }
  }
}*/
