// 3D Snake Game - Issue #7: Side Score Panel, Integer Auto Move
const container = document.getElementById('gameContainer');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);
const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(600, 600);
container.appendChild(renderer.domElement);

// OrbitControls for camera
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.target.set(10, 10, 10);
controls.update();

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 30, 30);
scene.add(light);
scene.add(new THREE.AmbientLight(0x888888));

// Add grid helper (ground)
const gridHelper = new THREE.GridHelper(20, 20, 0x888888, 0x444444);
gridHelper.position.y = -0.51;
scene.add(gridHelper);

// Game grid
const gridSize = 20;
const cubeSize = 1;

// Snake (integer movement for auto mode)
let snake = [{ x: 10, y: 10, z: 10 }];
let snakeMeshes = [];
let velocity = new THREE.Vector3(1, 0, 0); // Integer step for auto
let targetDirection = velocity.clone();
let autoTracking = false;
let paused = false;
let statusMsg = '';

// Food
let food = { x: 15, y: 10, z: 10 };
let foodMesh = null;

// Score
let score = 0;

// Camera setup
camera.position.set(25, 25, 25);
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
    snakeMeshes.forEach(mesh => scene.remove(mesh));
    snakeMeshes = [];
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
    if (paused) return;
    // Auto tracking: move toward food in integer steps
    if (autoTracking) {
        const head = snake[0];
        let dx = food.x - head.x;
        let dy = food.y - head.y;
        let dz = food.z - head.z;
        // Move in one axis at a time (priority: x > y > z)
        if (dx !== 0) {
            velocity = new THREE.Vector3(Math.sign(dx), 0, 0);
        } else if (dy !== 0) {
            velocity = new THREE.Vector3(0, Math.sign(dy), 0);
        } else if (dz !== 0) {
            velocity = new THREE.Vector3(0, 0, Math.sign(dz));
        }
        targetDirection = velocity.clone();
    }
    // Move head
    let head = { ...snake[0] };
    head.x += velocity.x;
    head.y += velocity.y;
    head.z += velocity.z;
    snake.unshift(head);
    // Remove tail for fixed length
    while (snake.length > 10) snake.pop();

    // Check food collision
    if (distance(head, food) < 1.2) {
        score++;
        food = randomPosition();
        drawFood();
    }

    // Wall: bounce instead of reset
    let bounced = false;
    if (head.x < 0 || head.x >= gridSize) { velocity.x *= -1; bounced = true; }
    if (head.y < 0 || head.y >= gridSize) { velocity.y *= -1; bounced = true; }
    if (head.z < 0 || head.z >= gridSize) { velocity.z *= -1; bounced = true; }
    if (bounced) statusMsg = 'Wall bounce!';
    else statusMsg = '';
}

function distance(a, b) {
    return Math.sqrt(
        (a.x - b.x) ** 2 +
        (a.y - b.y) ** 2 +
        (a.z - b.z) ** 2
    );
}

function resetGame() {
    snake = [{ x: 10, y: 10, z: 10 }];
    velocity = new THREE.Vector3(1, 0, 0);
    targetDirection = velocity.clone();
    food = randomPosition();
    score = 0;
    drawFood();
}

// Mouse drag to set direction (manual mode)
let isDragging = false;
let lastMouse = { x: 0, y: 0 };
renderer.domElement.addEventListener('pointerdown', (e) => {
    if (e.button === 0 && !autoTracking && !paused) {
        isDragging = true;
        lastMouse.x = e.clientX;
        lastMouse.y = e.clientY;
        document.body.style.cursor = 'grabbing';
    }
});
renderer.domElement.addEventListener('pointerup', () => {
    isDragging = false;
    document.body.style.cursor = 'default';
});
renderer.domElement.addEventListener('pointermove', (e) => {
    if (isDragging && !autoTracking && !paused) {
        const dx = e.clientX - lastMouse.x;
        const dy = e.clientY - lastMouse.y;
        lastMouse.x = e.clientX;
        lastMouse.y = e.clientY;
        const dragVec = new THREE.Vector3(dx, -dy, 0).normalize();
        const right = new THREE.Vector3();
        camera.getWorldDirection(right);
        right.cross(camera.up).normalize();
        const up = camera.up.clone().normalize();
        targetDirection = new THREE.Vector3();
        targetDirection.addScaledVector(right, dragVec.x);
        targetDirection.addScaledVector(up, dragVec.y);
        targetDirection.normalize();
        // Snap to nearest axis for integer movement
        if (Math.abs(targetDirection.x) > Math.abs(targetDirection.y) && Math.abs(targetDirection.x) > Math.abs(targetDirection.z)) {
            velocity = new THREE.Vector3(Math.sign(targetDirection.x), 0, 0);
        } else if (Math.abs(targetDirection.y) > Math.abs(targetDirection.z)) {
            velocity = new THREE.Vector3(0, Math.sign(targetDirection.y), 0);
        } else {
            velocity = new THREE.Vector3(0, 0, Math.sign(targetDirection.z));
        }
    }
});

drawFood();

// UI: Show coordinates and score
const coordsDiv = document.getElementById('coords');
const keyhintDiv = document.getElementById('keyhint');
const scoreDiv = document.getElementById('score');
const statusDiv = document.getElementById('status');
function updateUI() {
    const h = snake[0];
    coordsDiv.textContent = `(x, y, z): ${h.x}, ${h.y}, ${h.z}`;
    scoreDiv.textContent = `Score: ${score}`;
    statusDiv.textContent = statusMsg;
}

// UI: Show key hint
const keyList = [
    { key: 'Mouse Drag', desc: 'Move snake direction (when Auto OFF)' },
    { key: 'A', desc: 'Toggle Auto Tracking' },
    { key: 'Space', desc: 'Pause/Resume' },
    { key: 'R', desc: 'Reset Game' },
    { key: 'OrbitControls', desc: 'Camera: drag/zoom' }
];
function showKeyHint() {
    keyhintDiv.innerHTML = '<b>Key Hint:</b><br>' + keyList.map(k => `<b>${k.key}</b>: ${k.desc}`).join('<br>');
}
showKeyHint();

// Auto Tracking Button
const autoBtn = document.getElementById('autoBtn');
autoBtn.onclick = () => {
    autoTracking = !autoTracking;
    autoBtn.textContent = `Auto Tracking: ${autoTracking ? 'ON' : 'OFF'}`;
    autoBtn.classList.toggle('on', autoTracking);
};

document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'a') {
        autoTracking = !autoTracking;
        autoBtn.textContent = `Auto Tracking: ${autoTracking ? 'ON' : 'OFF'}`;
        autoBtn.classList.toggle('on', autoTracking);
    } else if (e.key === ' ') {
        paused = !paused;
        statusMsg = paused ? 'Paused' : '';
    } else if (e.key.toLowerCase() === 'r') {
        resetGame();
        statusMsg = 'Game Reset!';
    }
});

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    updateUI();
    renderer.render(scene, camera);
}

function gameLoop() {
    setTimeout(gameLoop, 120);
    update();
    drawSnake();
}

animate();
gameLoop();