import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import sqlite3 from "sqlite3";
import { open } from "sqlite"; 
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cors from "cors";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 3000;
const JWT_SECRET = "linganguliguliguliwachalingangulingangulinganguliguli";
const SALT_ROUNDS = 2;

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let db;
(async () => {
  db = await open({
    filename: path.join(__dirname, "database.sqlite"),
    driver: sqlite3.Database
  });

  // tabla de usuarios
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password_hash TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // slots de guardado del jugador
  await db.exec(`
    CREATE TABLE IF NOT EXISTS saves (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      slot INTEGER,
      level INTEGER DEFAULT 1,
      score INTEGER DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, slot)
    );
  `);

  // tabla global de puntuaciones
  await db.exec(`
    CREATE TABLE IF NOT EXISTS highscores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT,
      score INTEGER,
      time INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
})().catch(err => {
  console.error("sqlite error", err);
  process.exit(1);
});

// =================== HELPERS ===================
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: "logueate primero" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "token inválido" });
  }
}

// =================== ENDPOINTS ===================

// registro
app.post("/registro", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password)
    return res.status(400).json({ error: "username y password requeridos" });

  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await db.run(
      "INSERT INTO users (username, password_hash) VALUES (?, ?)",
      username,
      hash
    );
    const token = generateToken({ id: result.lastID, username });
    res.json({ id: result.lastID, username, token });
  } catch (err) {
    if (err.message.includes("UNIQUE"))
      return res.status(409).json({ error: "usuario ya existe" });
    console.error(err);
    res.status(500).json({ error: "error registrando usuario" });
  }
});

// login
app.post("/login", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password)
    return res.status(400).json({ error: "username y password requeridos" });

  try {
    const user = await db.get(
      "SELECT * FROM users WHERE username = ?",
      username
    );
    if (!user) return res.status(401).json({ error: "usuario no existe" });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "contraseña incorrecta" });

    const token = generateToken({ id: user.id, username });
    res.json({ id: user.id, username: user.username, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "error en login" });
  }
});

// guardar partida
app.post("/save", authMiddleware, async (req, res) => {
  const { slot, level, score } = req.body || {};
  if (slot == null) return res.status(400).json({ error: "slot requerido" });
  try {
    await db.run(
      `
      INSERT INTO saves (user_id, slot, level, score)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(user_id, slot) DO UPDATE SET
        level=excluded.level,
        score=excluded.score,
        updated_at=CURRENT_TIMESTAMP;
      `,
      req.user.id, slot, level, score
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "error guardando partida" });
  }
});

// cargar partida
app.get("/load/:slot", authMiddleware, async (req, res) => {
  const { slot } = req.params;
  try {
    const save = await db.get(
      "SELECT level, score FROM saves WHERE user_id = ? AND slot = ?",
      req.user.id, slot
    );
    if (!save) return res.status(404).json({ error: "no hay partida en ese slot" });
    res.json(save);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "error cargando partida" });
  }
});

// listar partidas guardadas
app.get("/saves", authMiddleware, async (req, res) => {
  try {
    const saves = await db.all(
      "SELECT slot, level, score, updated_at FROM saves WHERE user_id = ? ORDER BY slot ASC",
      req.user.id
    );
    res.json(saves);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "error listando saves" });
  }
});

// =================== HIGHSCORES GLOBALES ===================

// registrar puntaje global
app.post("/highscore", authMiddleware, async (req, res) => {
  const { score, time } = req.body || {};
  if (!score || !time)
    return res.status(400).json({ error: "faltan datos score/time" });
  try {
    await db.run(
      "INSERT INTO highscores (username, score, time) VALUES (?, ?, ?)",
      req.user.username,
      score,
      time
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "error guardando highscore" });
  }
});

// obtener ranking global (top 10)
app.get("/highscores", async (req, res) => {
  try {
    const rows = await db.all(
      "SELECT username, score, time FROM highscores ORDER BY score DESC, time ASC LIMIT 10"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "error obteniendo ranking" });
  }
});

// =================== SERVIDOR ===================
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
