import { Component, OnInit } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as STATS from 'stats.js';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})

export class MainComponent implements OnInit {

  constructor() { }

  scene;
  camera;
  renderer;
  controls;

  sunSpeed = 0.005;
  wallColor = 0x00ff00;

  time: number;

  setup() {
    if (localStorage.getItem('high-score') == null) {
      localStorage.setItem('high-score', "0");
    }
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x4a4a4a);

    //lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); //color n intensity
    this.scene.add(ambientLight);
    
    //Create a DirectionalLight and turn on shadows for the light
    const light = new THREE.PointLight( 0xffffff, 0.5 );
    light.position.set( 0, 100, 0 ); //default; light shining from top
    light.castShadow = true; 
    this.scene.add( light );
    console.log(light)

    //Set up shadow properties for the light
    light.shadow.mapSize.width = 512; // default
    light.shadow.mapSize.height = 512; // default
    light.shadow.camera.near = 0.5; // default
    light.shadow.camera.far = 500; // default
    const helper = new THREE.PointLightHelper( light, 5 );
    this.scene.add( helper );


    //camera
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 500);

    this.camera.position.set(0, 10, 25);
    // this.camera.lookAt(0, 0, 0);

    //renderer
    let pixelRatio = window.devicePixelRatio
    let AA = true
    if (pixelRatio > 1) {
      AA = false
    }
    this.renderer = new THREE.WebGLRenderer({
      antialias: AA,
      powerPreference: "high-performance"
    });

    //shadow setup
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.BasicShadowMap;

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.render(this.scene, this.camera);

    // controls

    this.controls = this.orbitSetup();
    this.controls.update();

    const axesHelper = new THREE.AxesHelper( 5 );
    axesHelper.position.set(0, 10, 0);
    this.scene.add( axesHelper );

    // Add it to HTML
    document.body.appendChild(this.renderer.domElement);

    this.animations(light);
  }
  orbitSetup() {
    const controls = new OrbitControls(this.camera, this.renderer.domElement);

    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.05;

    controls.screenSpacePanning = false;


    controls.maxPolarAngle = Math.PI;

    controls.target.set(0, 0, 0);
    controls.zoomSpeed = 2;

    return controls;
  }
  createWindowedWall(width, height, depth, x, y, z) {
    const windowSize = 1; 
    //we need to create 4 blocks with a 1x1 square hole on then
    const w1 = (width/2)-windowSize;
    const bigGeometry = new THREE.BoxBufferGeometry( w1, height, depth );
    const smallGeometry = new THREE.BoxBufferGeometry( windowSize, (height/2)-windowSize, depth );
    const material = new THREE.MeshLambertMaterial( {color: this.wallColor} );

    const bigWall1 = new THREE.Mesh( bigGeometry, material );
    const bigWall2 = new THREE.Mesh( bigGeometry, material );
    const smallWall1 = new THREE.Mesh( smallGeometry, material );
    const smallWall2 = new THREE.Mesh( smallGeometry, material ); 
    
    const group = new THREE.Group();
    group.add(bigWall1);
    group.add(bigWall2);
    group.add(smallWall1);
    group.add(smallWall2);

    console.log(group);
  }
  createWalls(width, depth) {
    const wallDepth = 0.5;
    const wallHeight = 5;
    const geometry = new THREE.BoxBufferGeometry( wallDepth, wallHeight, depth );
    const material = new THREE.MeshLambertMaterial( {color: this.wallColor} );

    const left = new THREE.Mesh( geometry, material );
    left.position.set(width/2, wallHeight/2,0);
    left.castShadow = true;
    left.receiveShadow = true;

    const right = new THREE.Mesh( geometry, material );
    right.position.set(-width/2, wallHeight/2,0);
    right.castShadow = true;
    right.receiveShadow = true;

    const geometrySide = new THREE.BoxBufferGeometry( width+(wallDepth), wallHeight, wallDepth );

    const front = new THREE.Mesh( geometrySide, material);
    front.position.set(0, wallHeight/2, depth/2);
    front.castShadow = true;
    front.receiveShadow = true;

    const back = new THREE.Mesh( geometrySide, material);
    back.position.set(0, wallHeight/2, -depth/2);
    back.castShadow = true;
    back.receiveShadow = true;

    const geometryFloor = new THREE.BoxBufferGeometry( 2*(width+wallDepth), 0.1, 2*depth);
    const materialFloor = new THREE.MeshLambertMaterial( {color: 0xcecece} );
    const floor = new THREE.Mesh( geometryFloor, materialFloor); 
    floor.receiveShadow = true;
    floor.castShadow = true;

    console.log(back);

    const group = new THREE.Group();
    group.add(left);
    group.add(right);
    group.add(front);
    group.add(back);
    group.add(floor);

    this.scene.add( group );
  }
  animations(light) {
    this.time += this.sunSpeed;

    light.position.y = 30*Math.cos(this.time) + 0;
    light.position.x = 30*Math.sin(this.time) + 0;
    
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(()=>this.animations(light));
  }
  setupStats() {
    var stats = new STATS();
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    stats.dom.style = "position: fixed; bottom: 0px;  cursor: pointer; opacity: 0.9; z-index: 10000; right: 0px";
    document.body.appendChild(stats.dom);

    function animate() {

      stats.begin();

      // monitored code goes here

      stats.end();

      requestAnimationFrame(animate);

    }

    requestAnimationFrame(animate);
  }
  ngOnInit(): void {
    window.addEventListener('resize', () => {
      if(this.renderer) {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
      }
    })
    this.time = 1;
    this.setup();
    this.createWalls(20, 10);
    
    this.setupStats();
  }

}
