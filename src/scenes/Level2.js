import LevelBase from './LevelBase.js';
import LevelConfig from '../utils/LevelConfig.js';

export default class Level2 extends LevelBase {
  constructor() {
    super('Level2');
  }

  create() {
    super.create(LevelConfig[1]);
  }

  update() {
    this.checkLevelCompletion(LevelConfig[1].targetScore, 'Level3');
  }
}


/*import Duck from '../utils/Duck.js';
import Player from '../utils/Player.js';
import LevelConfig from '../utils/LevelConfig.js';

export default class Level2 extends Phaser.Scene {
  constructor() {
    super('Level2');
  }

  init(data = {}) {
    this.hasLoadedData =
      Object.prototype.hasOwnProperty.call(data, 'stats');
    if (this.hasLoadedData) {
      this.loadedScore = data.stats.score;
      this.loadedHits = data.stats.hits;
      this.loadedAmmo = data.stats.ammo;
    }
  }

  create() {
    const config = LevelConfig[1];

    const totalScore = this.hasLoadedData
      ? (this.loadedScore ?? this.registry.get('score') ?? 0)
      : (this.registry.get('score') ?? 0);
    this.registry.set('score', totalScore);
    this.registry.set('hits', this.loadedHits ?? this.registry.get('hits') ?? 0);
    this.registry.set('ammo', this.loadedAmmo ?? this.registry.get('ammo') ?? 5);
    this.registry.set('tiempo', config.duration / 1000);

    this.music = this.sound.add(config.music, { volume: 0.2, loop: true });
    this.music.play();

    this.background = this.add
      .image(0, 0, config.background)
      .setOrigin(0)
      .setDisplaySize(window.innerWidth, window.innerHeight);

    this.crosshair = this.add.image(400, 300, 'crosshair').setScale(0.3).setDepth(10);
    this.input.on('pointermove', (p) => this.crosshair.setPosition(p.x, p.y));

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

    this.player = new Player(this);

    this.anims.create({
      key: 'fly',
      frames: this.anims.generateFrameNumbers('duck', { start: 0, end: 3 }),
      frameRate: 15,
      repeat: -1,
    });

    if (!this.scene.isActive('HudScene')) this.scene.launch('HudScene');

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
    if (score >= LevelConfig[1].targetScore) {
      this.music.stop();
      this.scene.stop('HudScene');
      this.scene.start('LevelTransitionScene', {
        levelNumber: 2,
        nextScene: 'Level3',
        stats: {
          hits: this.player.hits,
          shots: this.player.shots,
          accuracy: (this.player.hits / this.player.shots) * 100 || 0,
          timeLeft: this.levelTime,
          score: this.registry.get('score')
        },
      });
    }
  }
}*/
