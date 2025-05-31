const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const grid = 20;
let count = 0;
let snake = [{ x: 160, y: 200 }];
let dx = grid;
let dy = 0;
let food = { x: 320, y: 200 };
let score = 0;

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function resetFood() {
    food.x = getRandomInt(0, canvas.width / grid) * grid;
    food.y = getRandomInt(0, canvas.height / grid) * grid;
}

function gameLoop() {
    requestAnimationFrame(gameLoop);
    if (++count < 6) return;
    count = 0;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Move snake
    let head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    // Check collision with food
    if (head.x === food.x && head.y === food.y) {
        score++;
        resetFood();
    } else {
        snake.pop();
    }

    // Draw food
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x, food.y, grid, grid);

    // Draw snake
    ctx.fillStyle = 'lime';
    snake.forEach((cell, i) => {
        ctx.fillRect(cell.x, cell.y, grid-1, grid-1);
        // Check collision with self
        if (i !== 0 && cell.x === head.x && cell.y === head.y) {
            snake = [{ x: 160, y: 200 }];
            dx = grid;
            dy = 0;
            score = 0;
            resetFood();
        }
    });

    // Check wall collision
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
        snake = [{ x: 160, y: 200 }];
        dx = grid;
        dy = 0;
        score = 0;
        resetFood();
    }

    // Draw score
    ctx.fillStyle = 'white';
    ctx.font = '18px Arial';
    ctx.fillText('Score: ' + score, 10, 20);
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft' && dx === 0) {
        dx = -grid; dy = 0;
    } else if (e.key === 'ArrowUp' && dy === 0) {
        dx = 0; dy = -grid;
    } else if (e.key === 'ArrowRight' && dx === 0) {
        dx = grid; dy = 0;
    } else if (e.key === 'ArrowDown' && dy === 0) {
        dx = 0; dy = grid;
    }
});

resetFood();
gameLoop();