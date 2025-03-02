// Global variables that can be controlled 
var scene, camera, renderer, box, clock, mixer, actions = [], mode, isWireframe = false;
let loadedModel;
let secondModelMixer, secondModelActions = [];

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

    // Directional Light
    const light = new THREE.DirectionalLight(0xFFFFFF);
    light.position.set(0, 10, 2);
    scene.add(light);

    // Ambient Light
    const ambient = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
    scene.add(ambient);

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
                    action.play();
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