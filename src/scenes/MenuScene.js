//vive dentro del scene manager del game 
//ademas se comunica con el backend 
export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  //creamos elementos de la interfaz
  create() {
    const { width, height } = this.sys.game.canvas;
    
    // fondo responsive basado en el tamaño de la ventana
    this.background = this.add.image(0, 0, 'menuBackground')
      .setOrigin(0)
      .setDisplaySize(window.innerWidth, window.innerHeight);

    // obtener token y usuario desde local storage, lo guardamos en una variable de la escena
    this.token = localStorage.getItem('token');
    this.username = localStorage.getItem('username') || 'Desconocido';

    // titulo del juego
    //this .add utiliza GameObjectFactory
    //posicion en x mitad de la pantalla e y 120
    this.add.text(width / 2, 120, 'DUCK SEASON', {
      //estilo del texto
      fontSize: '64px',
      fill: '#000000',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif'
      //set origin cambia el punto de referencia al centro , principalmente para el anclaje
    }).setOrigin(0.5);

    // informacion del jugador
    this.add.text(width / 2, 190, `Jugador: ${this.username}`, {
      fontSize: '24px',
      fill: '#2600ff',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);

    //arreglo con las opciones del menu definiendo texto y accion centralizando opciones
    const options = [
      { text: '🕹️ Nuevo Juego', action: () => this.startNewGame() },
      { text: '💾 Continuar', action: () => this.showLoadSlots() },
      { text: '🏆 Ranking Global', action: () => this.showGlobalRanking() }, // NUEVA OPCIÓN
      { text: '📜 Créditos', action: () => this.showCredits() }
    ];

    //construimos de manera dinamica el menu
    //iteramos sobre options
    options.forEach((opt, i) => {
      //creamos un texto centrado en el medio y desplazando verticalmente por el indice
      const btn = this.add.text(width / 2, 280 + i * 60, opt.text, {
        fontSize: '32px',
        fill: '#ffff00',
        fontFamily: 'Arial, sans-serif'
      }).setOrigin(0.5)
      //set interactive hace que el texto responda a eventos del mouse cambiamos el cursor para que sea una mano
        .setInteractive({ useHandCursor: true })
        //al hacer click llamamos a la accion que tiene asignado
        .on('pointerdown', opt.action)
        //cambiamos el estilo al pasar por encima y al salir
        .on('pointerover', () => btn.setStyle({ fill: '#ffffff' }))
        .on('pointerout', () => btn.setStyle({ fill: '#ffff00' }));
    });

    // remover cualquier listener previo del registry
    //registry utiliza Phaser.Data.DataManager
    if (this.registry.events) {
      //sacamos el listener de cambio de data
      this.registry.events.off('changedata');
    }

    // resetear registry al entrar al menu (para nuevo juego limpio), tambien en el caso de que sea la pirmra vez que entramos
    //instancia las variables clave valor
    this.registry.set('score', 0);
    this.registry.set('hits', 0);
    this.registry.set('ammo', 5);
    this.registry.set('tiempo', 0);
  }

  // MOSTRAR RANKING GLOBAL
  async showGlobalRanking() {
    //que el tamaño se base en el canvas y no la ventana
    const { width, height } = this.sys.game.canvas;
    
    // Fondo del modal pos x e y tamaño de 500x500 opacidad del 95%
    const bg = this.add.rectangle(width / 2, height / 2, 500, 500, 0x000000, 0.95)
    //le da un borde dorado
      .setStrokeStyle(3, 0xffd700);
    //que el texto este justo encima del rectangulo
    const title = this.add.text(width / 2, height / 2 - 220, "🏆 RANKING GLOBAL", {
      fontSize: "32px",
      fill: "#ffd700",
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5);
//para poder destruirlos despues
    const buttons = [bg, title];

    // Texto de carga
    const loadingText = this.add.text(width / 2, height / 2, "Cargando ranking...", {
      fontSize: "20px",
      fill: "#ffffff",
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);
    buttons.push(loadingText);

    try {
      //peticion asincrona al back
      const res = await fetch("http://localhost:3000/highscores");
      //respuesta de 200
      if (res.ok) {
        //parseamos a objeto json
        const highscores = await res.json();

        loadingText.destroy(); // Remover texto de carga

        if (highscores.length === 0) {
          // Si no hay puntuaciones
          // /n quiebre de linea 
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
          const header = this.add.text(width / 2, height / 2 - 170, 
            "POS  JUGADOR          PUNTOS    TIEMPO", {
            fontSize: "18px",
            fill: "#ffd700",
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
          }).setOrigin(0.5);
          buttons.push(header);

          // Mostrar cada puntuación
          highscores.forEach((score, index) => {
            const yPos = height / 2 - 130 + index * 30;
            
            const position = this.add.text(width / 2 - 220, yPos, 
              `${index + 1}.`, {
              fontSize: "18px",
              fill: "#ffffff",
              fontFamily: 'Arial, sans-serif'
            }).setOrigin(0, 0.5);

            //separamos el string en el caso de que sea muy largo
            const username = this.add.text(width / 2 - 180, yPos, 
              score.username.length > 12 ? score.username.substring(0, 12) + "..." : score.username, {
              fontSize: "18px",
              fill: "#4ecdc4",
              fontFamily: 'Arial, sans-serif'
              //punto de anclje basado en x e y
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

          // Informacion adicional
          const infoText = this.add.text(width / 2, height / 2 + 170, 
            "💡 Completa el Level 3 para subir tu puntuación", {
            fontSize: "16px",
            fill: "#aaaaaa",
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'italic'
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
    const closeBtn = this.add.text(width / 2, height / 2 + 220, 'Cerrar', {
      fontSize: '20px',
      fill: '#ff5555',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#660000',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        //limpiar todos los elementos del modal
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

  // empezar nuevo juego
  startNewGame() {
    // limpiar cualquier escena de nivel existente
    const levelScenes = ['Level1', 'Level2', 'Level3', 'Level4', 'Level5'];
    levelScenes.forEach(sceneKey => {
      if (this.scene.isActive(sceneKey)) {
        this.scene.stop(sceneKey);
      }
    });

    // resetear valores del registry para nuevo juego
    this.registry.set('score', 0);
    this.registry.set('hits', 0);
    this.registry.set('ammo', 5);
    this.registry.set('tiempo', 0);

    this.scene.start('Level1');
  }

  // mostrar menu de carga 
  async showLoadSlots() {
    //verifiacmos que tenga token
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

                  // limpiar todas las escenas de nivel existentes
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

                  // iniciar el nivel correspondiente
                  this.scene.start(`Level${data.level}`, loadData);
                  
                } else {
                  this.showToast("❌ Datos de partida invalidos", "#f00");
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

    // boton cerrar
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

  // mostrar creditos
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

    // boton cerrar creditos
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

  // mostrar mensajes a lo toast
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

  // limpiar recursos cuando se cierra la escena
  shutdown() {
    // limpiar cualquier evento pendiente
    if (this.input.keyboard) {
      this.input.keyboard.off('keydown-ESC');
    }
    
    // limpiar listeners del registry
    if (this.registry.events) {
      this.registry.events.off('changedata');
    }
  }
}