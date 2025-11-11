export default class Duck extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, baseSpeed) {
    super(scene, x, y, 'duck');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.play('fly');

    const velX = Phaser.Math.Between(-baseSpeed, baseSpeed);
    const velY = Phaser.Math.Between(-baseSpeed , -baseSpeed);

    this.setVelocity(velX, velY);
    this.setCollideWorldBounds(false);
    this.setBounce(0);

    // caja de colision
    this.body.setSize(this.width * 0.6, this.height * 0.6, true);

    // para que gire la sprite
    this.setFlipX(velX < 0);

    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;

    this.isDead = false;
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    // rotar la sprite por velocidad en x
    if (this.body.velocity.x < 0 && !this.flipX) {
      this.setFlipX(true);
    } else if (this.body.velocity.x > 0 && this.flipX) {
      this.setFlipX(false);
    }

    // borrar si se sale de la pantalla
    const { width, height } = this.scene.sys.game.canvas;
    if (
      this.x < -50 || this.x > width + 50 ||
      this.y < -50 || this.y > height + 50
    ) {
      this.destroy();
    }
  }

  //cuando el pato recibe un disparo
  hit() {
    if (this.isDead) return;
    this.isDead = true;

    // animacion de golpe/caida
    this.setVelocity(Phaser.Math.Between(-50, 50), 300);
    this.setTint(0xff0000);
    this.play('fly', true); // cambiar a hit

    // rotar pato al caer
    this.rotation = Phaser.Math.DegToRad(Phaser.Math.Between(-30, 30));

    // caida y borrado del pato
    this.scene.tweens.add({
      targets: this,
      y: this.y + 100,
      alpha: 0,
      duration: 800,
      onComplete: () => this.destroy()
    });
  }
}
