// js implementation of a gravity simulation by mortargoblin

const BG_COLOR = 'black'; // '#12141B';

const viewport = document.querySelector('#viewport');
viewport.width = 800;
viewport.height = 800;
viewport.style.touchAction = "none";

const ctx = viewport.getContext('2d');

const G = 50;

let bodies = [
  { r: 20, mass: 10000, pos: {x:400, y:400}, vel: {x:0, y:0}, color: 'yellow' },
  { r: 8, mass: 15, pos: {x:400, y: 250}, vel: {x:6, y:0}, color: 'red' },
  { r: 10, mass: 20, pos: {x:400, y:600}, vel: {x:-5, y:0}, color: 'green' },
  { r: 15, mass: 200, pos: {x:50, y:400}, vel: {x:0, y:-5}, color: 'blue' },
  { r: 3, mass: 10, pos: {x:50, y:425}, vel: {x:-2.5, y:-5}, color: 'purple' },
  { r: 5, mass: 20, pos: {x:800, y:400}, vel: {x:0, y:5}, color: 'brown' }
];

const camera = { x: 0, y: 0 };

function resizeCanvas() {
  viewport.width = window.innerWidth;
  viewport.height = window.innerHeight;
  console.log(viewport.width, viewport.height);
}

function drawBody(body) {
  ctx.fillStyle = body.color;
  ctx.beginPath();
  ctx.arc(
    body.pos.x, // - camera.x, 
    body.pos.y, // - camera.y, 
    body.r, 
    0, 
    2 *Math.PI
  );
  ctx.fill();
}

function clearViewport() {
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0,0, viewport.width, viewport.height);
}

/* PREVIOUS C IMPLEMENTATION
void apply_gravity(Body *body1, Body *body2, float dt) {
    Vector2 dir = {
      body2->pos.x - body1->pos.x,
      body2->pos.y - body1->pos.y
    };

    float dist_sq = dir.x * dir.x + dir.y * dir.y;
    float dist = sqrtf(dist_sq);

    if (dist < 0.01f) return;

    dir.x /= dist;
    dir.y /= dist;
    
    float G = 50.0f;
    float accel_mag = G * body2->mass / dist_sq;
    Vector2 accel = {dir.x * accel_mag, dir.y * accel_mag};

    body1->vel.x += accel.x * dt;
    body1->vel.y += accel.y * dt;
}
*/

function applyGravity(b1, b2, dt) {
  const dir = {
    x: b2.pos.x - b1.pos.x,
    y: b2.pos.y - b1.pos.y,
  }

  const distSq = dir.x**2 + dir.y**2;
  const dist = Math.sqrt(distSq);
  if (dist < 0.01) return;

  dir.x /= dist;
  dir.y /= dist;

  accelMag = G * b2.mass / distSq;
  accel = {x: dir.x * accelMag, y: dir.y * accelMag};

  b1.vel.x += accel.x * dt;
  b1.vel.y += accel.y * dt;
}

function drawVelocityLine(body) {
  const SCALE = 8;
  const x = body.pos.x + body.vel.x * SCALE;
  const y = body.pos.y + body.vel.y * SCALE;
  ctx.strokeStyle = 'white';
  ctx.beginPath();
  ctx.moveTo(body.pos.x, body.pos.y);
  ctx.lineTo(x, y);
  // ctx.lineWidth = 3;
  ctx.stroke();
}

function randInt(max) {
  return Math.floor(Math.random() * max);
}

function spawnBody() {
  // MATH IS HARD
  const sun = bodies[0];

  const size = randInt(13) + 2;
  const mass = size * 10;

  const r = randInt(600) + 100;

  const theta = Math.random() * Math.PI * 2;

  // position relative to sun
  const dx = Math.cos(theta) * r;
  const dy = Math.sin(theta) * r;

  // world position
  const x = sun.pos.x + dx;
  const y = sun.pos.y + dy;

  const speed = Math.sqrt(sun.mass / r);

  // tangential direction
  const px = -dy;
  const py = dx;

  const len = Math.hypot(px, py);

  // orbital velocity relative to sun
  const orbitalVx = px / len * speed;
  const orbitalVy = py / len * speed;

  const newBody = {
    r: size,
    mass: mass,
    pos: { x, y },
    vel: {
      x: sun.vel.x + orbitalVx,
      y: sun.vel.y + orbitalVy
    },
    color: `rgb(${randInt(255)}, ${randInt(255)}, ${randInt(255)})`
  };

  console.log(newBody);
  bodies.push(newBody);
}

function update(dt) {
  for (let i = 0; i < bodies.length; i++) {
    for (let j = 0; j < bodies.length; j++) {
      if (j !== i)
        applyGravity(bodies[i], bodies[j], dt);
    }
  }
  bodies.forEach((body) => {
    body.pos.x += body.vel.x;
    body.pos.y += body.vel.y;
  });
}

function render() {
  clearViewport();
  ctx.save();
  ctx.translate(-camera.x, -camera.y);
  bodies.forEach(body => {
    drawBody(body);
    if (velocityLines) drawVelocityLine(body);
  });
  ctx.restore();
}

let dragging = false;
let lastMouse = {x:0, y:0};

viewport.addEventListener('pointerdown', (e) => {
  dragging = true;
  lastMouse.x = e.clientX;
  lastMouse.y = e.clientY;
});
viewport.addEventListener('pointermove', (e) => {
  if (!dragging) return;

  const dx = e.clientX - lastMouse.x;
  const dy = e.clientY - lastMouse.y;

  camera.x -= dx;
  camera.y -= dy;

  lastMouse.x = e.clientX;
  lastMouse.y = e.clientY;
});
viewport.addEventListener('pointerup', () =>  {
  dragging = false;
});
viewport.addEventListener('pointercanvel', () => {
  dragging = false;
});

let velocityLines = false;
document.querySelector('#vel-btn').addEventListener('click', () => {
  velocityLines = !velocityLines;
});

document.querySelector('#refresh-btn').addEventListener('click', () => {
  window.location.reload()
});

document.querySelector('#spawn-btn').addEventListener('click', spawnBody);

window.addEventListener("resize", resizeCanvas);

resizeCanvas();

let lastTime = 0;
function frame(time) {
  const dt = (time - lastTime) / 1000; // sec
  lastTime = time;

  update(dt);
  render();

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
