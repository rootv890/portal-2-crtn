import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
const canvas = document.querySelector('canvas.webgl');

/**
 * Loaders
 **/
const textureLoader = new THREE.TextureLoader();

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

/**
 * Scene
 **/
const scene = new THREE.Scene();

/**
 * Sizes & Pixel Ratio
 **/
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
	pixelRatio: Math.min(window.devicePixelRatio, 2),
};

/**
 * Camera
 **/

const camera = new THREE.PerspectiveCamera(
	75,
	sizes.width / sizes.height,
	0.1,
	1000,
);

camera.position.set(0, 0, 3);
scene.add(camera);

/**
 * Textures
 **/
// bakedTextures
const bakedTexture = textureLoader.load('baked.jpg');
bakedTexture.flipY = false;
bakedTexture.colorSpace = THREE.SRGBColorSpace;
console.log(bakedTexture);

/**
 * Materials
 **/
// BakedMaterial
const bakedMaterial = new THREE.MeshBasicMaterial({
	map: bakedTexture,
});

// Pole Light Material
const poleLightMaterial = new THREE.MeshBasicMaterial({
	color: 0xfaeb64,
});

// Portal Light Material
const portalLightMaterial = new THREE.MeshBasicMaterial({
	color: 0xffffff,
	side: THREE.DoubleSide,
});

/**
 * Portal
 **/

gltfLoader.load('portal.glb', (gltf) => {
	const model = gltf.scene;

	// Baked
	const bakedMesh = model.getObjectByName('baked');
	bakedMesh.material = bakedMaterial;

	// Portal
	const portalLightMesh = model.getObjectByName('portalLight');

	// Pole
	// const poleLightAMesh = model.children.find(
	// 	(child) => child.name === 'poleLightA',
	// );
	const poleLightAMesh = model.getObjectByName('poleLightA');
	const poleLightBMesh = model.getObjectByName('poleLightB');

	poleLightAMesh.material = poleLightMaterial;
	poleLightBMesh.material = poleLightMaterial;
	portalLightMesh.material = portalLightMaterial;

	scene.add(model);
});

/**
 * Renderer
 **/

const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
	antialias: true,
});

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);
renderer.setClearColor(0x000000, 1);

/**
 * Orbit Controls
 **/

const controls = new OrbitControls(camera, canvas);
// Limt the horizontal rotation
controls.maxZoom = 2;
controls.enableDamping = true;

/**
 * Resize
 **/
window.addEventListener('resize', () => {
	// update sizes
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;
	sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);

	// update camera
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// update renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(sizes.pixelRatio);
});

/**
 * Tick
 **/

const tick = () => {
	controls.update();
	renderer.render(scene, camera);
	window.requestAnimationFrame(tick);
};
tick();
