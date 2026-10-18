// MIRARIM Game Logic - versión completa
const Game = {
  state: {
    level: 'explorers',
    mode: 'individual',
    narration: true,
    sounds: true,
    reducedMotion: false,
    routeChange: true,
    players: [],
    currentPlayerIndex: 0,
    seals: [false, false, false],
    missions: {
      1: { status: 'pending', responses: [] },
      2: { status: 'pending', responses: [] },
      3: { status: 'pending', responses: [] }
    },
    currentScreen: 'cover',
    videoSrc: null
  },

  avatars: [
    { id: 1, name: 'Agente Azul', color: '#4A90D9', desc: 'Abrigo y gorra azul' },
    { id: 2, name: 'Agente Verde', color: '#6B8E23', desc: 'Trenza, ropa verde, bufanda mostaza' },
    { id: 3, name: 'Agente Beige', color: '#D2B48C', desc: 'Cabello negro, abrigo beige' },
    { id: 4, name: 'Agente Rizado', color: '#5F9EA0', desc: 'Cabello rizado, abrigo azul' },
    { id: 5, name: 'Agente Gris', color: '#708090', desc: 'Ropa verde, bufanda gris' },
    { id: 6, name: 'Agente Terracota', color: '#CD5C5C', desc: 'Trenza oscura, ropa terracota' }
  ],

  init() {
    this.bindEvents();
    this.checkOrientation();
    window.addEventListener('resize', () => this.checkOrientation());
    window.addEventListener('orientationchange', () => this.checkOrientation());
    this.showScreen('cover');
  },

  checkOrientation() {
    const overlay = document.getElementById('rotate-overlay');
    const isPortrait = window.innerHeight > window.innerWidth && window.innerWidth < 900;
    overlay.classList.toggle('active', isPortrait);
    if (isPortrait && window.speechSynthesis) speechSynthesis.cancel();
  },

  bindEvents() {
    document.getElementById('btn-start').addEventListener('click', () => this.goToConfig());
    document.getElementById('btn-companion').addEventListener('click', () => this.toggleCompanion());
    document.getElementById('close-companion').addEventListener('click', () => this.toggleCompanion(false));
  },

  showScreen(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById(`screen-${name}`);
    if (screen) {
      screen.classList.add('active');
      this.state.currentScreen = name;
      this.renderScreen(name);
    }
  },

  renderScreen(name) {
    const screen = document.getElementById(`screen-${name}`);
    if (!screen) return;
    switch (name) {
      case 'config': this.renderConfig(screen); break;
      case 'avatars': this.renderAvatars(screen); break;
      case 'welcome': this.renderWelcome(screen); break;
      case 'map': this.renderMap(screen); break;
      case 'mission1': this.renderMission1(screen); break;
      case 'mission2': this.renderMission2(screen); break;
      case 'mission3': this.renderMission3(screen); break;
      case 'briefcase': this.renderBriefcase(screen); break;
      case 'tools': this.renderToolsChoice(screen); break;
      case 'video': this.renderVideo(screen); break;
      case 'goodbye': this.renderGoodbye(screen); break;
      case 'summary': this.renderSummary(screen); break;
    }
  },

  goToConfig() { this.showScreen('config'); },

  renderConfig(container) {
    container.innerHTML = `
      <h2>Configuración del acompañante</h2>
      <div style="margin: 1.5rem 0; display: flex; flex-direction: column; gap: 1rem;">
        <label><input type="radio" name="level" value="explorers" checked> ${TEXTS.config.levelExplorers}</label>
        <label><input type="radio" name="level" value="agents"> ${TEXTS.config.levelAgents}</label>
        <hr>
        <label><input type="radio" name="mode" value="individual" checked> ${TEXTS.config.modeIndividual}</label>
        <label><input type="radio" name="mode" value="group"> ${TEXTS.config.modeGroup}</label>
        <hr>
        <label><input type="checkbox" id="narration" checked> ${TEXTS.config.narration}</label>
        <label><input type="checkbox" id="sounds" checked> ${TEXTS.config.sounds}</label>
        <label><input type="checkbox" id="reduced"> ${TEXTS.config.reducedMotion}</label>
        <label><input type="checkbox" id="route" checked> ${TEXTS.config.routeChange}</label>
      </div>
      <button class="btn" id="config-next">Continuar a avatares</button>
    `;
    document.getElementById('config-next').onclick = () => {
      this.state.level = document.querySelector('input[name="level"]:checked').value;
      this.state.mode = document.querySelector('input[name="mode"]:checked').value;
      this.state.narration = document.getElementById('narration').checked;
      this.state.sounds = document.getElementById('sounds').checked;
      this.state.reducedMotion = document.getElementById('reduced').checked;
      this.state.routeChange = document.getElementById('route').checked;
      this.showScreen('avatars');
    };
  },

  renderAvatars(container) {
    const maxPlayers = this.state.mode === 'group' ? 6 : 1;
    container.innerHTML = `
      <h2>Elige avatar${maxPlayers > 1 ? 'es' : ''}</h2>
      <p>Selecciona ${maxPlayers === 1 ? 'un avatar' : 'hasta ' + maxPlayers + ' avatares'}.</p>
      <div id="avatar-grid" style="display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center; margin: 1.5rem 0;"></div>
      <button class="btn" id="avatars-next" disabled>Continuar</button>
    `;
    const grid = document.getElementById('avatar-grid');
    this.avatars.forEach(av => {
      const card = document.createElement('div');
      card.className = 'avatar-card';
      card.innerHTML = `
        <div class="avatar-placeholder" style="background: ${av.color}">${av.id}</div>
        <div style="font-size: 0.8rem; margin-top: 0.5rem; text-align: center;">${av.name}</div>
      `;
      card.onclick = () => this.selectAvatar(av, card, maxPlayers);
      grid.appendChild(card);
    });
    document.getElementById('avatars-next').onclick = () => this.showScreen('welcome');
  },

  selectAvatar(av, card, max) {
    const existing = this.state.players.find(p => p.id === av.id);
    if (existing) {
      this.state.players = this.state.players.filter(p => p.id !== av.id);
      card.classList.remove('selected');
    } else if (this.state.players.length < max) {
      this.state.players.push({ id: av.id, name: `Agente ${this.state.players.length + 1}`, avatar: av, tools: [] });
      card.classList.add('selected');
    }
    document.getElementById('avatars-next').disabled = this.state.players.length === 0;
  },

  renderWelcome(container) {
    container.innerHTML = `
      <h2>¡Hola, equipo!</h2>
      <p style="font-size: 1.3rem; max-width: 700px; margin: 1.5rem auto; text-align: center;">${TEXTS.welcome}</p>
      <button class="btn" id="welcome-next">Ir al mapa</button>
    `;
    document.getElementById('welcome-next').onclick = () => this.showScreen('map');
    this.speak(TEXTS.welcome);
  },

  renderMap(container) {
    container.innerHTML = `
      <h2>${TEXTS.mapTitle}</h2>
      <div style="display: flex; justify-content: space-around; margin: 2rem 0; flex-wrap: wrap; gap: 1rem;">
        <button class="btn" data-mission="1">1. ${TEXTS.mission1}</button>
        <button class="btn" data-mission="2">2. ${TEXTS.mission2}</button>
        <button class="btn" data-mission="3">3. ${TEXTS.mission3}</button>
      </div>
      <div style="margin-top: 1rem;">Sellos: ${this.state.seals.map(s => s ? '✓' : '○').join(' ')}</div>
      <button class="btn secondary" id="map-end" style="margin-top: 1rem;">Terminar por hoy</button>
    `;
    container.querySelectorAll('[data-mission]').forEach(btn => {
      btn.onclick = () => this.startMission(parseInt(btn.dataset.mission));
    });
    document.getElementById('map-end').onclick = () => this.showScreen('goodbye');
  },

  startMission(num) {
    this.state.missions[num].status = 'explored';
    this.showScreen(`mission${num}`);
  },

  addToolsBar(container) {
    const bar = document.createElement('div');
    bar.className = 'tools-bar';
    bar.innerHTML = `
      <button class="tool-btn" data-tool="hint"><span class="icon">💡</span>${TEXTS.tools.hint}</button>
      <button class="tool-btn" data-tool="together"><span class="icon">🤝</span>${TEXTS.tools.together}</button>
      <button class="tool-btn" data-tool="parts"><span class="icon">🧩</span>${TEXTS.tools.parts}</button>
      <button class="tool-btn" data-tool="pause"><span class="icon">⏸️</span>${TEXTS.tools.pause}</button>
    `;
    bar.querySelectorAll('.tool-btn').forEach(btn => {
      btn.onclick = () => this.useTool(btn.dataset.tool);
    });
    container.appendChild(bar);
  },

  useTool(tool) {
    if (tool === 'pause') this.showPausePanel();
    else if (tool === 'hint') alert('Pista: Mira con calma y prueba una opción similar.');
    else if (tool === 'together') alert('Ayuda juntos: El adulto puede acompañarte a comparar.');
    else if (tool === 'parts') alert('Por partes: Enfócate en un paso a la vez.');
  },

  showPausePanel() {
    const panel = document.createElement('div');
    panel.style.cssText = 'position:absolute; inset:0; background:rgba(244,241,222,0.95); display:flex; flex-direction:column; align-items:center; justify-content:center; z-index:50;';
    panel.innerHTML = `<h3>Una pausa</h3>${TEXTS.pauseOptions.map(opt => `<button class="btn secondary" style="margin:0.5rem; width:280px;">${opt}</button>`).join('')}`;
    panel.querySelectorAll('button').forEach((btn, i) => {
      btn.onclick = () => {
        if (i === 3) panel.remove();
        else if (i === 4) this.showScreen('goodbye');
        else alert(btn.textContent + ' — toma el tiempo que necesites.');
      };
    });
    document.getElementById('game-container').appendChild(panel);
  },

  renderMission1(container) {
    const count = this.state.level === 'explorers' ? 3 : 5;
    container.innerHTML = `
      <h2>${TEXTS.mission1}</h2>
      <p>Coloca las piezas en sus espacios.</p>
      <div id="pieces-area" style="display:flex; flex-wrap:wrap; justify-content:center; margin:1rem 0;"></div>
      <div id="slots-area" style="display:flex; flex-wrap:wrap; justify-content:center; margin:1rem 0;"></div>
      <div id="mission1-msg" style="text-align:center; margin:1rem;"></div>
      <button class="btn" id="mission1-done" style="display:none;">Continuar</button>
    `;
    this.addToolsBar(container);
    const piecesArea = document.getElementById('pieces-area');
    const slotsArea = document.getElementById('slots-area');
    const shapes = ['círculo', 'cuadrado', 'triángulo', 'rectángulo', 'estrella'].slice(0, count);
    let matched = 0;
    shapes.forEach(shape => {
      const piece = document.createElement('div');
      piece.className = 'piece';
      piece.textContent = shape;
      piece.dataset.shape = shape;
      piece.onclick = () => this.selectPiece(piece, slotsArea, () => {
        matched++;
        if (matched === count) {
          document.getElementById('mission1-done').style.display = 'block';
          this.state.seals[0] = true;
          this.state.missions[1].status = 'completed';
        }
      });
      piecesArea.appendChild(piece);
      const slot = document.createElement('div');
      slot.className = 'slot';
      slot.textContent = '?';
      slot.dataset.shape = shape;
      slotsArea.appendChild(slot);
    });
    document.getElementById('mission1-done').onclick = () => this.showScreen('map');
  },

  selectPiece(piece, slotsArea, onMatch) {
    document.querySelectorAll('.piece').forEach(p => p.style.outline = '');
    piece.style.outline = '3px solid var(--gold)';
    slotsArea.querySelectorAll('.slot').forEach(slot => {
      slot.onclick = () => {
        if (slot.dataset.shape === piece.dataset.shape && !slot.classList.contains('correct')) {
          slot.textContent = piece.textContent;
          slot.classList.add('correct');
          piece.classList.add('matched');
          onMatch();
        } else {
          document.getElementById('mission1-msg').textContent = 'Esta pieza no encaja aquí. Podemos mirar otra opción.';
        }
      };
    });
  },

  renderMission2(container) {
    container.innerHTML = `
      <h2>${TEXTS.mission2}</h2>
      <p id="turn-info">Turno de ${this.state.players[0]?.name || 'Agente 1'}</p>
      <div id="bridge" style="display:flex; justify-content:center; align-items:flex-end; height:120px; margin:2rem 0; border-bottom:4px solid #8B4513;"></div>
      <div id="planks" style="display:flex; justify-content:center; gap:1rem;"></div>
      <button class="btn" id="mission2-done" style="display:none; margin-top:1rem;">Continuar</button>
    `;
    this.addToolsBar(container);
    let planksPlaced = 0;
    const total = 6;
    const placePlank = () => {
      if (planksPlaced >= total) return;
      const plank = document.createElement('div');
      plank.className = 'plank';
      plank.style.width = (80 + Math.random()*40) + 'px';
      document.getElementById('bridge').appendChild(plank);
      planksPlaced++;
      if (planksPlaced === total) {
        document.getElementById('mission2-done').style.display = 'block';
        this.state.seals[1] = true;
        this.state.missions[2].status = 'completed';
      } else {
        const nextIdx = (this.state.currentPlayerIndex + 1) % Math.max(1, this.state.players.length);
        this.state.currentPlayerIndex = nextIdx;
        document.getElementById('turn-info').textContent = `Turno de ${this.state.players[nextIdx]?.name || 'Agente'}`;
      }
    };
    for (let i = 0; i < 2; i++) {
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.textContent = `Tablón ${i+1}`;
      btn.onclick = placePlank;
      document.getElementById('planks').appendChild(btn);
    }
    document.getElementById('mission2-done').onclick = () => this.showScreen('map');
  },

  renderMission3(container) {
    container.innerHTML = `
      <h2>${TEXTS.mission3}</h2>
      <p>Lleva la herramienta al robot eligiendo caminos.</p>
      <div id="paths" style="display:flex; justify-content:center; gap:2rem; margin:2rem 0;">
        <button class="btn" data-path="1">Camino 1</button>
        <button class="btn" data-path="2">Camino 2</button>
        ${this.state.level === 'agents' ? '<button class="btn" data-path="3">Camino 3</button>' : ''}
      </div>
      <div id="mission3-msg"></div>
      <button class="btn" id="mission3-done" style="display:none;">Continuar</button>
    `;
    this.addToolsBar(container);
    let step = 0;
    document.querySelectorAll('[data-path]').forEach(btn => {
      btn.onclick = () => {
        step++;
        if (this.state.routeChange && step === 1) {
          document.getElementById('mission3-msg').textContent = 'Querías seguir por aquí y ahora está cerrado. Esto puede molestar. ¿Qué podemos probar?';
        } else {
          document.getElementById('mission3-done').style.display = 'block';
          this.state.seals[2] = true;
          this.state.missions[3].status = 'completed';
        }
      };
    });
    document.getElementById('mission3-done').onclick = () => this.showScreen('map');
  },

  renderBriefcase(container) {
    container.innerHTML = `
      <h2>Apertura del maletín</h2>
      <p style="font-size:1.2rem; margin:1.5rem 0;">${TEXTS.briefcaseOpen}</p>
      <div style="display:flex; justify-content:center; gap:1rem; flex-wrap:wrap;">
        ${TEXTS.toolsChoice.map(t => `<div class="btn secondary" style="pointer-events:none;">${t}</div>`).join('')}
      </div>
      <button class="btn" id="brief-next" style="margin-top:2rem;">Elegir herramientas</button>
    `;
    document.getElementById('brief-next').onclick = () => this.showScreen('tools');
  },

  renderToolsChoice(container) {
    container.innerHTML = `
      <h2>${TEXTS.personal}</h2>
      <div id="tools-choices" style="display:flex; flex-direction:column; gap:0.5rem; margin:1.5rem 0; align-items:center;">
        ${TEXTS.toolsChoice.map((t, i) => `<label><input type="checkbox" value="${i}"> ${t}</label>`).join('')}
      </div>
      <button class="btn" id="tools-next">Continuar al video</button>
    `;
    document.getElementById('tools-next').onclick = () => this.showScreen('video');
  },

  renderVideo(container) {
    container.innerHTML = `
      <h2>${TEXTS.videoTitle}</h2>
      <p>${TEXTS.videoText}</p>
      <div id="video-area" style="aspect-ratio:16/9; background:var(--cream); display:flex; align-items:center; justify-content:center; margin:1rem auto; border-radius:12px; max-width:720px; border:2px solid var(--deep-blue);">
        <p id="video-placeholder">${TEXTS.videoPlaceholder}</p>
        <video id="closing-video" controls style="display:none; width:100%; height:100%; border-radius:12px;" playsinline></video>
      </div>
      <input type="file" id="video-file" accept="video/mp4,video/*" style="margin:1rem 0;">
      <button class="btn" id="play-video" disabled>Ver video</button>
      <button class="btn secondary" id="skip-video">Continuar sin ver</button>
    `;
    const fileInput = document.getElementById('video-file');
    const videoEl = document.getElementById('closing-video');
    const placeholder = document.getElementById('video-placeholder');
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        if (this.state.videoSrc) URL.revokeObjectURL(this.state.videoSrc);
        this.state.videoSrc = URL.createObjectURL(file);
        videoEl.src = this.state.videoSrc;
        placeholder.style.display = 'none';
        videoEl.style.display = 'block';
        document.getElementById('play-video').disabled = false;
      }
    };
    document.getElementById('play-video').onclick = () => videoEl.play().catch(() => alert('No se pudo reproducir. Continúa si quieres.'));
    document.getElementById('skip-video').onclick = () => this.showScreen('goodbye');
  },

  renderGoodbye(container) {
    container.innerHTML = `
      <h2>¡Gracias!</h2>
      <p style="font-size:1.3rem; margin:1.5rem 0;">${TEXTS.goodbye}</p>
      <button class="btn" id="to-summary">Ver resumen</button>
      <button class="btn secondary" id="new-session" style="margin-left:1rem;">Nueva sesión</button>
    `;
    document.getElementById('to-summary').onclick = () => this.showScreen('summary');
    document.getElementById('new-session').onclick = () => { if (confirm('¿Borrar progreso y empezar de nuevo?')) location.reload(); };
  },

  renderSummary(container) {
    container.innerHTML = `
      <h2>Resumen para el acompañante</h2>
      <p>${TEXTS.summaryDisclaimer}</p>
      <ul style="margin:1rem 0; text-align:left; max-width:600px;">
        <li>Misiones completadas: ${Object.values(this.state.missions).filter(m => m.status === 'completed').length}</li>
        <li>Sellos: ${this.state.seals.filter(Boolean).length}/3</li>
        <li>Participantes: ${this.state.players.length}</li>
      </ul>
      <button class="btn" onclick="window.print()">Imprimir resumen</button>
      <button class="btn secondary" onclick="Game.showScreen('map')">Volver al mapa</button>
    `;
  },

  toggleCompanion(open = true) {
    const panel = document.getElementById('companion-panel');
    panel.classList.toggle('open', open);
    if (open) this.renderCompanionContent();
  },

  renderCompanionContent() {
    document.getElementById('companion-content').innerHTML = `
      <p>Nivel: ${this.state.level}</p>
      <p>Modo: ${this.state.mode}</p>
      <button class="btn" onclick="Game.showScreen('map')">Ir al mapa</button>
      <button class="btn secondary" onclick="Game.showScreen('goodbye')">Terminar</button>
    `;
  },

  speak(text) {
    if (!this.state.narration || !window.speechSynthesis) return;
    speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'es-ES';
    speechSynthesis.speak(utter);
  }
};

document.addEventListener('DOMContentLoaded', () => Game.init());
