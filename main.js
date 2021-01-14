let width = window.innerWidth;
let height = window.innerHeight;

let canvas;
let ctx;

let grid;
let now;

let mouse_x = width / 2;
let mouse_y = height / 2;

function init() {
  canvas = document.getElementById("main_canvas");
  ctx = canvas.getContext("2d");
  ctx.canvas.width = width;
  ctx.canvas.height = height;

  canvas.style.background = "#112244";

  update_loop();
  draw_loop();
  grid = init_grid(width, height, 10, 10);
}

function circle(x, y, radius) {
  let circle = new Path2D();
  circle.arc(x, y, radius, 0, 2 * Math.PI, false);
  return circle;
}

function render_circle(circle) {
  ctx.fillStyle = "#ffddaa";
  ctx.fill(circle); //   <<< pass circle to context

  // ctx.lineWidth = 1;
  // ctx.strokeStyle = '#000066';
  // ctx.stroke(circle); // <<< pass circle here too
}

function distance_2d(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

class Cell {
  constructor(row, col, x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.update();
  }

  update() {
    let visible_chance = 0.1;
    visible_chance += 20 / distance_2d(this.x, this.y, mouse_x, mouse_y);

    this.visible = Math.random() < visible_chance;

    this.refresh_interval = 1000 * Math.random() + 500;
    setTimeout(() => {
      this.update();
    }, this.refresh_interval);
  }

  render() {
    if (this.visible) {
      let c = circle(this.x, this.y, 1);
      render_circle(c);
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

function render_grid(grid, width, height) {
  for (const row of grid) {
    for (const cell of row) {
      cell.render();
    }
  }
}

function update() {
  now = new Date();
}

function render() {
  ctx.globalCompositeOperation = "destination-over";
  ctx.clearRect(0, 0, width, height); // clear canvas
  // ctx.fillStyle = "black";
  // ctx.fillRect(0, 0, width, height);

  render_grid(grid, width, height);
}

let fps = 60;

function update_loop() {}

function draw_loop() {
  setTimeout(function () {
    requestAnimationFrame(draw_loop);
    render();
  }, 1000 / fps);
}

onmousemove = function (e) {
  mouse_x = e.clientX;
  mouse_y = e.clientY;
};

window.onload = function () {
  init();
};
