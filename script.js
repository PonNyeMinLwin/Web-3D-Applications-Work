// Global variables that can be controlled 
var scene, camera, renderer, box, clock, mixer, action = [], mode;

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

    // Plays an animation from an array of actions when a button is pressed
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

    //GLTF Loader 
    const loader = new THREE.GLTFLoader();
    loader.load(assetPath + 'assets/models/CocaCola Bottle.glb', function(gltf) {
        const model = gltf.scene;
        model.position.set(0, 0, 0); // Adjust position to ensure visibility
        scene.add(model);

        mixer = new THREE.AnimationMixer(model);
        const animations = gltf.animations;

        animations.forEach(clip => {
            const action = mixer.clipAction(clip);
            actions.push(action);
        });
    });

    // Resize button event listener 
    window.addEventListener('resize', resize, false);

    animate();
}

function animate() {
    requestAnimationFrame(animate);

    if (mixer) {
        mixer.update(clock.getDelta());
    }
    renderer.render(scene, camera);
}

function resize() {
    const canvas = document.getElementById('threeContainer');
    const width = window.innerWidth;
    const height = window.innerHeight;

    // When the resize button event is interacted with
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}