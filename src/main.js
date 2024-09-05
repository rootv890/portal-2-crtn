import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import GUI from 'lil-gui';
import FfVertexShader from './shaders/fireflies/vertex.glsl';
import FfFragmentShader from './shaders/fireflies/fragment.glsl';
import PortalVertexShader from './shaders/portal/vertex.glsl';
import PortalFragmentShader from './shaders/portal/fragment.glsl';

const canvas = document.querySelector('canvas.webgl');

/**
 * GUI & Debug
 **/
const debugObjects = {};
const gui = new GUI();
gui.close();

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

	// update fireFlies uniforms
	ffMaterial.uniforms.uPixelRatio.value = sizes.pixelRatio;
});

/**
 * Materials
 **/
// uniforms
const uniforms = {
	uTime: new THREE.Uniform(0),
	uColorStart: new THREE.Uniform(new THREE.Color('#1a1a1a')),
	uColorEnd: new THREE.Uniform(new THREE.Color('#fafafa')),
};

// BakedMaterial
const bakedMaterial = new THREE.MeshBasicMaterial({
	map: bakedTexture,
});

// Pole Light Material
const poleLightMaterial = new THREE.MeshBasicMaterial({
	color: 0xfaeb64,
});

// Portal Light Material
const portalLightMaterial = new THREE.ShaderMaterial({
	// Shaders
	vertexShader: PortalVertexShader,
	fragmentShader: PortalFragmentShader,

	side: THREE.DoubleSide,

	// Uniforms
	uniforms: {
		uTime: uniforms.uTime,
		uColorStart: uniforms.uColorStart,
		uColorEnd: uniforms.uColorEnd,
	},
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
 * FireFlies
 **/

const ffGeometry = new THREE.BufferGeometry();
const ffCount = 30;
const ffPositionArray = new Float32Array(ffCount * 3);
const ffScaleArray = new Float32Array(ffCount * 1);
// Fill the positions
for (let i = 0; i < ffCount; i++) {
	const i3 = i * 3;

	// Position
	ffPositionArray[i3 + 0] = (Math.random() - 0.5) * 4;
	ffPositionArray[i3 + 1] = Math.random() * 1.8;
	ffPositionArray[i3 + 2] = (Math.random() - 0.5) * 4;

	// Scale
	ffScaleArray[i] = Math.random();
}

// Set the positions
ffGeometry.setAttribute(
	'position',
	new THREE.BufferAttribute(ffPositionArray, 3),
);

ffGeometry.setAttribute('aScale', new THREE.BufferAttribute(ffScaleArray, 1.0));

console.log(ffGeometry.getAttribute('aScale'));

// const ffMaterial = new THREE.PointsMaterial({
// 	color: 0xffffff,
// 	size: 0.02,
// 	sizeAttenuation: true,
// });

const ffMaterial = new THREE.ShaderMaterial({
	// Shaders
	vertexShader: FfVertexShader,
	fragmentShader: FfFragmentShader,

	transparent: true,

	blending: THREE.AdditiveBlending,
	depthWrite: false,
	// depthTest: false,

	// Uniforms
	uniforms: {
		uTime: uniforms.uTime,
		uPixelRatio: new THREE.Uniform(sizes.pixelRatio),
		uPointSize: new THREE.Uniform(100),
	},
});

const fireFlies = new THREE.Points(ffGeometry, ffMaterial);
scene.add(fireFlies);

// GUI DEBUG
gui
	.add(ffMaterial.uniforms.uPointSize, 'value')
	.min(0)
	.max(100)
	.step(1)
	.name('FireFly Size');

gui
	.addColor(uniforms.uColorStart, 'value')
	.name('Portal Start Color')
	.onChange(() => {
		// update in the the material
		portalLightMaterial.uniforms.uColorStart.value = new THREE.Color(
			uniforms.uColorStart.value,
		);
	});

gui
	.addColor(uniforms.uColorEnd, 'value')
	.name('Portal End Color')
	.onChange(() => {
		// update in the the material
		portalLightMaterial.uniforms.uColorEnd.value = new THREE.Color(
			uniforms.uColorEnd.value,
		);
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

debugObjects.clearColor = '#1a1a1a';

renderer.setClearColor(debugObjects.clearColor, 1);

gui.addColor(debugObjects, 'clearColor').onChange((color) => {
	renderer.setClearColor(color, 1);
});

/**
 * Orbit Controls
 **/

const controls = new OrbitControls(camera, canvas);
// Limt the horizontal rotation
controls.maxZoom = 2;
controls.enableDamping = true;

/**
 * Tick
 **/

const clock = new THREE.Clock();

const tick = () => {
	const elaspseTime = clock.getElapsedTime();

	// update uTime
	ffMaterial.uniforms.uTime.value = elaspseTime;

	controls.update();
	renderer.render(scene, camera);
	window.requestAnimationFrame(tick);
};
tick();
