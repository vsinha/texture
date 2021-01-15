let width = window.innerWidth;
let height = window.innerHeight;

let canvas;
let ctx;

let grid;
let now;

let render_ticks = 0;

let mouse_x = width / 2;
let mouse_y = height / 2;

function init() {
  canvas = document.getElementById("main_canvas");
  ctx = canvas.getContext("2d");
  ctx.canvas.width = width;
  ctx.canvas.height = height;

  canvas.style.background = "#011224";

  grid = init_grid(width, height, 10, 10);

  draw_loop();
}

function distance_2d(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function clamp(num, min, max) {
  return num <= min ? min : num >= max ? max : num;
}

class Cell {
  constructor(row, col, x, y, width, height) {
    this.row = row;
    this.col = col;
    this.x = x;
    this.y = y;
    this.dx = 0;
    this.dy = 0;
    this.radius = 1;
    this.width = width;
    this.height = height;
    this.visible = true;
    this.update();
  }

  update() {
    // let visible_chance = 0.1;
    // visible_chance += 20 / distance_2d(this.x, this.y, mouse_x, mouse_y);
    // this.visible = Math.random() < 0.9;

    let x = mouse_x - this.x;
    let y = mouse_y - this.y;
    let r = Math.sqrt(x * x + y * y);
    let sinc = 1000 * (Math.sin((r + 8 * render_ticks) / 50) / r);

    this.dy -= sinc * Math.sin(render_ticks / 10);
    this.dx += sinc * Math.cos(render_ticks / 10);

    this.radius = 1;
    this.radius = clamp(this.radius, 0, 4);

    if (this.row == 20 && this.col == 20) {
      //console.log(this.radius);
    }
  }

  render() {
    if (this.visible) {
      // draw_circle(this.x + this.dx, this.y + this.dy, this.radius);
      draw_rect(this.x + this.dx, this.y + this.dy);
    }
  }
}

function init_grid(width, height, cell_width, cell_height) {
  let grid = [];
  let rows = width / cell_width;
  let cols = height / cell_height;

  for (let row = 0; row < rows; row++) {
    let row_elems = [];
    for (let col = 0; col < cols; col++) {
      let cell = new Cell(
        row,
        col,
        row * (width / rows) + cell_width / 2,
        col * (height / cols) + cell_height / 2,
        cell_width,
        cell_height
      );
      row_elems.push(cell);
    }
    grid.push(row_elems);
  }
  return grid;
}

function draw_rect(x, y, radius) {
  ctx.rect(x, y, 1, 1); // fill in the pixel at (10,10)
}

function draw_circle(x, y, radius) {
  ctx.moveTo(x, y);
  ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
}

function render_grid(grid, width, height) {
  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#fffdda";

  for (const row of grid) {
    for (const cell of row) {
      cell.render();
    }
  }

  ctx.stroke();
}

function update() {
  for (const row of grid) {
    for (const cell of row) {
      cell.update();
    }
  }
}

function render() {
  ctx.globalCompositeOperation = "destination-over";
  ctx.clearRect(0, 0, width, height); // clear canvas
  // ctx.fillStyle = "black";
  // ctx.fillRect(0, 0, width, height);

  render_grid(grid, width, height);

  render_ticks += 1;
}

let fps = 60;

function draw_loop() {
  update();
  render();
  requestAnimationFrame(draw_loop);
}

onmousemove = function (e) {
  mouse_x = e.clientX;
  mouse_y = e.clientY;
};

window.onload = function () {
  init();
};
