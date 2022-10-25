import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import Stats from 'three/addons/libs/stats.module.js';


import vertexShader from './shaders/vertexShader.glsl';
import fragmentShader from './shaders/fragmentShader.glsl';

// Globals
const starPrimaryColors = [0xb8ffff, 0x76e1fc, 0xfffbbd, 0xfff980, 0xffd200, 0xff9f00, 0xfe3c00, 0x760e00]
// Bloom layers num
const BLOOM_SCENE_LAYER_NUM = 1, ENTIRE_SCENE_LAYER_NUM = 0;

// Helper functions
function rotateObj(obj, x = 0, y = 0, z = 0) {
  obj.rotation.x += x
  obj.rotation.y += y
  obj.rotation.z += z
}

function genUniqRndNum(numSet, lowBond, highBond, attempts = 10) {
  let num;
  attempts--;
  do {
    num = THREE.MathUtils.randFloat(lowBond, highBond)
  }
  while (numSet.has(num) && attempts > 0)
  return num;
}

// Auto resize
window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
  let width = window.innerWidth
  let height = window.innerHeight
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
  bloomComposer.setSize(width, height);
  finalComposer.setSize(width, height);
  // Update renderer
  // renderer.setSize(sizes.width, sizes.height)
  // renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  render()
}

// StarMaker
const starInfo = {
  // geometry: new THREE.SphereGeometry(0.25, 15, 15),
  geometry: new THREE.OctahedronGeometry(0.25, 2),
  material: new THREE.MeshStandardMaterial({ color: 0xffffff }),
}

let starList = [];

function addStars(num, offset = {
  "x": 0,
  "y": 0,
  "z": 0
}, spread = 40, stars = starList) {
  for (let i = 0; i < num; i++) {
    // const { geometry, material } = starInfo
    const geometry = new THREE.SphereGeometry(THREE.MathUtils.randFloat(0.1, 0.5), 14, 14)
    //const material = new THREE.MeshStandardMaterial({ color: starPrimaryColors[Math.floor(Math.random() * starPrimaryColors.length)] })
    const material = new THREE.MeshBasicMaterial({ color: starPrimaryColors[Math.floor(Math.random() * starPrimaryColors.length)] })
    // const material = new THREE.MeshStandardMaterial({ color: starPrimaryColors[THREE.MathUtils.randInt(0, starPrimaryColors.length)] })
    const star = new THREE.Mesh(geometry, material);
    const [x, y, z] = Array(3)
      .fill()
      .map(() => THREE.MathUtils.randFloatSpread(spread));
    //console.log("Star coords: ", x + offset.x, y + offset.y, z + offset.z)
    star.position.set(x + offset.x, y + offset.y, z + offset.z);
    stars.push(star)

    star.layers.enable(BLOOM_SCENE_LAYER_NUM) //JUMP1 STAR LAYER

    scene.add(star);
  }
  return stars
}


// Basic three.js setup
const canvas = document.querySelector('#animated-bg');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer(
  {
    canvas: document.querySelector('#animated-bg'),
    powerPreference: "high-performance",
    antialias: true, // true 
  }
);
let loader = new THREE.TextureLoader();



renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
//for the bloom toneMapping, makes dark
// renderer.toneMapping = THREE.ReinhardToneMapping;

// After the tone mapping
//const canvas = document.getElementById('animated-bg');
// console.log(canvas)
// //canvas.appendChild(new Stats())
// console.log("DOm element", renderer.domElement)
// let stats = new Stats();
// canvas.appendChild( stats.dom );
// canvas.appendChild(renderer.domElement);






camera.position.setZ(130);
camera.position.setX(-3);

//Fog
scene.fog = new THREE.FogExp2(0x8e569e, 0.001);

//Clouds
let zCloudSet = new Set()
let cloudParticles = []
renderer.setClearColor(scene.fog.color); // set clear color for the fog
loader.load("/images/smoke-transparent-1.png", function(texture) {
  console.log("fog texture is loaded")
  let cloudGeometry = new THREE.PlaneGeometry(958, 700);
  // let cloudGeometry = new THREE.PlaneGeometry(2000, 2000);
  // let cloudMaterial = new THREE.MeshPhongMaterial({
  let cloudMaterial = new THREE.MeshLambertMaterial({
    map: texture,
    transparent: true, //Change to true
  });

  // create multiple cloud particles
  let zSuTEST = 0;
  for (let i = 0; i < 8; i++) {
    let cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
    // cloud.doubleSided = true
    let cloudZ = genUniqRndNum(zCloudSet, -400, -215);
    // zSuTEST = zSuTEST + cloudZ
    // console.log("CLOUD Z: ", cloudZ)


    cloud.position.set(
      THREE.MathUtils.randFloat(-200, 200),
      // THREE.MathUtils.randFloat(-400, 400),
      100,
      // genUniqRndNum(zCloudSet, -600, -400),
      // THREE.MathUtils.randFloat(-500, -200),
      cloudZ,
    );
    cloud.rotation.x = 0;
    cloud.rotation.y = 0;
    cloud.rotation.z = Math.random() * 2 * Math.PI;
    // cloud.material.opacity = 0.55;
    cloud.material.opacity = 0.55;
    cloudParticles.push(cloud);
    scene.add(cloud);
  }
  // console.log("cloud z sum/8: ", zSuTEST / 8.0)
});

//TorusKnot
// const geometry = new THREE.TorusKnotGeometry(1.7, 4, 37, 5, 12, 1);
// const material = new THREE.MeshStandardMaterial({ color: 0xac4dc6 });
// // const material = new THREE.MeshBasicMaterial({ color: 0xff6347, wireframe: true });
// const torusKnot_1 = new THREE.Mesh(geometry, material);
// scene.add(torusKnot_1);
// torusKnot_1.position.set(-10, 11, -38)
// torusKnot_1.position.set(-10, 11, -58)

// Lights
//const pointLightOne = new THREE.PointLight(0xffffff, 1, 100, 1.7);
const pointLightOne = new THREE.PointLight(0xffffff, 1, 100, .001);
// pointLight.position.set(5, 15, -10);
pointLightOne.position.set(-15, 24, 10)
scene.add(pointLightOne) // TEST remove


// const ambientLight = new THREE.AmbientLight(0xffffff, .4); //TEST
const ambientLight = new THREE.AmbientLight(0x404040, .1);
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
// const gridHelper = new THREE.GridHelper(200, 50);
// const sphereSize = 15;
// const pointLightHelperOrange = new THREE.PointLightHelper(orangeLight, sphereSize);
// scene.add(pointLightHelperOrange);
// scene.add(gridHelper)


//Add stars
//addStars(40, { ...camera.position, 'z': camera.position.z - 160 }, 75);
addStars(40, { ...camera.position, 'z': camera.position.z - 160 }, 75);
addStars(30, { ...camera.position, 'z': camera.position.z - 141 }, 15);
//console.log("Stats: ", starList)
// addStars(100, { 'x': 0, 'y': 0, 'z': 0 },);
//console.log("CAMPos: ", camera.position);

//Sky texture
const skyTexture1 = new THREE.TextureLoader().load('/images/sky1.2.jpeg');
scene.background = skyTexture1;
//Effects
// loader.load("/images/sky1.2.jpeg", function(texture) {
//   console.log("sky loaded")

//   const textureEffect = new POSTPROCESSING.TextureEffect({
//     blendFunction: POSTPROCESSING.BlendFunction.COLOR_DODGE,
//     texture: texture
//   });
//   textureEffect.blendMode.opacity.value = 0.2;


//   let effectPass = new POSTPROCESSING.EffectPass(
//     camera,
//     textureEffect
//   );
//   effectPass.renderToScreen = true;

//   composer = new POSTPROCESSING.EffectComposer(renderer);
//   composer.addPass(new POSTPROCESSING.RenderPass(scene, camera));
//   composer.addPass(effectPass);
// });

//Postrocessing unreal bloom

const bloomParams = {
  exposure: 0.5,
  bloomStrength: 2,
  bloomThreshold: 0,
  bloomRadius: .2,
  // scene: 'Scene with Glow'
};


const materials = {};
const darkMaterial = new THREE.MeshBasicMaterial({ color: 'black' });

// Make layer to put bloom effect only on objects in the layer
const bloomLayer = new THREE.Layers()
bloomLayer.set(BLOOM_SCENE_LAYER_NUM)

//Add objects to the bloom layer
// for (let i = 0; i < starList.length; i++) {
//   starList[i].layers.set(BLOOM_SCENE_LAYER_NUM)
// }


// Clear buffers and render the scene
const renderScene = new RenderPass(scene, camera);

// Bloom Effect //
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = bloomParams.bloomThreshold;
bloomPass.strength = bloomParams.bloomStrength;
bloomPass.radius = bloomParams.bloomRadius;

// Bloom mapping exposure
//renderer.toneMappingExposure = Math.pow(bloomPass.exposure, 4.0);
renderer.toneMappingExposure = 1.0
renderer.toneMappingExposure = 0.8
//renderer.toneMapping = THREE.ReinhardToneMapping;
//renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMapping = THREE.ReinhardToneMapping;

const bloomComposer = new EffectComposer(renderer);
//bloomComposer.renderToScreen = false;
// bloomComposer.renderToScreen = true;
bloomComposer.renderToScreen = false;

// Add passes(effects) to the scene
bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);

//COMM
const finalPass = new ShaderPass(
  new THREE.ShaderMaterial({
    uniforms: {
      baseTexture: { value: null },
      bloomTexture: { value: bloomComposer.renderTarget2.texture }
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    defines: {}
  }), 'baseTexture'
);
//Swaps frame buffers, render the output buffer to the screen
finalPass.needsSwap = true;

const finalComposer = new EffectComposer(renderer);
finalComposer.addPass(renderScene);
finalComposer.addPass(finalPass);
//COMMEND


// Bloom Functions //

function renderBloom(mask) {

  if (mask === true) {

    scene.traverse(darkenNonBloomed);
    bloomComposer.render();
    scene.traverse(restoreMaterial);

  } else {

    camera.layers.set(BLOOM_SCENE_LAYER_NUM);
    bloomComposer.render();
    camera.layers.set(ENTIRE_SCENE_LAYER_NUM);

  }

}

function darkenNonBloomed(obj) {

  if (obj.isMesh && bloomLayer.test(obj.layers) === false) {

    materials[obj.uuid] = obj.material;
    obj.material = darkMaterial;

  }

}

function restoreMaterial(obj) {

  if (materials[obj.uuid]) {

    obj.material = materials[obj.uuid];
    delete materials[obj.uuid];

  }
}




//console.log("Stars 2", starList)
console.log("Star1 layers: ", starList[0].layers.isEnabled(BLOOM_SCENE_LAYER_NUM))
console.log("Star1 layers: ", starList[0].layers.isEnabled(ENTIRE_SCENE_LAYER_NUM))

// Scroll Animation
function moveCamera() {
  const t = document.body.getBoundingClientRect().top;
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
}

document.body.onscroll = moveCamera;
moveCamera();

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  //Animation here
  // rotateObj(torusKnot_1, 0.01, 0.006, 0.001);
  // renderer.render(scene, camera)

  // Render with effects //

  // render scene with bloom
  renderBloom(true);
  //bloomComposer.render();

  // render the entire scene, then render bloom scene on top
  finalComposer.render();
}
animate()

