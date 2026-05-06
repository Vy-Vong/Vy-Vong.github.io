let particles = [];
let paddle, ball, bricks = [];
let mode = "cyberpunk";
let score = 0;
let gameState = "play";

let ballImg;

// ---------- RESPONSIVE SYSTEM ----------
let baseW = 1000;
let baseH = 600;
let scaleFactor = 1;

function getCanvasSize() {
  let w = min(windowWidth, 1000);
  let h = w * 0.6;
  return { w, h };
}

// ---------- MODES ----------
const MODES = {
  cyberpunk: { bg: [10, 5, 20], rain: ["#00f5ff", "#ff2bd6", "#a6ff00"], speed: 2.2, density: 200 },
  tron: { bg: [5, 10, 20], rain: ["#4df3ff"], speed: 1.5, density: 160 },
  galaxy: { bg: [15, 0, 25], rain: ["#c77dff", "#ff5ea8", "#6ef7ff"], speed: 1.8, density: 180 }
};

// ---------- LOAD ----------
function preload() {
  ballImg = loadImage("Chiikawa.png");
}

// ---------- SETUP ----------
function setup() {
  let canvasSize = getCanvasSize(); // ✅ FIXED NAME
  createCanvas(canvasSize.w, canvasSize.h);

  scaleFactor = width / baseW;

  textFont("monospace");

  paddle = new Paddle();
  ball = new Ball();

  makeBricks();
  makeRain();
}

// ---------- DRAW ----------
function draw() {
  background(...MODES[mode].bg);

  // cyber haze
  for (let i = 0; i < height; i += 25 * scaleFactor) {
    fill(0, 0, 0, 12);
    rect(0, i, width, 25 * scaleFactor);
  }

  if (gameState === "play") {
    for (let p of particles) {
      p.update();
      p.draw();
      p.hit(paddle);
    }

    paddle.update();
    ball.update();
  }

  // bricks
  for (let b of bricks) {
    if (b.alive) {
      fill(255, 60, 200);
      rect(b.x, b.y, b.w, b.h, 3 * scaleFactor);
    }
  }

  ball.draw();
  paddle.draw();

  // UI
  fill(255);
  textAlign(LEFT);
  textSize(14 * scaleFactor);
  text("mode: " + mode, 20 * scaleFactor, 30 * scaleFactor);
  text("score: " + score, 20 * scaleFactor, 50 * scaleFactor);

  // WIN
  if (gameState === "win") {
    textAlign(CENTER);
    textSize(40 * scaleFactor);
    text("YOU WIN", width / 2, height / 2);
  }

  // LOSE
  if (gameState === "lose") {
    textAlign(CENTER);

    textSize(40 * scaleFactor);
    text("GAME OVER", width / 2, height / 2);

    textSize(16 * scaleFactor);
    text("press R to restart", width / 2, height / 2 + 40 * scaleFactor);
  }
}

// ---------- RAIN ----------
function makeRain() {
  particles = [];
  let c = MODES[mode].density;

  for (let i = 0; i < c; i++) {
    particles.push(new Rain());
  }
}

class Rain {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = random(width);
    this.y = random(-height, 0);
    this.len = random(10, 20) * scaleFactor;
    this.spd = random(2, 6) * MODES[mode].speed * scaleFactor;
    this.col = random(MODES[mode].rain);
  }

  update() {
    this.y += this.spd;
    if (this.y > height) this.reset();
  }

  hit(p) {
    if (
      this.x > p.x - p.w / 2 &&
      this.x < p.x + p.w / 2 &&
      this.y > p.y &&
      this.y < p.y + p.h
    ) {
      this.y = p.y;
      this.spd *= -0.2;
    }
  }

  draw() {
    stroke(this.col);
    line(this.x, this.y, this.x, this.y + this.len);
  }
}

// ---------- PADDLE ----------
class Paddle {
  constructor() {
    this.w = 150 * scaleFactor;
    this.h = 12 * scaleFactor;
    this.x = width / 2;
    this.y = height - 80 * scaleFactor;
  }

  update() {
    this.x += (mouseX - this.x) * 0.2;
  }

  draw() {
    fill(0, 255, 255, 80);
    rect(this.x - this.w / 2, this.y, this.w, this.h, 8 * scaleFactor);
  }
}

// ---------- BALL ----------
class Ball {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = width / 2;
    this.y = height / 2;
    this.r = 12 * scaleFactor;
    this.vx = random([-3, 3]) * scaleFactor;
    this.vy = -4 * scaleFactor;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 || this.x > width) this.vx *= -1;
    if (this.y < 0) this.vy *= -1;

    let p = paddle;

    if (
      this.y + this.r > p.y &&
      this.x > p.x - p.w / 2 &&
      this.x < p.x + p.w / 2
    ) {
      this.vy *= -1;
      this.vx += (this.x - p.x) * 0.05;
    }

    if (this.y > height) {
      gameState = "lose";
    }

    for (let b of bricks) {
      if (!b.alive) continue;

      if (
        this.x > b.x &&
        this.x < b.x + b.w &&
        this.y > b.y &&
        this.y < b.y + b.h
      ) {
        b.alive = false;
        this.vy *= -1;
        score++;

        if (bricks.every(bb => !bb.alive)) {
          gameState = "win";
        }
      }
    }
  }

  draw() {
    imageMode(CENTER);
    image(ballImg, this.x, this.y, this.r * 5, this.r * 5);
  }
}

// ---------- BRICKS ----------
function makeBricks() {
  bricks = [];

  for (let x = 20 * scaleFactor; x < width - 40 * scaleFactor; x += 55 * scaleFactor) {
    for (let y = 40 * scaleFactor; y < 180 * scaleFactor; y += 28 * scaleFactor) {
      bricks.push({
        x,
        y,
        w: 50 * scaleFactor,
        h: 20 * scaleFactor,
        alive: true
      });
    }
  }
}

// ---------- CONTROLS ----------
function keyPressed() {
  if (key === "1") {
    mode = "cyberpunk";
    makeRain();
  }
  if (key === "2") {
    mode = "tron";
    makeRain();
  }
  if (key === "3") {
    mode = "galaxy";
    makeRain();
  }
  if (key === "r") {
    restart();
  }
}

// ---------- RESTART ----------
function restart() {
  score = 0;
  gameState = "play";
  ball.reset();
  makeBricks();
  makeRain();
}

// ---------- RESIZE ----------
function windowResized() {
  let canvasSize = getCanvasSize(); // ✅ FIXED HERE TOO
  resizeCanvas(canvasSize.w, canvasSize.h);

  scaleFactor = width / baseW;

  paddle = new Paddle();
  ball = new Ball();
  makeBricks();
  makeRain();
}