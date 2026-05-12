// ===============================
// CHIIKAWA NEON BREAKER - CUTE EDITION
// ===============================

let particles = [];
let bricks = [];
let paddle, ball;

let mode = "cute";
let score = 0;
let lives = 3;

let gameState = "menu"; // menu, play, win, lose

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

  makeBricks();
}

// ---------- DRAW ----------
function draw() {
  background(15, 10, 30);

  // soft glow overlay (no scanlines)
  fill(255, 255, 255, 3);
  rect(0, 0, width, height);

  // ---------- MENU ----------
  if (gameState === "menu") {
    drawMenu();
    return;
  }

  // ---------- UPDATE ----------
  if (gameState === "play") {
    paddle.update();
    ball.update();

    particles.forEach(p => p.update());
  }

  // ---------- DRAW BRICKS ----------
  for (let b of bricks) {
    if (!b.alive) continue;

    fill(random(PALETTE));
    stroke(255, 120);
    strokeWeight(1);

    rect(b.x, b.y, b.w, b.h, 6);
  }

  // ---------- DRAW OBJECTS ----------
  paddle.draw();
  ball.draw();

  particles.forEach(p => p.draw());

  // ---------- UI ----------
  drawUI();

  // ---------- END STATES ----------
  if (gameState === "win") drawWin();
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
}

// ---------- WIN / LOSE ----------
function drawWin() {
  textAlign(CENTER);
  fill("#b6f7ff");
  textSize(40 * scaleFactor);
  text("YOU WIN!", width / 2, height / 2);
}

function drawLose() {
  textAlign(CENTER);
  fill("#ffb6ff");
  textSize(40 * scaleFactor);
  text("GAME OVER", width / 2, height / 2);

  textSize(16 * scaleFactor);
  fill(255);
  text("press R to restart", width / 2, height / 2 + 40);
}

// ---------- PARTICLE ----------
class Sparkle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.r = random(2, 5);
    this.col = random(PALETTE);
    this.vy = random(-2, 2);
    this.vx = random(-2, 2);
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
    this.vx = random([-3, 3]);
    this.vy = -4;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 || this.x > width) this.vx *= -1;
    if (this.y < 0) this.vy *= -1;

    // paddle
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
          gameState = "win";
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
  let rows = 5;

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
    gameState = "play";
  }

  if (key === "r") {
    restart();
  }
}

function restart() {
  score = 0;
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
