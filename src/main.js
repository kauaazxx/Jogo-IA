import './style.css';

import * as THREE from 'three';

const container = document.querySelector('#game');

if (!container) {

  throw new Error('Elemento #game nÃ£o encontrado.');

}

const FIELD_W = 24;

const FIELD_L = 36;

const GOAL_W = 5.2;

const GOAL_H = 2.8;

const MATCH_TIME = 90;

let scoreHome = 0;

let scoreAway = 0;

let timeLeft = MATCH_TIME;

let gameStarted = false;

let gamePaused = false;

let gameOver = false;

let lastTime = 0;

let joystickX = 0;

let joystickY = 0;

let sprinting = false;

let kickCooldown = 0;
let opponentKickCooldown = 0;

let goalMessageTime = 0;

let opponentSpeed = 4.3;

let playerSpeed = 6.2;

let goalkeepersEnabled = true;

const STATS_KEY = 'streetFootball3DStats';

function loadStats() {
  const defaultStats = {
    matches: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    goals: 0,
    bestMatchGoals: 0,
    coins: 0,
    speedLevel: 0,
    shotLevel: 0
  };

  try {
    const saved = JSON.parse(localStorage.getItem(STATS_KEY));
    return saved ? { ...defaultStats, ...saved } : defaultStats;
  } catch {
    return defaultStats;
  }
}

const careerStats = loadStats();

const keys = {};

const goalParticles = [];

const messageElement = document.querySelector('#message');

const homeScoreElement = document.querySelector('#home-score');

const awayScoreElement = document.querySelector('#away-score');

const timerElement = document.querySelector('#timer');

const startScreen = document.querySelector('#start-screen');

const endScreen = document.querySelector('#end-screen');

const pauseScreen = document.querySelector('#pause-screen');

const startButton = document.querySelector('#start-button');

const restartButton = document.querySelector('#restart-button');

const pauseButton = document.querySelector('#pause-button');

const resumeButton = document.querySelector('#resume-button');

const quitButton = document.querySelector('#quit-button');

const difficultySelect = document.querySelector('#difficulty');

const resultTitle = document.querySelector('#result-title');

const resultDescription = document.querySelector('#result-description');

const finalHome = document.querySelector('#final-home');

const finalAway = document.querySelector('#final-away');

const statsPanel = document.createElement('div');
statsPanel.id = 'career-stats';
statsPanel.style.cssText = [
  'margin: 18px auto 0',
  'padding: 14px 16px',
  'max-width: 420px',
  'width: 100%',
  'box-sizing: border-box',
  'border: 1px solid rgba(110,255,160,0.35)',
  'border-radius: 14px',
  'background: rgba(5,20,12,0.78)',
  'color: #ffffff',
  'font-size: 14px',
  'line-height: 1.7',
  'text-align: left'
].join(';');

if (startScreen) {
  startScreen.appendChild(statsPanel);
}

function saveStats() {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(careerStats));
  } catch (error) {
    console.warn('NÃ£o foi possÃ­vel salvar as estatÃ­sticas.', error);
  }
}

statsPanel.addEventListener('click', (event) => {
  const button = event.target.closest('[data-upgrade]');
  if (!button) return;

  const type = button.dataset.upgrade;
  const levelKey = type === 'speed' ? 'speedLevel' : 'shotLevel';
  const cost = 50 + careerStats[levelKey] * 40;

  if (careerStats.coins < cost) {
    showMessage('Moedas insuficientes! Termine uma partida para ganhar mais.');
    window.setTimeout(hideMessage, 1800);
    return;
  }

  careerStats.coins -= cost;
  careerStats[levelKey] += 1;
  saveStats();
  updateStatsPanel();
  showMessage(type === 'speed' ? 'âš¡ Velocidade melhorada!' : 'ðŸŽ¯ Chute melhorado!');
  window.setTimeout(hideMessage, 1500);
});

function updateStatsPanel() {
  if (!statsPanel) return;

  const speedCost = 50 + careerStats.speedLevel * 40;
  const shotCost = 50 + careerStats.shotLevel * 40;
  statsPanel.innerHTML = `
    <div style="font-size:17px;font-weight:800;margin-bottom:6px;color:#75ff9c">ðŸ† SUA CARREIRA</div>
    <div>ðŸª™ Moedas: <strong>${careerStats.coins}</strong></div>
    <div>Partidas: <strong>${careerStats.matches}</strong></div>
    <div>VitÃ³rias: <strong>${careerStats.wins}</strong> &nbsp; Derrotas: <strong>${careerStats.losses}</strong> &nbsp; Empates: <strong>${careerStats.draws}</strong></div>
    <div>Gols marcados: <strong>${careerStats.goals}</strong></div>
    <div>Recorde de gols em uma partida: <strong>${careerStats.bestMatchGoals}</strong></div>
    <hr style="border:0;border-top:1px solid rgba(255,255,255,.18);margin:10px 0">
    <div style="font-size:15px;font-weight:800;color:#75ff9c;margin-bottom:6px">âš¡ MELHORIAS DO JOGADOR</div>
    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin:7px 0">
      <span>Velocidade Â· Nv. ${careerStats.speedLevel}</span>
      <button type="button" data-upgrade="speed" style="border:0;border-radius:8px;padding:7px 10px;font-weight:800;cursor:pointer;background:#75ff9c;color:#092012">Comprar (${speedCost} ðŸª™)</button>
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin:7px 0">
      <span>Chute Â· Nv. ${careerStats.shotLevel}</span>
      <button type="button" data-upgrade="shot" style="border:0;border-radius:8px;padding:7px 10px;font-weight:800;cursor:pointer;background:#75ff9c;color:#092012">Comprar (${shotCost} ðŸª™)</button>
    </div>
    <div style="font-size:12px;opacity:.8;margin-top:5px">Ganhe moedas ao terminar partidas. Melhorias ficam salvas neste navegador.</div>
  `;
}

const joystickBase = document.querySelector('#joystick-base');

const joystickStick = document.querySelector('#joystick-stick');

const sprintButton = document.querySelector('#sprint-button');

const kickButton = document.querySelector('#kick-button');

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x10251a);

scene.fog = new THREE.Fog(0x10251a, 45, 90);

const camera = new THREE.PerspectiveCamera(

  55,

  container.clientWidth / Math.max(container.clientHeight, 1),

  0.1,

  150

);

camera.position.set(0, 14, 24);

camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({

  antialias: true,

  alpha: false

});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

renderer.setSize(container.clientWidth, container.clientHeight);

renderer.shadowMap.enabled = true;

renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.outputColorSpace = THREE.SRGBColorSpace;

renderer.domElement.style.display = 'block';

renderer.domElement.style.width = '100%';

renderer.domElement.style.height = '100%';

container.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffffff, 0x31513a, 2));

const sunlight = new THREE.DirectionalLight(0xffffff, 2.2);

sunlight.position.set(-8, 20, 12);

sunlight.castShadow = true;

sunlight.shadow.mapSize.set(1024, 1024);

scene.add(sunlight);

const whiteMaterial = new THREE.MeshBasicMaterial({

  color: 0xffffff

});

function addBox(parent, width, height, depth, material, x, y, z) {

  const mesh = new THREE.Mesh(

    new THREE.BoxGeometry(width, height, depth),

    material

  );

  mesh.position.set(x, y, z);

  mesh.castShadow = true;

  mesh.receiveShadow = true;

  parent.add(mesh);

  return mesh;

}

// CAMPO

const field = new THREE.Group();

scene.add(field);

addBox(

  field,

  FIELD_W + 8,

  0.3,

  FIELD_L + 8,

  new THREE.MeshStandardMaterial({ color: 0x183b24 }),

  0,

  -0.25,

  0

);

const grassMaterials = [

  new THREE.MeshStandardMaterial({ color: 0x267d38 }),

  new THREE.MeshStandardMaterial({ color: 0x218034 })

];

const grass = new THREE.Mesh(

  new THREE.PlaneGeometry(FIELD_W, FIELD_L),

  grassMaterials[0]

);

grass.rotation.x = -Math.PI / 2;

grass.position.y = -0.08;

grass.receiveShadow = true;

field.add(grass);

for (let i = 0; i < 9; i++) {

  const stripe = new THREE.Mesh(

    new THREE.PlaneGeometry(FIELD_W, FIELD_L / 9),

    grassMaterials[i % 2]

  );

  stripe.rotation.x = -Math.PI / 2;

  stripe.position.set(

    0,

    -0.065,

    -FIELD_L / 2 + FIELD_L / 18 + i * FIELD_L / 9

  );

  stripe.receiveShadow = true;

  field.add(stripe);

}

function addLine(x1, z1, x2, z2, thickness = 0.075) {

  const dx = x2 - x1;

  const dz = z2 - z1;

  const length = Math.hypot(dx, dz);

  const line = new THREE.Mesh(

    new THREE.BoxGeometry(

      Math.abs(dx) < 0.001 ? thickness : length,

      0.025,

      Math.abs(dz) < 0.001 ? thickness : length

    ),

    whiteMaterial

  );

  line.position.set(

    (x1 + x2) / 2,

    0.015,

    (z1 + z2) / 2

  );

  if (Math.abs(dx) > 0.001 && Math.abs(dz) > 0.001) {

    line.rotation.y = -Math.atan2(dz, dx);

  }

  field.add(line);

}

addLine(-FIELD_W / 2, -FIELD_L / 2, FIELD_W / 2, -FIELD_L / 2);

addLine(-FIELD_W / 2, FIELD_L / 2, FIELD_W / 2, FIELD_L / 2);

addLine(-FIELD_W / 2, -FIELD_L / 2, -FIELD_W / 2, FIELD_L / 2);

addLine(FIELD_W / 2, -FIELD_L / 2, FIELD_W / 2, FIELD_L / 2);

addLine(-FIELD_W / 2, 0, FIELD_W / 2, 0);

const centerCircle = new THREE.Mesh(

  new THREE.RingGeometry(2.7, 2.78, 64),

  whiteMaterial

);

centerCircle.rotation.x = -Math.PI / 2;

centerCircle.position.y = 0.025;

field.add(centerCircle);

const centerSpot = new THREE.Mesh(

  new THREE.CircleGeometry(0.12, 24),

  whiteMaterial

);

centerSpot.rotation.x = -Math.PI / 2;

centerSpot.position.y = 0.03;

field.add(centerSpot);

function addPenaltyArea(z, direction) {

  const edge = z + direction * 5;

  const halfWidth = 7;

  addLine(-halfWidth, z, halfWidth, z);

  addLine(-halfWidth, z, -halfWidth, edge);

  addLine(halfWidth, z, halfWidth, edge);

  addLine(-halfWidth, edge, halfWidth, edge);

  addLine(-3, z, 3, z);

  addLine(-3, z, -3, z + direction * 1.5);

  addLine(3, z, 3, z + direction * 1.5);

}

addPenaltyArea(-FIELD_L / 2, 1);

addPenaltyArea(FIELD_L / 2, -1);

// GOLS

function createGoal(z, direction) {

  const goal = new THREE.Group();

  const postMaterial = new THREE.MeshStandardMaterial({

    color: 0xffffff,

    metalness: 0.25,

    roughness: 0.4

  });

  const radius = 0.12;

  const backZ = z + direction * 2;

  addBox(goal, radius, GOAL_H, radius, postMaterial, -GOAL_W / 2, GOAL_H / 2, z);

  addBox(goal, radius, GOAL_H, radius, postMaterial, GOAL_W / 2, GOAL_H / 2, z);

  addBox(

    goal,

    GOAL_W + radius,

    radius,

    radius,

    postMaterial,

    0,

    GOAL_H,

    z

  );

  const netMaterial = new THREE.LineBasicMaterial({

    color: 0xe5f5e9,

    transparent: true,

    opacity: 0.65

  });

  const points = [];

  for (let x = -GOAL_W / 2; x <= GOAL_W / 2 + 0.01; x += 0.5) {

    points.push(new THREE.Vector3(x, 0, z));

    points.push(new THREE.Vector3(x, GOAL_H, z));

    points.push(new THREE.Vector3(x, 0, backZ));

    points.push(new THREE.Vector3(x, GOAL_H, backZ));

  }

  for (let y = 0; y <= GOAL_H + 0.01; y += 0.45) {

    points.push(new THREE.Vector3(-GOAL_W / 2, y, z));

    points.push(new THREE.Vector3(GOAL_W / 2, y, z));

    points.push(new THREE.Vector3(-GOAL_W / 2, y, backZ));

    points.push(new THREE.Vector3(GOAL_W / 2, y, backZ));

  }

  for (let x = -GOAL_W / 2; x < GOAL_W / 2; x += 0.5) {

    for (let y = 0; y < GOAL_H; y += 0.45) {

      const geometry = new THREE.BufferGeometry().setFromPoints([

        new THREE.Vector3(x, y, backZ),

        new THREE.Vector3(x + 0.5, y, backZ)

      ]);

      goal.add(new THREE.Line(geometry, netMaterial));

    }

  }

  const netGeometry = new THREE.BufferGeometry().setFromPoints(points);

  goal.add(new THREE.LineSegments(netGeometry, netMaterial));

  scene.add(goal);

}

createGoal(-FIELD_L / 2, -1);

createGoal(FIELD_L / 2, 1);

// JOGADORES

function createPlayer(shirtColor, shortsColor, number) {

  const root = new THREE.Group();

  const shirt = new THREE.MeshStandardMaterial({

    color: shirtColor,

    roughness: 0.7

  });

  const shorts = new THREE.MeshStandardMaterial({

    color: shortsColor,

    roughness: 0.8

  });

  const skin = new THREE.MeshStandardMaterial({

    color: 0xc98d65,

    roughness: 0.8

  });

  const shoes = new THREE.MeshStandardMaterial({

    color: 0x171717,

    roughness: 0.7

  });

  const body = new THREE.Mesh(

    new THREE.CapsuleGeometry(0.36, 0.55, 4, 8),

    shirt

  );

  body.position.y = 1.25;

  body.castShadow = true;

  root.add(body);

  const shortsMesh = new THREE.Mesh(

    new THREE.BoxGeometry(0.65, 0.32, 0.4),

    shorts

  );

  shortsMesh.position.y = 0.83;

  shortsMesh.castShadow = true;

  root.add(shortsMesh);

  const head = new THREE.Mesh(

    new THREE.SphereGeometry(0.25, 16, 16),

    skin

  );

  head.position.y = 2.02;

  head.castShadow = true;

  root.add(head);

  const hair = new THREE.Mesh(

    new THREE.SphereGeometry(0.255, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),

    new THREE.MeshStandardMaterial({ color: 0x302018 })

  );

  hair.position.y = 2.09;

  hair.castShadow = true;

  root.add(hair);

  const arms = [];

  const legs = [];

  for (const side of [-1, 1]) {

    const arm = new THREE.Mesh(

      new THREE.CapsuleGeometry(0.105, 0.42, 3, 6),

      shirt

    );

    arm.position.set(side * 0.43, 1.32, 0);

    arm.rotation.z = side * -0.12;

    arm.castShadow = true;

    root.add(arm);

    arms.push(arm);

    const leg = new THREE.Group();

    const legMesh = new THREE.Mesh(

      new THREE.CapsuleGeometry(0.13, 0.43, 3, 6),

      skin

    );

    legMesh.position.y = -0.24;

    legMesh.castShadow = true;

    leg.add(legMesh);

    const shoe = new THREE.Mesh(

      new THREE.BoxGeometry(0.23, 0.12, 0.36),

      shoes

    );

    shoe.position.set(0, -0.5, -0.07);

    shoe.castShadow = true;

    leg.add(shoe);

    leg.position.set(side * 0.2, 0.68, 0);

    root.add(leg);

    legs.push(leg);

  }

  const numberCanvas = document.createElement('canvas');

  numberCanvas.width = 128;

  numberCanvas.height = 128;

  const context = numberCanvas.getContext('2d');

  context.clearRect(0, 0, 128, 128);

  context.fillStyle = '#ffffff';

  context.font = 'bold 72px Arial';

  context.textAlign = 'center';

  context.textBaseline = 'middle';

  context.fillText(String(number), 64, 66);

  const numberTexture = new THREE.CanvasTexture(numberCanvas);

  const numberMesh = new THREE.Mesh(

    new THREE.PlaneGeometry(0.34, 0.34),

    new THREE.MeshBasicMaterial({

      map: numberTexture,

      transparent: true,

      side: THREE.DoubleSide,

      depthWrite: false

    })

  );

  numberMesh.position.set(0, 1.28, -0.365);

  root.add(numberMesh);

  scene.add(root);

  root.traverse((object) => {

    if (object.isMesh) {

      object.visible = true;

      object.frustumCulled = false;

    }

  });

  return { root, legs, arms, number };

}

const home = createPlayer(0x1687ff, 0x123d8c, 10);

const away = createPlayer(0xff3030, 0x9d1414, 9);

home.root.position.set(0, 0, 8);

away.root.position.set(0, 0, -7);

// GOLEIROS

function createGoalkeeper(color, z) {

  const root = new THREE.Group();

  const shirtMaterial = new THREE.MeshStandardMaterial({

    color,

    roughness: 0.65

  });

  const shortsMaterial = new THREE.MeshStandardMaterial({

    color: 0x20252a,

    roughness: 0.8

  });

  const skinMaterial = new THREE.MeshStandardMaterial({

    color: 0xc98d65,

    roughness: 0.8

  });

  const gloveMaterial = new THREE.MeshStandardMaterial({

    color: 0xf4f4f4,

    roughness: 0.65

  });

  const body = new THREE.Mesh(

    new THREE.CapsuleGeometry(0.4, 0.6, 4, 8),

    shirtMaterial

  );

  body.position.y = 1.25;

  body.castShadow = true;

  root.add(body);

  const shorts = new THREE.Mesh(

    new THREE.BoxGeometry(0.7, 0.3, 0.42),

    shortsMaterial

  );

  shorts.position.y = 0.82;

  shorts.castShadow = true;

  root.add(shorts);

  const head = new THREE.Mesh(

    new THREE.SphereGeometry(0.25, 16, 16),

    skinMaterial

  );

  head.position.y = 2.03;

  head.castShadow = true;

  root.add(head);

  const arms = [];

  for (const side of [-1, 1]) {

    const arm = new THREE.Mesh(

      new THREE.CapsuleGeometry(0.12, 0.48, 3, 6),

      shirtMaterial

    );

    arm.position.set(side * 0.47, 1.38, 0);

    arm.rotation.z = side * -0.35;

    arm.castShadow = true;

    root.add(arm);

    arms.push(arm);

    const glove = new THREE.Mesh(

      new THREE.SphereGeometry(0.17, 12, 12),

      gloveMaterial

    );

    glove.position.set(side * 0.61, 1.4, -0.04);

    glove.castShadow = true;

    root.add(glove);

  }

  const legs = [];

  for (const side of [-1, 1]) {

    const leg = new THREE.Mesh(

      new THREE.CapsuleGeometry(0.14, 0.45, 3, 6),

      skinMaterial

    );

    leg.position.set(side * 0.2, 0.35, 0);

    leg.castShadow = true;

    root.add(leg);

    legs.push(leg);

  }

  root.position.set(0, 0, z);

  scene.add(root);

  root.traverse((object) => {

    if (object.isMesh) {

      object.visible = true;

      object.frustumCulled = false;

    }

  });

  return {

    root,

    arms,

    legs,

    homeX: 0,

    baseZ: z,

    diveTime: 0,

    diveDirection: 0,

    cooldown: 0

  };

}

const homeGoalkeeper = createGoalkeeper(0xffb52e, 16.3);

const awayGoalkeeper = createGoalkeeper(0x22d6bd, -16.3);

// BOLA

const ball = new THREE.Mesh(

  new THREE.SphereGeometry(0.38, 24, 24),

  new THREE.MeshStandardMaterial({

    color: 0xffffff,

    roughness: 0.65

  })

);

ball.position.set(0, 0.4, 4);

ball.castShadow = true;

ball.receiveShadow = true;

scene.add(ball);

const ballMarkings = new THREE.Mesh(

  new THREE.IcosahedronGeometry(0.385, 1),

  new THREE.MeshBasicMaterial({

    color: 0x222222,

    wireframe: true

  })

);

ball.add(ballMarkings);

const ballVelocity = new THREE.Vector3();

// INTERFACE

function updateScore() {

  homeScoreElement.textContent = scoreHome;

  awayScoreElement.textContent = scoreAway;

}

function updateTimer() {

  const minutes = Math.floor(timeLeft / 60);

  const seconds = Math.floor(timeLeft % 60);

  timerElement.textContent =

    `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

}

function showOverlay(element) {

  element.classList.remove('hidden');

}

function hideOverlay(element) {

  element.classList.add('hidden');

}

function showMessage(text) {

  messageElement.textContent = text;

  messageElement.classList.remove('hidden');

}

function hideMessage() {

  messageElement.classList.add('hidden');

}

// EFEITOS DE GOL

function createGoalEffect() {

  const colors = [0xffff00, 0x00ff88, 0xffffff, 0x00aaff];

  for (let i = 0; i < 70; i++) {

    const particle = new THREE.Mesh(

      new THREE.SphereGeometry(0.07, 6, 6),

      new THREE.MeshBasicMaterial({

        color: colors[Math.floor(Math.random() * colors.length)],

        transparent: true

      })

    );

    particle.position.set(

      ball.position.x,

      ball.position.y + 1,

      ball.position.z

    );

    particle.userData.velocity = new THREE.Vector3(

      (Math.random() - 0.5) * 10,

      Math.random() * 8 + 2,

      (Math.random() - 0.5) * 10

    );

    particle.userData.life = 1.5;

    scene.add(particle);

    goalParticles.push(particle);

  }

}

function updateGoalParticles(delta) {

  for (let i = goalParticles.length - 1; i >= 0; i--) {

    const particle = goalParticles[i];

    particle.userData.life -= delta;

    particle.userData.velocity.y -= 12 * delta;

    particle.position.addScaledVector(

      particle.userData.velocity,

      delta

    );

    particle.material.opacity = Math.max(

      0,

      particle.userData.life / 1.5

    );

    if (particle.userData.life <= 0) {

      scene.remove(particle);

      particle.geometry.dispose();

      particle.material.dispose();

      goalParticles.splice(i, 1);

    }

  }

}

// RESET E PARTIDA

function resetPositions() {

  home.root.position.set(0, 0, 8);

  home.root.rotation.set(0, Math.PI, 0);

  home.root.visible = true;

  away.root.position.set(0, 0, -7);

  away.root.rotation.set(0, 0, 0);

  away.root.visible = true;

  homeGoalkeeper.root.position.set(0, 0, 16.3);

  awayGoalkeeper.root.position.set(0, 0, -16.3);

  homeGoalkeeper.diveTime = 0;

  awayGoalkeeper.diveTime = 0;

  homeGoalkeeper.cooldown = 0;

  awayGoalkeeper.cooldown = 0;

  ball.position.set(0, 0.4, 4);

  ballVelocity.set(0, 0, 0);

  joystickX = 0;

  joystickY = 0;

  sprinting = false;

}

function startGame() {

  scoreHome = 0;

  scoreAway = 0;

  timeLeft = MATCH_TIME;

  gameStarted = true;

  gamePaused = false;

  gameOver = false;

  kickCooldown = 0;

  goalMessageTime = 0;

  resetPositions();

  updateScore();

  updateTimer();

  hideMessage();

  hideOverlay(startScreen);

  hideOverlay(endScreen);

  hideOverlay(pauseScreen);

}

function finishGame() {

  gameStarted = false;

  gameOver = true;

  finalHome.textContent = scoreHome;

  finalAway.textContent = scoreAway;

  if (scoreHome > scoreAway) {

    resultTitle.textContent = 'VOCÃŠ VENCEU!';

    resultDescription.textContent = 'Grande partida! VocÃª dominou o campo.';

  } else if (scoreHome < scoreAway) {

    resultTitle.textContent = 'VOCÃŠ PERDEU!';

    resultDescription.textContent = 'NÃ£o desista! Tente novamente.';

  } else {

    resultTitle.textContent = 'EMPATE!';

    resultDescription.textContent = 'Uma partida equilibrada!';

  }

  // Atualiza a carreira uma Ãºnica vez ao encerrar a partida.
  careerStats.matches += 1;
  careerStats.goals += scoreHome;
  careerStats.bestMatchGoals = Math.max(careerStats.bestMatchGoals, scoreHome);
  if (scoreHome > scoreAway) {
    careerStats.wins += 1;
    careerStats.coins += 30 + scoreHome * 10;
  } else if (scoreHome < scoreAway) {
    careerStats.losses += 1;
    careerStats.coins += scoreHome * 10;
  } else {
    careerStats.draws += 1;
    careerStats.coins += 15 + scoreHome * 10;
  }
  saveStats();
  updateStatsPanel();

  showOverlay(endScreen);

}

function pauseGame() {

  if (!gameStarted || gameOver || gamePaused) return;

  gamePaused = true;

  showOverlay(pauseScreen);

}

function resumeGame() {

  if (!gamePaused) return;

  gamePaused = false;

  hideOverlay(pauseScreen);

}

function returnToMenu() {

  gameStarted = false;

  gamePaused = false;

  gameOver = false;

  resetPositions();

  hideMessage();

  hideOverlay(pauseScreen);

  hideOverlay(endScreen);

  showOverlay(startScreen);

}

// GOLEIROS: POSICIONAMENTO E DEFESAS

function updateGoalkeeper(goalkeeper, defendingPositiveZ, delta) {

  if (goalkeeper.cooldown > 0) {

    goalkeeper.cooldown -= delta;

  }

  if (goalkeeper.diveTime > 0) {

    goalkeeper.diveTime -= delta;

    goalkeeper.root.position.x +=

      goalkeeper.diveDirection * 4.5 * delta;

    goalkeeper.root.position.x = THREE.MathUtils.clamp(

      goalkeeper.root.position.x,

      -GOAL_W / 2 + 0.5,

      GOAL_W / 2 - 0.5

    );

    goalkeeper.root.rotation.z =

      goalkeeper.diveDirection * 0.55;

    goalkeeper.root.position.y =

      Math.sin((goalkeeper.diveTime / 0.55) * Math.PI) * 0.65;

    if (goalkeeper.diveTime <= 0) {

      goalkeeper.root.rotation.z = 0;

      goalkeeper.root.position.y = 0;

    }

    return;

  }

  const ballThreatensGoal = defendingPositiveZ

    ? ball.position.z > 7

    : ball.position.z < -7;

  let targetX = ballThreatensGoal

    ? ball.position.x

    : ball.position.x * 0.3;

  targetX = THREE.MathUtils.clamp(

    targetX,

    -GOAL_W / 2 + 0.4,

    GOAL_W / 2 - 0.4

  );

  const moveSpeed = ballThreatensGoal ? 1.35 : 0.9;

  goalkeeper.root.position.x += THREE.MathUtils.clamp(

    targetX - goalkeeper.root.position.x,

    -moveSpeed * delta,

    moveSpeed * delta

  );

  goalkeeper.root.position.z = goalkeeper.baseZ;

  goalkeeper.root.position.y = 0;

  // Tenta defender quando a bola chega perto do gol.

  const nearGoal = defendingPositiveZ

    ? ball.position.z > 12

    : ball.position.z < -12;

  const movingTowardGoal = defendingPositiveZ

    ? ballVelocity.z > 0

    : ballVelocity.z < 0;

  const closeEnough = Math.abs(

    ball.position.x - goalkeeper.root.position.x

  ) < 1.0;

  if (

    goalkeepersEnabled &&

    nearGoal &&

    movingTowardGoal &&

    closeEnough &&

    goalkeeper.cooldown <= 0

  ) {

    goalkeeper.diveDirection =

      ball.position.x >= goalkeeper.root.position.x ? 1 : -1;

    goalkeeper.diveTime = 0.42;

    goalkeeper.cooldown = 3.2;

    // Desvia a bola para longe da linha do gol.

    ballVelocity.z *= -0.35;

    ballVelocity.x += goalkeeper.diveDirection * 1.2;

    ballVelocity.y = Math.max(ballVelocity.y, 1.2);

    ball.position.z = defendingPositiveZ ? 13.0 : -13.0;

    showMessage('ðŸ§¤ DEFESA DO GOLEIRO!');

    goalMessageTime = 1.0;

  }

}

function scoreGoal(playerScored) {

  if (goalMessageTime > 0) return;

  if (playerScored) {

    scoreHome++;

    showMessage('âš½ GOOOOOL! VOCÃŠ MARCOU!');

  } else {

    scoreAway++;

    showMessage('âš½ GOL DO ADVERSÃRIO!');

  }

  updateScore();

  goalMessageTime = 1.8;

  createGoalEffect();

  resetPositions();

}

// MOVIMENTAÃ‡ÃƒO

function clampPlayer(player) {

  player.root.position.x = THREE.MathUtils.clamp(

    player.root.position.x,

    -FIELD_W / 2 + 0.8,

    FIELD_W / 2 - 0.8

  );

  player.root.position.z = THREE.MathUtils.clamp(

    player.root.position.z,

    -FIELD_L / 2 + 0.8,

    FIELD_L / 2 - 0.8

  );

  player.root.position.y = 0;

  player.root.visible = true;

}

function animatePlayer(player, moving, delta) {

  const amount = moving

    ? Math.sin(performance.now() * 0.012) * 0.55

    : 0;

  player.legs.forEach((leg, index) => {

    const side = index === 0 ? 1 : -1;

    const target = amount * side;

    leg.rotation.x +=

      (target - leg.rotation.x) * Math.min(1, delta * 11);

  });

  player.arms.forEach((arm, index) => {

    const side = index === 0 ? 1 : -1;

    const target = moving ? -amount * side * 0.6 : 0;

    arm.rotation.x +=

      (target - arm.rotation.x) * Math.min(1, delta * 11);

  });

}

function moveHome(delta) {

  const direction = new THREE.Vector3();

  if (keys.KeyW || keys.ArrowUp) direction.z -= 1;

  if (keys.KeyS || keys.ArrowDown) direction.z += 1;

  if (keys.KeyA || keys.ArrowLeft) direction.x -= 1;

  if (keys.KeyD || keys.ArrowRight) direction.x += 1;

  direction.x += joystickX;

  direction.z += joystickY;

  if (direction.lengthSq() > 1) {

    direction.normalize();

  }

  const running =

    sprinting || keys.ShiftLeft || keys.ShiftRight;

  const upgradedPlayerSpeed = playerSpeed + careerStats.speedLevel * 0.45;
  const speed = running ? upgradedPlayerSpeed * 1.45 : upgradedPlayerSpeed;

  home.root.position.x += direction.x * speed * delta;

  home.root.position.z += direction.z * speed * delta;

  if (direction.lengthSq() > 0.01) {

    home.root.rotation.y = Math.atan2(direction.x, direction.z);

  }

  clampPlayer(home);

  animatePlayer(home, direction.lengthSq() > 0.01, delta);

}

function moveOpponent(delta) {
  // O adversÃ¡rio tem um objetivo claro: levar a bola atÃ© o gol do jogador,
  // que fica no lado positivo do campo (+Z).
  opponentKickCooldown = Math.max(0, opponentKickCooldown - delta);

  const dx = ball.position.x - away.root.position.x;
  const dz = ball.position.z - away.root.position.z;
  const distance = Math.hypot(dx, dz);
  const hasBall = distance < 1.45;

  // Sem a bola, tenta chegar por trÃ¡s dela, na direÃ§Ã£o do prÃ³prio gol-alvo,
  // em vez de perseguir o centro da bola sem estratÃ©gia.
  let targetX;
  let targetZ;
  if (hasBall) {
    // Conduz a bola para frente e procura alinhar a jogada com o gol.
    targetX = THREE.MathUtils.clamp(ball.position.x * 0.45, -2.0, 2.0);
    targetZ = ball.position.z + 1.2;
  } else {
    targetX = ball.position.x;
    targetZ = ball.position.z - 0.85;
  }

  const direction = new THREE.Vector3(
    targetX - away.root.position.x,
    0,
    targetZ - away.root.position.z
  );

  if (direction.lengthSq() > 0.04) {
    direction.normalize();
    const speed = hasBall ? opponentSpeed * 0.72 : opponentSpeed;
    away.root.position.x += direction.x * speed * delta;
    away.root.position.z += direction.z * speed * delta;
    away.root.rotation.y = Math.atan2(direction.x, direction.z);
  }

  clampPlayer(away);
  animatePlayer(away, distance > 0.25, delta);

  // Ao alcanÃ§ar a bola, chuta em direÃ§Ã£o ao gol do jogador (+Z),
  // mirando levemente para o centro e variando a direÃ§Ã£o conforme a posiÃ§Ã£o.
  if (distance < 1.55 && opponentKickCooldown <= 0) {
    const aimX = THREE.MathUtils.clamp(-ball.position.x * 0.22, -1.2, 1.2);
    const shot = new THREE.Vector3(aimX, 0, 1).normalize();
    ballVelocity.x = shot.x * 5.2;
    ballVelocity.z = 7.2;
    ballVelocity.y = 1.15;
    opponentKickCooldown = 1.15;
  }
}

// CHUTE

function kickBall() {

  if (!gameStarted || gamePaused || gameOver || kickCooldown > 0) {

    return;

  }

  const distance = Math.hypot(

    home.root.position.x - ball.position.x,

    home.root.position.z - ball.position.z

  );

  if (distance > 2.1) return;

  const forward = new THREE.Vector3(

    Math.sin(home.root.rotation.y),

    0,

    Math.cos(home.root.rotation.y)

  );

  const towardGoal = new THREE.Vector3(

    -ball.position.x * 0.15,

    0,

    -1

  ).normalize();

  const shotDirection = forward

    .lerp(towardGoal, 0.55)

    .normalize();

  const shotPower = 11 + careerStats.shotLevel * 1.2;
  ballVelocity.x += shotDirection.x * shotPower;

  ballVelocity.z += shotDirection.z * shotPower;

  ballVelocity.y = 2.2;

  kickCooldown = 0.45;

}

// FÃSICA DA BOLA

function updateBall(delta) {

  ball.position.x += ballVelocity.x * delta;

  ball.position.z += ballVelocity.z * delta;

  ball.position.y += ballVelocity.y * delta;

  ballVelocity.y -= 9.8 * delta;

  if (ball.position.y < 0.4) {

    ball.position.y = 0.4;

    ballVelocity.y *= -0.35;

    if (Math.abs(ballVelocity.y) < 0.8) {

      ballVelocity.y = 0;

    }

  }

  ballVelocity.x *= Math.pow(0.985, delta * 60);

  ballVelocity.z *= Math.pow(0.985, delta * 60);

  if (Math.abs(ball.position.x) > FIELD_W / 2 - 0.5) {

    ball.position.x =

      Math.sign(ball.position.x) * (FIELD_W / 2 - 0.5);

    ballVelocity.x *= -0.7;

  }

  // Primeiro, atualiza os goleiros para tentarem a defesa.

  updateGoalkeeper(homeGoalkeeper, true, delta);

  updateGoalkeeper(awayGoalkeeper, false, delta);

  if (Math.abs(ball.position.z) > FIELD_L / 2) {

    const insideGoal =

      Math.abs(ball.position.x) < GOAL_W / 2 &&

      ball.position.y < GOAL_H;

    if (insideGoal) {

      scoreGoal(ball.position.z < 0);

      return;

    }

    ball.position.z =

      Math.sign(ball.position.z) * (FIELD_L / 2 - 0.5);

    ballVelocity.z *= -0.7;

  }

  for (const player of [home, away]) {

    const distance = Math.hypot(

      ball.position.x - player.root.position.x,

      ball.position.z - player.root.position.z

    );

    if (distance < 1.05) {

      const push = new THREE.Vector3(

        ball.position.x - player.root.position.x,

        0,

        ball.position.z - player.root.position.z

      );

      if (push.lengthSq() < 0.01) {

        push.set(0, 0, 1);

      }

      push.normalize();

      ballVelocity.x += push.x * 2.2;

      ballVelocity.z += push.z * 2.2;

    }

  }

  ball.rotation.x += ballVelocity.z * delta * 1.5;

  ball.rotation.z -= ballVelocity.x * delta * 1.5;

}

// CÃ‚MERA

function updateCamera(delta) {

  const playerZ = home.root.position.z;

  const targetX = home.root.position.x * 0.35;

  const targetZ = THREE.MathUtils.clamp(

    playerZ * 0.25,

    -5,

    5

  );

  const desiredPosition = new THREE.Vector3(

    home.root.position.x * 0.3,

    13,

    24 + THREE.MathUtils.clamp(playerZ * 0.45, -5, 5)

  );

  camera.position.lerp(

    desiredPosition,

    Math.min(1, delta * 2.5)

  );

  camera.lookAt(targetX, 0, targetZ - 2);

}

// DIFICULDADE

function updateDifficulty() {

  if (difficultySelect.value === 'easy') {

    opponentSpeed = 3.1;

  } else if (difficultySelect.value === 'hard') {

    opponentSpeed = 5.6;

  } else {

    opponentSpeed = 4.3;

  }

}

difficultySelect.addEventListener('change', updateDifficulty);

// TECLADO

window.addEventListener('keydown', (event) => {

  keys[event.code] = true;

  if (

    ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)

  ) {

    event.preventDefault();

  }

  if (event.code === 'Space') {

    kickBall();

  }

  if (event.code === 'Escape' || event.code === 'KeyP') {

    if (gamePaused) {

      resumeGame();

    } else {

      pauseGame();

    }

  }

});

window.addEventListener('keyup', (event) => {

  keys[event.code] = false;

});

// JOYSTICK

if (joystickBase && joystickStick) {

  let joystickActive = false;

  let joystickPointer = null;

  function updateJoystick(event) {

    const rect = joystickBase.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;

    const centerY = rect.top + rect.height / 2;

    let x = event.clientX - centerX;

    let y = event.clientY - centerY;

    const maxDistance = rect.width * 0.32;

    const distance = Math.hypot(x, y);

    if (distance > maxDistance) {

      x = (x / distance) * maxDistance;

      y = (y / distance) * maxDistance;

    }

    joystickX = x / maxDistance;

    joystickY = y / maxDistance;

    joystickStick.style.transform = `translate(${x}px, ${y}px)`;

  }

  joystickBase.addEventListener('pointerdown', (event) => {

    joystickActive = true;

    joystickPointer = event.pointerId;

    joystickBase.setPointerCapture(event.pointerId);

    updateJoystick(event);

  });

  joystickBase.addEventListener('pointermove', (event) => {

    if (joystickActive && event.pointerId === joystickPointer) {

      updateJoystick(event);

    }

  });

  function stopJoystick() {

    joystickActive = false;

    joystickPointer = null;

    joystickX = 0;

    joystickY = 0;

    joystickStick.style.transform = 'translate(0px, 0px)';

  }

  joystickBase.addEventListener('pointerup', stopJoystick);

  joystickBase.addEventListener('pointercancel', stopJoystick);

  joystickBase.addEventListener('lostpointercapture', stopJoystick);

}

// BOTÃ•ES MOBILE

sprintButton.addEventListener('pointerdown', (event) => {

  event.preventDefault();

  sprinting = true;

});

function stopSprint() {

  sprinting = false;

}

sprintButton.addEventListener('pointerup', stopSprint);

sprintButton.addEventListener('pointercancel', stopSprint);

sprintButton.addEventListener('pointerleave', stopSprint);

kickButton.addEventListener('pointerdown', (event) => {

  event.preventDefault();

  kickBall();

});

// MENU

startButton.addEventListener('click', startGame);

restartButton.addEventListener('click', startGame);

pauseButton.addEventListener('click', pauseGame);

resumeButton.addEventListener('click', resumeGame);

quitButton.addEventListener('click', returnToMenu);

// TAMANHO DA TELA

function resizeRenderer() {

  const width = container.clientWidth;

  const height = container.clientHeight;

  if (!width || !height) return;

  camera.aspect = width / height;

  camera.updateProjectionMatrix();

  renderer.setSize(width, height);

}

window.addEventListener('resize', resizeRenderer);

// LOOP PRINCIPAL

function animate(now) {

  requestAnimationFrame(animate);

  const delta = Math.min(

    (now - lastTime) / 1000 || 0,

    0.05

  );

  lastTime = now;

  updateGoalParticles(delta);

  if (goalMessageTime > 0) {

    goalMessageTime -= delta;

    if (goalMessageTime <= 0) {

      hideMessage();

    }

  }

  if (gameStarted && !gamePaused && !gameOver) {

    moveHome(delta);

    moveOpponent(delta);

    updateBall(delta);

    updateCamera(delta);

    timeLeft -= delta;

    if (timeLeft <= 0) {

      timeLeft = 0;

      finishGame();

    }

    if (kickCooldown > 0) {

      kickCooldown -= delta;

    }

    updateTimer();

  } else {

    updateCamera(delta);

  }

  home.root.visible = true;

  away.root.visible = true;

  homeGoalkeeper.root.visible = true;

  awayGoalkeeper.root.visible = true;

  renderer.render(scene, camera);

}

// INICIALIZAÃ‡ÃƒO

updateScore();

updateTimer();

updateStatsPanel();

updateDifficulty();

resizeRenderer();

hideOverlay(endScreen);

hideOverlay(pauseScreen);

showOverlay(startScreen);

hideMessage();

requestAnimationFrame(animate);