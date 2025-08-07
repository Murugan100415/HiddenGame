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

const ORIGINAL_WIDTH = 725;
const ORIGINAL_HEIGHT = 900; // Estimated height, adjust if you know the exact value

const centerHotspots = [
  // Format: { name, x_percent, y_percent, w_percent, h_percent }
  { name: "slice of pizza", cx: 536 / ORIGINAL_WIDTH, cy: 769 / ORIGINAL_HEIGHT, w: 120 / ORIGINAL_WIDTH, h: 45 / ORIGINAL_HEIGHT },
  { name: "radish", cx: 91 / ORIGINAL_WIDTH, cy: 302 / ORIGINAL_HEIGHT, w: 45 / ORIGINAL_WIDTH, h: 62 / ORIGINAL_HEIGHT },
  { name: "mitten", cx: 200 / ORIGINAL_WIDTH, cy: 775 / ORIGINAL_HEIGHT, w: 108 / ORIGINAL_WIDTH, h: 96 / ORIGINAL_HEIGHT },
  { name: "musical note", cx: 241 / ORIGINAL_WIDTH, cy: 439 / ORIGINAL_HEIGHT, w: 60 / ORIGINAL_WIDTH, h: 65 / ORIGINAL_HEIGHT },
  { name: "slice of bread", cx: 562 / ORIGINAL_WIDTH, cy: 692 / ORIGINAL_HEIGHT, w: 67 / ORIGINAL_WIDTH, h: 59 / ORIGINAL_HEIGHT },
  { name: "ice-cream cone", cx: 94 / ORIGINAL_WIDTH, cy: 677 / ORIGINAL_HEIGHT, w: 74 / ORIGINAL_WIDTH, h: 122 / ORIGINAL_HEIGHT },
  { name: "flag", cx: 600 / ORIGINAL_WIDTH, cy: 258 / ORIGINAL_HEIGHT, w: 100 / ORIGINAL_WIDTH, h: 262 / ORIGINAL_HEIGHT },
  { name: "doughnut", cx: 284 / ORIGINAL_WIDTH, cy: 559 / ORIGINAL_HEIGHT, w: 61 / ORIGINAL_WIDTH, h: 46 / ORIGINAL_HEIGHT },
  { name: "cracker", cx: 117 / ORIGINAL_WIDTH, cy: 143 / ORIGINAL_HEIGHT, w: 45 / ORIGINAL_WIDTH, h: 45 / ORIGINAL_HEIGHT },
  { name: "book", cx: 59 / ORIGINAL_WIDTH, cy: 448 / ORIGINAL_HEIGHT, w: 79 / ORIGINAL_WIDTH, h: 40 / ORIGINAL_HEIGHT },
  { name: "watermelon", cx: 463 / ORIGINAL_WIDTH, cy: 435 / ORIGINAL_HEIGHT, w: 67 / ORIGINAL_WIDTH, h: 77 / ORIGINAL_HEIGHT },
  { name: "butterfly", cx: 458 / ORIGINAL_WIDTH, cy: 163 / ORIGINAL_HEIGHT, w: 80 / ORIGINAL_WIDTH, h: 57 / ORIGINAL_HEIGHT },
  { name: "snake", cx: 595 / ORIGINAL_WIDTH, cy: 575 / ORIGINAL_HEIGHT, w: 40 / ORIGINAL_WIDTH, h: 160 / ORIGINAL_HEIGHT },
  { name: "ring", cx: 359 / ORIGINAL_WIDTH, cy: 40 / ORIGINAL_HEIGHT, w: 38 / ORIGINAL_WIDTH, h: 57 / ORIGINAL_HEIGHT },
  { name: "paintbrush", cx: 298 / ORIGINAL_WIDTH, cy: 718 / ORIGINAL_HEIGHT, w: 60 / ORIGINAL_WIDTH, h: 84 / ORIGINAL_HEIGHT }
];

const objectsToFind = centerHotspots.map(obj => ({
  name: obj.name,
  x: obj.cx - (obj.w / 2),
  y: obj.cy - (obj.h / 2),
  w: obj.w,
  h: obj.h
}));

let score = 0;
let timeLeft = 180;
let timer;

function startGame() {
  const list = document.getElementById('object-list');
  const imageContainer = document.querySelector('.left-panel');
  const puzzleImage = document.getElementById('puzzle-image');

  // Get the current, scaled dimensions of the puzzle image
  const rect = puzzleImage.getBoundingClientRect();
  const currentWidth = rect.width;
  const currentHeight = rect.height;

  // Create Hotspots using percentage calculations
  objectsToFind.forEach(obj => {
    const hotspot = document.createElement('div');
    hotspot.classList.add('hotspot');
    // Calculate pixel position from percentage
    hotspot.style.top = `${obj.y * currentHeight}px`;
    hotspot.style.left = `${obj.x * currentWidth}px`;
    hotspot.style.width = `${obj.w * currentWidth}px`;
    hotspot.style.height = `${obj.h * currentHeight}px`;
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
        
        // Use pointer-events to reliably check what's under the cursor
        clone.style.pointerEvents = 'none';
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
        
        // Use pointer-events to reliably check what's under the finger
        clone.style.pointerEvents = 'none';
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

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      img.classList.add('reveal');
      launchMagicEffect(obj.x + obj.w / 2, obj.y + obj.h / 2);
    });
  });
  
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
