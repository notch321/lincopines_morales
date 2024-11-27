


// Leaderboard: Initialize leaderboard data
const leaderboardDOM = document.getElementById("leaderboard");
const maxLeaderboardEntries = 5;

// Fetch leaderboard from local storage or initialize empty array
let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

// Function to update and render leaderboard
function updateLeaderboard(score) {
  leaderboard.push(score);
  leaderboard.sort((a, b) => b - a); // Sort scores in descending order
  leaderboard = leaderboard.slice(0, maxLeaderboardEntries); // Keep top scores

  // Store updated leaderboard in local storage
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));

  // Render leaderboard
  renderLeaderboard();
}

// Function to render leaderboard on the screen
function renderLeaderboard() {
  leaderboardDOM.innerHTML = "<h3>Leaderboard</h3>";
  leaderboard.forEach((score, index) => {
    leaderboardDOM.innerHTML += `<p>${index + 1}. ${score}</p>`;
  });
}

// Call renderLeaderboard initially to show saved scores on load
renderLeaderboard();

// Update the counter and check for new high score
function move(direction) {
  const finalPositions = moves.reduce(
    (position, move) => {
      if (move === "forward")
        return { lane: position.lane + 1, column: position.column };
      if (move === "backward")
        return { lane: position.lane - 1, column: position.column };
      if (move === "left")
        return { lane: position.lane, column: position.column - 1 };
      if (move === "right")
        return { lane: position.lane, column: position.column + 1 };
    },
    { lane: currentLane, column: currentColumn }
  );

  if (direction === "forward") {
    if (
      lanes[finalPositions.lane + 1].type === "forest" &&
      lanes[finalPositions.lane + 1].occupiedPositions.has(
        finalPositions.column
      )
    )
      return;
    if (!stepStartTimestamp) startMoving = true;
    addLane();
  } else if (direction === "backward") {
    if (finalPositions.lane === 0) return;
    if (
      lanes[finalPositions.lane - 1].type === "forest" &&
      lanes[finalPositions.lane - 1].occupiedPositions.has(
        finalPositions.column
      )
    )
      return;
    if (!stepStartTimestamp) startMoving = true;
  } else if (direction === "left") {
    if (finalPositions.column === 0) return;
    if (
      lanes[finalPositions.lane].type === "forest" &&
      lanes[finalPositions.lane].occupiedPositions.has(
        finalPositions.column - 1
      )
    )
      return;
    if (!stepStartTimestamp) startMoving = true;
  } else if (direction === "right") {
    if (finalPositions.column === columns - 1) return;
    if (
      lanes[finalPositions.lane].type === "forest" &&
      lanes[finalPositions.lane].occupiedPositions.has(
        finalPositions.column + 1
      )
    )
      return;
    if (!stepStartTimestamp) startMoving = true;
  }
  moves.push(direction);

  // Leaderboard: Update score and display
  if (direction === "forward") {
    counterDOM.innerHTML = parseInt(counterDOM.innerHTML) + 1;
  }
}

// Reset game and update leaderboard
document.querySelector("#retry").addEventListener("click", () => {
  const currentScore = parseInt(counterDOM.innerHTML);
  if (currentScore > 0) updateLeaderboard(currentScore);

  counterDOM.innerHTML = "0";
  lanes.forEach((lane) => scene.remove(lane.mesh));
  initaliseValues();
  endDOM.style.visibility = "hidden";
});

/**==================================**/























const counterDOM = document.getElementById("counter");
const endDOM = document.getElementById("end");
const scene = new THREE.Scene();
const distance = 500;
const camera = new THREE.OrthographicCamera(
  window.innerWidth / -2,
  window.innerWidth / 2,
  window.innerHeight / 2,
  window.innerHeight / -2,
  0.1,
  10000
);

camera.rotation.x = (50 * Math.PI) / 180;
camera.rotation.y = (20 * Math.PI) / 180;
camera.rotation.z = (10 * Math.PI) / 180;

const initialCameraPositionY = -Math.tan(camera.rotation.x) * distance;
const initialCameraPositionX =
  Math.tan(camera.rotation.y) *
  Math.sqrt(distance ** 2 + initialCameraPositionY ** 2);
camera.position.y = initialCameraPositionY;
camera.position.x = initialCameraPositionX;
camera.position.z = distance;

const zoom = 2.9;

const chickenSize = 14;

const positionWidth = 42;
const columns = 17;
const boardWidth = positionWidth * columns;

const stepTime = 200; // Miliseconds it takes for the chicken to take a step forward, backward, left or right

let lanes;
let currentLane;
let currentColumn;

let previousTimestamp;
let startMoving;
let moves;
let stepStartTimestamp;

const carFrontTexture = new Texture(40, 80, [{ x: 0, y: 10, w: 30, h: 60 }]);
const carBackTexture = new Texture(40, 80, [{ x: 10, y: 10, w: 30, h: 60 }]);
const carRightSideTexture = new Texture(110, 40, [
  { x: 10, y: 0, w: 50, h: 30 },
  { x: 70, y: 0, w: 30, h: 30 },
]);
const carLeftSideTexture = new Texture(110, 40, [
  { x: 10, y: 10, w: 50, h: 30 },
  { x: 70, y: 10, w: 30, h: 30 },
]);

const truckFrontTexture = new Texture(30, 30, [{ x: 15, y: 0, w: 10, h: 30 }]);
const truckRightSideTexture = new Texture(25, 30, [
  { x: 0, y: 15, w: 10, h: 10 },
]);
const truckLeftSideTexture = new Texture(25, 30, [
  { x: 0, y: 5, w: 10, h: 10 },
]);

const generateLanes = () =>
  [-9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    .map((index) => {
      const lane = new Lane(index);
      lane.mesh.position.y = index * positionWidth * zoom;
      scene.add(lane.mesh);
      return lane;
    })
    .filter((lane) => lane.index >= 0);

const addLane = () => {
  const index = lanes.length;
  const lane = new Lane(index);
  lane.mesh.position.y = index * positionWidth * zoom;
  scene.add(lane.mesh);
  lanes.push(lane);
};

const chicken = new Chicken();
scene.add(chicken);

hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
scene.add(hemiLight);

const initialDirLightPositionX = -100;
const initialDirLightPositionY = -100;
dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
dirLight.position.set(initialDirLightPositionX, initialDirLightPositionY, 200);
dirLight.castShadow = true;
dirLight.target = chicken;
scene.add(dirLight);

dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
var d = 500;
dirLight.shadow.camera.left = -d;
dirLight.shadow.camera.right = d;
dirLight.shadow.camera.top = d;
dirLight.shadow.camera.bottom = -d;

// var helper = new THREE.CameraHelper( dirLight.shadow.camera );
// var helper = new THREE.CameraHelper( camera );
// scene.add(helper)

backLight = new THREE.DirectionalLight(0x000000, 0.4);
backLight.position.set(200, 200, 50);
backLight.castShadow = true;
scene.add(backLight);

const laneTypes = ["car", "truck", "forest"];
const laneSpeeds = [2, 2.5, 3];
const vechicleColors = [0xa52523, 0xbdb638, 0x78b14b];
const threeHeights = [20, 45, 60];

const initaliseValues = () => {
  lanes = generateLanes();

  currentLane = 0;
  currentColumn = Math.floor(columns / 2);

  previousTimestamp = null;

  startMoving = false;
  moves = [];
  stepStartTimestamp;

  chicken.position.x = 0;
  chicken.position.y = 0;

  camera.position.y = initialCameraPositionY;
  camera.position.x = initialCameraPositionX;

  dirLight.position.x = initialDirLightPositionX;
  dirLight.position.y = initialDirLightPositionY;
};

initaliseValues();

const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);




// Canvas Creation and Setup   It means yung mismong view screen ng laro automatic mag aadjust
function Texture(width, height, rects) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.fillStyle = "rgba(0,0,0,0.6)";
  rects.forEach((rect) => {
    context.fillRect(rect.x, rect.y, rect.w, rect.h);
  });
  return new THREE.CanvasTexture(canvas);
}


// Wheel for car
function Wheel() {
  // Constants for easy adjustment
  const width = 12;
  const height = 33;
  const depth = 12;
  const color = 0x333333;

  // Create the geometry for the wheel
  const geometry = new THREE.BoxBufferGeometry(
    width * zoom,
    height * zoom,
    depth * zoom
  );

  // Create the material for the wheel
  const material = new THREE.MeshStandardMaterial({
    color: color,
    flatShading: true,
  });

  // Create the mesh and set position
  const wheel = new THREE.Mesh(geometry, material);
  wheel.position.z = (depth / 2) * zoom;

  // Enable shadows for better visual effect
  wheel.castShadow = true;
  wheel.receiveShadow = true;

  return wheel;
}

// Structure Design For Car
function Car() {
  const car = new THREE.Group();
  const color =
    vechicleColors[Math.floor(Math.random() * vechicleColors.length)];

  const main = new THREE.Mesh(
    new THREE.BoxBufferGeometry(60 * zoom, 30 * zoom, 15 * zoom),
    new THREE.MeshPhongMaterial({ color, flatShading: true })
  );
  main.position.z = 12 * zoom;
  main.castShadow = true;
  main.receiveShadow = true;
  car.add(main);

  const cabin = new THREE.Mesh(
    new THREE.BoxBufferGeometry(33 * zoom, 24 * zoom, 12 * zoom),
    [
      new THREE.MeshPhongMaterial({
        color: 0xcccccc,
        flatShading: true,
        map: carBackTexture,
      }),
      new THREE.MeshPhongMaterial({
        color: 0xcccccc,
        flatShading: true,
        map: carFrontTexture,
      }),
      new THREE.MeshPhongMaterial({
        color: 0xcccccc,
        flatShading: true,
        map: carRightSideTexture,
      }),
      new THREE.MeshPhongMaterial({
        color: 0xcccccc,
        flatShading: true,
        map: carLeftSideTexture,
      }),
      new THREE.MeshPhongMaterial({ color: 0xcccccc, flatShading: true }), // top
      new THREE.MeshPhongMaterial({ color: 0xcccccc, flatShading: true }), // bottom
    ]
  );
  cabin.position.x = 6 * zoom;
  cabin.position.z = 25.5 * zoom;
  cabin.castShadow = true;
  cabin.receiveShadow = true;
  car.add(cabin);

  const frontWheel = new Wheel();
  frontWheel.position.x = -18 * zoom;
  car.add(frontWheel);

  const backWheel = new Wheel();
  backWheel.position.x = 18 * zoom;
  car.add(backWheel);

  car.castShadow = true;
  car.receiveShadow = false;

  return car;
}
// Structure Design For Truck Car
function Truck() {
  const truck = new THREE.Group();
  const color =
    vechicleColors[Math.floor(Math.random() * vechicleColors.length)];

  const base = new THREE.Mesh(
    new THREE.BoxBufferGeometry(100 * zoom, 25 * zoom, 5 * zoom),
    new THREE.MeshLambertMaterial({ color: 0xb4c6fc, flatShading: true })
  );
  base.position.z = 10 * zoom;
  truck.add(base);

  const cargo = new THREE.Mesh(
    new THREE.BoxBufferGeometry(75 * zoom, 35 * zoom, 40 * zoom),
    new THREE.MeshPhongMaterial({ color: 0xb4c6fc, flatShading: true })
  );
  cargo.position.x = 15 * zoom;
  cargo.position.z = 30 * zoom;
  cargo.castShadow = true;
  cargo.receiveShadow = true;
  truck.add(cargo);

  const cabin = new THREE.Mesh(
    new THREE.BoxBufferGeometry(25 * zoom, 30 * zoom, 30 * zoom),
    [
      new THREE.MeshPhongMaterial({ color, flatShading: true }), // back
      new THREE.MeshPhongMaterial({
        color,
        flatShading: true,
        map: truckFrontTexture,
      }),
      new THREE.MeshPhongMaterial({
        color,
        flatShading: true,
        map: truckRightSideTexture,
      }),
      new THREE.MeshPhongMaterial({
        color,
        flatShading: true,
        map: truckLeftSideTexture,
      }),
      new THREE.MeshPhongMaterial({ color, flatShading: true }), // top
      new THREE.MeshPhongMaterial({ color, flatShading: true }), // bottom
    ]
  );
  cabin.position.x = -40 * zoom;
  cabin.position.z = 20 * zoom;
  cabin.castShadow = true;
  cabin.receiveShadow = true;
  truck.add(cabin);

  const frontWheel = new Wheel();
  frontWheel.position.x = -38 * zoom;
  truck.add(frontWheel);

  const middleWheel = new Wheel();
  middleWheel.position.x = -10 * zoom;
  truck.add(middleWheel);

  const backWheel = new Wheel();
  backWheel.position.x = 30 * zoom;
  truck.add(backWheel);

  return truck;
}

// Design For Three
function Three() {
  const three = new THREE.Group();

  // Constants for easy adjustment
  const trunkWidth = 15;
  const trunkHeight = 20;
  const crownWidth = 30;
  const trunkColor = 0x4d2926;
  const crownColor = 0x7aa21d;

  // Helper function to create the trunk
  function createTrunk() {
    const geometry = new THREE.BoxBufferGeometry(
      trunkWidth * zoom,
      trunkWidth * zoom,
      trunkHeight * zoom
    );
    const material = new THREE.MeshStandardMaterial({
      color: trunkColor,
      flatShading: true,
    });

    const trunk = new THREE.Mesh(geometry, material);
    trunk.position.z = (trunkHeight / 2) * zoom;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    return trunk;
  }

  // Helper function to create the crown
  function createCrown() {
    const height = threeHeights[Math.floor(Math.random() * threeHeights.length)];
    const geometry = new THREE.BoxBufferGeometry(
      crownWidth * zoom,
      crownWidth * zoom,
      height * zoom
    );
    const material = new THREE.MeshStandardMaterial({
      color: crownColor,
      flatShading: true,
    });

    const crown = new THREE.Mesh(geometry, material);
    crown.position.z = ((height / 2) + trunkHeight) * zoom;
    crown.castShadow = true;
    crown.receiveShadow = false;
    return crown;
  }

  // Add trunk and crown to the group
  three.add(createTrunk());
  three.add(createCrown());

  return three;
}




// Design For Chicken Avatar
function Chicken() {
  const chicken = new THREE.Group();

  // Scale down the whole chicken to a smaller size
  const scaleFactor = 0.3; // Scale down to 30%

  // Body (Smooth and slightly oval-shaped)
  const body = new THREE.Mesh(
    new THREE.SphereBufferGeometry(chickenSize * zoom, 32, 32),
    new THREE.MeshStandardMaterial({
      color: 0xF4A300, // Orange color
      roughness: 0.6,
      metalness: 0.1,
      flatShading: false,
    })
  );
  body.position.z = 15 * zoom;
  body.castShadow = true;
  body.receiveShadow = true;
  chicken.add(body);

  // Head (Slightly smaller with a smooth surface)
  const head = new THREE.Mesh(
    new THREE.SphereBufferGeometry(chickenSize * zoom / 1.5, 32, 32),
    new THREE.MeshStandardMaterial({
      color: 0xF4A300,
      roughness: 0.6,
      metalness: 0.1,
      flatShading: false,
    })
  );
  head.position.z = 30 * zoom;
  head.position.y = 12 * zoom;
  head.castShadow = true;
  head.receiveShadow = true;
  chicken.add(head);

  // Eyes (Refined with slightly glossy look)
  const leftEye = new THREE.Mesh(
    new THREE.SphereBufferGeometry(2.5 * zoom, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.1, metalness: 0.5 })
  );
  leftEye.position.set(-5 * zoom, 17 * zoom, 35 * zoom);
  chicken.add(leftEye);

  const rightEye = new THREE.Mesh(
    new THREE.SphereBufferGeometry(2.5 * zoom, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.1, metalness: 0.5 })
  );
  rightEye.position.set(5 * zoom, 17 * zoom, 35 * zoom);
  chicken.add(rightEye);

  // Beak (Cone shape with more defined features)
  const beak = new THREE.Mesh(
    new THREE.ConeBufferGeometry(3 * zoom, 6 * zoom, 6),
    new THREE.MeshStandardMaterial({ color: 0xFF6600, roughness: 0.7, metalness: 0.1 })
  );
  beak.position.set(0, 9 * zoom, 34 * zoom);
  beak.rotation.x = Math.PI / 2;  // Align the beak properly
  chicken.add(beak);

  // Wings (Curved geometry for a more realistic look)
  const wingGeometry = new THREE.CylinderBufferGeometry(6 * zoom, 0, 10 * zoom, 8, 1, true);
  const leftWing = new THREE.Mesh(
    wingGeometry,
    new THREE.MeshStandardMaterial({ color: 0xFFDD00, roughness: 0.5, metalness: 0.1 })
  );
  leftWing.rotation.z = Math.PI / 4;
  leftWing.position.set(-10 * zoom, 6 * zoom, 20 * zoom);
  leftWing.castShadow = true;
  leftWing.receiveShadow = true;
  chicken.add(leftWing);

  const rightWing = new THREE.Mesh(
    wingGeometry,
    new THREE.MeshStandardMaterial({ color: 0xFFDD00, roughness: 0.5, metalness: 0.1 })
  );
  rightWing.rotation.z = -Math.PI / 4;
  rightWing.position.set(10 * zoom, 6 * zoom, 20 * zoom);
  rightWing.castShadow = true;
  rightWing.receiveShadow = true;
  chicken.add(rightWing);

  // Legs (More realistic cylindrical shape with joints)
  const legGeometry = new THREE.CylinderBufferGeometry(1.5 * zoom, 1.5 * zoom, 8 * zoom);
  const leftLeg = new THREE.Mesh(
    legGeometry,
    new THREE.MeshStandardMaterial({ color: 0xF4A300, roughness: 0.6, metalness: 0.1 })
  );
  leftLeg.position.set(-5 * zoom, -7 * zoom, 5 * zoom);
  leftLeg.castShadow = true;
  leftLeg.receiveShadow = true;
  chicken.add(leftLeg);

  const rightLeg = new THREE.Mesh(
    legGeometry,
    new THREE.MeshStandardMaterial({ color: 0xF4A300, roughness: 0.6, metalness: 0.1 })
  );
  rightLeg.position.set(5 * zoom, -7 * zoom, 5 * zoom);
  rightLeg.castShadow = true;
  rightLeg.receiveShadow = true;
  chicken.add(rightLeg);

  // Feet (Detailed claws with three toes)
  const footGeometry = new THREE.BoxBufferGeometry(4 * zoom, 1 * zoom, 1 * zoom);
  const leftFoot = new THREE.Mesh(
    footGeometry,
    new THREE.MeshStandardMaterial({ color: 0xFF6600, roughness: 0.6, metalness: 0.2 })
  );
  leftFoot.position.set(-5 * zoom, -12 * zoom, 0);
  chicken.add(leftFoot);

  const rightFoot = new THREE.Mesh(
    footGeometry,
    new THREE.MeshStandardMaterial({ color: 0xFF6600, roughness: 0.6, metalness: 0.2 })
  );
  rightFoot.position.set(5 * zoom, -12 * zoom, 0);
  chicken.add(rightFoot);

  // Adding a comb (stylized red crest on the chicken's head)
  const comb = new THREE.Mesh(
    new THREE.SphereBufferGeometry(3 * zoom, 16, 8),
    new THREE.MeshStandardMaterial({ color: 0xB81027, roughness: 0.8, metalness: 0.1 })
  );
  comb.position.set(0, 19 * zoom, 38 * zoom);
  comb.castShadow = true;
  comb.receiveShadow = true;
  chicken.add(comb);

  // Scale down the entire chicken model
  chicken.scale.set(scaleFactor, scaleFactor, scaleFactor);

  return chicken;
}















// Design For Road
function Road() {
  const road = new THREE.Group();

  const createSection = (color) =>
    new THREE.Mesh(
      new THREE.PlaneBufferGeometry(boardWidth * zoom, positionWidth * zoom),
      new THREE.MeshPhongMaterial({ color })
    );

  const middle = createSection(0x454a59);
  middle.receiveShadow = true;
  road.add(middle);

  const left = createSection(0x393d49);
  left.position.x = -boardWidth * zoom;
  road.add(left);

  const right = createSection(0x393d49);
  right.position.x = boardWidth * zoom;
  road.add(right);

  return road;
}


// Design For Grass ground
function Grass() {
  const grass = new THREE.Group();

  const createSection = (color) =>
    new THREE.Mesh(
      new THREE.BoxBufferGeometry(
        boardWidth * zoom,
        positionWidth * zoom,
        3 * zoom
      ),
      new THREE.MeshPhongMaterial({ color })
    );

  const middle = createSection(0x9adb27);
  middle.receiveShadow = true;
  grass.add(middle);

  const left = createSection(0x9adb27);
  left.position.x = -boardWidth * zoom;
  grass.add(left);

  const right = createSection(0x9adb27);
  right.position.x = boardWidth * zoom;
  grass.add(right);

  grass.position.z = 1.5 * zoom;
  return grass;
}

function Lane(index) {
  this.index = index;
  this.type =
    index <= 0
      ? "field"
      : laneTypes[Math.floor(Math.random() * laneTypes.length)];

  switch (this.type) {
    case "field": {
      this.type = "field";
      this.mesh = new Grass();
      break;
    }
    case "forest": {
      this.mesh = new Grass();

      this.occupiedPositions = new Set();
      this.threes = [1, 2, 3, 4].map(() => {
        const three = new Three();
        let position;
        do {
          position = Math.floor(Math.random() * columns);
        } while (this.occupiedPositions.has(position));
        this.occupiedPositions.add(position);
        three.position.x =
          (position * positionWidth + positionWidth / 2) * zoom -
          (boardWidth * zoom) / 2;
        this.mesh.add(three);
        return three;
      });
      break;
    }
    case "car": {
      this.mesh = new Road();
      this.direction = Math.random() >= 0.5;

      const occupiedPositions = new Set();
      this.vechicles = [1, 2, 3].map(() => {
        const vechicle = new Car();
        let position;
        do {
          position = Math.floor((Math.random() * columns) / 2);
        } while (occupiedPositions.has(position));
        occupiedPositions.add(position);
        vechicle.position.x =
          (position * positionWidth * 2 + positionWidth / 2) * zoom -
          (boardWidth * zoom) / 2;
        if (!this.direction) vechicle.rotation.z = Math.PI;
        this.mesh.add(vechicle);
        return vechicle;
      });

      this.speed = laneSpeeds[Math.floor(Math.random() * laneSpeeds.length)];
      break;
    }
    case "truck": {
      this.mesh = new Road();
      this.direction = Math.random() >= 0.5;

      const occupiedPositions = new Set();
      this.vechicles = [1, 2].map(() => {
        const vechicle = new Truck();
        let position;
        do {
          position = Math.floor((Math.random() * columns) / 3);
        } while (occupiedPositions.has(position));
        occupiedPositions.add(position);
        vechicle.position.x =
          (position * positionWidth * 3 + positionWidth / 2) * zoom -
          (boardWidth * zoom) / 2;
        if (!this.direction) vechicle.rotation.z = Math.PI;
        this.mesh.add(vechicle);
        return vechicle;
      });

      this.speed = laneSpeeds[Math.floor(Math.random() * laneSpeeds.length)];
      break;
    }
  }
}

document.querySelector("#retry").addEventListener("click", () => {
  counterDOM.innerHTML = "0";
  lanes.forEach((lane) => scene.remove(lane.mesh));
  initaliseValues();
  endDOM.style.visibility = "hidden";
});

document
  .getElementById("forward")
  .addEventListener("click", () => move("forward"));

document
  .getElementById("backward")
  .addEventListener("click", () => move("backward"));

document.getElementById("left").addEventListener("click", () => move("left"));

document.getElementById("right").addEventListener("click", () => move("right"));

window.addEventListener("keydown", (event) => {
  if (event.keyCode == "38") {
    // up arrow
    move("forward");
  } else if (event.keyCode == "40") {
    // down arrow
    move("backward");
  } else if (event.keyCode == "37") {
    // left arrow
    move("left");
  } else if (event.keyCode == "39") {
    // right arrow
    move("right");
  }
});

function move(direction) {
  const finalPositions = moves.reduce(
    (position, move) => {
      if (move === "forward")
        return { lane: position.lane + 1, column: position.column };
      if (move === "backward")
        return { lane: position.lane - 1, column: position.column };
      if (move === "left")
        return { lane: position.lane, column: position.column - 1 };
      if (move === "right")
        return { lane: position.lane, column: position.column + 1 };
    },
    { lane: currentLane, column: currentColumn }
  );

  if (direction === "forward") {
    if (
      lanes[finalPositions.lane + 1].type === "forest" &&
      lanes[finalPositions.lane + 1].occupiedPositions.has(
        finalPositions.column
      )
    )
      return;
    if (!stepStartTimestamp) startMoving = true;
    addLane();
  } else if (direction === "backward") {
    if (finalPositions.lane === 0) return;
    if (
      lanes[finalPositions.lane - 1].type === "forest" &&
      lanes[finalPositions.lane - 1].occupiedPositions.has(
        finalPositions.column
      )
    )
      return;
    if (!stepStartTimestamp) startMoving = true;
  } else if (direction === "left") {
    if (finalPositions.column === 0) return;
    if (
      lanes[finalPositions.lane].type === "forest" &&
      lanes[finalPositions.lane].occupiedPositions.has(
        finalPositions.column - 1
      )
    )
      return;
    if (!stepStartTimestamp) startMoving = true;
  } else if (direction === "right") {
    if (finalPositions.column === columns - 1) return;
    if (
      lanes[finalPositions.lane].type === "forest" &&
      lanes[finalPositions.lane].occupiedPositions.has(
        finalPositions.column + 1
      )
    )
      return;
    if (!stepStartTimestamp) startMoving = true;
  }
  moves.push(direction);
}

function animate(timestamp) {
  requestAnimationFrame(animate);

  if (!previousTimestamp) previousTimestamp = timestamp;
  const delta = timestamp - previousTimestamp;
  previousTimestamp = timestamp;

  // Animate cars and trucks moving on the lane
  lanes.forEach((lane) => {
    if (lane.type === "car" || lane.type === "truck") {
      const aBitBeforeTheBeginingOfLane =
        (-boardWidth * zoom) / 2 - positionWidth * 2 * zoom;
      const aBitAfterTheEndOFLane =
        (boardWidth * zoom) / 2 + positionWidth * 2 * zoom;
      lane.vechicles.forEach((vechicle) => {
        if (lane.direction) {
          vechicle.position.x =
            vechicle.position.x < aBitBeforeTheBeginingOfLane
              ? aBitAfterTheEndOFLane
              : (vechicle.position.x -= (lane.speed / 16) * delta);
        } else {
          vechicle.position.x =
            vechicle.position.x > aBitAfterTheEndOFLane
              ? aBitBeforeTheBeginingOfLane
              : (vechicle.position.x += (lane.speed / 16) * delta);
        }
      });
    }
  });

  if (startMoving) {
    stepStartTimestamp = timestamp;
    startMoving = false;
  }

  if (stepStartTimestamp) {
    const moveDeltaTime = timestamp - stepStartTimestamp;
    const moveDeltaDistance =
      Math.min(moveDeltaTime / stepTime, 1) * positionWidth * zoom;
    const jumpDeltaDistance =
      Math.sin(Math.min(moveDeltaTime / stepTime, 1) * Math.PI) * 8 * zoom;
    switch (moves[0]) {
      case "forward": {
        const positionY =
          currentLane * positionWidth * zoom + moveDeltaDistance;
        camera.position.y = initialCameraPositionY + positionY;
        dirLight.position.y = initialDirLightPositionY + positionY;
        chicken.position.y = positionY; // initial chicken position is 0

        chicken.position.z = jumpDeltaDistance;
        break;
      }
      case "backward": {
        positionY = currentLane * positionWidth * zoom - moveDeltaDistance;
        camera.position.y = initialCameraPositionY + positionY;
        dirLight.position.y = initialDirLightPositionY + positionY;
        chicken.position.y = positionY;

        chicken.position.z = jumpDeltaDistance;
        break;
      }
      case "left": {
        const positionX =
          (currentColumn * positionWidth + positionWidth / 2) * zoom -
          (boardWidth * zoom) / 2 -
          moveDeltaDistance;
        camera.position.x = initialCameraPositionX + positionX;
        dirLight.position.x = initialDirLightPositionX + positionX;
        chicken.position.x = positionX; // initial chicken position is 0
        chicken.position.z = jumpDeltaDistance;
        break;
      }
      case "right": {
        const positionX =
          (currentColumn * positionWidth + positionWidth / 2) * zoom -
          (boardWidth * zoom) / 2 +
          moveDeltaDistance;
        camera.position.x = initialCameraPositionX + positionX;
        dirLight.position.x = initialDirLightPositionX + positionX;
        chicken.position.x = positionX;

        chicken.position.z = jumpDeltaDistance;
        break;
      }
    }
    // Once a step has ended
    if (moveDeltaTime > stepTime) {
      switch (moves[0]) {
        case "forward": {
          currentLane++;
          counterDOM.innerHTML = currentLane;
          break;
        }
        case "backward": {
          currentLane--;
          counterDOM.innerHTML = currentLane;
          break;
        }
        case "left": {
          currentColumn--;
          break;
        }
        case "right": {
          currentColumn++;
          break;
        }
      }
      moves.shift();
      // If more steps are to be taken then restart counter otherwise stop stepping
      stepStartTimestamp = moves.length === 0 ? null : timestamp;
    }
  }

  // Hit test
  if (
    lanes[currentLane].type === "car" ||
    lanes[currentLane].type === "truck"
  ) {
    const chickenMinX = chicken.position.x - (chickenSize * zoom) / 2;
    const chickenMaxX = chicken.position.x + (chickenSize * zoom) / 2;
    const vechicleLength = { car: 60, truck: 105 }[lanes[currentLane].type];
    lanes[currentLane].vechicles.forEach((vechicle) => {
      const carMinX = vechicle.position.x - (vechicleLength * zoom) / 2;
      const carMaxX = vechicle.position.x + (vechicleLength * zoom) / 2;
      if (chickenMaxX > carMinX && chickenMinX < carMaxX) {
        endDOM.style.visibility = "visible";
      }
    });
  }
  renderer.render(scene, camera);
}

requestAnimationFrame(animate);
