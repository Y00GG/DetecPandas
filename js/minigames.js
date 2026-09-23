const MINIGAME_STYLES = `
  .mg-wrapper {
    width: 100%; height: 100%;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 1rem;
    font-family: 'Fredoka', sans-serif;
    color: #fff8ef;
    position: relative;
    overflow: hidden;
  }
  .mg-wrapper * { box-sizing: border-box; }
  .mg-title {
    font-size: clamp(1.2rem, 3.5vw, 1.8rem);
    font-weight: 700; color: #ffda6b;
    text-align: center; margin-bottom: 0.5rem;
    text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  }
  .mg-subtitle {
    font-size: clamp(0.8rem, 2vw, 1rem);
    color: rgba(255,248,239,0.7); text-align: center;
    margin-bottom: 1.5rem;
  }
  .mg-btn {
    font-family: 'Fredoka', sans-serif;
    font-size: clamp(0.9rem, 2.2vw, 1.1rem);
    font-weight: 600; color: #fff8ef;
    background: linear-gradient(180deg, #5a8f3c, #3d6b28);
    border: 3px solid #7ab85a;
    border-bottom: 4px solid #2a4f1a;
    border-radius: 10px;
    padding: 0.7rem 2rem; cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }
  .mg-btn:active { border-bottom-width: 2px; transform: translateY(2px); }
  .mg-btn.secondary {
    background: linear-gradient(180deg, #6a6a7a, #4a4a5a);
    border-color: #8a8a9a;
    border-bottom-color: #3a3a4a;
  }
  .mg-feedback {
    font-size: clamp(1rem, 2.5vw, 1.3rem);
    font-weight: 600; text-align: center;
    margin: 1rem 0; min-height: 2em;
  }
  .mg-feedback.success { color: #6ec46e; }
  .mg-feedback.error { color: #e85d5d; }
  .mg-feedback.info { color: #a8d8ea; }
  .mg-lives {
    font-size: clamp(1rem, 2.5vw, 1.2rem);
    margin-bottom: 0.5rem;
  }
`;

function injectStyles(container) {
  if (!container.querySelector('#mg-styles')) {
    const style = document.createElement('style');
    style.id = 'mg-styles';
    style.textContent = MINIGAME_STYLES;
    container.appendChild(style);
  }
}

// ═══════════════════════════════════════
// MINIGAME 1: Calendar Catch (Rhythm/Timing)
// Months fall and you must tap them in the correct seasonal order
// ═══════════════════════════════════════
export function calendarMinigame(container, onComplete) {
  injectStyles(container);

  const SEASONS = [
    { name: 'Primavera', months: ['Marzo', 'Abril', 'Mayo'], color: '#6ec46e' },
    { name: 'Verano', months: ['Junio', 'Julio', 'Agosto'], color: '#ffda6b' },
    { name: 'Otoño', months: ['Septiembre', 'Octubre', 'Noviembre'], color: '#e8a050' },
    { name: 'Invierno', months: ['Diciembre', 'Enero', 'Febrero'], color: '#a8d8ea' },
  ];

  const correctOrder = SEASONS.flatMap(s => s.months);
  let caught = [];
  let lives = 3;
  let gameActive = false;
  let fallingCards = [];
  let animFrame = null;
  let spawnTimer = null;
  let spawnIndex = 0;

  container.innerHTML = `
    <div class="mg-wrapper">
      <div class="mg-title">Reconstruye el Calendario</div>
      <div class="mg-subtitle">Atrapa los meses en orden tocándolos antes de que caigan</div>
      <div class="mg-lives" id="cal-lives"></div>
      <div id="cal-progress" style="font-size:clamp(0.8rem,1.8vw,0.95rem);color:#e8c9a0;margin-bottom:0.5rem;text-align:center;min-height:1.5em;"></div>
      <div id="cal-arena" style="position:relative;width:min(100%,500px);height:55vh;border:2px solid rgba(196,149,106,0.3);border-radius:12px;overflow:hidden;background:rgba(0,0,0,0.3);touch-action:none;"></div>
      <div class="mg-feedback" id="cal-feedback"></div>
      <button class="mg-btn" id="cal-start">Empezar</button>
    </div>
  `;

  const arena = container.querySelector('#cal-arena');
  const livesEl = container.querySelector('#cal-lives');
  const feedbackEl = container.querySelector('#cal-feedback');
  const progressEl = container.querySelector('#cal-progress');
  const startBtn = container.querySelector('#cal-start');

  function updateLives() {
    livesEl.textContent = '❤️'.repeat(lives) + '🖤'.repeat(3 - lives);
  }

  function updateProgress() {
    const next = correctOrder[caught.length];
    progressEl.textContent = next ? `Siguiente: ${next}` : '';
  }

  function getSeason(month) {
    return SEASONS.find(s => s.months.includes(month));
  }

  function spawnCard() {
    if (!gameActive || spawnIndex >= correctOrder.length + 4) return;

    const shuffled = [...correctOrder].sort(() => Math.random() - 0.5);
    const month = shuffled[spawnIndex % shuffled.length];
    spawnIndex++;

    const season = getSeason(month);
    const card = document.createElement('div');
    const arenaW = arena.offsetWidth;
    const cardW = Math.min(110, arenaW * 0.28);
    const x = Math.random() * (arenaW - cardW);

    Object.assign(card.style, {
      position: 'absolute',
      left: x + 'px',
      top: '-60px',
      width: cardW + 'px',
      padding: '0.5rem 0.3rem',
      background: `linear-gradient(135deg, ${season.color}22, ${season.color}44)`,
      border: `2px solid ${season.color}`,
      borderRadius: '10px',
      textAlign: 'center',
      fontFamily: "'Fredoka', sans-serif",
      fontSize: 'clamp(0.7rem, 2vw, 0.9rem)',
      fontWeight: '600',
      color: '#fff8ef',
      cursor: 'pointer',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      touchAction: 'none',
      zIndex: '5',
    });

    card.innerHTML = `<div style="font-size:0.7em;opacity:0.7">${season.name}</div>${month}`;
    card.dataset.month = month;

    const handleTap = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!gameActive) return;

      const expected = correctOrder[caught.length];
      if (month === expected) {
        caught.push(month);
        card.style.transition = 'transform 0.2s, opacity 0.2s';
        card.style.transform = 'scale(1.3)';
        card.style.opacity = '0';
        setTimeout(() => card.remove(), 200);
        fallingCards = fallingCards.filter(c => c.el !== card);
        feedbackEl.textContent = `¡${month}! ✓`;
        feedbackEl.className = 'mg-feedback success';
        updateProgress();

        if (caught.length === correctOrder.length) {
          endGame(true);
        }
      } else {
        lives--;
        updateLives();
        feedbackEl.textContent = `No es ${month}… necesitas ${expected}`;
        feedbackEl.className = 'mg-feedback error';
        card.style.borderColor = '#e85d5d';
        setTimeout(() => { if (card.parentNode) card.style.borderColor = season.color; }, 400);
        if (lives <= 0) endGame(false);
      }
    };

    card.addEventListener('pointerdown', handleTap);
    arena.appendChild(card);

    const speed = 0.4 + Math.random() * 0.3 + (caught.length * 0.02);
    fallingCards.push({ el: card, y: -60, speed });
  }

  function gameLoop() {
    if (!gameActive) return;
    const arenaH = arena.offsetHeight;

    fallingCards = fallingCards.filter(c => {
      c.y += c.speed;
      c.el.style.top = c.y + 'px';

      if (c.y > arenaH + 10) {
        c.el.remove();
        return false;
      }
      return true;
    });

    animFrame = requestAnimationFrame(gameLoop);
  }

  function endGame(won) {
    gameActive = false;
    clearInterval(spawnTimer);
    cancelAnimationFrame(animFrame);

    if (won) {
      feedbackEl.textContent = '¡Calendario completo!';
      feedbackEl.className = 'mg-feedback success';
      startBtn.textContent = 'Continuar';
      startBtn.classList.remove('secondary');
      startBtn.onclick = () => onComplete();
    } else {
      feedbackEl.textContent = 'Vuelve a intentarlo…';
      feedbackEl.className = 'mg-feedback error';
      startBtn.textContent = 'Reintentar';
      startBtn.classList.add('secondary');
      startBtn.onclick = startGame;
    }
    startBtn.classList.remove('hidden');
    startBtn.style.display = '';
  }

  function startGame() {
    caught = [];
    lives = 3;
    spawnIndex = 0;
    fallingCards.forEach(c => c.el.remove());
    fallingCards = [];
    feedbackEl.textContent = '';
    updateLives();
    updateProgress();
    startBtn.style.display = 'none';
    gameActive = true;

    spawnTimer = setInterval(spawnCard, 1400);
    spawnCard();
    gameLoop();
  }

  updateLives();
  startBtn.onclick = startGame;
}


// ═══════════════════════════════════════
// MINIGAME 2: Precision Click (Power Meter)
// Stop the needle in the tiny green zone
// ═══════════════════════════════════════
export function precisionMinigame(container, onComplete) {
  injectStyles(container);

  const ROUNDS_NEEDED = 3;
  let round = 0;
  let lives = 3;
  let angle = 0;
  let speed = 2.5;
  let direction = 1;
  let animFrame = null;
  let gameActive = false;

  const zoneStart = 75;
  const zoneEnd = 95;

  container.innerHTML = `
    <div class="mg-wrapper">
      <div class="mg-title">La Ventana del Tiempo</div>
      <div class="mg-subtitle">Toca justo cuando la aguja esté en la zona verde (${ROUNDS_NEEDED} veces)</div>
      <div class="mg-lives" id="prec-lives"></div>
      <div id="prec-round" style="font-size:clamp(0.85rem,2vw,1rem);color:#e8c9a0;margin-bottom:1rem;"></div>
      <div id="prec-meter" style="position:relative;width:min(90%,400px);height:40px;border-radius:20px;overflow:hidden;border:3px solid #c4956a;margin-bottom:1.5rem;">
        <div style="position:absolute;inset:0;background:linear-gradient(90deg,#e85d5d 0%,#e85d5d ${zoneStart}%,#6ec46e ${zoneStart}%,#6ec46e ${zoneEnd}%,#e85d5d ${zoneEnd}%,#e85d5d 100%);opacity:0.4;"></div>
        <div id="prec-needle" style="position:absolute;top:0;bottom:0;width:4px;background:#fff8ef;border-radius:2px;box-shadow:0 0 8px rgba(255,248,239,0.6);transition:none;"></div>
      </div>
      <button class="mg-btn" id="prec-tap" style="padding:1rem 3rem;font-size:clamp(1.1rem,3vw,1.4rem);">¡AHORA!</button>
      <div class="mg-feedback" id="prec-feedback"></div>
      <button class="mg-btn secondary" id="prec-start">Empezar</button>
    </div>
  `;

  const livesEl = container.querySelector('#prec-lives');
  const roundEl = container.querySelector('#prec-round');
  const needle = container.querySelector('#prec-needle');
  const tapBtn = container.querySelector('#prec-tap');
  const feedbackEl = container.querySelector('#prec-feedback');
  const startBtn = container.querySelector('#prec-start');

  tapBtn.style.display = 'none';

  function updateLives() {
    livesEl.textContent = '❤️'.repeat(lives) + '🖤'.repeat(3 - lives);
  }

  function updateRound() {
    roundEl.textContent = `Ronda ${round + 1} de ${ROUNDS_NEEDED}`;
  }

  function animate() {
    if (!gameActive) return;
    angle += speed * direction;
    if (angle >= 100 || angle <= 0) direction *= -1;
    needle.style.left = `calc(${angle}% - 2px)`;
    animFrame = requestAnimationFrame(animate);
  }

  function handleTap() {
    if (!gameActive) return;

    if (angle >= zoneStart && angle <= zoneEnd) {
      round++;
      feedbackEl.textContent = '¡Perfecto!';
      feedbackEl.className = 'mg-feedback success';
      speed += 0.5;

      if (round >= ROUNDS_NEEDED) {
        endGame(true);
      } else {
        updateRound();
      }
    } else {
      lives--;
      updateLives();
      const dist = angle < zoneStart ? 'Muy pronto…' : 'Muy tarde…';
      feedbackEl.textContent = dist;
      feedbackEl.className = 'mg-feedback error';
      if (lives <= 0) endGame(false);
    }
  }

  function endGame(won) {
    gameActive = false;
    cancelAnimationFrame(animFrame);
    tapBtn.style.display = 'none';

    if (won) {
      feedbackEl.textContent = '¡Ventana capturada!';
      feedbackEl.className = 'mg-feedback success';
      startBtn.textContent = 'Continuar';
      startBtn.classList.remove('secondary');
      startBtn.onclick = () => onComplete();
    } else {
      feedbackEl.textContent = 'No fue suficiente… inténtalo de nuevo';
      feedbackEl.className = 'mg-feedback error';
      startBtn.textContent = 'Reintentar';
      startBtn.onclick = startGame;
    }
    startBtn.style.display = '';
  }

  function startGame() {
    round = 0;
    lives = 3;
    speed = 2.5;
    angle = 0;
    direction = 1;
    gameActive = true;
    updateLives();
    updateRound();
    feedbackEl.textContent = '';
    startBtn.style.display = 'none';
    tapBtn.style.display = '';
    animate();
  }

  tapBtn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    handleTap();
  });

  updateLives();
  startBtn.onclick = startGame;
}


// ═══════════════════════════════════════
// MINIGAME 3: Logic Puzzle (Family Connections)
// Match species to their litter sizes using elimination
// ═══════════════════════════════════════
export function logicMinigame(container, onComplete) {
  injectStyles(container);

  const FAMILIES = [
    { species: 'Conejos', litter: '6-8 crías', icon: '🐰', correct: 3 },
    { species: 'Zorros', litter: '4-6 crías', icon: '🦊', correct: 2 },
    { species: 'Ardillas', litter: '3-4 crías', icon: '🐿️', correct: 1 },
    { species: 'Pandas', litter: '1-2 crías', icon: '🐼', correct: 0 },
  ];

  const LITTERS = ['1-2 crías', '3-4 crías', '4-6 crías', '6-8 crías'];
  let selections = {};
  let solved = false;

  container.innerHTML = `
    <div class="mg-wrapper" style="justify-content:flex-start;padding-top:2rem;">
      <div class="mg-title">Archivo de las Familias</div>
      <div class="mg-subtitle">Conecta cada especie con su tamaño de camada</div>
      <div id="logic-grid" style="width:min(95%,450px);margin:1rem 0;"></div>
      <div class="mg-feedback" id="logic-feedback"></div>
      <button class="mg-btn" id="logic-check">Verificar</button>
    </div>
  `;

  const grid = container.querySelector('#logic-grid');
  const feedbackEl = container.querySelector('#logic-feedback');
  const checkBtn = container.querySelector('#logic-check');

  function render() {
    grid.innerHTML = FAMILIES.map((f, i) => `
      <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.8rem;background:rgba(0,0,0,0.3);border:2px solid rgba(196,149,106,0.3);border-radius:12px;padding:0.6rem 0.8rem;">
        <span style="font-size:1.5rem;">${f.icon}</span>
        <span style="flex:1;font-weight:600;font-size:clamp(0.85rem,2vw,1rem);">${f.species}</span>
        <select data-idx="${i}" style="
          font-family:'Fredoka',sans-serif;
          font-size:clamp(0.8rem,1.8vw,0.95rem);
          background:#2d1b0e;
          color:#fff8ef;
          border:2px solid #c4956a;
          border-radius:8px;
          padding:0.4rem 0.5rem;
          outline:none;
          -webkit-appearance:none;
          min-width:120px;
        ">
          <option value="">Elegir…</option>
          ${LITTERS.map(l => `<option value="${l}" ${selections[i] === l ? 'selected' : ''}>${l}</option>`).join('')}
        </select>
      </div>
    `).join('');

    grid.querySelectorAll('select').forEach(sel => {
      sel.addEventListener('change', () => {
        selections[sel.dataset.idx] = sel.value;
      });
    });
  }

  function check() {
    if (solved) {
      onComplete();
      return;
    }

    const allFilled = FAMILIES.every((_, i) => selections[i]);
    if (!allFilled) {
      feedbackEl.textContent = 'Selecciona todas las opciones';
      feedbackEl.className = 'mg-feedback info';
      return;
    }

    const correct = FAMILIES.every((f, i) => selections[i] === LITTERS[f.correct]);

    if (correct) {
      solved = true;
      feedbackEl.textContent = '¡Todas las conexiones son correctas!';
      feedbackEl.className = 'mg-feedback success';
      checkBtn.textContent = 'Continuar';
      checkBtn.classList.remove('secondary');
    } else {
      const wrongCount = FAMILIES.filter((f, i) => selections[i] !== LITTERS[f.correct]).length;
      feedbackEl.textContent = `${wrongCount} conexión(es) incorrecta(s). Piénsalo de nuevo…`;
      feedbackEl.className = 'mg-feedback error';
    }
  }

  render();
  checkBtn.onclick = check;
}


// ═══════════════════════════════════════
// MINIGAME 4: Code 180 (Combination Lock)
// ═══════════════════════════════════════
export function codeMinigame(container, onComplete) {
  injectStyles(container);

  let digits = [0, 0, 0];

  container.innerHTML = `
    <div class="mg-wrapper">
      <div class="mg-title">El Código Secreto</div>
      <div class="mg-subtitle">Recuerda los números de las pistas: temporada, días, crías</div>
      <div style="display:flex;gap:1rem;margin:2rem 0;" id="code-dials"></div>
      <div class="mg-feedback" id="code-feedback"></div>
      <button class="mg-btn" id="code-submit">Abrir</button>
    </div>
  `;

  const dialsEl = container.querySelector('#code-dials');
  const feedbackEl = container.querySelector('#code-feedback');
  const submitBtn = container.querySelector('#code-submit');

  function renderDials() {
    dialsEl.innerHTML = digits.map((d, i) => `
      <div style="display:flex;flex-direction:column;align-items:center;gap:0.3rem;">
        <button class="mg-btn secondary dial-btn" data-idx="${i}" data-dir="up" style="padding:0.4rem 1rem;font-size:1.2rem;">▲</button>
        <div style="
          width:60px;height:70px;
          background:#2d1b0e;
          border:3px solid #c4956a;
          border-radius:12px;
          display:flex;align-items:center;justify-content:center;
          font-size:2rem;font-weight:700;color:#ffda6b;
        ">${d}</div>
        <button class="mg-btn secondary dial-btn" data-idx="${i}" data-dir="down" style="padding:0.4rem 1rem;font-size:1.2rem;">▼</button>
      </div>
    `).join('');

    dialsEl.querySelectorAll('.dial-btn').forEach(btn => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        const idx = parseInt(btn.dataset.idx);
        const dir = btn.dataset.dir;
        digits[idx] = (digits[idx] + (dir === 'up' ? 1 : 9)) % 10;
        renderDials();
      });
    });
  }

  function submit() {
    const code = digits.join('');
    if (code === '180') {
      feedbackEl.textContent = '¡El candado se abre!';
      feedbackEl.className = 'mg-feedback success';
      submitBtn.textContent = 'Continuar';
      submitBtn.onclick = () => onComplete();
    } else {
      feedbackEl.textContent = 'No abre. El misterio sigue resistiéndose.';
      feedbackEl.className = 'mg-feedback error';
    }
  }

  renderDials();
  submitBtn.onclick = submit;
}
