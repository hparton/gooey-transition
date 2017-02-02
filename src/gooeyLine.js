// Wavy line based on the effect by Waaark studios
// Rewritten to be a bit more reusable and using simplex noise
// to generate the movement rather than the mouse.
import Simple1DNoise from './simpleNoise'

const generator = new Simple1DNoise();

function Point(canvas, x, y, t) {
  this.x = x;
  this.y = y;
  this.t = t;
  this.controlX = x;
  this.controlY = y;
  this.previousY = y;
  this.canvas = canvas;
}

function GooeyLine(config) {
  this.config = Object.assign({
    showIndicators: false,
    showConsoleLogs: false,
    width: window.innerWidth,
    height: window.innerHeight,
    totalPoints: 20,
    maxRange: 200,
    timing: 0.01,
    yOffset: window.innerHeight / 2,
    color: '#ff3737',
    background: '#27313e'
  }, config);

  this.rafID = null;
  this.points = [];
}

GooeyLine.prototype.init = function() {
  // Check if we have a canvas, otherwise throw an error that it needs to be defined
  if (!this.config.el) {
    return console.error('No canvas element was defined, pass one through with `el: \'canvasID\'`');
  }

  // Save a reference to the canvas and the context
  this.canvas = document.getElementById(this.config.el);
  this.ctx = this.canvas.getContext('2d');

  // Size the canvas
  this.canvas.width = this.config.width;
  this.canvas.height = this.config.height;

  // Stylish
  // this.canvas.style.background = this.config.background;

  // Calculate positions based on width / this.config.totalPoints
  let gap = (this.canvas.width / (this.config.totalPoints - 1));
  let y = this.canvas.height / 2;

  // Create the points for the bezier curve and clear any if we have any.
  this.points = [];

  for (var i = 0; i < this.config.totalPoints; i++) {
     this.points.push(new Point(this.canvas, gap * i, y + getRandomInt(-this.config.maxRange, this.config.maxRange), getRandomInt(0, 100)))
  }

  if (this.config.showConsoleLogs) console.log('init()', this)

  // Start this wierd blobby party!
  this.step()
}

GooeyLine.prototype.resize = function(w, h) {
  this.config.width = w;
  this.config.height = h;

  // If we dont cancel the current frame it just keeps running more on top of each other.
  cancelAnimationFrame(this.rafID);

  this.init();
}

GooeyLine.prototype.step = function() {
  // Move all of the points by x amount +- a random amount to create the wave
  // Instead of just Math.random() use simplex noise to make it less jaggedy.
  for (var i = 0; i < this.points.length; i++) {
    var y = generator.getVal(this.points[i].t);
    // Since the noise function returns a value between 0 and 1 we need to map it to a bigger range.
    var movement = map(y, 0, 1, -this.config.maxRange, this.config.maxRange)

    this.points[i].y = this.config.yOffset + movement
    // Increment time using another noise generator
    this.points[i].t += map(generator.getVal(this.points[i].t + i * 0.75), 0, 1, 0, this.config.timing);
  }

  // Calculate the control points between each point
  for (var i = 0; i < this.points.length; i++) {
    let p = this.points[i];

    if (this.points[i + 1] != undefined) {
      p.controlX = (p.x + this.points[i + 1].x) / 2;
      p.controlY = (p.y + this.points[i + 1].y) / 2;
    } else {
      p.controlX = p.x;
      p.controlY = p.y;
    }
  }

  // Draw all the things!
  this.draw()

  this.rafID = window.requestAnimationFrame(() => {
    this.step()
  })
  // Call myself again.
}

GooeyLine.prototype.draw = function() {
  // Clear the canvas
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

  // Draw a bezier curve between all of the points
  this.ctx.fillStyle = this.config.color;
  this.ctx.strokeStyle = this.config.color;
  this.ctx.lineWidth = 1;
  this.ctx.beginPath();

  for (var i = 0; i < this.points.length; i++) {
    let p = this.points[i]
    this.ctx.bezierCurveTo(p.x, p.y, p.controlX, p.controlY, p.controlX, p.controlY);
  }

  this.ctx.lineTo(this.canvas.width, this.config.yOffset);
  this.ctx.lineTo(this.canvas.width, 0);
  this.ctx.lineTo(0, 0);
  this.ctx.closePath();
  this.ctx.fill();

  // Show the debug points and control points
  if (this.config.showIndicators) {
    this.showDebug();
  }
}

GooeyLine.prototype.showDebug = function() {
  // -- Debug points --
  this.ctx.fillStyle = '#000';
  this.ctx.beginPath();
  for (var i = 0; i <= this.config.totalPoints - 1; i++) {
    var p = this.points[i];

    this.ctx.rect(p.x - 2, p.y - 2, 4, 4);
  }
  this.ctx.fill();

  // -- Control points --
  this.ctx.fillStyle = '#fff';
  this.ctx.beginPath();
  for (var i = 0; i <= this.config.totalPoints - 1; i++) {
    var p = this.points[i];

    this.ctx.rect(p.controlX - 1, p.controlY - 1, 2, 2);
  }
  this.ctx.fill();

  // -- Max range --
  this.ctx.strokeStyle = 'blue';
  this.ctx.beginPath();
  // Top line
  this.ctx.moveTo(0, this.config.yOffset - this.config.maxRange);
  this.ctx.lineTo(this.canvas.width, this.config.yOffset - this.config.maxRange);
  // Center line
  this.ctx.moveTo(0, this.config.yOffset);
  this.ctx.lineTo(this.canvas.width, this.config.yOffset);
  // Bottom line
  this.ctx.moveTo(0, this.config.yOffset + this.config.maxRange);
  this.ctx.lineTo(this.canvas.width, this.config.yOffset + this.config.maxRange);

  this.ctx.stroke();
  this.ctx.closePath();
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function map(value, low1, high1, low2, high2) {
  return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

export default GooeyLine
