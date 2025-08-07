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

  // Create Hotspots first and store them for easy access
  const hotspots = {};
  objectsToFind.forEach(obj => {
    const hotspot = document.createElement('div');
    hotspot.classList.add('hotspot');
    hotspot.style.top = obj.y + 'px';
    hotspot.style.left = obj.x + 'px';
    hotspot.style.width = obj.w + 'px';
    hotspot.style.height = obj.h + 'px';
    hotspot.dataset.name = obj.name;
    imageContainer.appendChild(hotspot);
    hotspots[obj.name] = hotspot;
  });

  // Create Draggable Icons and add custom mouse events
  objectsToFind.forEach((obj, i) => {
    const iconFile = iconMap[obj.name] || obj.name;
    const img = document.createElement('img');
    img.src = `Temp/${iconFile}.png`;
    img.alt = obj.name;
    img.classList.add('draggable-icon');
    img.dataset.name = obj.name;
    list.appendChild(img);

    // --- CUSTOM DRAG-AND-DROP LOGIC ---
    img.addEventListener('mousedown', (e) => {
      e.preventDefault(); // Prevent default image drag behavior

      const originalIcon = e.target;
      if (originalIcon.classList.contains('found')) return;

      // Create a clone to drag
      const clone = originalIcon.cloneNode(true);
      clone.classList.add('dragging');
      document.body.appendChild(clone);
      clone.style.left = `${e.clientX - 25}px`;
      clone.style.top = `${e.clientY - 25}px`;

      originalIcon.style.opacity = '0.3'; // Dim original icon

      function onMouseMove(moveEvent) {
        clone.style.left = `${moveEvent.clientX - 25}px`;
        clone.style.top = `${moveEvent.clientY - 25}px`;
      }

      function onMouseUp(upEvent) {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);

        clone.remove(); // Remove the clone from the page

        // Hide the clone to check what's underneath
        clone.style.display = 'none';
        const elementUnder = document.elementFromPoint(upEvent.clientX, upEvent.clientY);
        clone.style.display = '';

        if (elementUnder && elementUnder.classList.contains('hotspot') && elementUnder.dataset.name === originalIcon.dataset.name) {
          // SUCCESSFUL DROP
          const hotspot = elementUnder;
          hotspot.classList.add('found');
          originalIcon.classList.add('found'); // Mark original as found
          originalIcon.style.pointerEvents = "none";
          score++;
          revealColoredIcon(obj, hotspot);
          checkWin();
        } else {
          // Failed drop, return original icon to normal
          originalIcon.style.opacity = '1';
        }
      }

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  });

  timer = setInterval(updateTimer, 1000);
}


function updateTimer() {
  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');
  document.getElementById('timer').textContent = `⏱️ ${minutes}:${seconds}`;
  timeLeft--;

  if (timeLeft <= 0) {
    endGame();
  }
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
  if (score === objectsToFind.length) {
    endGame();
  }
}

window.onload = startGame;

function launchConfetti() {
  const duration = 2 * 1000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0, y: 1 } });
    confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1, y: 1 } });
    if (Date.now() < end) { requestAnimationFrame(frame); }
  })();
}

function revealColoredIcon(obj, hotspotEl) {
  const iconFile = iconMap[obj.name] || obj.name;
  const imagePath = `Temp/Ans/${iconFile}C.png`;
  const img = document.createElement('img');

  // Handle load error
  img.onerror = function () {
    console.error("❌ IMAGE FAILED TO LOAD:", imagePath);
  };

  img.src = imagePath;
  img.classList.add('answer-icon');
  img.style.width = obj.w + 'px';
  img.style.height = obj.h + 'px';
  img.style.top = obj.y + 'px';
  img.style.left = obj.x + 'px';
  img.style.position = 'absolute';

  const imageContainer = document.querySelector('.left-panel');
  imageContainer.appendChild(img);

  console.log("✅ Added blurred hidden icon:", imagePath);

  // 🧠 Force layout so browser applies initial blur state before reveal
  void img.offsetWidth; // Trigger reflow (this ensures the animation works)

  // 🌟 Add .reveal to trigger animation instantly
  img.classList.add('reveal');
  console.log("🎉 Reveal animation triggered.");

  // 🎆 Launch magic visual effect at center of icon
  launchMagicEffect(obj.x + obj.w / 2, obj.y + obj.h / 2);
}

function launchMagicEffect(x, y) {
  // Convert the puzzle's pixel coordinates to the screen's percentage-based coordinates
  const puzzleRect = document.getElementById('puzzle-image').getBoundingClientRect();
  const originX = (puzzleRect.left + x) / window.innerWidth;
  const originY = (puzzleRect.top + y) / window.innerHeight;

  // Configure the "magic puff" effect
  confetti({
    particleCount: 50,
    spread: 80,
    gravity: 0.5, // Makes the particles float up slightly
    origin: { x: originX, y: originY },
    shapes: ['star'], // Use star shapes instead of squares
    colors: ['#ffd700', '#ffeca0', '#ffffff', '#fff4a3'] // Gold, yellow, and white colors
  });

}

