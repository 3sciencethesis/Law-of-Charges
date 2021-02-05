const sz = 45;
let cols;
let rows;
const charges = [];
const K = 10000;
let running = false;
let magField;
let w;
let h;
let horizontal;
let vertical;

let holdingAlt = false;

function preload (){
  horizontal = loadImage('horizontal.png');
  vertical = loadImage('vertical.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  cols = (width / sz) | 0;
  rows = (height / sz) | 0;
  magField = Array(rows).fill().map(() => Array(cols).fill(0));
  w = width - width % cols;
  h = height - height % rows;
}



function keyPressed() {
  if (key == 1) {
    charges.push(new Charge(mouseX, mouseY, holdingAlt ? 0.5 : 1, false));
  } else if (key == 2) {
    charges.push(new Charge(mouseX, mouseY, holdingAlt ? -0.5 : -1, false));
  } else if (key == 3) {
    charges.push(new Charge(mouseX, mouseY, holdingAlt ? 0.5 : 1, true));
  } else if (key == 4) {
    charges.push(new Charge(mouseX, mouseY, holdingAlt ? -0.5 : -1, true));
  } else if (key == "r" || key == "R") {
    running = !running;
  } else if (keyCode == 1) {
    holdingAlt = true;
  }
}

function keyReleased() {
  if (keyCode == 0) {
    holdingAlt = false;
  }
}


function draw() {
  background('#222222');
  image(horizontal, 225, 10, 950, 175);
  image (vertical, 0, 0, 225, 650);
  if (keyIsPressed) {
    const i = map(mouseX, 0, w, 0, cols) | 0;
    const j = map(mouseY, 0, h, 0, rows) | 0;
    if (key == "p" || key == "P") {
      magField[j][i] = 1;
    } else if (key == "o" || key == "O") {
      magField[j][i] = 20;
    } else if (key == "0") {
      magField[j][i] = 0;
    }
  }
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const x = i*sz + sz/2;
      const y = j*sz + sz/2;
      stroke(0, 204, 0);
      fill(255);
      const sum = createVector();
      for (const c of charges)  {
        const line = c.fieldLine(x, y);
        sum.add(line);
      }
      if (magField[j][i] == 1) {
        fill(0, 255, 255);
        square(i*sz, j*sz, sz);
      } else if (magField[j][i] == 2) {
        fill(255, 0, 255);
        square(i*sz, j*sz, sz);
      }
      sum.mult(100);
      sum.limit(15);
      line(x, y, x + sum.x, y + sum.y);
      circle(x, y, 4);
    }
  }
  if (running) {
    for (const a of charges) {
      for (const b of charges) {
        if (a != b) {
          const line = a.fieldLine(b.pos.x, b.pos.y);
          line.mult(b.charge);
          b.applyForce(line);
        }
      }
    }
    for (const c of charges) {
      const i = map(c.pos.x, 0, w, 0, cols) | 0;
      const j = map(c.pos.y, 0, h, 0, rows) | 0;
      if (i >= 0 && i < cols && j >= 0 && j < rows) {
        if (magField[j][i] == 1) {
          c.vel.rotate(radians(3) * c.charge);
        } else if (magField[j][i] == 2) {
          c.vel.rotate(-radians(3) * c.charge);
        }
      }
    }
  }
  for (const c of charges) {
    if (running && !c.lazy) {
      c.update();
    }
    c.render();
  }
}

class Charge {
  constructor(x, y, charge, lazy) {
    this.pos = createVector(x, y);
    this.vel = createVector();
    this.acc = createVector();
    this.charge = charge;
    this.lazy = lazy;
  }
  
  applyForce(force) {
    this.acc.add(force);
  }
  
  fieldLine(x, y) {
    const disp = p5.Vector.sub(createVector(x, y), this.pos);
    const distSq = disp.magSq();
    disp.setMag(K * this.charge / distSq);
    return disp;
  }
  
  update() {
    this.vel.add(this.acc);
    this.vel.limit(6);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }
  
  render() {
    const c = this.charge ? this.charge*20 : 20;
    const l = this.charge ? this.charge*7 : 7;
    if (this.charge > 0) {
      noStroke();
      fill(this.lazy ? 128 : 255, 0, 0);
      circle(this.pos.x, this.pos.y, c);
      stroke(255);
      line(this.pos.x-l, this.pos.y, this.pos.x+l, this.pos.y);
      line(this.pos.x, this.pos.y-l, this.pos.x, this.pos.y+l);
    } else if (this.charge < 0) {
      noStroke();
      fill(0, 0, this.lazy ? 128 : 255);
      circle(this.pos.x, this.pos.y, c);
      stroke(255);
      line(this.pos.x-l, this.pos.y, this.pos.x+l, this.pos.y);
    }
  }
  
}