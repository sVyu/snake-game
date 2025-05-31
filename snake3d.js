// 3D Snake Game using Three.js
// Basic 3D snake logic and rendering

const container = document.getElementById('gameContainer');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(600, 600);
container.appendChild(renderer.domElement);

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 10, 10);
scene.add(light);

// Game grid
const gridSize = 20;
const cubeSize = 1;

// Snake
let snake = [{ x: 10, y: 10, z: 10 }];
let direction = { x: 1, y: 0, z: 0 };
let snakeMeshes = [];

// Food
let food = { x: 15, y: 10, z: 10 };
let foodMesh = null;

// Score
let score = 0;

// Camera setup
camera.position.set(10, 25, 25);
camera.lookAt(10, 10, 10);

function createCube(x, y, z, color) {
    const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    const material = new THREE.MeshPhongMaterial({ color });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(x, y, z);
    scene.add(cube);
    return cube;
}

function drawSnake() {
    // Remove old meshes
    snakeMeshes.forEach(mesh => scene.remove(mesh));
    snakeMeshes = [];
    // Draw new snake
    snake.forEach((segment, i) => {
        const mesh = createCube(segment.x, segment.y, segment.z, i === 0 ? 0x00ff00 : 0x008800);
        snakeMeshes.push(mesh);
    });
}

function drawFood() {
    if (foodMesh) scene.remove(foodMesh);
    foodMesh = createCube(food.x, food.y, food.z, 0xff0000);
}

function randomPosition() {
    return {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize),
        z: Math.floor(Math.random() * gridSize)
    };
}

function update() {
    // Move snake
    const head = { ...snake[0] };
    head.x += direction.x;
    head.y += direction.y;
    head.z += direction.z;
    snake.unshift(head);

    // Check food collision
    if (head.x === food.x && head.y === food.y && head.z === food.z) {
        score++;
        food = randomPosition();
        drawFood();
    } else {
        snake.pop();
    }

    // Check wall collision
    if (
        head.x < 0 || head.x >= gridSize ||
        head.y < 0 || head.y >= gridSize ||
        head.z < 0 || head.z >= gridSize
    ) {
        resetGame();
    }

    // Check self collision
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y && head.z === snake[i].z) {
            resetGame();
        }
    }
}

function resetGame() {
    snake = [{ x: 10, y: 10, z: 10 }];
    direction = { x: 1, y: 0, z: 0 };
    food = randomPosition();
    score = 0;
    drawFood();
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') direction = { x: 0, y: 0, z: -1 };
    else if (e.key === 'ArrowDown') direction = { x: 0, y: 0, z: 1 };
    else if (e.key === 'ArrowLeft') direction = { x: -1, y: 0, z: 0 };
    else if (e.key === 'ArrowRight') direction = { x: 1, y: 0, z: 0 };
    else if (e.key === 'w') direction = { x: 0, y: 1, z: 0 };
    else if (e.key === 's') direction = { x: 0, y: -1, z: 0 };
});

drawFood();

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

let tick = 0;
function gameLoop() {
    setTimeout(gameLoop, 120);
    update();
    drawSnake();
}

animate();
gameLoop();