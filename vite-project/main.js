import './style.css'

import * as three from 'three';
import { Clock, Sphere, SphereGeometry, TorusBufferGeometry, WireframeGeometry } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls' 
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let clock = new three.Clock(); 


function calcPosFromLatLonRad(lat,lon,radius){
  var phi   = (90-lat)*(Math.PI/180);
  var theta = (lon+180)*(Math.PI/180);
  
  let x = -((radius) * Math.sin(phi)*Math.cos(theta));
  let z = ((radius) * Math.sin(phi)*Math.sin(theta));
  let y = ((radius) * Math.cos(phi));
  return [x,y,z];
}



// ISS long lat 

const scene = new three.Scene();

const camera = new three.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new three.WebGLRenderer({
  canvas: document.querySelector('#bg')
})

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(150);


//EARTH generation

const earthTexture = new three.TextureLoader().load('8k_earth_daymap.jpeg')
const earthNormalMap = new three.TextureLoader().load('2k_earth_normal_map.tif')

const geometry = new three.SphereGeometry(80, 100, 100)
const material = new three.MeshStandardMaterial({ map: earthTexture, normalMap: earthNormalMap })
const sphere = new three.Mesh(geometry, material);

scene.add(sphere)

// Long and lat to sphere points


//ISS generation

function createMarker(array, size){
const geo = new three.SphereGeometry(size, 10, 10)
const mat = new three.MeshStandardMaterial({ color: 0xba6565, transparent: true, opacity: 0.8})
const marker = new three.Mesh(geo, mat);

marker.position.setX(array[0])
marker.position.setY(array[1])
marker.position.setZ(array[2])
scene.add(marker)
}



let issLoaded = false;
const iss = []

let currentIssPosition = [];


function createISS(array, size){
  const GFTloader = new GLTFLoader();
  GFTloader.load( './ISS_stationary.glb', function ( gltf ) {
    const issModel = gltf.scene.children[0];
    issModel.scale.set(.08,.08,.08)
    issModel.position.setX(array[0])
    issModel.position.setY(array[1])
    issModel.position.setZ(array[2])
    iss[0] = issModel;
    scene.add( gltf.scene );
  }, undefined, function ( error ) {

    console.error( error );

  } );
  currentIssPosition = array;
  issLoaded = true;
  }
  
  function issSlowPositionUpdate(){
    
    if(currentIssPosition != issFuturePosition){
      let delta = clock.getDelta()
      if(delta == 0){
        delta+= 0.1
      }
      for(var i = 0; i < 3; i++){
        if(currentIssPosition[i] > issFuturePosition[i]){
          currentIssPosition[i]-= (currentIssPosition[i] - issFuturePosition[i]) / (delta*10000);
        }else{
          currentIssPosition[i]+= (issFuturePosition[i]- currentIssPosition[i]) / (delta*10000);
        }
      }
      iss[0].position.setX(currentIssPosition[0])
      iss[0].position.setY(currentIssPosition[1])
      iss[0].position.setZ(currentIssPosition[2])
    }
    iss[0].lookAt(0,0,0)
    //iss[0].rotation.x+= 0.0005
    //iss[0].rotation.z+= 0.0005
}

let issFuturePosition = []
let issFuturePositonReady = false;

function issPositonUpdate(array){
  issFuturePosition = array
  issFuturePositonReady = true;
}


const pointLight = new three.PointLight(0xffffff);
const ambienteLight = new three.AmbientLight(0xffffff);


pointLight.position.set(100,50,100)

scene.add(pointLight, ambienteLight)

const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 100;
controls.enableDamping = true;

  let storedDate = new Date().getTime()/1000

function animate() {
  if (storedDate+1 <= new Date().getTime()/1000){
    storedDate = new Date().getTime()/1000
    fetch('http://api.open-notify.org/iss-now.json')
    .then(res => res.json())
    .then(data => {
      const issLat = parseInt(data.iss_position.latitude);
      const issLon = parseInt(data.iss_position.longitude)
    if(issLoaded){
      issPositonUpdate(calcPosFromLatLonRad(issLat, issLon, 85));
    }else{
      createISS(calcPosFromLatLonRad(issLat, issLon, 85));
    
      

    }
  })
  .catch(error => console.log(error))
  }
  if(issFuturePositonReady){
    issSlowPositionUpdate()
  }
  requestAnimationFrame( animate );
  controls.update()

  renderer.render(scene, camera);
}



animate();

