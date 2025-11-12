import ScoreManager from '../utils/Score.js';

export default class PauseScene extends Phaser.Scene {
  constructor() {
    super('PauseScene');
  }

  init(data) {
    this.previousScene = data.previousScene || null;
    this.stats = data.stats || {};
    this.token = data.token || localStorage.getItem('token') || null;
    this.username = data.username || localStorage.getItem('username') || 'Desconocido';
  }

  create() {
    const { width, height } = this.sys.game.canvas;

    // fondo semitransparente
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);

    // titulo
    this.add.text(width / 2, height / 2 - 180, '⏸ PAUSA', {
      fontSize: '48px',
      fill: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // obtener datos actualizados del registry si estan disponibles
    const currentScene = this.scene.get(this.previousScene);
    let currentStats = this.stats;
    
    if (currentScene && currentScene.registry) {
      currentStats = {
        score: currentScene.registry.get('score') || this.stats.score || 0,
        hits: currentScene.registry.get('hits') || this.stats.hits || 0,
        ammo: currentScene.registry.get('ammo') || this.stats.ammo || 0,
        tiempo: currentScene.registry.get('tiempo') || this.stats.tiempo || 0
      };
    }

    const { score = 0, hits = 0, ammo = 0, tiempo = 0 } = currentStats;
    
    this.add.text(width / 2, height / 2 - 100,
      `Jugador: ${this.username}\nPuntos: ${score}\nAciertos: ${hits}\nBalas: ${ammo}\nTiempo: ${tiempo}s`,
      { 
        fontSize: '22px', 
        fill: '#ffffff', 
        align: 'center',
        lineSpacing: 8 
      }
    ).setOrigin(0.5);

    // options
    const options = [
      { text: 'Reanudar', action: () => this.resumeGame() },
      { text: 'Guardar Progreso', action: () => this.showSaveSlots() },
      { text: 'Cargar Progreso', action: () => this.showLoadSlots() },
      { text: '🏆 Ranking Global', action: () => this.showGlobalRanking() },
      { text: 'Salir al Menu', action: () => this.exitToMenu() }
    ];

    options.forEach((opt, i) => {
      const btn = this.add.text(width / 2, height / 2 + 30 + i * 50, opt.text, {
        fontSize: '26px',
        fill: '#ffff00',
        fontFamily: 'Arial, sans-serif'
      }).setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', opt.action)
        .on('pointerover', () => btn.setStyle({ fill: '#ffffff' }))
        .on('pointerout', () => btn.setStyle({ fill: '#ffff00' }));
    });

    this.input.keyboard.once('keydown-ESC', () => this.resumeGame());
  }

  // ---------- REANUDAR ----------
  resumeGame() {
    this.scene.stop();
    if (this.previousScene) {
      this.scene.resume(this.previousScene);
    }
  }

  exitToMenu() {
    // limpiar listeners del registry antes de salir
    if (this.registry.events) {
      this.registry.events.off('changedata');
    }
    
    // limpiar todas las escenas de nivel antes de ir al menu
    const levelScenes = ['Level1', 'Level2', 'Level3', 'Level4', 'Level5'];
    levelScenes.forEach(sceneKey => {
      if (this.scene.isActive(sceneKey) || this.scene.isPaused(sceneKey)) {
        this.scene.stop(sceneKey);
      }
    });
    
    this.scene.start('MenuScene');
  }

  // ---------- TOAST ----------
  showToast(text, color = "#0f0") {
    const { width, height } = this.sys.game.canvas;
    const msg = this.add.text(width / 2, height - 50, text, {
      fontSize: '20px',
      fill: color,
      backgroundColor: "#000000",
      padding: { x: 10, y: 5 },
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);
    this.time.delayedCall(1500, () => msg.destroy());
  }

  // ---------- NUEVO: RANKING GLOBAL ----------
  async showGlobalRanking() {
    const { width, height } = this.sys.game.canvas;
    
    // Fondo del modal
    const bg = this.add.rectangle(width / 2, height / 2, 500, 450, 0x000000, 0.95)
      .setStrokeStyle(3, 0xffd700);
    
    const title = this.add.text(width / 2, height / 2 - 200, "🏆 RANKING GLOBAL", {
      fontSize: "32px",
      fill: "#ffd700",
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const buttons = [bg, title];

    // Texto de carga
    const loadingText = this.add.text(width / 2, height / 2, "Cargando ranking...", {
      fontSize: "20px",
      fill: "#ffffff",
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);
    buttons.push(loadingText);

    try {
      const res = await fetch("http://localhost:3000/highscores");
      
      if (res.ok) {
        const highscores = await res.json();
        loadingText.destroy(); // Remover texto de carga

        if (highscores.length === 0) {
          // Si no hay puntuaciones
          const noScoresText = this.add.text(width / 2, height / 2, 
            "¡Aún no hay puntuaciones!\n\nCompleta el Level 3 para aparecer aquí.", {
            fontSize: "22px",
            fill: "#aaaaaa",
            fontFamily: 'Arial, sans-serif',
            align: 'center',
            lineSpacing: 10
          }).setOrigin(0.5);
          buttons.push(noScoresText);
        } else {
          // Mostrar top 10
          const header = this.add.text(width / 2, height / 2 - 150, 
            "POS  JUGADOR          PUNTOS    TIEMPO", {
            fontSize: "18px",
            fill: "#ffd700",
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
          }).setOrigin(0.5);
          buttons.push(header);

          // Mostrar cada puntuación
          highscores.forEach((score, index) => {
            const yPos = height / 2 - 110 + index * 30;
            
            const position = this.add.text(width / 2 - 220, yPos, 
              `${index + 1}.`, {
              fontSize: "18px",
              fill: "#ffffff",
              fontFamily: 'Arial, sans-serif'
            }).setOrigin(0, 0.5);

            const username = this.add.text(width / 2 - 180, yPos, 
              score.username.length > 12 ? score.username.substring(0, 12) + "..." : score.username, {
              fontSize: "18px",
              fill: "#4ecdc4",
              fontFamily: 'Arial, sans-serif'
            }).setOrigin(0, 0.5);

            const points = this.add.text(width / 2 + 50, yPos, 
              score.score.toString(), {
              fontSize: "18px",
              fill: "#ffff00",
              fontFamily: 'Arial, sans-serif'
            }).setOrigin(0.5, 0.5);

            const time = this.add.text(width / 2 + 150, yPos, 
              `${score.time}s`, {
              fontSize: "18px",
              fill: "#ff6b6b",
              fontFamily: 'Arial, sans-serif'
            }).setOrigin(0.5, 0.5);

            // Destacar si es el jugador actual
            if (score.username === this.username) {
              [position, username, points, time].forEach(text => {
                text.setStyle({ fill: "#ffd700", fontStyle: 'bold' });
              });
            }

            buttons.push(position, username, points, time);
          });

          // Información sobre cómo subir al ranking
          const infoText = this.add.text(width / 2, height / 2 + 150, 
            "💡 Las puntuaciones se suben automáticamente al completar el Level 3", {
            fontSize: "14px",
            fill: "#aaaaaa",
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'italic',
            align: 'center',
            lineSpacing: 5
          }).setOrigin(0.5);
          buttons.push(infoText);
        }

      } else {
        loadingText.setText("Error al cargar el ranking");
        loadingText.setStyle({ fill: "#ff6666" });
      }
    } catch (err) {
      console.error('Error fetching highscores:', err);
      loadingText.setText("Error de conexión");
      loadingText.setStyle({ fill: "#ff6666" });
    }

    // Botón cerrar
    const closeBtn = this.add.text(width / 2, height / 2 + 190, 'Cerrar', {
      fontSize: '20px',
      fill: '#ff5555',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#660000',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        buttons.forEach(el => el.destroy());
        closeBtn.destroy();
      })
      .on('pointerover', () => closeBtn.setStyle({ 
        fill: '#ffffff', 
        backgroundColor: '#880000' 
      }))
      .on('pointerout', () => closeBtn.setStyle({ 
        fill: '#ff5555', 
        backgroundColor: '#660000' 
      }));
  }

  // ---------- GUARDAR PARTIDA ----------
  async showSaveSlots() {
    if (!this.token) return this.showToast("⚠️ No estás logueado", "#f00");

    const { width, height } = this.sys.game.canvas;
    const bg = this.add.rectangle(width / 2, height / 2, 450, 450, 0x000000, 0.9)
      .setStrokeStyle(2, 0xffff00);
    const title = this.add.text(width / 2, height / 2 - 180, "GUARDAR PARTIDA", { 
      fontSize: "28px", 
      fill: "#ffff00",
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);
    
    const buttons = [bg, title];

    // obtener datos actuales del nivel en pausa
    const currentScene = this.scene.get(this.previousScene);
    let currentLevel = 1;
    let currentScore = 0;
    let currentHits = 0;
    let currentAmmo = 5;

    if (currentScene && currentScene.registry) {
      currentLevel = Number(this.previousScene?.replace('Level', '') || 1);
      currentScore = currentScene.registry.get('score') || 0;
      currentHits = currentScene.registry.get('hits') || 0;
      currentAmmo = currentScene.registry.get('ammo') || 5;
    }

    let saves = [];
    try {
      const res = await fetch("http://localhost:3000/saves", { 
        headers: { Authorization: `Bearer ${this.token}` } 
      });
      if (res.ok) saves = await res.json();
    } catch (err) { 
      console.error('Error fetching saves:', err);
      this.showToast("Error de conexión", "#f00");
      return;
    }

    // boton de cerrar
    const closeBtn = this.add.text(width / 2, height / 2 + 180, 'Cerrar', {
      fontSize: '22px',
      fill: '#ff5555',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        buttons.forEach(el => el.destroy());
      })
      .on('pointerover', () => closeBtn.setStyle({ fill: '#ffffff' }))
      .on('pointerout', () => closeBtn.setStyle({ fill: '#ff5555' }));
    
    buttons.push(closeBtn);

    for (let i = 1; i <= 5; i++) {
      const slotData = saves.find(s => s.slot === i);
      const info = slotData ? 
        `Nivel ${slotData.level} | Puntos ${slotData.score}` : 
        "Vacío";
      
      const yPos = height / 2 - 120 + i * 50;

      const slotText = this.add.text(width / 2 - 100, yPos, `Slot ${i}:`, {
        fontSize: "20px",
        fill: "#ffffff",
        fontFamily: 'Arial, sans-serif'
      }).setOrigin(0, 0.5);

      const infoText = this.add.text(width / 2 + 20, yPos, info, {
        fontSize: "18px",
        fill: slotData ? "#ffff00" : "#888888",
        fontFamily: 'Arial, sans-serif'
      }).setOrigin(0, 0.5);

      const btn = this.add.text(width / 2, yPos, '💾 GUARDAR', {
        fontSize: "16px",
        fill: "#00ff00",
        backgroundColor: "#005500",
        padding: { x: 10, y: 5 },
        fontFamily: 'Arial, sans-serif'
      }).setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', async () => {
          try {
            const saveData = {
              slot: i,
              level: currentLevel,
              score: currentScore,
              hits: currentHits,
              ammo: currentAmmo,
              timestamp: new Date().toISOString()
            };

            const res = await fetch("http://localhost:3000/save", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.token}`
              },
              body: JSON.stringify(saveData)
            });
            
            if (res.ok) {
              this.showToast(`✅ Partida guardada en Slot ${i}`);
              buttons.forEach(el => el.destroy());
            } else {
              this.showToast("❌ Error al guardar", "#f00");
            }
          } catch (err) {
            console.error('Error saving game:', err);
            this.showToast("❌ Error de conexión", "#f00");
          }
        })
        .on('pointerover', () => btn.setStyle({ fill: "#ffffff", backgroundColor: "#007700" }))
        .on('pointerout', () => btn.setStyle({ fill: "#00ff00", backgroundColor: "#005500" }));

      buttons.push(slotText, infoText, btn);
    }
  }

  // ---------- CARGAR PARTIDA ----------
  async showLoadSlots() {
    if (!this.token) return this.showToast("⚠️ No estás logueado", "#f00");

    const { width, height } = this.sys.game.canvas;
    const bg = this.add.rectangle(width / 2, height / 2, 450, 450, 0x000000, 0.9)
      .setStrokeStyle(2, 0x00ffff);
    const title = this.add.text(width / 2, height / 2 - 180, "CARGAR PARTIDA", { 
      fontSize: "28px", 
      fill: "#00ffff",
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);
    
    const buttons = [bg, title];

    let saves = [];
    try {
      const res = await fetch("http://localhost:3000/saves", { 
        headers: { Authorization: `Bearer ${this.token}` } 
      });
      if (res.ok) saves = await res.json();
    } catch (err) { 
      console.error('Error fetching saves:', err);
      this.showToast("Error de conexión", "#f00");
      return;
    }

    // boton de cerrar
    const closeBtn = this.add.text(width / 2, height / 2 + 180, 'Cerrar', {
      fontSize: '22px',
      fill: '#ff5555',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        buttons.forEach(el => el.destroy());
      })
      .on('pointerover', () => closeBtn.setStyle({ fill: '#ffffff' }))
      .on('pointerout', () => closeBtn.setStyle({ fill: '#ff5555' }));
    
    buttons.push(closeBtn);

    for (let i = 1; i <= 5; i++) {
      const slotData = saves.find(s => s.slot === i);
      const info = slotData ? 
        `Nivel ${slotData.level} | Puntos ${slotData.score}` : 
        "Vacío";
      
      const yPos = height / 2 - 120 + i * 50;

      const slotText = this.add.text(width / 2 - 100, yPos, `Slot ${i}:`, {
        fontSize: "20px",
        fill: "#ffffff",
        fontFamily: 'Arial, sans-serif'
      }).setOrigin(0, 0.5);

      const infoText = this.add.text(width / 2 + 20, yPos, info, {
        fontSize: "18px",
        fill: slotData ? "#00ffff" : "#555555",
        fontFamily: 'Arial, sans-serif'
      }).setOrigin(0, 0.5);

      if (slotData) {
        const btn = this.add.text(width / 2, yPos, '🎮 CARGAR', {
          fontSize: "16px",
          fill: "#ffffff",
          backgroundColor: "#0055aa",
          padding: { x: 10, y: 5 },
          fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5)
          .setInteractive({ useHandCursor: true })
          .on('pointerdown', async () => {
            try {
              const res = await fetch(`http://localhost:3000/load/${i}`, { 
                headers: { Authorization: `Bearer ${this.token}` } 
              });
              
              if (res.ok) {
                const data = await res.json();
                
                if (data.level != null) {
                  // preparar datos para cargar en el nivel
                  const loadData = {
                    loadedScore: data.score || 0,
                    loadedHits: data.hits || 0,
                    loadedAmmo: data.ammo || 5
                  };

                  // cerrar todas las escenas de nivel existentes
                  const levelScenes = ['Level1', 'Level2', 'Level3', 'Level4', 'Level5'];
                  levelScenes.forEach(sceneKey => {
                    if (this.scene.isActive(sceneKey) || this.scene.isPaused(sceneKey)) {
                      this.scene.stop(sceneKey);
                    }
                  });

                  // cerrar pausa y cargar el nivel guardado
                  this.scene.stop();
                  this.scene.start(`Level${data.level}`, loadData);
                  
                  this.showToast(`🎯 Cargando Nivel ${data.level}...`);
                } else {
                  this.showToast("❌ Datos de partida inválidos", "#f00");
                }
              } else {
                this.showToast("❌ Error al cargar partida", "#f00");
              }
            } catch (err) {
              console.error('Error loading game:', err);
              this.showToast("❌ Error de conexión", "#f00");
            }
          })
          .on('pointerover', () => btn.setStyle({ fill: "#ffff00", backgroundColor: "#0077cc" }))
          .on('pointerout', () => btn.setStyle({ fill: "#ffffff", backgroundColor: "#0055aa" }));

        buttons.push(btn);
      }

      buttons.push(slotText, infoText);
    }
  }
}