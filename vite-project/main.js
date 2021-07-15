import './style.css'

import * as three from 'three';
import { Sphere, SphereGeometry, TorusBufferGeometry, WireframeGeometry } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls' 


function calcPosFromLatLonRad(lat,lon,radius){
	
  var phi   = (90-lat)*(Math.PI/180);
  var theta = (lon+180)*(Math.PI/180);
  
  var x = -((radius) * Math.sin(phi)*Math.cos(theta));
  var z = ((radius) * Math.sin(phi)*Math.sin(theta));
  var y = ((radius) * Math.cos(phi));
      
      
    console.log([x,y,z]);
     return [x,y,z];
}

// ISS long lat 

fetch('http://api.open-notify.org/iss-now.json')
  .then(res => res.json())
  .then(data => {
    console.log(data)
    const IssLat = data.iss_position.latitude;
    const IssLong = data.iss_position.longitude;
    createMarker(calcPosFromLatLonRad(IssLat, IssLong, 30))
  })
  .catch(error => console.log('ERROR'))



const scene = new three.Scene();

const camera = new three.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new three.WebGLRenderer({
  canvas: document.querySelector('#bg')
})

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(50);


//EARTH generation

const earthTexture = new three.TextureLoader().load('8k_earth_daymap.jpeg')
const earthNormalMap = new three.TextureLoader().load('2k_earth_normal_map.tif')

const geometry = new three.SphereGeometry(30, 50, 50)
const material = new three.MeshStandardMaterial({ map: earthTexture, normalMap: earthNormalMap })
const sphere = new three.Mesh(geometry, material);

scene.add(sphere)

// Long and lat to sphere points


//ISS generation
function createMarker(array){
const geo = new three.SphereGeometry(.40 , 10, 10)
const mat = new three.MeshStandardMaterial({ color: 0xba6565})
const marker = new three.Mesh(geo, mat);

marker.position.setX(array[0])
marker.position.setY(array[1])
marker.position.setZ(array[2])

scene.add(marker)
}


const pointLight = new three.PointLight(0xffffff);
const ambienteLight = new three.AmbientLight(0xffffff);


pointLight.position.set(50,5,50)

scene.add(pointLight, ambienteLight)

const controls = new OrbitControls(camera, renderer.domElement);



function animate() {
  requestAnimationFrame( animate );



  renderer.render(scene, camera);
}

animate();

