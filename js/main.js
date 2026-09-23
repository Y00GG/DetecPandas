import { DialogueEngine } from './dialogueEngine.js';
import { SCENES } from './scenes.js';
import {
  calendarMinigame,
  precisionMinigame,
  logicMinigame,
  codeMinigame,
} from './minigames.js';

const dialogue = new DialogueEngine();

const titleScreen = document.getElementById('title-screen');
const sceneScreen = document.getElementById('scene-screen');
const minigameScreen = document.getElementById('minigame-screen');
const minigameContainer = document.getElementById('minigame-container');
const sceneBg = document.getElementById('scene-background');
const sceneTitleOverlay = document.getElementById('scene-title-overlay');
const sceneTitleText = document.getElementById('scene-title-text');
const sceneTitleSub = document.getElementById('scene-title-sub');
const transitionOverlay = document.getElementById('transition-overlay');

function showScreen(screen) {
  [titleScreen, sceneScreen, minigameScreen].forEach(s => s.classList.remove('active'));
  screen.classList.add('active');
}

async function transition(callback) {
  transitionOverlay.classList.add('active');
  await sleep(500);
  callback();
  await sleep(100);
  transitionOverlay.classList.remove('active');
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function showSceneTitle(title, subtitle) {
  if (!title) return;
  sceneTitleText.textContent = title;
  sceneTitleSub.textContent = subtitle || '';
  sceneTitleOverlay.classList.remove('hidden');

  return new Promise(resolve => {
    const dismiss = () => {
      sceneTitleOverlay.classList.add('hidden');
      sceneTitleOverlay.removeEventListener('pointerdown', dismiss);
      resolve();
    };
    setTimeout(() => {
      sceneTitleOverlay.addEventListener('pointerdown', dismiss);
    }, 600);
    setTimeout(dismiss, 3000);
  });
}

function loadScene(sceneId) {
  const scene = SCENES[sceneId];
  if (!scene) {
    showEnding();
    return;
  }

  transition(async () => {
    showScreen(sceneScreen);
    sceneBg.style.backgroundImage = `url('${scene.background}')`;

    if (scene.title) {
      await showSceneTitle(scene.title, scene.subtitle);
    }

    dialogue.loadDialogues(scene.dialogues, () => {
      const next = scene.next;
      if (next && next.startsWith('minigame_')) {
        launchMinigame(next, sceneId);
      } else if (next === 'ending') {
        showEnding();
      } else {
        loadScene(next);
      }
    });
  });
}

function launchMinigame(minigameId, fromScene) {
  transition(() => {
    showScreen(minigameScreen);
    minigameContainer.innerHTML = '';

    const afterScene = fromScene.replace('_intro', '_end');
    const onComplete = () => {
      loadScene(afterScene);
    };

    switch (minigameId) {
      case 'minigame_calendar':
        calendarMinigame(minigameContainer, onComplete);
        break;
      case 'minigame_precision':
        precisionMinigame(minigameContainer, onComplete);
        break;
      case 'minigame_logic':
        logicMinigame(minigameContainer, onComplete);
        break;
      case 'minigame_code':
        codeMinigame(minigameContainer, onComplete);
        break;
    }
  });
}

function showEnding() {
  transition(() => {
    showScreen(sceneScreen);
    sceneBg.style.backgroundImage = `url('assets/scenes/escena1.png')`;

    const endDialogues = [
      { type: 'narrator', text: 'Nennis resolvió el misterio de los pupitres vacíos.' },
      { type: 'narrator', text: 'Los pandas son una edición limitada, y eso los hace especiales.' },
      { type: 'narrator', text: '¿Pero qué pasó con el bambú perdido?\nEso… es otro caso.' },
      { type: 'narrator', text: '🐾 Fin 🐾' },
    ];

    dialogue.loadDialogues(endDialogues, () => {
      transition(() => {
        showScreen(titleScreen);
      });
    });
  });
}

// Input handling - touch and click
function handleAdvance(e) {
  if (e.target.closest('button') || e.target.closest('select') || e.target.closest('.dial-btn')) return;
  if (!sceneScreen.classList.contains('active')) return;
  e.preventDefault();
  dialogue.advance();
}

sceneScreen.addEventListener('pointerdown', handleAdvance);

// Start button
document.getElementById('btn-start').addEventListener('pointerdown', (e) => {
  e.preventDefault();
  loadScene('scene1');
});

// Prevent double-tap zoom on mobile
document.addEventListener('touchstart', (e) => {
  if (e.touches.length > 1) e.preventDefault();
}, { passive: false });

let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
  const now = Date.now();
  if (now - lastTouchEnd < 300) e.preventDefault();
  lastTouchEnd = now;
}, { passive: false });
