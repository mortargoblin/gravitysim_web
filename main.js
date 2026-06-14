// js implementation of a gravity simulation by mortargoblin

const BG_COLOR = 'BLACK';

const viewport = document.querySelector('#viewport');
viewport.width = 800;
viewport.height = 800;

const ctx = viewport.getContext('2d');

let bodies = [
  { r: 20, mass: 10000, pos: {x:400, y:400}, vel: {x:0, y:0}, color: 'yellow' },
  { r: 10, mass: 10, pos: {x:400, y: 200}, vel: {x:6, y:0}, color: 'red' },
  { r: 10, mass: 20, pos: {x:400, y:600}, vel: {x:-5, y:0}, color: 'green' }
];

const camera = { x: 0, y: 0 };

function drawBody(body) {
  ctx.fillStyle = body.color;
  ctx.beginPath();
  ctx.arc(
    body.pos.x - camera.x, 
    body.pos.y - camera.y, 
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

  G = 50;
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
  ctx.lineWidth = 3;
  ctx.stroke();
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
  bodies.forEach(body => {
    drawBody(body);
    if (velocityLines) drawVelocityLine(body);
  });
}

let dragging = false;
let lastMouse = {x:0, y:0};

viewport.addEventListener('mousedown', (e) => {
  dragging = true;
  lastMouse.x = e.clientX;
  lastMouse.y = e.clientY;
  console.log(e);
});
viewport.addEventListener('mousemove', (e) => {
  if (!dragging) return;

  const dx = e.clientX - lastMouse.x;
  const dy = e.clientY - lastMouse.y;

  camera.x -= dx;
  camera.y -= dy;

  lastMouse.x = e.clientX;
  lastMouse.y = e.clientY;
});
viewport.addEventListener('mouseup', () =>  {
  dragging = false;
});
viewport.addEventListener('mouseleave', () => {
  dragging = false;
});

let velocityLines = false;
document.querySelector('#vel-btn').addEventListener('click', () => {
  velocityLines = !velocityLines;
});

let lastTime = 0;
function frame(time) {
  const dt = (time - lastTime) / 1000; // sec
  lastTime = time;

  update(dt);
  render();

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
