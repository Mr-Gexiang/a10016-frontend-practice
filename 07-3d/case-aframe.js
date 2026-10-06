const status = document.getElementById('render-status');
const scene = document.querySelector('a-scene');

if (!window.AFRAME) {
  status.textContent = '场景加载失败：A-Frame本地文件未加载，请检查vendor目录。';
  status.classList.add('error');
} else {
  // 使用HTML实体生成重复窗户与树木，无需外部资源。
  const building = document.getElementById('building');
  for (const y of [3.8, 5.7]) for (const x of [-4.4, -2.2, 0, 2.2, 4.4]) {
    const windowBox = document.createElement('a-box');
    windowBox.setAttribute('position', `${x} ${y} -10.92`);
    windowBox.setAttribute('width', '1.3');
    windowBox.setAttribute('height', '1.2');
    windowBox.setAttribute('depth', '0.12');
    windowBox.setAttribute('color', '#80b7c0');
    building.appendChild(windowBox);
  }
  const trees = document.getElementById('trees');
  for (const [x, z] of [[-8, -4], [8, -8], [-9, -15], [10, -17]]) {
    const trunk = document.createElement('a-cylinder');
    trunk.setAttribute('position', `${x} 1.2 ${z}`);
    trunk.setAttribute('radius', '0.25');
    trunk.setAttribute('height', '2.4');
    trunk.setAttribute('color', '#916c49');
    trees.appendChild(trunk);
    const crown = document.createElement('a-sphere');
    crown.setAttribute('position', `${x} 3.1 ${z}`);
    crown.setAttribute('radius', '1.6');
    crown.setAttribute('color', '#477f50');
    trees.appendChild(crown);
  }
  function ready() {
    status.hidden = true;
    document.getElementById('stage').dataset.state = 'ready';
  }
  scene.addEventListener('renderstart', ready, { once: true });
  if (scene.renderStarted) ready();
  scene.addEventListener('loaded', () => {
    if (!scene.renderer) {
      status.hidden = false;
      status.textContent = '场景加载失败：浏览器无法建立WebGL渲染器。';
      status.classList.add('error');
    }
  }, { once: true });
  document.getElementById('reset').addEventListener('click', () => {
    const camera = document.getElementById('camera');
    camera.setAttribute('position', '0 1.7 10');
    camera.setAttribute('rotation', '0 0 0');
    const look = camera.components['look-controls'];
    if (look) {
      look.pitchObject.rotation.x = 0;
      look.yawObject.rotation.y = 0;
    }
  });
  let paused = false;
  document.getElementById('pause').addEventListener('click', event => {
    paused = !paused;
    for (const id of ['flag', 'lamp-globe', 'lamp-light']) document.getElementById(id).emit(paused ? 'pause-motion' : 'resume-motion');
    event.currentTarget.textContent = paused ? '继续动画' : '暂停动画';
    event.currentTarget.setAttribute('aria-pressed', String(paused));
  });
}
