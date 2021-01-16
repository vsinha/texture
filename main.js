let width;
let height;

let canvas;
let ctx;
let animation_token;

let grid;
let now;

let render_ticks;

let mouse_x;
let mouse_y;

let rows_to_remove = 10;

let carousel_max = 3;
let carousel_index = 1;

const times = [];
let fps = 0;
let fps_div;

function init() {
  canvas = document.getElementById("main_canvas");
  fps_div = document.getElementById("fps");
  ctx = canvas.getContext("2d");

  canvas.style.background = "#011224";

  reset_window_size();
  reset();
}

function start() {
  draw_loop();
}

function stop() {
  window.cancelAnimationFrame(animation_token);
  animation_token = null;
}

function reset_window_size() {
  ctx.canvas.width = window.innerWidth;
  ctx.canvas.height = window.innerHeight;
}

function reset() {
  let cell_width = 10;
  render_ticks = 0;
  width = window.innerWidth - rows_to_remove * cell_width;
  height = window.innerHeight - rows_to_remove * cell_width;

  mouse_x = width / 2;
  mouse_y = height / 2;

  grid = init_grid(width, height, rows_to_remove, cell_width, cell_width);
  render();
}

function distance_2d(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function clamp(num, min, max) {
  return num <= min ? min : num >= max ? max : num;
}

class Cell {
  constructor(row, col, x, y, width, height, mode) {
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
    this.mode = mode;
    this.i = 0;
  }

  // wormhole
  mode_1_update() {
    let x = mouse_x - this.x;
    let y = mouse_y - this.y;
    let r = Math.sqrt(x * x + y * y);

    let sinc = 200 * (Math.sin((r + 8 * render_ticks) / 200) / r);

    this.dy -= sinc * Math.sin(render_ticks / 100);
    this.dx += sinc * Math.cos(render_ticks / 100);
  }

  //  twinkly
  mode_2_update() {
    if (this.i == 0) {
      let visible_chance = 0.5;
      visible_chance += 20 / distance_2d(this.x, this.y, mouse_x, mouse_y);
      this.visible = Math.random() < 0.4;
      this.period = Math.floor(Math.random() * 100);
    }
    this.i += 1;
    this.i = this.i % this.period;

    let dx = mouse_x - this.x;
    let dy = mouse_y - this.y;
    let r = Math.sqrt(dx * dx + dy * dy);

    this.dx = -(40 * dx) / r;
    this.dy = -(40 * dy) / r;
  }

  mode_3_update() {
    let x = mouse_x - this.x;
    let y = mouse_y - this.y;
    let r = Math.sqrt(x * x + y * y);
    let sinc = -900 * (Math.sin((r + render_ticks / 2) / 10) / r);

    this.dy = sinc;
  }

  update() {
    if (this.mode == 0) {
      this.mode_1_update();
    } else if (this.mode == 1) {
      this.mode_2_update();
    } else if (this.mode == 2) {
      this.mode_3_update();
    }
  }

  render() {
    if (this.visible) {
      draw_rect(this.x + this.dx, this.y + this.dy);
    }
  }
}

function init_grid(width, height, rows_to_remove, cell_width, cell_height) {
  let grid = [];
  let rows = width / cell_width;
  let cols = height / cell_height;

  for (let row = 0; row < rows; row++) {
    let row_elems = [];
    for (let col = 0; col < cols; col++) {
      let cell = new Cell(
        row,
        col,
        (cell_width * rows_to_remove) / 2 +
          row * (width / rows) +
          cell_width / 2,
        (cell_height * rows_to_remove) / 2 +
          col * (height / cols) +
          cell_height / 2,
        cell_width,
        cell_height,
        carousel_index
      );
      row_elems.push(cell);
    }
    grid.push(row_elems);
  }
  return grid;
}

function draw_rect(x, y, radius) {
  ctx.rect(x, y, 2, 2); // fill in the pixel at (10,10)
}

function draw_circle(x, y, radius) {
  ctx.moveTo(x, y);
  ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
}

function render_grid(grid, width, height) {
  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.fillStyle = "#fffdda";

  for (const row of grid) {
    for (const cell of row) {
      cell.render();
    }
  }

  ctx.fill();
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
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight); // clear canvas
  render_grid(grid, width, height);
  render_ticks += 1;
}

function update_fps() {
  const now = performance.now();
  while (times.length > 0 && times[0] <= now - 1000) {
    times.shift();
  }
  times.push(now);
  fps = times.length;
  fps_div.innerHTML = fps;
}

function draw_loop() {
  update();
  render();
  update_fps();
  animation_token = requestAnimationFrame(draw_loop);
}

window.onresize = reset_window_size;

window.onmousemove = function (e) {
  mouse_x = e.clientX;
  mouse_y = e.clientY;
};

window.onload = function () {
  init();
  start();
};

function mod(n, m) {
  return ((n % m) + m) % m;
}

document.body.onkeydown = (e) => {
  var keys = event2string(e);
  console.log(keys); // e.g. "Ctrl + A"
  switch (keys) {
    case "R":
      reset();
      break;
    case "Space":
      if (animation_token == null) {
        start();
      } else {
        stop();
      }
      break;
    case "-":
      rows_to_remove += 1;
      stop();
      reset();
      break;
    case "+":
      rows_to_remove -= 1;
      stop();
      reset();
      break;
    case "P":
      carousel_index -= 1;
      carousel_index = mod(carousel_index, carousel_max);
      console.log(carousel_index);
      reset();
      break;
    case "N":
      carousel_index += 1;
      carousel_index = mod(carousel_index, carousel_max);
      console.log(carousel_index);
      reset();
      break;
    case "QUESTION_MARK":
      break;
    default:
      break;
  }
};
