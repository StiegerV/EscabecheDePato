const LevelConfig = [
  {
    // imagen de fondo, velocidad de los patos, musica de fondo, tiempo entre spawns, puntaje objetivo, duracion del nivel
    background: 'background1',
    duckSpeed: 200,
    music: 'level1music',
    spawnDelay: 1200,
    targetScore: 1500,
    duration: 30000 //en milisegundos
  },
  {
    background: 'background2',
    duckSpeed: 400,
    music: 'level2music',
    spawnDelay: 900,
    targetScore: 3000,
    duration: 3000 //en milisegundos
  },
  {
    background: 'background3',
    duckSpeed: 600,
    music: 'level3music',
    spawnDelay: 700,
    targetScore: 5000,
    duration: 30000 //en milisegundos
  }
];

export default LevelConfig;
