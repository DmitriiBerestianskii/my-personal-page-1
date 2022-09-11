import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GlitchPass } from 'three/addons/postprocessing/GlitchPass.js';

// Globals
const starPrimaryColors = [0xb8ffff, 0x76e1fc, 0xfffbbd, 0xfff980, 0xffd200, 0xff9f00, 0xfe3c00, 0x760e00]

// Helper functions
function rotateObj(obj, x = 0, y = 0, z = 0) {
  obj.rotation.x += x
  obj.rotation.y += y
  obj.rotation.z += z
}

// Auto resize
window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  // Update renderer
  // renderer.setSize(sizes.width, sizes.height)
  // renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  // render()
}

// StarMaker
const starInfo = {
  // geometry: new THREE.SphereGeometry(0.25, 15, 15),
  geometry: new THREE.OctahedronGeometry(0.25, 2),
  material: new THREE.MeshStandardMaterial({ color: 0xffffff }),
}

function addStars(num, offset = {
  "x": 0,
  "y": 0,
  "z": 0
}, spread = 40) {
  for (let i = 0; i < num; i++) {
    // const { geometry, material } = starInfo
    const geometry = new THREE.SphereGeometry(THREE.MathUtils.randFloat(0.1, 0.5), 14, 14)
    const material = new THREE.MeshStandardMaterial({ color: starPrimaryColors[Math.floor(Math.random() * starPrimaryColors.length)] })
    // const material = new THREE.MeshStandardMaterial({ color: starPrimaryColors[THREE.MathUtils.randInt(0, starPrimaryColors.length)] })
    const star = new THREE.Mesh(geometry, material);
    const [x, y, z] = Array(3)
      .fill()
      .map(() => THREE.MathUtils.randFloatSpread(spread));
    console.log("Star coords: ", x + offset.x, y + offset.y, z + offset.z)
    star.position.set(x + offset.x, y + offset.y, z + offset.z);
    scene.add(star);
  }
}


// Basic three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer(
  {
    canvas: document.querySelector('#animated-bg')
  }
);
let loader = new THREE.TextureLoader();



renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(130);
camera.position.setX(-3);

//Fog
scene.fog = new THREE.FogExp2(0x8e569e, 0.001);
let cloudParticles = []
renderer.setClearColor(scene.fog.color); // set clear color for the fog
loader.load("/images/smoke-transparent-1.png", function(texture) {
  console.log("fog texture is loaded")

  // let cloudGeometry = new THREE.PlaneBufferGeometry(958, 700);
  let cloudGeometry = new THREE.PlaneGeometry(958, 700);
  let cloudMaterial = new THREE.MeshLambertMaterial({
    map: texture,
    // blending: THREE.AdditiveBlending,
    transparent: true,
  });

  // create multiple cloud particles
  for (let i = 0; i < 8; i++) {
    let cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
    // cloud.doubleSided = true
    cloud.position.set(
      THREE.MathUtils.randFloat(-400, 400),
      100,
      THREE.MathUtils.randFloat(-500, -200),
    );
    cloud.rotation.x = 0;
    cloud.rotation.y = 0;
    cloud.rotation.z = Math.random() * 2 * Math.PI;
    // cloud.material.opacity = 0.55;
    cloud.material.opacity = 0.55;
    cloudParticles.push(cloud);
    scene.add(cloud);
  }
});

//TorusKnot
const geometry = new THREE.TorusKnotGeometry(1.7, 4, 37, 5, 12, 1);
const material = new THREE.MeshStandardMaterial({ color: 0xac4dc6 });
// const material = new THREE.MeshBasicMaterial({ color: 0xff6347, wireframe: true });
const torusKnot_1 = new THREE.Mesh(geometry, material);
scene.add(torusKnot_1);
torusKnot_1.position.set(-10, 11, -38)

// Lights
const pointLightOne = new THREE.PointLight(0xffffff, 1, 100, 1.7);
// pointLight.position.set(5, 15, -10);
pointLightOne.position.set(-15, 24, 10)
scene.add(pointLightOne)


const ambientLight = new THREE.AmbientLight(0xffffff, .4);
// scene.add(pointLightOne, ambientLight);
scene.add(ambientLight);

// Colored lights for the cloud
let orangeLight = new THREE.PointLight(0xcc6600, 55, 350, 1.7);
orangeLight.position.set(20, 10, -280);
scene.add(orangeLight);
let redLight = new THREE.PointLight(0xd8547e, 55, 350, 1.7);
redLight.position.set(80, 15, -300);
scene.add(redLight);
let blueLight = new THREE.PointLight(0x3677ac, 55, 350, 1.7);
blueLight.position.set(-80, -15, -250);
scene.add(blueLight);




//Helpers
// const lightHelper = new THREE.PointLightHelper(pointLight)
const gridHelper = new THREE.GridHelper(200, 50);
const sphereSize = 15;
const pointLightHelperOrange = new THREE.PointLightHelper(orangeLight, sphereSize);
scene.add(pointLightHelperOrange);
scene.add(gridHelper)


//Add stars
// addStars(40, { ...camera.position, 'z': camera.position.z - 175 }, 75);
addStars(40, { ...camera.position, 'z': camera.position.z - 160 }, 75);
addStars(30, { ...camera.position, 'z': camera.position.z - 141 }, 15);
// addStars(100, { 'x': 0, 'y': 0, 'z': 0 },);
console.log("CAMPos: ", camera.position);

//Sky texture
// const skyTexture1 = new THREE.TextureLoader().load('/images/sky1.2.jpeg');
// scene.background = skyTexture1;
//Effects
loader.load("/images/sky1.2.jpeg", function(texture) {
  console.log("sky loaded")

  const textureEffect = new POSTPROCESSING.TextureEffect({
    blendFunction: POSTPROCESSING.BlendFunction.COLOR_DODGE,
    texture: texture
  });
  textureEffect.blendMode.opacity.value = 0.2;


  let effectPass = new POSTPROCESSING.EffectPass(
    camera,
    textureEffect
  );
  effectPass.renderToScreen = true;

  composer = new POSTPROCESSING.EffectComposer(renderer);
  composer.addPass(new POSTPROCESSING.RenderPass(scene, camera));
  composer.addPass(effectPass);
});


// THREE.Loader.load("/images/sky1.2.jpeg", function(texture) {
//   const textureEffect = new POSTPROCESSING.TextureEffect({blendFunction: POSTPROCESSING.BlendFunction.COLOR_DODGE,texture: texture});
//   textureEffect.blendMode.opacity.value = 0.2;
// }

// Scroll Animation

function moveCamera() {
  const t = document.body.getBoundingClientRect().top;
  // console.log("top: ", t)
  // camera.position.z = t * +0.01;
  // camera.rotation.y = t * +0.0003;
  // camera.position.x = t * +0.0003;
  let x_move = t / 25000
  let y_move = t / 55000
  let z_move = t / 1500
  camera.position.x = x_move
  // camera.rotation.y = y_move
  camera.position.z = z_move
  camera.rotateY(y_move - camera.rotation.y)
  cloudParticles.forEach(p => {
    p.rotation.y = camera.rotation.y
    p.rotation.x = camera.rotation.x
    p.rotation.z -= 0.001;
  });


  //Test rotation TEST
  // camera.rotation.x = t / 40000 
  // camera.rotation.z = t / 40000 
  // camera.rotation.z = t / 70000 
}

document.body.onscroll = moveCamera;
moveCamera();

// Animation loop
function animate() {
  requestAnimationFrame(animate)
  //Animation here
  rotateObj(torusKnot_1, 0.01, 0.006, 0.001)
  renderer.render(scene, camera)
}
animate()

