// Global variables that can be controlled 
var scene, camera, renderer, box, clock, mixer, actions = [], mode, isWireframe = false, params, lights;
let loadedModel;
let secondModelMixer, secondModelActions = [];
let sound, secondSound;

// Initializing 
init();

function init() {
    // When the website opens, initializes these variables 
    const assetPath = './';

    // Clock
    clock = new THREE.Clock();

    // Scene 
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x00aaff);

    // Camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(-5, 25, 20);

    // Listener 
    const listener = new THREE.AudioListener();
    camera.add(listener);

    // Sound Effects
    sound = new THREE.Audio(listener);
    secondSound = new THREE.Audio(listener);

    // Can opening sound effect loader
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load('assets/sound/Can_Open_Sound_FX.mp3', function(buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(false);
        sound.setVolume(1.0);
    });

    // Can recycling sound effect loader
    audioLoader.load('assets/sound/Can_Recycle_FX.mp3', function(buffer) {
        secondSound.setBuffer(buffer);
        secondSound.setLoop(false);
        secondSound.setVolume(2.0);
    });

    // Ambient Light
    const ambient = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
    scene.add(ambient);

    // Spot Light and Scene Lights GUI
    lights = {};
    lights.spot = new THREE.SpotLight();
    lights.spot.visible = true;
    lights.spot.position.set(0,20,0);
    lights.spotHelper = new THREE.SpotLightHelper(lights.spot);
    lights.spotHelper.visible = false;
    scene.add(lights.spotHelper);
    scene.add(lights.spot);
    
    params = {
        spot: {
            enable: false,
            color: 0xffffff,
            distance: 20,
            angle: Math.PI/2,
            penumbra: 0,
            helper: false,
            moving: false
        }
    }
    
    const gui = new dat.GUI({ autoPlace: false });
    const guiContainer = document.getElementById('gui-container');
    guiContainer.appendChild(gui.domElement);

    guiContainer.style.position = 'fixed';
    
    const spot = gui.addFolder('Spot');
    spot.open();
    spot.add(params.spot, 'enable').onChange(value => { lights.spot.visible = value });
    spot.addColor(params.spot, 'color').onChange(value => lights.spot.color = new THREE.Color(value));
    spot.add(params.spot,'distance').min(0).max(20).onChange( value => lights.spot.distance = value);
    spot.add(params.spot,'angle').min(0.1).max(6.28).onChange( value => lights.spot.angle = value );
    spot.add(params.spot,'penumbra').min(0).max(1).onChange( value => lights.spot.penumbra = value );
    spot.add(params.spot, 'helper').onChange(value => lights.spotHelper.visible = value);
    spot.add(params.spot, 'moving');

    // Renderer 
    const canvas = document.getElementById('threeContainer');
    renderer = new THREE.WebGLRenderer({canvas: canvas});
    renderer.setPixelRatio(window.devicePixelRatio);
    resize();

    // Orbit Controls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(1, 2, 0);
    controls.update();

    // Open Can Button
    mode = 'open';
    const btn = document.getElementById("btn");
    btn.addEventListener('click', function() {
        if (actions.length === 2) {
            if (mode === "open") {
                actions.forEach(action => {
                    action.timeScale = 1;
                    action.reset();
                    action.setLoop(THREE.LoopOnce);
                    action.clampWhenFinished = true;
                    action.play();
                    
                    if (sound.isPlaying) { 
                        sound.stop(); 
                    }
                    sound.play();
                });
            }
        }
    });

    // Toggle Wireframe Button
    const wireframeBtn = document.getElementById("toggleWireframe");
    wireframeBtn.addEventListener('click', function() {
        isWireframe = !isWireframe;
        toggleWireframe(isWireframe);
    });

    // Rotate Can Button
    const rotateBtn = document.getElementById("rotate");
    rotateBtn.addEventListener('click', function() {
        if (loadedModel) {
            const axis = new THREE.Vector3(0, 1, 0);
            const angle = Math.PI / 8;
            loadedModel.rotateOnAxis(axis, angle);
        } else {
            console.warn('Model is not loaded yet');
        }
    });

    // Recycle Can Button
    const playSecondModelAnimationBtn = document.getElementById("playSecondModelAnimation");
    playSecondModelAnimationBtn.addEventListener('click', function() {
        if (secondModelActions.length > 0) {
            secondModelActions.forEach(action => {
                action.reset();
                action.setLoop(THREE.LoopOnce);
                action.clampWhenFinished = true;
                action.play();

                if (secondSound.isPlaying) {
                    secondSound.stop();
                }
                secondSound.play();
            });
        } else {
            console.warn('No animations are available for the second model');
        }
    });

    //Load the GLTF model
    const loader = new THREE.GLTFLoader();

    function loadModel(modelPath) {
        if (loadedModel) {
            scene.remove(loadedModel);
        }

        loader.load(modelPath, function(gltf) {
            const model = gltf.scene;

            model.position.set(0, 0, 0);
            scene.add(model);
            loadedModel = model;

            mixer = new THREE.AnimationMixer(model);
            const animations = gltf.animations;
            action = [];

            animations.forEach(clip => {
                const action = mixer.clipAction(clip);
                actions.push(action);
            });

            if(modelPath === 'assets/models/Recycled Cola Bottle.glb') {
                secondModelMixer = mixer;
                secondModelActions = actions;
            }
        });
    }
    loadModel('assets/models/CocaCola Bottle.glb')
    const switchBtn = document.getElementById("switchModel");
    switchBtn.addEventListener('click', function() {
        loadModel('assets/models/Recycled Cola Bottle.glb');
    });

    // Resize button event listener 
    window.addEventListener('resize', resize, false);

    animate();
}

// Toggle Wireframe Function
function toggleWireframe(enable) {
    scene.traverse(function(object) {
        if (object.isMesh) {
            object.material.wireframe = enable;
        }
    });
}

// Animate Function
function animate() {
    requestAnimationFrame(animate);

    if (mixer) {
        mixer.update(clock.getDelta());
        if (secondModelMixer) {
            secondModelMixer.update(clock.getDelta());
        }
    }
    renderer.render(scene, camera);

    const time = clock.getElapsedTime();
    const delta = Math.sin(time) * 5;
    if (params.spot.moving) {
        lights.spot.position.x = delta;
        lights.spotHelper.update();
    }
}

// Resize Box Display Function
function resize() {
    const canvas = document.getElementById('threeContainer');
    const width = window.innerWidth;
    const height = window.innerHeight;

    // When the resize button event is interacted with
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}