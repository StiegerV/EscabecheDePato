//hereda de Phaser.Physics.Arcade.Sprite proporciona body con fisicads de arcade
export default class Duck extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, baseSpeed) {
    //constructor de phaser, le pasamos la escena, posicion y key de la sprite
    super(scene, x, y, 'duck');
//añadimos la sprite a la escena y le añadimos fisicas arcade
    scene.add.existing(this);
    scene.physics.add.existing(this);
//activamos la animacion de vuelo
    this.play('fly');
//seteamos una velocidad aleatoria en x e y dentro de un rango para que cada pato se mueva distinto
    const velX = Phaser.Math.Between(-baseSpeed, baseSpeed);
    const velY = Phaser.Math.Between(-baseSpeed, -baseSpeed);

    this.setVelocity(velX, velY);
    //no colisiona con los bordes del mundo
    this.setCollideWorldBounds(false);
    //no rebota al chocar
    this.setBounce(0);

    // caja de colision
    //la caja al tamaño del 60% de la sprite para evitar bordes transparentes
    this.body.setSize(this.width * 0.6, this.height * 0.6, true);

    // para que gire la sprite
    //si x es negativa mira a la izquierda
    this.setFlipX(velX < 0);

    // destruir si sale de la pantalla
    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;

    this.isDead = false;
  }

  //update propio del objeto
  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    // esta activo?
    if (!this.active) return;

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

  // cuando el pato recibe un disparo
  hit() {
    if (this.isDead || !this.active) return;
    this.isDead = true;

    // animacion de golpe/caida
    this.setVelocity(Phaser.Math.Between(-50, 50), 300);
    //pintamos de rojo
    this.setTint(0xff0000);

    this.play('fly', true);

    // rotar pato al caer
    this.rotation = Phaser.Math.DegToRad(Phaser.Math.Between(-30, 30));

    // caida y borrado del pato
    //tween animaciones interpoladas
    this.scene.tweens.add({
      targets: this,
      y: this.y + 100,
      // el alpha es opacidad
      alpha: 0,
      //ms que dura la animacion
      duration: 800,
      onComplete: () => {
        if (this.active) {
          this.destroy();
        }
      }
    });
  }
}