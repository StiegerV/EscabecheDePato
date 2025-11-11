import config from '../src/config.js';

//Comprobamos si hay token en localStorage
const token = localStorage.getItem("token");
const username = localStorage.getItem("username");

if (!token) {
  // Si no hay token, redirigimos a login.html
  window.location.href = "login.html";
} else {
  // Si hay token, lanzamos el juego normalmente
  const game = new Phaser.Game(config);

  //  Guardamos los datos del usuario dentro del juego (accesible desde cualquier escena)
  game.registry.set("username", username);
  game.registry.set("token", token);
}
