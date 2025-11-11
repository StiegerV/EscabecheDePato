export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const { width, height } = this.sys.game.canvas;
    
    // Fondo
    this.background = this.add.image(0, 0, 'menuBackground')
      .setOrigin(0)
      .setDisplaySize(window.innerWidth, window.innerHeight);

    // 🔹 Obtener token y usuario
    this.token = localStorage.getItem('token');
    this.username = localStorage.getItem('username') || 'Desconocido';

    // Título del juego
    this.add.text(width / 2, 150, 'DUCK SEASON', {
      fontSize: '64px',
      fill: '#000000',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);

    // Información del jugador
    this.add.text(width / 2, 230, `Jugador: ${this.username}`, {
      fontSize: '24px',
      fill: '#2600ff',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);

    // Opciones de menú
    const options = [
      { text: '🕹️ Nuevo Juego', action: () => this.startNewGame() },
      { text: '💾 Continuar', action: () => this.showLoadSlots() },
      { text: '📜 Créditos', action: () => this.showCredits() }
    ];

    options.forEach((opt, i) => {
      const btn = this.add.text(width / 2, 350 + i * 60, opt.text, {
        fontSize: '32px',
        fill: '#ffff00',
        fontFamily: 'Arial, sans-serif'
      }).setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', opt.action)
        .on('pointerover', () => btn.setStyle({ fill: '#ffffff' }))
        .on('pointerout', () => btn.setStyle({ fill: '#ffff00' }));
    });

    // 🔹 IMPORTANTE: Remover cualquier listener previo del registry
    if (this.registry.events) {
      this.registry.events.off('changedata');
    }

    // Resetear registry al entrar al menú (para nuevo juego limpio)
    this.registry.set('score', 0);
    this.registry.set('hits', 0);
    this.registry.set('ammo', 5);
    this.registry.set('tiempo', 0);
  }

  // 🔸 Empezar nuevo juego
  startNewGame() {
    // Limpiar cualquier escena de nivel existente
    const levelScenes = ['Level1', 'Level2', 'Level3', 'Level4', 'Level5'];
    levelScenes.forEach(sceneKey => {
      if (this.scene.isActive(sceneKey)) {
        this.scene.stop(sceneKey);
      }
    });

    // Resetear valores del registry para nuevo juego
    this.registry.set('score', 0);
    this.registry.set('hits', 0);
    this.registry.set('ammo', 5);
    this.registry.set('tiempo', 0);

    this.scene.start('Level1');
  }

  // 🔸 Mostrar menú de carga (compatible con LevelBase)
  async showLoadSlots() {
    if (!this.token) {
      this.showToast("⚠️ No estás logueado", "#f00");
      return;
    }

    const { width, height } = this.sys.game.canvas;
    
    // Fondo del modal
    const bg = this.add.rectangle(width / 2, height / 2, 450, 450, 0x000000, 0.9)
      .setStrokeStyle(2, 0x00ffff);
    
    const title = this.add.text(width / 2, height / 2 - 180, "CARGAR PARTIDA", {
      fontSize: "28px",
      fill: "#00ffff",
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);

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

    const buttons = [bg, title];

    for (let i = 1; i <= 5; i++) {
      const slotData = saves.find(s => s.slot === i);
      const info = slotData
        ? `Nivel ${slotData.level} | Puntos ${slotData.score}`
        : "Vacío";

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
        const loadBtn = this.add.text(width / 2, yPos, '🎮 CARGAR', {
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
                console.log('MenuScene: load response', data);

                if (data.level != null) {
                  // Preparar datos para LevelBase
                  const loadData = {
                    loadedScore: data.score || 0,
                    loadedHits: data.hits || 0,
                    loadedAmmo: data.ammo || 5
                  };

                  console.log(`Cargando partida -> Nivel: ${data.level}, Score: ${loadData.loadedScore}, Hits: ${loadData.loadedHits}, Ammo: ${loadData.loadedAmmo}`);

                  // Limpiar todas las escenas de nivel existentes
                  const levelScenes = ['Level1', 'Level2', 'Level3', 'Level4', 'Level5'];
                  levelScenes.forEach(sceneKey => {
                    if (this.scene.isActive(sceneKey)) {
                      this.scene.stop(sceneKey);
                    }
                  });

                  // Actualizar registry global
                  this.registry.set('score', loadData.loadedScore);
                  this.registry.set('hits', loadData.loadedHits);
                  this.registry.set('ammo', loadData.loadedAmmo);

                  // Cerrar modal antes de cambiar escena
                  buttons.forEach(el => el.destroy());
                  closeBtn.destroy();

                  // Iniciar el nivel correspondiente
                  this.scene.start(`Level${data.level}`, loadData);
                  
                } else {
                  this.showToast("❌ Datos de partida inválidos", "#f00");
                }
              } else {
                this.showToast("❌ Error al cargar partida", "#f00");
              }
            } catch (err) {
              console.error('Error en load slot:', err);
              this.showToast("❌ Error de conexión", "#f00");
            }
          })
          .on('pointerover', () => loadBtn.setStyle({ fill: "#ffff00", backgroundColor: "#0077cc" }))
          .on('pointerout', () => loadBtn.setStyle({ fill: "#ffffff", backgroundColor: "#0055aa" }));

        buttons.push(loadBtn);
      }

      buttons.push(slotText, infoText);
    }

    // Botón cerrar
    const closeBtn = this.add.text(width / 2, height / 2 + 180, "❌ Cerrar", {
      fontSize: "20px",
      fill: "#ff4444",
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        buttons.forEach(el => el.destroy());
        closeBtn.destroy();
      })
      .on('pointerover', () => closeBtn.setStyle({ fill: "#ffffff" }))
      .on('pointerout', () => closeBtn.setStyle({ fill: "#ff4444" }));
  }

  // 🔸 Mostrar créditos
  showCredits() {
    const { width, height } = this.sys.game.canvas;
    const bg = this.add.rectangle(width / 2, height / 2, 500, 200, 0x000000, 0.8)
      .setStrokeStyle(2, 0xffffff);
    
    const creditsText = this.add.text(width / 2, height / 2, 
      "DUCK SEASON\n\nHecho por Valentin Stieger\n© 2025", {
      fontSize: "22px", 
      fill: "#ffffff", 
      align: "center",
      fontFamily: 'Arial, sans-serif',
      lineSpacing: 10
    }).setOrigin(0.5);

    // Botón cerrar créditos
    const closeBtn = this.add.text(width / 2, height / 2 + 80, "Cerrar", {
      fontSize: "18px",
      fill: "#ff5555",
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        bg.destroy();
        creditsText.destroy();
        closeBtn.destroy();
      })
      .on('pointerover', () => closeBtn.setStyle({ fill: "#ffffff" }))
      .on('pointerout', () => closeBtn.setStyle({ fill: "#ff5555" }));
  }

  // 🔸 Mostrar mensajes toast
  showToast(text, color = "#0f0") {
    const { width, height } = this.sys.game.canvas;
    const msg = this.add.text(width / 2, height - 50, text, {
      fontSize: '20px',
      fill: color,
      backgroundColor: "#000000",
      padding: { x: 10, y: 5 },
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);
    
    this.time.delayedCall(1500, () => {
      if (msg && msg.destroy) {
        msg.destroy();
      }
    });
  }

  // Limpiar recursos cuando se cierra la escena
  shutdown() {
    // Limpiar cualquier evento pendiente
    if (this.input.keyboard) {
      this.input.keyboard.off('keydown-ESC');
    }
    
    // Limpiar listeners del registry
    if (this.registry.events) {
      this.registry.events.off('changedata');
    }
  }
}