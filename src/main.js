import config from '../src/config.js';

//comprobamos si hay token en localStorage
const token = localStorage.getItem("token");
const username = localStorage.getItem("username");

if (!token) {
  // si no hay token, redirigimos a login.html
  window.location.href = "login.html";
} else {
  // si hay token, lanzamos el juego normalmente
  //crea una instancia de Phase.game crea el canvas,carga escenas inicializa subsistemas, aca empieza el phaser
  const game = new Phaser.Game(config);

  //  guardamos los datos del usuario dentro del juego (accesible desde cualquier escena)instancia de Phaser.Data.DataManager.
  game.registry.set("username", username);
  game.registry.set("token", token);
}
