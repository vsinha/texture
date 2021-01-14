let width = window.innerWidth;
let height = window.innerHeight;

let canvas;
let ctx;

let circles = [];
let grid;
let now;

function init() {
    canvas = document.getElementById("main_canvas");
    ctx = canvas.getContext("2d");
    ctx.canvas.width = width;
    ctx.canvas.height = height;
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
    ctx.fillStyle = 'blue';
    ctx.fill(circle); //   <<< pass circle to context

    ctx.lineWidth = 1;
    ctx.strokeStyle = '#000066';
    ctx.stroke(circle); // <<< pass circle here too
}

class Cell {

    constructor(row, col, x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.visible = Math.random() > 0.5;

        this.update();
    }

    update() {
        this.visible = Math.random() > 0.5;

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
            let x = row * (width / rows) + cell_width / 2;
            let y = col * (height / cols) + cell_height / 2;
            row_elems.push(new Cell(
                row,
                col,
                x,
                y,
                cell_width,
                cell_height
            ));
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

    // for (let i = 0; i < 10; i++) {
    //     let x = width * Math.random();
    //     let y = height * Math.random();
    //     circles.push(circle(x, y, 2));
    // }

    for (const row of grid) {
        for (const cell of row) {
            cell.update();
        }
    }
}

function render() {
    ctx.globalCompositeOperation = 'destination-over';
    ctx.clearRect(0, 0, width, height); // clear canvas

    // for (const circle of circles) {
    //     render_circle(circle);
    // }

    render_grid(grid, width, height);
}

let fps = 60;

function update_loop() {
    // setInterval(function() {
    //     update();
    // }, 5000);
}

function draw_loop() {
    setTimeout(function() {
        requestAnimationFrame(draw_loop);
        render();
    }, 1000 / fps);
}

window.onload = function() {
    init();
}