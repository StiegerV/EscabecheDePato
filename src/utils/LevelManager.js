let currentLevel = 1;

const levels = {
  1: { spawnDelay: 2000, duckSpeed: 150, targetScore: 500 },
  2: { spawnDelay: 1500, duckSpeed: 200, targetScore: 1000 },
  3: { spawnDelay: 1000, duckSpeed: 250, targetScore: 1500 },
  4: { spawnDelay: 800,  duckSpeed: 300, targetScore: 2000 },
};

export default {
  get() { return currentLevel; },
  config() { return levels[currentLevel]; },
  next() { if (levels[currentLevel + 1]) currentLevel++; },
  reset() { currentLevel = 1; },
};
