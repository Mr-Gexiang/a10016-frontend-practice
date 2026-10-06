import * as THREE from 'three';
import { OrbitControls } from '../vendor/OrbitControls.js';

const stage = document.getElementById('stage');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#e8efe8');
const camera = new THREE.PerspectiveCamera(45, stage.clientWidth / stage.clientHeight, 0.1, 100);
camera.position.set(7, 5.3, 8);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(stage.clientWidth, stage.clientHeight);
stage.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.9, 0);
controls.enableDamping = true;
controls.minDistance = 5;
controls.maxDistance = 20;
controls.update();
controls.saveState();
scene.add(new THREE.AmbientLight('#ffffff', 1.2));
const light = new THREE.DirectionalLight('#fff5dd', 2.6);
light.position.set(4, 7, 5);
scene.add(light);

const platform = new THREE.Group();
scene.add(platform);
const base = new THREE.Mesh(new THREE.CylinderGeometry(3.3, 3.3, 0.45, 64), new THREE.MeshStandardMaterial({ color: '#b9c5b7', roughness: 0.7 }));
base.position.y = 0.23;
platform.add(base);
const cube = new THREE.Mesh(new THREE.BoxGeometry(1.25, 1.25, 1.25), new THREE.MeshStandardMaterial({ color: '#42856b', roughness: 0.5 }));
cube.position.set(-1.6, 1.1, 0);
cube.rotation.y = 0.4;
platform.add(cube);
const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.72, 32, 24), new THREE.MeshStandardMaterial({ color: '#d6b157', roughness: 0.4 }));
sphere.position.set(0, 1.17, 0.7);
platform.add(sphere);
const ring = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.19, 16, 48), new THREE.MeshStandardMaterial({ color: '#a87563', metalness: 0.2, roughness: 0.4 }));
ring.position.set(1.65, 1.37, -0.2);
platform.add(ring);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ color: '#d7ded2', roughness: 1 }));
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.015;
scene.add(ground);

let paused = false;
let lastTime = 0;
document.getElementById('pause').addEventListener('click', event => {
  paused = !paused;
  event.currentTarget.textContent = paused ? '继续旋转' : '暂停旋转';
  event.currentTarget.setAttribute('aria-pressed', String(paused));
});
document.getElementById('reset').addEventListener('click', () => controls.reset());
window.addEventListener('resize', () => {
  camera.aspect = stage.clientWidth / stage.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(stage.clientWidth, stage.clientHeight);
});
function animate(time) {
  const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.1) : 0;
  lastTime = time;
  if (!paused) platform.rotation.y += delta * 0.35;
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
renderer.render(scene, camera);
document.getElementById('render-status').hidden = true;
stage.dataset.state = 'ready';
requestAnimationFrame(animate);
