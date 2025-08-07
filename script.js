const iconMap = {
  "slice of pizza": "Pizza",
  "radish": "Radish",
  "mitten": "Mitten",
  "musical note": "MusicNote",
  "slice of bread": "BreadSlice",
  "ice-cream cone": "IceCream",
  "flag": "Flag",
  "doughnut": "Doughnut",
  "cracker": "Crackers",
  "book": "Book",
  "watermelon": "Watermelon",
  "butterfly": "Butterfly",
  "snake": "Snake",
  "ring": "Ring",
  "paintbrush": "Brush",
  "crown": "Crown"
};

const centerHotspots = [
  { name: "slice of pizza", cx: 536, cy: 769, w: 120, h: 45 },
  { name: "radish", cx: 91, cy: 302, w: 45, h: 62 },
  { name: "mitten", cx: 200, cy: 775, w: 108, h: 96 },
  { name: "musical note", cx: 241, cy: 439, w: 60, h: 65 },
  { name: "slice of bread", cx: 562, cy: 692, w: 67, h: 59 },
  { name: "ice-cream cone", cx: 94, cy: 677, w: 74, h: 122 },
  { name: "flag", cx: 600, cy: 258, w: 100, h: 262 },
  { name: "doughnut", cx: 284, cy: 559, w: 61, h: 46 },
  { name: "cracker", cx: 117, cy: 143, w: 45, h: 45 },
  { name: "book", cx: 59, cy: 448, w: 79, h: 40 },
  { name: "watermelon", cx: 463, cy: 435, w: 67, h: 77 },
  { name: "butterfly", cx: 458, cy: 163, w: 80, h: 57 },
  { name: "snake", cx: 595, cy: 575, w: 40, h: 160 },
  { name: "ring", cx: 359, cy: 40, w: 38, h: 57 },
  { name: "paintbrush", cx: 298, cy: 718, w: 60, h: 84 }
];

const objectsToFind = centerHotspots.map(obj => ({
  name: obj.name,
  x: obj.cx - obj.w / 2,
  y: obj.cy - obj.h / 2,
  w: obj.w,
  h: obj.h
}));

let score = 0;
let timeLeft = 180;
let timer;

function startGame() {
  const list = document.getElementById('object-list');
  const imageContainer = document.querySelector('.left-panel');

  // Create Hotspots
  objectsToFind.forEach(obj => {
    const hotspot = document.createElement('div');
    hotspot.classList.add('hotspot');
    hotspot.style.top = `${obj.y}px`;
    hotspot.style.left = `${obj.x}px`;
    hotspot.style.width = `${obj.w}px`;
    hotspot.style.height = `${obj.h}px`;
    hotspot.dataset.name = obj.name;
    imageContainer.appendChild(hotspot);
  });

  // Create Draggable Icons
  objectsToFind.forEach((obj) => {
    const iconFile = iconMap[obj.name] || obj.name;
    const img = document.createElement('img');
    img.src = `Temp/${iconFile}.png`;
    img.alt = obj.name;
    img.classList.add('draggable-icon');
    img.dataset.name = obj.name;
    list.appendChild(img);

    // --- MOUSE DRAG LOGIC ---
    img.addEventListener('mousedown', (e) => {
      e.preventDefault();
      const originalIcon = e.target;
      if (originalIcon.classList.contains('found')) return;

      const offsetX = e.offsetX;
      const offsetY = e.offsetY;
      const clone = originalIcon.cloneNode(true);
      clone.classList.add('dragging');
      document.body.appendChild(clone);
      clone.style.left = `${e.clientX - offsetX}px`;
      clone.style.top = `${e.clientY - offsetY}px`;
      originalIcon.style.opacity = '0.3';

      function mouseMove(moveEvent) {
        clone.style.left = `${moveEvent.clientX - offsetX}px`;
        clone.style.top = `${moveEvent.clientY - offsetY}px`;
      }

      function mouseUp(upEvent) {
        document.removeEventListener('mousemove', mouseMove);
        document.removeEventListener('mouseup', mouseUp);
        clone.style.display = 'none';
        const elementUnder = document.elementFromPoint(upEvent.clientX, upEvent.clientY);
        clone.remove();

        if (elementUnder && elementUnder.classList.contains('hotspot') && elementUnder.dataset.name === originalIcon.dataset.name) {
          elementUnder.classList.add('found');
          originalIcon.classList.add('found');
          originalIcon.style.pointerEvents = "none";
          score++;
          revealColoredIcon(obj, elementUnder);
          checkWin();
        } else {
          originalIcon.style.opacity = '1';
        }
      }

      document.addEventListener('mousemove', mouseMove);
      document.addEventListener('mouseup', mouseUp);
    });

    // --- TOUCH DRAG LOGIC ---
    img.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const originalIcon = e.target;
      if (originalIcon.classList.contains('found')) return;

      const touch = e.touches[0];
      const rect = originalIcon.getBoundingClientRect();
      const offsetX = touch.clientX - rect.left;
      const offsetY = touch.clientY - rect.top;
      const clone = originalIcon.cloneNode(true);
      clone.classList.add('dragging');
      document.body.appendChild(clone);
      clone.style.left = `${touch.clientX - offsetX}px`;
      clone.style.top = `${touch.clientY - offsetY}px`;
      originalIcon.style.opacity = '0.3';

      function touchMove(moveEvent) {
        const moveTouch = moveEvent.touches[0];
        clone.style.left = `${moveTouch.clientX - offsetX}px`;
        clone.style.top = `${moveTouch.clientY - offsetY}px`;
      }

      function touchEnd(endEvent) {
        document.removeEventListener('touchmove', touchMove);
        document.removeEventListener('touchend', touchEnd);
        clone.style.display = 'none';
        const endTouch = endEvent.changedTouches[0];
        const elementUnder = document.elementFromPoint(endTouch.clientX, endTouch.clientY);
        clone.remove();
        
        if (elementUnder && elementUnder.classList.contains('hotspot') && elementUnder.dataset.name === originalIcon.dataset.name) {
          elementUnder.classList.add('found');
          originalIcon.classList.add('found');
          originalIcon.style.pointerEvents = "none";
          score++;
          revealColoredIcon(obj, elementUnder);
          checkWin();
        } else {
          originalIcon.style.opacity = '1';
        }
      }
      
      document.addEventListener('touchmove', touchMove, { passive: false });
      document.addEventListener('touchend', touchEnd);
    });
  });

  timer = setInterval(updateTimer, 1000);
}

function updateTimer() {
  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');
  document.getElementById('timer').textContent = `⏱️ ${minutes}:${seconds}`;
  timeLeft--;
  if (timeLeft <= 0) endGame();
}

function endGame() {
  clearInterval(timer);
  document.getElementById('end-screen').classList.remove('hidden');
  document.getElementById('score-value').textContent = score;
  let message = '';
  if (score === 15) {
    message = "🎉 Kola Mass Sarae!";
    launchConfetti();
  } else if (score >= 11) {
    message = "👍 Good Job!";
  } else {
    message = "👎 Better Luck Next Time";
  }
  document.getElementById('end-message').textContent = message;
}

function checkWin() {
  if (score === objectsToFind.length) endGame();
}

function launchConfetti() {
  const duration = 2 * 1000;
  const end = Date.now() + duration;
  (function frame() {
    confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0, y: 1 } });
    confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1, y: 1 } });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

function revealColoredIcon(obj, hotspotEl) {
  const imageContainer = document.querySelector('.left-panel');
  const smoke = document.createElement('div');
  smoke.classList.add('smoke-effect');
  smoke.style.backgroundImage = 'url(Temp/smoke-effect.gif)';
  const smokeSize = 150;
  smoke.style.left = (obj.x + obj.w / 2 - smokeSize / 2) + 'px';
  smoke.style.top = (obj.y + obj.h / 2 - smokeSize / 2) + 'px';
  imageContainer.appendChild(smoke);

  const iconFile = iconMap[obj.name] || obj.name;
  const img = document.createElement('img');
  img.src = `Temp/Ans/${iconFile}C.png`;
  img.classList.add('answer-icon');
  img.style.width = obj.w + 'px';
  img.style.height = obj.h + 'px';
  img.style.top = obj.y + 'px';
  img.style.left = obj.x + 'px';
  imageContainer.appendChild(img);

  setTimeout(() => {
    img.classList.add('reveal');
    // Call the star burst effect
    launchMagicEffect(obj.x + obj.w / 2, obj.y + obj.h / 2);
  }, 200);
  
  setTimeout(() => {
    smoke.remove();
  }, 1000);
}

function launchMagicEffect(x, y) {
  const puzzleRect = document.getElementById('puzzle-image').getBoundingClientRect();
  const originX = (puzzleRect.left + x) / window.innerWidth;
  const originY = (puzzleRect.top + y) / window.innerHeight;

  confetti({
    particleCount: 30,
    spread: 60,
    startVelocity: 25,
    scalar: 0.7,
    gravity: 0.3,
    origin: { x: originX, y: originY },
    shapes: ['star'],
    colors: ['#ffd700', '#ffeca0', '#ffffff', '#fff4a3']
  });
}

// --- Logic to start the game ---
const startButton = document.getElementById('start-button');
const startScreen = document.getElementById('start-screen');
const gameContainer = document.querySelector('.game-container');
const backgroundMusic = document.getElementById('bg-music');

if (startButton) {
  startButton.addEventListener('click', () => {
    startScreen.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    if (backgroundMusic) {
      backgroundMusic.play().catch(error => console.error("Music playback failed:", error));
    }
    startGame();
  });
} else {
  window.onload = startGame;
}
