// Burnout ride - p5.js Project 
// Theme - overworking / Burnout 
//lets get started with the basics and then we can add more fun little details later in the extras section, for now i want to focus on making a solid core game loop with good feel and polish, then we can add more fun little details later in the extras section
//--GLOBAL VARIABLES--

// Player properties 
let player;
let speed = 4;
let maxSpeed = 12;
let acceleration = 0.2;

// Stress system 
let stress = 0;
let maxStress = 100;

//Obstacles
let obstacles = [];

// Particles 
let particles = [];

// game state 
let gameState = "start";

// screen effects 
let shake = 0;
let vigetteStrength = 0;

// world scrolling
let worldOffset = 0;

// sky colour
let skyColor;

// fonts
let fontSize = 16;

//jumping and gravity
let gravity = 0.6;
let jumpForce = -12;
let groundY;


//notes
// some names are weird but i understand them when i read again later.
// if game feels too hard:
//- reduce obstacle random chance
//- reduce stress gain
//- reduce shake map max



function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  // keep player on ground after resize
  groundY = height - 60;
}
//setup and canvas 
function setup() {
  createCanvas(windowWidth, windowHeight);

  // set ground 
  groundY = height - 50;

  //create the player object 
  player = {
    x: width * 0.2,
    y: groundY,
    size: 30,
    vy: 0,
    isJumping: false
  };

  skyColor = color(180, 220, 255);
}

  groundY = height - 60;

  skyColor = color(180, 220, 255); //light blue sky or pale blue sky colour


//draw loop 
function draw() {
  if (gameState === "start") {
    drawStartScreen();
  } else if (gameState === "playing") {
    push();
    runGame();
    pop();
  } else if (gameState === "crash") {
    drawCrashScreen();
  }
}

function keyPressed() {
  //start and restart game
  if (key === " ") {
    if (gameState === "start") {
      gameState = "playing";
    } else if (gameState === "crash") {
      resetGame();
    }
  }
  //jump
  if (
    gameState === "playing" &&
    !player.isJumping &&
    (keyCode === UP_ARROW || key === "w" || key === "W")
  ) {
    player.vy = jumpForce;
    player.isJumping = true;
  }
}

//start screen - 
//find fonts for later 
function drawStartScreen() {
  background(20);

  fill(255);
  textAlign(CENTER, CENTER);

  textSize(32);
  text("BURNOUT RIDE!", width / 2, height / 2 - 40);

  textSize(16);
  text("Press space to Start", width / 2, height / 2 + 20);

text("use the arrow keys to control your speed and avoid obstacles", width / 2, height / 2 + 60);
text("right to go forward and left to slow down or stop ", width / 2, height / 2 + 100);
text("press up arrow key to jump", width / 2, height / 2 + 140);
}

//--MAIN GAME--
function runGame() {

  //update the systems 
  updateStress();
  updateWorld();
  updateJump();
  updateParticles();

  //draw the world 
  drawWorld();
  drawGround();

  //obstacles 
  handleObstacles();

  // Player
  drawPlayer();

  //effects
  applyScreenShake();
  drawVigette();

  // ui
  drawUI();
}

function drawWorld() {
  drawSky();
}
//--PLAYER--
function drawPlayer() {


  fill(0);
  ellipse(player.x, player.y, player.size);


//wheels
ellipse(player.x - 10, player.y + 10, 10);
ellipse(player.x + 10, player.y + 10, 10);
}

//--MOVEMENT--
function handleMovement() {
  if (keyIsDown(RIGHT_ARROW)) {
    speed += acceleration;
  }
  
  if (keyIsDown(LEFT_ARROW)) {
    speed -= acceleration;
  }

  speed = constrain(speed, 1, maxSpeed);
}
//jump physics and ground collision
function updateJump() {
  player.vy += gravity;
  player.y += player.vy;

  // ground collision
  if (player.y >= groundY) {
    player.y = groundY;
    player.vy = 0;
    player.isJumping = false;
  }
}

//--STRESS SYSTEM--
function updateStress() {

  handleMovement();

  // increase stress based on speed
  stress += speed * 0.05;
  stress = constrain(stress, 0, maxStress);

  //increase shake based on the stress
  shake = map(stress, 0, maxStress, 0, 15);

  //increase vigette strength based on stress
  vigetteStrength = map(stress, 0, maxStress, 0, 180);
}

//---WORLD--

function updateWorld() {
  worldOffset += speed;
}

function drawSky() {

  //the sky darkens with stress
  let r  = map(stress, 0, maxStress, 180, 100);
  let g = map(stress, 0, maxStress, 220, 50);
  let b = map(stress, 0, maxStress, 255, 50);

  skyColor = color(r, g, b);
  background(skyColor);
}

function drawGround() {
  fill(100, 50, 0);
  rect(0, height - 40, width, 40);

//road lines
  stroke(255);
  for (let i = 0; i<width; i += 40) {
    let x = (i - worldOffset * 2) % width;
    line(x, height - 20, x + 20, height - 20);
  }
  noStroke();
}

//--OBSTACLES--
function handleObstacles() {

  //spawans new obstacles
  if (random(1) < 0.02 + stress * 0.0002) {
    obstacles.push({
      x: width,
      y: height - 50,
      size: random(15, 30)
    });
  }

  //update and draw
  for (let i = obstacles.length - 1; i >= 0; i--) {

    let o = obstacles[i];

    o.x -= speed;

    fill(255, 50, 50);
    rect(o.x, o.y, o.size, o.size);

    if (
  player.x + 15 > o.x &&
  player.x - 15 < o.x + o.size &&
  player.y + 15 > o.y
) {
  gameState = "crash";
}


    //remove offscreen
    if (o.x < -50) {
      
      obstacles.splice(i, 1);
    }
  }
}

//--PARTICLES--
function updateParticles() {

  if (random(1) < speed * 0.03) {
    particles.push({
      x: player.x,
      y: player.y,
      vx: random(-1, 1),
      vy: random(-1, 1),
      life: 50
    });
  }

  for (let i = particles.length - 1; i >= 0; i--) {

    
    let p = particles[i];

    p.x += p.vx;
    p.y += p.vy;
    p.life--;

    
    fill(255, 250, 250, p.life * 5);
    
    ellipse(p.x, p.y, 5);

    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
  
}


//--SCREEN EFFECTS--

function applyScreenShake() {
  translate (random(-shake, shake), random(-shake, shake));


}
function drawVigette() {

  noFill();
  for(let i = 0; i < 50; i++) {
    stroke(0, vigetteStrength * (i / 50));
    rect(-i, -i, width + i * 2, height + i * 2);

  }
  noStroke();
}

//---UI---

function drawUI() {
  fill(0);
  textSize(fontSize);

  text('speed: ' + nf(speed, 1, 2), 20, 30);
  text('stress: ' + int(stress), 20, 50);

  //the warning message or text
  if (stress > 85) {
    fill(255, 0, 0);
    textSize(fontSize + 4);
    text("WARNING: BURNOUT IMMINENT, YOU CANT KEEP THIS UP!", width / 2, 30);

  }
}

//--CRASH SCREEN--
function drawCrashScreen() {
  background(0);
  fill(255, 0, 0);
  textAlign(CENTER, CENTER);

  textSize(32);
  text("YOU BURNED OUT!", width / 2, height / 2 - 40);

  textSize(16);
  text("Press SPACE to try again", width / 2, height / 2 + 20);
}

//--RESET GAME--
function resetGame() {
  speed = 4;
  stress = 0;
  obstacles = [];
  particles = [];
  worldOffset = 0;
  gameState = "playing";
}

// -------extra ideas zone / messy prototype notes-------
// this section is intentionally messy + experimental

let mood = "tired";
let ideaNotes = [];
let neonSigns = [];
let clouds = [];
let tinyTasks = [];
let burnoutQuotes = [
  "just one more task...",
  "dont stop now",
  "deadline moved earlier",
  "meeting in 5 mins",
  "no break today",
  "please optimize later",
  "its probably fine",
  "you got this maybe"
];

let fakePhoneBattery = 100;
let coffeeLevel = 100;
let inboxCount = 21;
let overthinkMeter = 0;
let alarmFlash = 0;
let roadNoise = 0;
let glitchWords = [];

function setupExtraIdeas() {
  // clouds
  for (let i = 0; i < 12; i++) {
    clouds.push({
      x: random(width),
      y: random(20, height / 3),
      w: random(60, 140),
      h: random(20, 50),
      drift: random(0.1, 0.6)
    });
  }

  // signs and quotes used in the backround
  for (let i = 0; i < 9; i++) {
    neonSigns.push({
      x: i * 240 + random(60, 160),
      y: random(height - 170, height - 80),
      txt: random(burnoutQuotes),
      blink: random(0.01, 0.05),
      on: true,
      c: color(random(120, 255), random(80, 200), random(80, 255))
    });
  }

  for (let i = 0; i < 24; i++) {
    tinyTasks.push({
      label: "task_" + i,
      done: false,
      weight: random(1, 8),
      panic: random(0, 10)
    });
  }

  ideaNotes.push("add weather events");
  ideaNotes.push("add audio hum layer");
  ideaNotes.push("add hard mode");
  ideaNotes.push("add optimistic mode lol");
  ideaNotes.push("add pause menu maybe");
}

function updateExtraIdeas() {
  // moving clouds
  for (let i = 0; i < clouds.length; i++) {
    let c = clouds[i];
    c.x -= c.drift + speed * 0.05;
    if (c.x < -c.w) c.x = width + random(10, 120);
  }

  // blink signs
  for (let i = 0; i < neonSigns.length; i++) {
    let s = neonSigns[i];
    if (random(1) < s.blink + stress * 0.00005) {
      s.on = !s.on;
    }
  }
//the faster you go the faster your phone battery drains
  fakePhoneBattery -= speed * 0.002;
  fakePhoneBattery = constrain(fakePhoneBattery, 0, 100);

  coffeeLevel -= 0.01 + stress * 0.0004;
  coffeeLevel = constrain(coffeeLevel, 0, 100);

  overthinkMeter += map(stress, 0, maxStress, 0.02, 0.3);
  overthinkMeter = constrain(overthinkMeter, 0, 100);

  if (random(1) < 0.01 + stress * 0.0002) {
    inboxCount += int(random(1, 4));
  }
// random glitch words that float across the screen
  if (random(1) < 0.02) {
    glitchWords.push({
      x: random(width),
      y: random(30, height - 90),
      word: random(["PING", "ERROR", "RUSH", "STACK", "LATE"]),
      life: random(20, 60),
      dx: random(-0.4, 0.4)
    });
  }

  for (let i = glitchWords.length - 1; i >= 0; i--) {
    glitchWords[i].x += glitchWords[i].dx;
    glitchWords[i].life--;
    if (glitchWords[i].life <= 0) glitchWords.splice(i, 1);
  }

  alarmFlash = map(stress, 70, 100, 0, 180);
  alarmFlash = constrain(alarmFlash, 0, 180);

  roadNoise += speed * 0.02;
}

function drawExtraSkyStuff() {
  noStroke();
  for (let i = 0; i < clouds.length; i++) {
    let c = clouds[i];
    fill(255, 255, 255, 110);
    ellipse(c.x, c.y, c.w, c.h);
    ellipse(c.x + c.w * 0.2, c.y - 4, c.w * 0.6, c.h * 0.8);
    ellipse(c.x - c.w * 0.18, c.y + 2, c.w * 0.5, c.h * 0.7);
  }
}

function drawNeonSigns() {
  textAlign(LEFT, CENTER);
  for (let i = 0; i < neonSigns.length; i++) {
    let s = neonSigns[i];
    let sx = s.x - worldOffset * 0.6;
    while (sx < -240) sx += 240 * neonSigns.length;

    if (s.on) {
      fill(red(s.c), green(s.c), blue(s.c), 180);
      rect(sx, s.y, 170, 26, 5);
      fill(10);
      textSize(11);
      text(s.txt, sx + 8, s.y + 13);
    } else {
      fill(50, 40);
      rect(sx, s.y, 170, 26, 5);
    }
  }
}


// draws glitchy words that float across the screen when stress is high
function drawGlitchWords() {
  textAlign(CENTER, CENTER);
  for (let i = 0; i < glitchWords.length; i++) {
    let g = glitchWords[i];
    fill(255, random(30, 200), random(30, 200), map(g.life, 0, 60, 0, 170));
    textSize(random(10, 18));
    text(g.word, g.x + random(-1, 1), g.y + random(-1, 1));
  }
}

function burnoutMicroEvents() {
  // intentionally chaotic tiny events
  if (stress > 50 && random(1) < 0.008) {
    speed += random(-0.3, 0.6);
  }

  if (stress > 75 && random(1) < 0.012) {
    shake += random(0, 0.8);
  }

  if (coffeeLevel < 10 && random(1) < 0.03) {
    speed -= 0.09;
  }

  if (inboxCount > 40 && random(1) < 0.01) {
    stress += 0.4;
  }

  speed = constrain(speed, 1, maxSpeed);
  stress = constrain(stress, 0, maxStress);
}

function drawAlarmOverlay() {
  if (stress > 70) {
    fill(255, 0, 0, alarmFlash * (sin(frameCount * 0.2) * 0.5 + 0.5));
    rect(0, 0, width, height);
  }
}


// hook extras into game by wrapping old runGame-ish behavior with more stuff
let _extraBooted = false;

function extraGameLayer() {
  if (!_extraBooted) {
    setupExtraIdeas();
    _extraBooted = true;
  }

  updateExtraIdeas();
  burnoutMicroEvents();

  drawExtraSkyStuff();
  drawNeonSigns();
  drawGlitchWords();
  drawAlarmOverlay();
}

// quick hack: run old game then extras
const _oldRunGame = runGame;
runGame = function() {
  _oldRunGame();
  extraGameLayer();
};


// -------- simple helpers i can tweak quickly --------
function easyModeOn() {
  // makes it more chill
  maxSpeed = 9;
}

function normalModeOn() {
  maxSpeed = 12;
}

function panicModeOn() {
  maxSpeed = 14;
  stress += 5;
}

// debug text block (left here on purpose)
function drawDebugMini() {
  fill(0, 130);
  rect(width - 145, height - 70, 130, 55);
  fill(255);
  textSize(10);
  textAlign(LEFT, TOP);
  text('fps~ ' + int(frameRate()), width - 138, height - 64);
  text('obs ' + obstacles.length, width - 138, height - 50);
  text('parts ' + particles.length, width - 138, height - 36);
}

// hook debug into extra layer too
const __oldExtraGameLayer = extraGameLayer;
extraGameLayer = function() {
  __oldExtraGameLayer();
  drawDebugMini();

  // random little choices for "mood" of round
  if (frameCount % 900 === 0) {
    let pick = int(random(0, 3));
    if (pick === 0) easyModeOn();
    if (pick === 1) normalModeOn();
    if (pick === 2) panicModeOn();
  }
};

//finished with extras for now, main game is solid and has a lot of polish, can always come back to add more fun little details later if i want :)