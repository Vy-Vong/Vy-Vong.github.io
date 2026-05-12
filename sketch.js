// ===============================
// CHIIKAWA NEON BREAKER - CUTE EDITION
// ===============================

let particles = [];
let bricks = [];
let paddle, ball;

let score = 0;
let level = 1;
let lives = 3;

// menu, play, levelComplete, lose
let gameState = "menu";

let ballImg;

// ---------- RESPONSIVE ----------
let baseW = 1000;
let scaleFactor = 1;

function getCanvasSize() {
  let w = min(windowWidth, 1000);
  let h = w * 0.6;
  return { w, h };
}

// ---------- COLORS ----------
const PALETTE = [
  "#ffb6ff",
  "#b6f7ff",
  "#fff3b0",
  "#caffbf",
  "#ffd6a5"
];

// ---------- PRELOAD ----------
function preload() {
  ballImg = loadImage("Chiikawa.png");
}

// ---------- SETUP ----------
function setup() {
  let s = getCanvasSize();
  createCanvas(s.w, s.h);

  scaleFactor = width / baseW;

  textFont("monospace");

  paddle = new Paddle();
  ball = new Ball();

  startLevel();
}

// ---------- START LEVEL ----------
function startLevel() {
  makeBricks();
  ball.reset();
  particles = [];
}

// ---------- DRAW ----------
function draw() {
  background(15, 10, 30);

  fill(255, 255, 255, 3);
  rect(0, 0, width, height);

  if (gameState === "menu") {
    drawMenu();
    return;
  }

  if (gameState === "play") {
    paddle.update();
    ball.update();
    particles.forEach(p => p.update());
  }

  // bricks
  for (let b of bricks) {
    if (!b.alive) continue;

    fill(random(PALETTE));
    stroke(255, 120);
    rect(b.x, b.y, b.w, b.h, 6);
  }

  paddle.draw();
  ball.draw();
  particles.forEach(p => p.draw());

  drawUI();

  if (gameState === "levelComplete") drawLevelComplete();
  if (gameState === "lose") drawLose();
}

// ---------- MENU ----------
function drawMenu() {
  textAlign(CENTER);

  fill("#ffb6ff");
  textSize(42 * scaleFactor);
  text("CHIIKAWA BREAKER", width / 2, height / 2 - 40);

  fill(255);
  textSize(16 * scaleFactor);
  text("press SPACE to start", width / 2, height / 2 + 20);
}

// ---------- UI ----------
function drawUI() {
  fill(255);
  textAlign(LEFT);
  textSize(14 * scaleFactor);

  text("score: " + score, 20, 30);
  text("lives: " + "♥".repeat(lives), 20, 55);
  text("level: " + level, 20, 80);
}

// ---------- LEVEL COMPLETE ----------
function drawLevelComplete() {
  textAlign(CENTER);

  fill("#b6f7ff");
  textSize(32 * scaleFactor);
  text("LEVEL " + (level - 1) + " COMPLETE!", width / 2, height / 2 - 20);

  fill(255);
  textSize(16 * scaleFactor);
  text("press SPACE for next level", width / 2, height / 2 + 20);
}

// ---------- LOSE ----------
function drawLose() {
  textAlign(CENTER);

  fill("#ffb6ff");
  textSize(40 * scaleFactor);
  text("GAME OVER", width / 2, height / 2);

  fill(255);
  textSize(16 * scaleFactor);
  text("press R to restart", width / 2, height / 2 + 40);
}

// ---------- PARTICLE ----------
class Sparkle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.r = random(2, 5);
    this.col = random(PALETTE);
    this.vx = random(-2, 2);
    this.vy = random(-2, 2);
    this.life = 60;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
  }

  draw() {
    noStroke();
    fill(this.col + "aa");
    circle(this.x, this.y, this.r);
  }
}

// ---------- PADDLE ----------
class Paddle {
  constructor() {
    this.w = 140 * scaleFactor;
    this.h = 14 * scaleFactor;
    this.x = width / 2;
    this.y = height - 60 * scaleFactor;
  }

  update() {
    this.x += (mouseX - this.x) * 0.15;
  }

  draw() {
    noStroke();
    fill("#ffb6ff");
    rect(this.x - this.w / 2, this.y, this.w, this.h, 20);
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
    this.r = 14 * scaleFactor;
    this.vx = random([-3, 3]) * (1 + level * 0.1);
    this.vy = -4 * (1 + level * 0.05);
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
      particles.push(new Sparkle(this.x, this.y));
    }

    // lose life
    if (this.y > height) {
      lives--;

      if (lives <= 0) {
        gameState = "lose";
      } else {
        this.reset();
      }
    }

    // bricks
    for (let b of bricks) {
      if (!b.alive) continue;

      if (
        this.x > b.x && this.x < b.x + b.w &&
        this.y > b.y && this.y < b.y + b.h
      ) {
        b.alive = false;
        this.vy *= -1;
        score += 10;

        particles.push(new Sparkle(this.x, this.y));

        if (bricks.every(bb => !bb.alive)) {
          gameState = "levelComplete";
        }
      }
    }
  }

  draw() {
    imageMode(CENTER);
    image(ballImg, this.x, this.y, this.r * 4, this.r * 4);
  }
}

// ---------- BRICKS ----------
function makeBricks() {
  bricks = [];

  let cols = 10;
  let rows = 4 + level; // more difficulty per level

  let pad = 10 * scaleFactor;
  let w = (width - pad * (cols + 1)) / cols;
  let h = 20 * scaleFactor;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      bricks.push({
        x: pad + c * (w + pad),
        y: 50 * scaleFactor + r * (h + pad),
        w,
        h,
        alive: true
      });
    }
  }
}

// ---------- INPUT ----------
function keyPressed() {
  if (key === " ") {

    if (gameState === "menu") {
      gameState = "play";
      startLevel();
    }

    else if (gameState === "levelComplete") {
      level++;
      gameState = "play";
      startLevel();
    }
  }

  if (key === "r") {
    restart();
  }
}

function restart() {
  score = 0;
  level = 1;
  lives = 3;
  gameState = "menu";

  ball.reset();
  makeBricks();
}

// ---------- RESIZE ----------
function windowResized() {
  let s = getCanvasSize();
  resizeCanvas(s.w, s.h);

  scaleFactor = width / baseW;

  paddle = new Paddle();
  ball = new Ball();
  makeBricks();
}
