import * as THREE from 'three';
import { OrbitControls } from '../vendor/OrbitControls.js';

const stage = document.getElementById('stage');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#e8efe8');
const camera = new THREE.PerspectiveCamera(42, stage.clientWidth / stage.clientHeight, 0.1, 100);
camera.position.set(13, 10, 14);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(stage.clientWidth, stage.clientHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
stage.appendChild(renderer.domElement);
renderer.domElement.setAttribute('aria-label', '可旋转和缩放的三维自习室');
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1, 0);
controls.enableDamping = true;
controls.minDistance = 8;
controls.maxDistance = 26;
controls.maxPolarAngle = Math.PI / 2.05;
controls.listenToKeyEvents(window);
controls.update();
controls.saveState();

scene.add(new THREE.AmbientLight('#ffffff', 1.2));
const sunlight = new THREE.DirectionalLight('#fff4dd', 2.4);
sunlight.position.set(3, 12, 7);
sunlight.castShadow = true;
sunlight.shadow.mapSize.set(1024, 1024);
sunlight.shadow.camera.left = -10;
sunlight.shadow.camera.right = 10;
sunlight.shadow.camera.top = 10;
sunlight.shadow.camera.bottom = -10;
scene.add(sunlight);

const wood = new THREE.MeshStandardMaterial({ color: '#c4a278', roughness: 0.8 });
const legs = new THREE.MeshStandardMaterial({ color: '#425c50', roughness: 0.6 });
const chairMaterial = new THREE.MeshStandardMaterial({ color: '#42856b', roughness: 0.7 });
const shelfMaterial = new THREE.MeshStandardMaterial({ color: '#376950', roughness: 0.8 });
const wall = new THREE.MeshStandardMaterial({ color: '#e6e4d6', roughness: 0.95 });
const lampMaterial = new THREE.MeshStandardMaterial({ color: '#e4c065', emissive: '#c99532', emissiveIntensity: 0.5 });

// 参数为宽、高、深、坐标和材质；返回已加入场景的Mesh。
function box(width, height, depth, x, y, z, material, parent = scene) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

box(12, 0.18, 9, 0, -0.12, 0, new THREE.MeshStandardMaterial({ color: '#d7d2bf' }));
box(12, 3.5, 0.16, 0, 1.65, -4.5, wall);
box(0.16, 3.5, 9, -6, 1.65, 0, wall);
const windowMaterial = new THREE.MeshStandardMaterial({ color: '#b8dde1', roughness: 0.3, emissive: '#628d93', emissiveIntensity: 0.2 });
for (const x of [-2.3, 2.3]) {
  box(3.5, 1.45, 0.06, x, 2.25, -4.39, windowMaterial);
  box(3.6, 0.1, 0.12, x, 1.5, -4.3, wood);
  box(0.06, 1.45, 0.1, x, 2.25, -4.31, wall);
}

function addChair(x, z, facingBack) {
  const chair = new THREE.Group();
  chair.position.set(x, 0, z);
  if (facingBack) chair.rotation.y = Math.PI;
  scene.add(chair);
  box(0.9, 0.13, 0.82, 0, 0.75, 0, chairMaterial, chair);
  box(0.9, 0.8, 0.11, 0, 1.12, 0.38, chairMaterial, chair);
  for (const lx of [-0.34, 0.34]) for (const lz of [-0.28, 0.28]) box(0.08, 0.7, 0.08, lx, 0.35, lz, legs, chair);
}

function addDesk(x, z) {
  box(2.65, 0.16, 1.25, x, 1.4, z, wood);
  for (const dx of [-1.1, 1.1]) for (const dz of [-0.45, 0.45]) box(0.12, 1.3, 0.12, x + dx, 0.65, z + dz, legs);
  const paper = new THREE.MeshStandardMaterial({ color: '#fff8e8' });
  box(0.65, 0.04, 0.45, x - 0.5, 1.51, z, paper);
  box(0.08, 0.55, 0.08, x + 0.85, 1.73, z - 0.28, legs);
  box(0.5, 0.13, 0.3, x + 0.69, 2, z - 0.28, lampMaterial);
  addChair(x - 0.55, z + 1.06, false);
  addChair(x + 0.55, z - 1.06, true);
}
for (const x of [-2.5, 1.8]) for (const z of [-1.55, 1.6]) addDesk(x, z);

function addShelf(x, z) {
  const shelf = new THREE.Group();
  shelf.position.set(x, 0, z);
  scene.add(shelf);
  box(2.15, 2.8, 0.08, 0, 1.4, -0.25, shelfMaterial, shelf);
  for (const side of [-1.08, 1.08]) box(0.13, 2.9, 0.55, side, 1.45, 0, shelfMaterial, shelf);
  const colors = ['#dfb663', '#ad685c', '#668da0', '#c8c6a6', '#4c796d'];
  for (let row = 0; row < 3; row++) {
    const y = 0.22 + row * 0.87;
    box(2.15, 0.12, 0.55, 0, y, 0, shelfMaterial, shelf);
    for (let i = 0; i < 7; i++) {
      box(0.19, 0.48 + (i % 3) * 0.06, 0.31, -0.84 + i * 0.27, y + 0.35, 0.02,
        new THREE.MeshStandardMaterial({ color: colors[(i + row) % colors.length] }), shelf);
    }
  }
  box(2.15, 0.12, 0.55, 0, 2.87, 0, shelfMaterial, shelf);
}
addShelf(-4.45, -3.9);
addShelf(4.45, -3.9);

const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.27, 0.55, 24), new THREE.MeshStandardMaterial({ color: '#b47856' }));
pot.position.set(-4.9, 0.28, 2.85);
pot.castShadow = true;
scene.add(pot);
for (let i = 0; i < 5; i++) {
  const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.36, 16, 12), chairMaterial);
  leaf.scale.set(0.55, 1.35, 0.6);
  leaf.position.set(-4.9 + Math.sin(i * 1.3) * 0.3, 0.9 + (i % 2) * 0.2, 2.85 + Math.cos(i * 1.3) * 0.3);
  leaf.rotation.z = Math.sin(i * 1.3) * 0.4;
  scene.add(leaf);
}

const signCanvas = document.createElement('canvas');
signCanvas.width = 768;
signCanvas.height = 160;
const pen = signCanvas.getContext('2d');
pen.fillStyle = '#376950';
pen.fillRect(0, 0, 768, 160);
pen.fillStyle = '#fff8e8';
pen.font = 'bold 70px Microsoft YaHei, sans-serif';
pen.textAlign = 'center';
pen.textBaseline = 'middle';
pen.fillText('静心自习室', 384, 80);
const sign = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.67), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(signCanvas) }));
sign.position.set(-5.9, 2.5, 0);
sign.rotation.y = Math.PI / 2;
scene.add(sign);

let paused = false;
let alternateColor = false;
let animationTime = 0;
let lastTime = 0;
document.getElementById('pause').addEventListener('click', event => {
  paused = !paused;
  event.currentTarget.textContent = paused ? '继续动画' : '暂停动画';
  event.currentTarget.setAttribute('aria-pressed', String(paused));
});
document.getElementById('color').addEventListener('click', () => {
  alternateColor = !alternateColor;
  shelfMaterial.color.set(alternateColor ? '#ad7853' : '#376950');
});
document.getElementById('reset').addEventListener('click', () => controls.reset());

function resize() {
  camera.aspect = stage.clientWidth / stage.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(stage.clientWidth, stage.clientHeight);
}
window.addEventListener('resize', resize);
function animate(time) {
  const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.1) : 0;
  lastTime = time;
  if (!paused) animationTime += delta;
  lampMaterial.emissiveIntensity = 0.5 + Math.sin(animationTime * 1.5) * 0.14;
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
renderer.render(scene, camera);
document.getElementById('render-status').hidden = true;
stage.dataset.state = 'ready';
requestAnimationFrame(animate);
