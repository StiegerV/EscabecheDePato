export default class ScoreManager {
  constructor(scene) {
    this.scene = scene;

    // si el registro ya tiene valores, los usamos si no, inicializamos
    this.score = this.scene.registry.get('score') ?? 0;
    this.hits = this.scene.registry.get('hits') ?? 0;
    this.ammo = this.scene.registry.get('ammo') ?? 5;

    // sseguramos que los valores existan en el registry
    if (!this.scene.registry.has('score')) this.scene.registry.set('score', this.score);
    if (!this.scene.registry.has('hits')) this.scene.registry.set('hits', this.hits);
    if (!this.scene.registry.has('ammo')) this.scene.registry.set('ammo', this.ammo);

    console.log(`[ScoreManager] Inicializado con score=${this.score}, hits=${this.hits}, ammo=${this.ammo}`);
  }

  // --- SCORE ---
  addScore(points) {
    this.score += points;
    this.scene.registry.set('score', this.score);
  }

  getScore() {
    return this.scene.registry.get('score') ?? this.score;
  }

  setScore(value) {
    this.score = value;
    this.scene.registry.set('score', value);
  }

  resetScore() {
    this.score = 0;
    this.scene.registry.set('score', 0);
  }

  // --- HITS ---
  addHit() {
    this.hits++;
    this.scene.registry.set('hits', this.hits);
  }

  getHits() {
    return this.scene.registry.get('hits') ?? this.hits;
  }

  setHits(value) {
    this.hits = value;
    this.scene.registry.set('hits', value);
  }

  // --- AMMO ---
  setAmmo(value) {
    this.ammo = value;
    this.scene.registry.set('ammo', value);
  }

  getAmmo() {
    return this.scene.registry.get('ammo') ?? this.ammo;
  }

  // --- RESETEAR TODO ---
  resetAll() {
    this.score = 0;
    this.hits = 0;
    this.ammo = 5;
    this.scene.registry.set('score', 0);
    this.scene.registry.set('hits', 0);
    this.scene.registry.set('ammo', 5);
  }

  // --- DEBUG ---
  log() {
    console.log(`[ScoreManager] score=${this.getScore()}, hits=${this.getHits()}, ammo=${this.getAmmo()}`);
  }
}
