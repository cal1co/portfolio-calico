import '../css/style.css'
import * as THREE from 'three'
import gsap from 'gsap'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import $ from 'jquery'
import dat from 'dat.gui'


//Update of
//https://codepen.io/al-ro/pen/jJJygQ
//Added lighting, translucency and movement on an infinite rounded world

//Based on:
//"Realistic real-time grass rendering" by Eddie Lee, 2010
//https://www.eddietree.com/grass
//https://en.wikibooks.org/wiki/GLSL_Programming/Unity/Translucent_Surfaces

//There are two scenes: one for the sky/sun and another for the grass. The sky is rendered without depth information on a plane geometry that fills the screen. Automatic clearing is disabled and after the sky has been rendered, we draw the grass scene on top of the background. Both scenes share a camera and light direction information.

const params = {
    sky:{
        day:'#ffffff',
        // night:'#080C17'
        night:'#080C17'
        // night:'#3D4259'
    }, 
    planet:{
        // day:'0x3BF560',
        // day:'0x3BDFFF',
        day:'#eeaaff',
        // night:
    }
}

const canvas = document.querySelector('canvas.world')

const mobile = ( navigator.userAgent.match(/Android/i)
      || navigator.userAgent.match(/webOS/i)
      || navigator.userAgent.match(/iPhone/i)
      || navigator.userAgent.match(/BlackBerry/i)
      || navigator.userAgent.match(/Windows Phone/i)
      );

//Variables for blade mesh
const joints = 4;
const bladeWidth = 0.12;
const bladeHeight = 1;

//Patch side length
const width = 120;
//Number of vertices on ground plane side
const resolution = 64;
//Distance between two ground plane vertices
const delta = width/resolution;
//Radius of the sphere onto which the ground plane is bent
const radius = 240;
//User movement speed
const speed = 0;

//The global coordinates
//The geometry never leaves a box of width*width around (0, 0)
//But we track where in space the camera would be globally
const pos = new THREE.Vector2(0.01, 0.01);

const sizes = {
    width: window.innerWidth * 0.45,
    // height: window.innerHeight * 0.50
    height: 10
}

//Number of blades
const instances = 40000;
if(mobile){
	instances = 7000;
	width = 50;
}

//Sun
//Height over horizon in range [0, PI/2.0]
const elevation = 0.02;
//Rotation around Y axis in range [0, 2*PI]
const azimuth = 0.4;

const fogFade = 0.01;

//Lighting variables for grass
const ambientStrength = 0.7;
const translucencyStrength = 1.5;
const specularStrength = 0.5;
const diffuseStrength = 1.5;
const shininess = 256;
const sunColour = new THREE.Vector3(1.0, 1.0, 1.0);
const specularColour = new THREE.Vector3(1.0, 1.0, 1.0);

//Camera rotate
const rotate = false;

//Initialise three.js. There are two scenes which are drawn after one another with clear() called manually at the start of each frame
//Grass scene
const scene = new THREE.Scene();
//Sky scene
const backgroundScene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({antialias: true, canvas: canvas});
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize( window.innerWidth, window.innerHeight );

//Camera
const distance = 1500;

const FOV = 50;//2 * Math.atan(window.innerHeight / distance) * 180 / Math.PI;
const camera = new THREE.PerspectiveCamera(FOV, window.innerWidth / window.innerHeight, 1, distance);

camera.position.set(-30, 5, 50);
camera.lookAt(new THREE.Vector3(0,0,0));

scene.add(camera);
backgroundScene.add(camera);

//Light for ground plane
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); 
scene.add(ambientLight);

//OrbitControls.js for camera manipulation
// var controls = new OrbitControls(camera, renderer.domElement);
// controls.autoRotate = rotate;
// controls.autoRotateSpeed = 1.0;
// controls.maxDistance = 65.0;
// if(mobile){
// 	controls.maxDistance = 35.0;
// }
// controls.minDistance = 5.0;
// //Disable keys to stop arrow keys from moving the camera
// controls.enableKeys = false;
// controls.update();

//************* GUI ***************

// var gui = new dat.GUI();
// gui.add(this, 'radius').min(85).max(1000).step(5);
// gui.add(this, 'speed').min(0.5).max(10).step(0.01);
// gui.add(this, 'elevation').min(0.0).max(Math.PI/2.0).step(0.01).listen().onChange(function(value){updateSunPosition();});
// gui.add(this, 'azimuth').min(0.0).max(Math.PI*2.0).step(0.01).listen().onChange(function(value){updateSunPosition();});
// gui.add(this, 'fogFade').min(0.001).max(0.01).step(0.0001).listen().onChange(function(value){backgroundMaterial.uniforms.fogFade.value = fogFade;});
// gui.close();
// console.log(dat.GUI)

window.addEventListener('resize', onWindowResize, false);
function onWindowResize(){
//   camera.aspect = window.innerWidth / window.innerHeight;
// 	renderer.setSize( window.innerWidth, window.innerHeight );
// 	backgroundMaterial.uniforms.resolution.value = new THREE.Vector2(canvas.width, canvas.height);
// 	camera.fov = FOV;
// 	camera.updateProjectionMatrix();
// 	backgroundMaterial.uniforms.fov.value = FOV;
    
    // Update sizes
    sizes.width = window.innerWidth * 0.9
    sizes.height = window.innerHeight * 0.50
    // Update camera 
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
    renderer.setSize(sizes.width, sizes.height)
}

//Get alpha map and blade texture
//These have been taken from "Realistic real-time grass rendering" by Eddie Lee, 2010
var loader = new THREE.TextureLoader();
loader.crossOrigin = '';
var grassTexture = loader.load( 'https://al-ro.github.io/images/grass/blade_diffuse.jpg' );
var alphaMap = loader.load( 'https://al-ro.github.io/images/grass/blade_alpha.jpg' );
var noiseTexture = loader.load( 'https://al-ro.github.io/images/grass/perlinFbm.jpg' );
noiseTexture.wrapS = THREE.RepeatWrapping;
noiseTexture.wrapT = THREE.RepeatWrapping;

//************** Sky **************
//https://discourse.threejs.org/t/how-do-i-use-my-own-custom-shader-as-a-scene-background/13598/2
const backgroundMaterial = new THREE.ShaderMaterial({
	uniforms: {
		sunDirection: {type: 'vec3', value: new THREE.Vector3(Math.sin(azimuth), Math.sin(elevation), -Math.cos(azimuth))},
		resolution: {type: 'vec2', value: new THREE.Vector2(canvas.width, canvas.height)},
		fogFade: {type: 'float', value: fogFade},
		fov: {type: 'float', value: FOV}
	},
	vertexShader: `
		varying vec2 vUv;
		void main() {
			vUv = uv;
			gl_Position = vec4( position, 1.0 );    
		}
`,
	fragmentShader: `
		varying vec2 vUv;
		uniform vec2 resolution;
		uniform vec3 sunDirection;
		uniform float fogFade;
		uniform float fov;

		const vec3 skyColour = 0.6 * vec3(0.02, 0.2, 0.9);
		// const vec3 skyColour = vec3(0.031,0.047,0.09);



            // COLOUR!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!



		//Darken sky when looking up
		vec3 getSkyColour(vec3 rayDir){
			return mix(0.35*skyColour, skyColour, pow(1.0-rayDir.y, 4.0));
		}

		//https://iquilezles.org/www/articles/fog/fog.htm
		vec3 applyFog(vec3 rgb, vec3 rayOri, vec3 rayDir, vec3 sunDir){
			//Make horizon more hazy
			float dist = 4000.0;
			if(abs(rayDir.y) < 0.0001){rayDir.y = 0.0001;}
			float fogAmount = 1.0 * exp(-rayOri.y*fogFade) * (1.0-exp(-dist*rayDir.y*fogFade))/(rayDir.y*fogFade);
			float sunAmount = max( dot( rayDir, sunDir ), 0.0 );
			vec3 fogColor  = mix(vec3(0.35, 0.5, 0.9), vec3(1.0, 1.0, 0.75), pow(sunAmount, 16.0) );
		return mix(rgb, fogColor, clamp(fogAmount, 0.0, 1.0));
		}

    vec3 ACESFilm(vec3 x){
      float a = 2.51;
      float b = 0.03;
      float c = 2.43;
      float d = 0.59;
      float e = 0.14;
      return clamp((x*(a*x+b))/(x*(c*x+d)+e), 0.0, 1.0);
    }
  
		vec3 rayDirection(float fieldOfView, vec2 fragCoord) {
      vec2 xy = fragCoord - resolution.xy / 2.0;
      float z = (0.5 * resolution.y) / tan(radians(fieldOfView) / 2.0);
      return normalize(vec3(xy, -z));
    }

		//https://www.geertarien.com/blog/2017/07/30/breakdown-of-the-lookAt-function-in-OpenGL/
		mat3 lookAt(vec3 camera, vec3 at, vec3 up){
			vec3 zaxis = normalize(at-camera);    
			vec3 xaxis = normalize(cross(zaxis, up));
			vec3 yaxis = cross(xaxis, zaxis);

			return mat3(xaxis, yaxis, -zaxis);
		}

		float getGlow(float dist, float radius, float intensity){
			dist = max(dist, 1e-6);
			return pow(radius/dist, intensity);	
		}

		void main() {

    	vec3 target = vec3(0.0, 0.0, 0.0);
    	vec3 up = vec3(0.0, 1.0, 0.0);
			vec3 rayDir = rayDirection(fov, gl_FragCoord.xy);

			//Get the view matrix from the camera orientation
			mat3 viewMatrix_ = lookAt(cameraPosition, target, up);

			//Transform the ray to point in the correct direction
			rayDir = viewMatrix_ * rayDir;

			vec3 col = getSkyColour(rayDir);

    	//Draw sun
			vec3 sunDir = normalize(sunDirection);
			float mu = dot(sunDir, rayDir);
    	col += vec3(1.0, 1.0, 0.8) * getGlow(1.0-mu, 0.00005, 0.9);

    	col += applyFog(col, vec3(0,1000,0), rayDir, sunDir);

			//Tonemapping
			col = ACESFilm(col);

			//Gamma correction 1.0/2.2 = 0.4545...
			col = pow(col, vec3(0.4545));

			gl_FragColor = vec4(col, 1.0 );
		}
`
});

backgroundMaterial.depthWrite = false;
var backgroundGeometry = new THREE.PlaneBufferGeometry(2, 2, 1, 1);
var background = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
backgroundScene.add(background);
backgroundScene.remove(background);


renderer.autoClear = false;

//************** Ground **************
//Ground material is a modification of the existing THREE.MeshPhongMaterial rather than one from scratch
var groundBaseGeometry = new THREE.PlaneBufferGeometry(width, width, resolution, resolution);
groundBaseGeometry.lookAt(new THREE.Vector3(0,1,0));
groundBaseGeometry.verticesNeedUpdate = true;

var groundGeometry = new THREE.PlaneBufferGeometry(width, width, resolution, resolution);
groundGeometry.addAttribute('basePosition', groundBaseGeometry.getAttribute("position"));
groundGeometry.lookAt(new THREE.Vector3(0,1,0));
groundGeometry.verticesNeedUpdate = true;
var groundMaterial = new THREE.MeshPhongMaterial({color: 0x000900});

var sharedPrefix = `
uniform sampler2D noiseTexture;
float getYPosition(vec2 p){
	return 8.0*(2.0*texture2D(noiseTexture, p/800.0).r - 1.0);
}
`;

var groundVertexPrefix = sharedPrefix + ` 
attribute vec3 basePosition;
uniform float delta;
uniform float posX;
uniform float posZ;
uniform float radius;
uniform float width;

float placeOnSphere(vec3 v){
  float theta = acos(v.z/radius);
  float phi = acos(v.x/(radius * sin(theta)));
  float sV = radius * sin(theta) * sin(phi);
  //If undefined, set to default value
  if(sV != sV){
    sV = v.y;
  }
  return sV;
}

//Get the position of the ground from the [x,z] coordinates, the sphere and the noise height field
vec3 getPosition(vec3 pos, float epsX, float epsZ){
  vec3 temp;
  temp.x = pos.x + epsX;
  temp.z = pos.z + epsZ;
  temp.y = max(0.0, placeOnSphere(temp)) - radius;
  temp.y += getYPosition(vec2(basePosition.x+epsX+delta*floor(posX), basePosition.z+epsZ+delta*floor(posZ)));
  return temp;
}

//Find the normal at pos as the cross product of the central-differences in x and z directions
vec3 getNormal(vec3 pos){
  float eps = 1e-1;

  vec3 tempP = getPosition(pos, eps, 0.0);
  vec3 tempN = getPosition(pos, -eps, 0.0);
  
  vec3 slopeX = tempP - tempN;

  tempP = getPosition(pos, 0.0, eps);
  tempN = getPosition(pos, 0.0, -eps);

  vec3 slopeZ = tempP - tempN;

  vec3 norm = normalize(cross(slopeZ, slopeX));
  return norm;
}
`;

let groundShader;
groundMaterial.onBeforeCompile = function ( shader ) {
  shader.uniforms.delta = { value: delta };
  shader.uniforms.posX = { value: pos.x };
  shader.uniforms.posZ = { value: pos.y };
  shader.uniforms.radius = { value: radius };
  shader.uniforms.width = { value: width };
	shader.uniforms.noiseTexture = { value: noiseTexture };
  shader.vertexShader = groundVertexPrefix + shader.vertexShader;
  shader.vertexShader = shader.vertexShader.replace(
      '#include <beginnormal_vertex>',
      `//https://dev.to/maurobringolf/a-neat-trick-to-compute-modulo-of-negative-numbers-111e
			vec3 pos = vec3(0);
      pos.x = basePosition.x - mod(mod((delta*posX),delta) + delta, delta);
      pos.z = basePosition.z - mod(mod((delta*posZ),delta) + delta, delta);
      pos.y = max(0.0, placeOnSphere(pos)) - radius;
      pos.y += getYPosition(vec2(basePosition.x+delta*floor(posX), basePosition.z+delta*floor(posZ)));
      vec3 objectNormal = getNormal(pos);
#ifdef USE_TANGENT
      vec3 objectTangent = vec3( tangent.xyz );
#endif`
      );
  shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `vec3 transformed = vec3(pos);`
      );
  groundShader = shader;
};

var ground = new THREE.Mesh(groundGeometry, groundMaterial);

ground.geometry.computeVertexNormals();
scene.add(ground);

//************** Grass **************
var grassVertexSource = sharedPrefix + `
precision mediump float;
attribute vec3 position;
attribute vec3 normal;
attribute vec3 offset;
attribute vec2 uv;
attribute vec2 halfRootAngle;
attribute float scale;
attribute float index;
uniform float time;

uniform float delta;
uniform float posX;
uniform float posZ;
uniform float radius;
uniform float width;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying float frc;
varying float idx;

const float PI = 3.1415;
const float TWO_PI = 2.0 * PI;


//https://www.geeks3d.com/20141201/how-to-rotate-a-vertex-by-a-quaternion-in-glsl/
vec3 rotateVectorByQuaternion(vec3 v, vec4 q){
  return 2.0 * cross(q.xyz, v * q.w + cross(q.xyz, v)) + v;
}

float placeOnSphere(vec3 v){
  float theta = acos(v.z/radius);
  float phi = acos(v.x/(radius * sin(theta)));
  float sV = radius * sin(theta) * sin(phi);
  //If undefined, set to default value
  if(sV != sV){
    sV = v.y;
  }
  return sV;
}

void main() {

	//Vertex height in blade geometry
	frc = position.y / float(` + bladeHeight + `);

	//Scale vertices
  vec3 vPosition = position;
	vPosition.y *= scale;

	//Invert scaling for normals
	vNormal = normal;
	vNormal.y /= scale;

	//Rotate blade around Y axis
  vec4 direction = vec4(0.0, halfRootAngle.x, 0.0, halfRootAngle.y);
	vPosition = rotateVectorByQuaternion(vPosition, direction);
	vNormal = rotateVectorByQuaternion(vNormal, direction);

  //UV for texture
  vUv = uv;

	vec3 pos;
	vec3 globalPos;
	vec3 tile;

	globalPos.x = offset.x-posX*delta;
	globalPos.z = offset.z-posZ*delta;

	tile.x = floor((globalPos.x + 0.5 * width) / width);
	tile.z = floor((globalPos.z + 0.5 * width) / width);

	pos.x = globalPos.x - tile.x * width;
	pos.z = globalPos.z - tile.z * width;

	pos.y = max(0.0, placeOnSphere(pos)) - radius;
	pos.y += getYPosition(vec2(pos.x+delta*posX, pos.z+delta*posZ));
	
	//Position of the blade in the visible patch [0->1]
  vec2 fractionalPos = 0.5 + offset.xz / width;
  //To make it seamless, make it a multiple of 2*PI
  fractionalPos *= TWO_PI;

  //Wind is sine waves in time. 
  float noise = sin(fractionalPos.x + time);
  float halfAngle = noise * 0.1;
  noise = 0.5 + 0.5 * cos(fractionalPos.y + 0.25 * time);
  halfAngle -= noise * 0.2;

	direction = normalize(vec4(sin(halfAngle), 0.0, -sin(halfAngle), cos(halfAngle)));

	//Rotate blade and normals according to the wind
  vPosition = rotateVectorByQuaternion(vPosition, direction);
	vNormal = rotateVectorByQuaternion(vNormal, direction);

	//Move vertex to global location
	vPosition += pos;

	//Index of instance for varying colour in fragment shader
	idx = index;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);

}`;

var grassFragmentSource = `
precision mediump float;

uniform vec3 cameraPosition;

//Light uniforms
uniform float ambientStrength;
uniform float diffuseStrength;
uniform float specularStrength;
uniform float translucencyStrength;
uniform float shininess;
uniform vec3 lightColour;
uniform vec3 sunDirection;


//Surface uniforms
uniform sampler2D map;
uniform sampler2D alphaMap;
uniform vec3 specularColour;

varying float frc;
varying float idx;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

vec3 ACESFilm(vec3 x){
	float a = 2.51;
	float b = 0.03;
	float c = 2.43;
	float d = 0.59;
	float e = 0.14;
	return clamp((x*(a*x+b))/(x*(c*x+d)+e), 0.0, 1.0);
}

void main() {

  //If transparent, don't draw
  if(texture2D(alphaMap, vUv).r < 0.15){
    discard;
  }

	vec3 normal;

	//Flip normals when viewing reverse of the blade
	if(gl_FrontFacing){
		normal = normalize(vNormal);
	}else{
		normal = normalize(-vNormal);
	}

  //Get colour data from texture
	vec3 textureColour = pow(texture2D(map, vUv).rgb, vec3(2.2));

  //Add different green tones towards root
	vec3 mixColour = idx > 0.75 ? vec3(0.07, 0.52, 0.06) : vec3(0.07, 0.43, 0.08);
  textureColour = mix(pow(mixColour, vec3(2.2)), textureColour, frc);

	vec3 lightTimesTexture = lightColour * textureColour;
  vec3 ambient = textureColour;
	vec3 lightDir = normalize(sunDirection);

  //How much a fragment faces the light
	float dotNormalLight = dot(normal, lightDir);
  float diff = max(dotNormalLight, 0.0);

  //Colour when lit by light
  vec3 diffuse = diff * lightTimesTexture;

  float sky = max(dot(normal, vec3(0,1,0)), 0.0);
	vec3 skyLight = sky * vec3(0.12, 0.29, 0.55);

  vec3 viewDirection = normalize(cameraPosition - vPosition);
  vec3 halfwayDir = normalize(lightDir + viewDirection);
  //How much a fragment directly reflects the light to the camera
  float spec = pow(max(dot(normal, halfwayDir), 0.0), shininess);
  
  //Colour of light sharply reflected into the camera
  vec3 specular = spec * specularColour * lightColour;

	//https://en.wikibooks.org/wiki/GLSL_Programming/Unity/Translucent_Surfaces
	vec3 diffuseTranslucency = vec3(0);
	vec3 forwardTranslucency = vec3(0);
	float dotViewLight = dot(-lightDir, viewDirection);
	if(dotNormalLight <= 0.0){
		diffuseTranslucency = lightTimesTexture * translucencyStrength * -dotNormalLight;
		if(dotViewLight > 0.0){
			forwardTranslucency = lightTimesTexture * translucencyStrength * pow(dotViewLight, 16.0);
		}
	}

  vec3 col = 0.3 * skyLight * textureColour + ambientStrength * ambient + diffuseStrength * diffuse + specularStrength * specular + diffuseTranslucency + forwardTranslucency;

  //Tonemapping
  col = ACESFilm(col);

  //Gamma correction 1.0/2.2 = 0.4545...
	col = pow(col, vec3(0.4545));

	//Add a shadow towards root
	col = mix(vec3(0.0, 0.2, 0.0), col, frc);

  gl_FragColor = vec4(col, 1.0);
}`;

//Define base geometry that will be instanced. We use a plane for an individual blade of grass
var grassBaseGeometry = new THREE.PlaneBufferGeometry(bladeWidth, bladeHeight, 1, joints);
grassBaseGeometry.translate(0, bladeHeight/2, 0);

//Define the bend of the grass blade as the combination of three quaternion rotations
let vertex = new THREE.Vector3();
let quaternion0 = new THREE.Quaternion();
let quaternion1 = new THREE.Quaternion();
let x, y, z, w, angle, sinAngle, rotationAxis;

//Rotate around Y
angle = 0.05;
sinAngle = Math.sin(angle / 2.0);
rotationAxis = new THREE.Vector3(0, 1, 0);
x = rotationAxis.x * sinAngle;
y = rotationAxis.y * sinAngle;
z = rotationAxis.z * sinAngle;
w = Math.cos(angle / 2.0);
quaternion0.set(x, y, z, w);

//Rotate around X
angle = 0.3;
sinAngle = Math.sin(angle / 2.0);
rotationAxis.set(1, 0, 0);
x = rotationAxis.x * sinAngle;
y = rotationAxis.y * sinAngle;
z = rotationAxis.z * sinAngle;
w = Math.cos(angle / 2.0);
quaternion1.set(x, y, z, w);

//Combine rotations to a single quaternion
quaternion0.multiply(quaternion1);

//Rotate around Z
angle = 0.1;
sinAngle = Math.sin(angle / 2.0);
rotationAxis.set(0, 0, 1);
x = rotationAxis.x * sinAngle;
y = rotationAxis.y * sinAngle;
z = rotationAxis.z * sinAngle;
w = Math.cos(angle / 2.0);
quaternion1.set(x, y, z, w);

//Combine rotations to a single quaternion
quaternion0.multiply(quaternion1);

let quaternion2 = new THREE.Quaternion();

//Bend grass base geometry for more organic look
for(let v = 0; v < grassBaseGeometry.attributes.position.array.length; v += 3){
	quaternion2.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
	vertex.x = grassBaseGeometry.attributes.position.array[v];
	vertex.y = grassBaseGeometry.attributes.position.array[v+1];
	vertex.z = grassBaseGeometry.attributes.position.array[v+2];
	let frac = vertex.y/bladeHeight;
	quaternion2.slerp(quaternion0, frac);
	vertex.applyQuaternion(quaternion2);
	grassBaseGeometry.attributes.position.array[v] = vertex.x;
	grassBaseGeometry.attributes.position.array[v+1] = vertex.y;
	grassBaseGeometry.attributes.position.array[v+2] = vertex.z;
}

grassBaseGeometry.computeVertexNormals();
var baseMaterial = new THREE.MeshNormalMaterial({side: THREE.DoubleSide});
var baseBlade = new THREE.Mesh(grassBaseGeometry, baseMaterial);
//Show grass base geometry
//scene.add(baseBlade);

var instancedGeometry = new THREE.InstancedBufferGeometry();

instancedGeometry.index = grassBaseGeometry.index;
instancedGeometry.attributes.position = grassBaseGeometry.attributes.position;
instancedGeometry.attributes.uv = grassBaseGeometry.attributes.uv;
instancedGeometry.attributes.normal = grassBaseGeometry.attributes.normal;

// Each instance has its own data for position, orientation and scale
var indices = [];
var offsets = [];
var scales = [];
var halfRootAngles = [];

//For each instance of the grass blade
for (let i = 0; i < instances; i++){
	
	indices.push(i/instances);
	
  //Offset of the roots
  x = Math.random() * width - width/2;
  z = Math.random() * width - width/2;
  y = 0; 
  offsets.push(x, y, z);

	//Random orientation
  let angle = Math.PI - Math.random() * (2 * Math.PI);
  halfRootAngles.push(Math.sin(0.5*angle), Math.cos(0.5*angle));

  //Define variety in height
  if(i % 3 != 0){
  	scales.push(2.0+Math.random() * 1.25);
  }else{
    scales.push(2.0+Math.random()); 
  }
}

var offsetAttribute = new THREE.InstancedBufferAttribute(new Float32Array(offsets), 3);
var scaleAttribute = new THREE.InstancedBufferAttribute(new Float32Array(scales), 1);
var halfRootAngleAttribute = new THREE.InstancedBufferAttribute(new Float32Array(halfRootAngles), 2);
var indexAttribute = new THREE.InstancedBufferAttribute(new Float32Array(indices), 1);

instancedGeometry.setAttribute( 'offset', offsetAttribute);
instancedGeometry.setAttribute( 'scale', scaleAttribute);
instancedGeometry.setAttribute( 'halfRootAngle', halfRootAngleAttribute);
instancedGeometry.setAttribute( 'index', indexAttribute);

//Define the material, specifying attributes, uniforms, shaders etc.
var grassMaterial = new THREE.RawShaderMaterial( {
  uniforms: {
    time: {type: 'float', value: 0},
		delta: {type: 'float', value: delta },
  	posX: {type: 'float', value: pos.x },
  	posZ: {type: 'float', value: pos.y },
  	radius: {type: 'float', value: radius },
  	width: {type: 'float', value: width },
    map: { value: grassTexture},
    alphaMap: { value: alphaMap},
    noiseTexture: { value: noiseTexture},
		sunDirection: {type: 'vec3', value: new THREE.Vector3(Math.sin(azimuth), Math.sin(elevation), -Math.cos(azimuth))},
		cameraPosition: {type: 'vec3', value: camera.position},
		ambientStrength: {type: 'float', value: ambientStrength},
    translucencyStrength: {type: 'float', value: translucencyStrength},
    diffuseStrength: {type: 'float', value: diffuseStrength},
    specularStrength: {type: 'float', value: specularStrength},
    shininess: {type: 'float', value: shininess},
    lightColour: {type: 'vec3', value: sunColour},
    specularColour: {type: 'vec3', value: specularColour},
  },
  vertexShader: grassVertexSource,
  fragmentShader: grassFragmentSource,
  side: THREE.DoubleSide
} );

var grass = new THREE.Mesh(instancedGeometry, grassMaterial);
scene.add(grass);

//************** User movement **************
var forward = false;
var backward = false;
var left = false;
var right = false;
function keyDown(e){
	if(e.keyCode == 38 || e.keyCode == 40){
		e.preventDefault();
	}
	if(e.keyCode == 87 || e.keyCode == 38) {
		forward = true;
	}
	if(e.keyCode == 83 || e.keyCode == 40) {
		backward = true;
	}
	if(e.keyCode == 65 || e.keyCode == 37) {
		left = true;
	}
	if(e.keyCode == 68 || e.keyCode == 39) {
		right = true;
	}
};

function keyUp(e){
	if(e.keyCode == 87 || e.keyCode == 38) {
		forward = false;
	}
	if(e.keyCode == 83 || e.keyCode == 40) {
		backward = false;
	}
	if(e.keyCode == 65 || e.keyCode == 37) {
		left = false;
	}
	if(e.keyCode == 68 || e.keyCode == 39) {
		right = false;
	}
};

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

function cross(a, b){
	return {x: a.y * b.z - a.z * b.y,
					y: a.z * b.x - a.x * b.z,
					z: a.x * b.y - a.y * b.x
				 }; 
}

var viewDirection = new THREE.Vector3();
var upVector = new THREE.Vector3(0,1,0);

//Find the height of the spherical world at given x,z position
function placeOnSphere(v){
  let theta = Math.acos(v.z/radius);
  let phi = Math.acos(v.x/(radius * Math.sin(theta)));
  let sV = radius * Math.sin(theta) * Math.sin(phi);
  //If undefined, set to default value
  if(sV != sV){
    sV = v.y;
  }
  return sV;
}

function move(dT){
	
	camera.getWorldDirection(viewDirection);
  length = Math.sqrt(viewDirection.x*viewDirection.x + viewDirection.z*viewDirection.z);
  viewDirection.x /= length;
  viewDirection.z /= length;
	if(forward){
		pos.x += dT * speed * viewDirection.x;
		pos.y += dT * speed * viewDirection.z;
	}
	if(backward){
		pos.x -= dT * speed * viewDirection.x;
		pos.y -= dT * speed * viewDirection.z;
	}
	if(left){
		var rightVector = cross(upVector, viewDirection);
		pos.x += dT * speed * rightVector.x;
		pos.y += dT * speed * rightVector.z;
	}
	if(right){
		var rightVector = cross(upVector, viewDirection);
		pos.x -= dT * speed * rightVector.x;
		pos.y -= dT * speed * rightVector.z;
	}
	
	if(groundShader){
		groundShader.uniforms.posX.value = pos.x;
		groundShader.uniforms.posZ.value = pos.y;
		groundShader.uniforms.radius.value = radius;
	}
	grassMaterial.uniforms.posX.value = pos.x;
  grassMaterial.uniforms.posZ.value = pos.y;
  grassMaterial.uniforms.radius.value = radius;
}

//******* Sun uniform update *******
function updateSunPosition(){
	var sunDirection = new THREE.Vector3(Math.sin(azimuth), Math.sin(elevation), -Math.cos(azimuth));
  grassMaterial.uniforms.sunDirection.value = sunDirection;
	backgroundMaterial.uniforms.sunDirection.value = sunDirection;
}

//************** Draw **************
var time = 0;
var lastFrame = Date.now();
var thisFrame;
var dT = 0;
let canvasActive = false

function draw(){
	// stats.begin();
	
    renderer.setSize(sizes.width, sizes.height)
    if (sizes.height < window.innerHeight * 0.50){
        sizes.height = sizes.height += 10
        camera.aspect = sizes.width / sizes.height
        camera.updateProjectionMatrix()

    } 
    else if (sizes.width < window.innerWidth * 0.9){
        sizes.width = sizes.width += 12
        camera.aspect = sizes.width / sizes.height
        camera.updateProjectionMatrix()
    }
    if (canvasActive){
        camera.position.x = cursor.x / 10
        camera.position.y = cursor.y / 20
    } 


	//Update time
	thisFrame = Date.now();
	dT = (thisFrame - lastFrame)/200.0;
	time += dT;	
	move(dT);
	lastFrame = thisFrame;
	
  grassMaterial.uniforms.time.value = time;
	
	renderer.clear();
	renderer.render(backgroundScene, camera);
	renderer.render(scene, camera);

  if(rotate){
    controls.update();
  }
//   stats.end();
  requestAnimationFrame(draw);
}

draw();


scene.background = new THREE.Color('#ffffff')


const llamaLoader = new GLTFLoader()

llamaLoader.load(

'/models/llama2/scene.gltf',
	// called when the resource is loaded
	function ( gltf ) {

    scene.add( gltf.scene );

		gltf.animations; // Array<THREE.AnimationClip>
		gltf.scene; // THREE.Group
		gltf.scenes; // Array<THREE.Group>
		gltf.cameras; // Array<THREE.Camera>
		gltf.asset; // Object

	},
	// called while loading is progressing
	function ( xhr ) {
		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
	},
	// called when loading has errors
	function ( error ) {
		console.log( 'An error happened' );
	}
);


const butt = $(".contact-butt")

// DARK MODE 

let sun = true
$(".go-up").on('click', function(){
    if (sun){
        $(this).children().removeClass('moon-sun')
        $(this).children().addClass('sun-moon')
        darkmode(true)
        sun = false
        localStorage.setItem('dark', false);
    } 
    else{
        $(this).children().removeClass('sun-moon')
        $(this).children().addClass('moon-sun')
        darkmode(false)
        sun = true
        localStorage.setItem('dark', true);
    }

})
const bod = $('body')
const navButt = $('.nav-butt')
const goUp = $(".go-up")
const nav = $('nav')
const skill = $(".skill")
const proj = $(".project")
const siteButt = $(".site")
const stackImg = $(".stack-img")
const title = $('.header-container').children()


let darkmode = (env) => {
    if (env){ // from light
        nav.css('background', 'black')
        bod.addClass('dark-body')
        navButt.css('color', 'white')
        goUp.css('background-color', 'white')
        skill.css('background-color', 'slateblue')
        skill.css('box-shadow', '12px 12px 2px 1px rgba(255, 130, 255, .2)')
        proj.css('background-color', 'slateblue')
        butt.css('color', 'white')
        siteButt.css('color', 'white')
        title.css('color','white')
        document.documentElement.style.setProperty('--underline', '#787AEB')
        scene.background = new THREE.Color(params.sky.night)
    } else { // from dark
        bod.removeClass('dark-body')
        navButt.css('color', 'black')
        nav.css('background', 'white')
        skill.css('background-color', 'white')
        skill.css('box-shadow', '12px 12px 2px 1px rgba(0, 0, 255, .2)')
        proj.css('background-color', 'white')
        butt.css('color', 'black')
        siteButt.css('color', 'black')
        title.css('color','black')

        document.documentElement.style.setProperty('--underline', '#7D9FF5')
        scene.background = new THREE.Color(params.sky.day)
    }
}

// Set darkmode
const darkSet = localStorage.getItem('dark');
if (darkSet === 'false'){
    darkmode(true)
    $(".go-up").children().removeClass('moon-sun')
    $(".go-up").children().addClass('sun-moon')
    sun = false
}