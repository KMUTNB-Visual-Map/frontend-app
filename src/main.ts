import "./style.css";
import { PositioningManager } from "./core/positioning";

/* =========================
   Guest ID (8 หลัก)
========================= */

function generateShortId(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0].toString(16).padStart(8, "0");
}

let guestId = localStorage.getItem("guest_id");

if (!guestId) {
  guestId = generateShortId();
  localStorage.setItem("guest_id", guestId);
}

/* =========================
   Positioning Manager
========================= */

const positioning = new PositioningManager(guestId);

/* =========================
   UI
========================= */

const app = document.querySelector<HTMLDivElement>("#app")!;

app.innerHTML = `
  <div style="text-align:center; margin-top:50px;">
    <h1>Position Test</h1>

    <button id="gpsBtn">GPS Mode</button>
    <button id="manualBtn">Manual Mode</button>

    <p><strong>Guest ID:</strong> ${guestId}</p>

    <div id="manualArea"
         style="margin:30px auto; width:300px; height:300px;
                background:#eee; position:relative; display:none;">
    </div>

    <p id="coords">Coordinates: -</p>
  </div>
`;

/* =========================
   DOM refs
========================= */

const coordsEl = document.getElementById("coords")!;
const gpsBtn = document.getElementById("gpsBtn")!;
const manualBtn = document.getElementById("manualBtn")!;
const manualArea = document.getElementById("manualArea")!;

/* =========================
   GPS Mode
========================= */

gpsBtn.addEventListener("click", () => {
  manualArea.style.display = "none";

  positioning.startGPSMode((pos) => {
    coordsEl.innerText = `Coordinates: ${pos.x}, ${pos.y}`;
  });
});

/* =========================
   Manual Mode
========================= */

manualBtn.addEventListener("click", () => {
  manualArea.style.display = "block";
  positioning.startManualMode();
});

/* =========================
   Click to set position
========================= */

manualArea.addEventListener("click", (e) => {
  const rect = manualArea.getBoundingClientRect();

  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  positioning.updateManualPosition(x, y);

  coordsEl.innerText = `Coordinates: ${x}, ${y}`;
});

// MOCK ทดสอบตำแหน่ง //
positioning.setDestination({ x: 100, y: 100, floor_id: 1 });

positioning.setRoutePath([
  { x: 50, y: 50, floor_id: 1 },
  { x: 100, y: 100, floor_id: 1 }
]);