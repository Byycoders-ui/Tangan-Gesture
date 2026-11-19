const PARTICLE_COUNT = 9000;
let scene, camera, renderer, particles, geometry;
let currentPositions = new Float32Array(PARTICLE_COUNT * 3);
let targetPositions = new Float32Array(PARTICLE_COUNT * 3);
let currentColors = new Float32Array(PARTICLE_COUNT * 3);
let targetColors = new Float32Array(PARTICLE_COUNT * 3);

let activeShapeIndex = 0;

// 1. Awan Warna-warni (Tangan Terbuka)
function getCloudPositions() {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 16;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 16;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 16;
    }
    return pos;
}

// 2. Bola/Lingkaran Padat Berputar (Mengepal)
function getSpherePositions() {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const u = Math.random() * Math.PI * 2;
        const v = Math.acos(Math.random() * 2 - 1);
        const r = 3.2 * Math.cbrt(Math.random());
        pos[i * 3] = r * Math.sin(v) * Math.cos(u);
        pos[i * 3 + 1] = r * Math.sin(v) * Math.sin(u);
        pos[i * 3 + 2] = r * Math.cos(v);
    }
    return pos;
}

// 3. Teks "I LOVE YOU" (Telunjuk Terbuka)
function getTextPositions() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 700;
    canvas.height = 140;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 52px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('I LOVE YOU', canvas.width / 2, canvas.height / 2);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const validPixels = [];

    for (let y = 0; y < canvas.height; y += 2) {
        for (let x = 0; x < canvas.width; x += 2) {
            const index = (y * canvas.width + x) * 4;
            if (imgData.data[index] > 128) {
                validPixels.push({
                    x: (x - canvas.width / 2) * 0.025,
                    y: -(y - canvas.height / 2) * 0.025
                });
            }
        }
    }

    const pos = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const pt = validPixels[i % validPixels.length];
        pos[i * 3] = pt.x + (Math.random() - 0.5) * 0.02;
        pos[i * 3 + 1] = pt.y + (Math.random() - 0.5) * 0.02;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 0.05;
    }
    return pos;
}

// 4. Bentuk Hati / Heart (Dua Jari / Peace)
function getHeartPositions() {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const t = Math.random() * Math.PI * 2;
        const u = Math.random() * Math.PI - Math.PI / 2;
        let x = 16 * Math.pow(Math.sin(t), 3);
        let y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        let z = u * 2;
        pos[i * 3] = x * 0.22;
        pos[i * 3 + 1] = y * 0.22;
        pos[i * 3 + 2] = z * 0.22;
    }
    return pos;
}

// WARNA MASING-MASING BENTUK
function getCloudColors() {
    const col = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        col[i * 3] = 0.2 + Math.random() * 0.8;
        col[i * 3 + 1] = 0.4 + Math.random() * 0.6;
        col[i * 3 + 2] = 0.9 + Math.random() * 0.1;
    }
    return col;
}

function getSphereColors() {
    const col = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        col[i * 3] = 0.9 + Math.random() * 0.1;
        col[i * 3 + 1] = 0.5 + Math.random() * 0.3;
        col[i * 3 + 2] = 0.1 + Math.random() * 0.2;
    }
    return col;
}

function getTextColor() {
    const col = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        col[i * 3] = 0.1;
        col[i * 3 + 1] = 0.85;
        col[i * 3 + 2] = 1.0;
    }
    return col;
}

function getHeartColors() {
    const col = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        col[i * 3] = 0.95 + Math.random() * 0.05;
        col[i * 3 + 1] = 0.05 + Math.random() * 0.15;
        col[i * 3 + 2] = 0.15 + Math.random() * 0.2;
    }
    return col;
}

const shapes = [
    getCloudPositions(),
    getSpherePositions(),
    getTextPositions(),
    getHeartPositions()
];

const shapeColors = [
    getCloudColors(),
    getSphereColors(),
    getTextColor(),
    getHeartColors()
];

function initThreeJS() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 12;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    geometry = new THREE.BufferGeometry();
    const initialPos = shapes[0];
    const initialCol = shapeColors[0];

    for (let i = 0; i < PARTICLE_COUNT * 3; i++) {
        currentPositions[i] = initialPos[i];
        targetPositions[i] = initialPos[i];
        currentColors[i] = initialCol[i];
        targetColors[i] = initialCol[i];
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(currentColors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.055,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.9
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);

    window.addEventListener('resize', onWindowResize);
    animate();
}

function setShape(shapeIndex) {
    if (activeShapeIndex === shapeIndex) return;
    activeShapeIndex = shapeIndex;
    
    const targetPos = shapes[shapeIndex];
    const targetCol = shapeColors[shapeIndex];

    for (let i = 0; i < PARTICLE_COUNT * 3; i++) {
        targetPositions[i] = targetPos[i];
        targetColors[i] = targetCol[i];
    }
}

function animate() {
    requestAnimationFrame(animate);

    const positions = geometry.attributes.position.array;
    const colorsAttr = geometry.attributes.color.array;

    for (let i = 0; i < PARTICLE_COUNT * 3; i++) {
        positions[i] += (targetPositions[i] - positions[i]) * 0.08;
        colorsAttr[i] += (targetColors[i] - colorsAttr[i]) * 0.08;
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;

    if (activeShapeIndex === 2) {
        particles.rotation.x = THREE.MathUtils.lerp(particles.rotation.x, 0, 0.1);
        particles.rotation.y = THREE.MathUtils.lerp(particles.rotation.y, 0, 0.1);
        particles.rotation.z = THREE.MathUtils.lerp(particles.rotation.z, 0, 0.1);
    } else if (activeShapeIndex === 3) {
        particles.rotation.y += 0.01;
        particles.rotation.x = THREE.MathUtils.lerp(particles.rotation.x, 0, 0.1);
        particles.rotation.z = THREE.MathUtils.lerp(particles.rotation.z, 0, 0.1);
    } else if (activeShapeIndex === 1) {
        particles.rotation.y += 0.015;
        particles.rotation.x += 0.005;
    } else {
        particles.rotation.y += 0.004;
    }

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function detectGesture(landmarks) {
    const isIndexOpen = landmarks[8].y < landmarks[6].y;
    const isMiddleOpen = landmarks[12].y < landmarks[10].y;
    const isRingOpen = landmarks[16].y < landmarks[14].y;
    const isPinkyOpen = landmarks[20].y < landmarks[18].y;

    if (isIndexOpen && isMiddleOpen && !isRingOpen && !isPinkyOpen) {
        return 3; 
    }
    if (isIndexOpen && !isMiddleOpen && !isRingOpen && !isPinkyOpen) {
        return 2; 
    }
    if (!isIndexOpen && !isMiddleOpen && !isRingOpen && !isPinkyOpen) {
        return 1; 
    }
    if (isIndexOpen && isMiddleOpen && isRingOpen && isPinkyOpen) {
        return 0; 
    }

    return activeShapeIndex;
}

function onResults(results) {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const shapeIndex = detectGesture(results.multiHandLandmarks[0]);
        setShape(shapeIndex);
    }
}

const videoElement = document.getElementById('webcam');
const errorMsg = document.getElementById('error-msg');

initThreeJS();

const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.65,
    minTrackingConfidence: 0.65
});

hands.onResults(onResults);

navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
        videoElement.srcObject = stream;
        const cameraUtils = new Camera(videoElement, {
            onFrame: async () => {
                await hands.send({ image: videoElement });
            },
            width: 480,
            height: 360
        });
        cameraUtils.start();
    })
    .catch((err) => {
        console.error("Akses kamera ditolak/gagal:", err);
        errorMsg.style.display = "block";
    });
