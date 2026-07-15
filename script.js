// --- In another life, I'd still choose you... let's make this one perfect. ---

// 1. Initialize Smooth Scrolling (Lenis)
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
});
function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// 2. Audio Controller
const audio = document.getElementById('bg-music');
audio.volume = 0;

function fadeAudio(targetVolume, duration = 2) {
    gsap.to(audio, {
        volume: targetVolume,
        duration: duration,
        ease: "power2.inOut"
    });
}

// 3. Three.js Background Setup
const canvas = document.getElementById('bg-canvas');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050816, 0.0015);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 100;

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Particle System (Stars)
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 2000;
const posArray = new Float32Array(particlesCount * 3);
const colorsArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i+=3) {
    posArray[i] = (Math.random() - 0.5) * 400; // x
    posArray[i+1] = (Math.random() - 0.5) * 400; // y
    posArray[i+2] = (Math.random() - 0.5) * 400; // z

    // Mix of white and faint gold
    const isGold = Math.random() > 0.8;
    colorsArray[i] = isGold ? 1 : 0.9;     // R
    colorsArray[i+1] = isGold ? 0.82 : 0.9; // G
    colorsArray[i+2] = isGold ? 0.4 : 1;    // B
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));

const particlesMaterial = new THREE.PointsMaterial({
    size: 0.8,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// Animation Loop
let isPetals = false;
const clock = new THREE.Clock();

function animateParticles() {
    const elapsedTime = clock.getElapsedTime();
    
    // Default Star rotation
    particlesMesh.rotation.y = elapsedTime * 0.02;
    particlesMesh.rotation.x = elapsedTime * 0.01;

    // If transitioned to cherry blossoms, simulate falling wind
    if(isPetals) {
        const positions = particlesGeometry.attributes.position.array;
        for(let i = 1; i < particlesCount * 3; i+=3) {
            positions[i] -= 0.1; // Fall down
            positions[i-1] += Math.sin(elapsedTime + i) * 0.05; // Wind X
            if(positions[i] < -200) { positions[i] = 200; } // Reset Y
        }
        particlesGeometry.attributes.position.needsUpdate = true;
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animateParticles);
}
animateParticles();

// Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


// 4. Scene Orchestration (The Director)
function switchScene(fromId, toId) {
    const fromEl = document.getElementById(fromId);
    const toEl = document.getElementById(toId);
    
    gsap.to(fromEl, { opacity: 0, duration: 1.5, onComplete: () => {
        fromEl.classList.remove('active-scene');
        fromEl.style.visibility = 'hidden';
        toEl.classList.add('active-scene');
        toEl.style.visibility = 'visible';
        gsap.to(toEl, { opacity: 1, duration: 1.5 });
    }});
}

// -- SCENE 1: MAKE A WISH --
const typedWish = new Typed('#wish-text', {
    strings: ["Before you continue...^1000", "Close your eyes.^1000", "Make a wish."],
    typeSpeed: 50,
    showCursor: false,
    onComplete: () => {
        const btn = document.getElementById('shooting-star-btn');
        btn.classList.remove('hidden');
        gsap.fromTo(btn, {opacity: 0, y: 20}, {opacity: 1, y: 0, duration: 1, delay: 0.5});
    }
});

document.getElementById('shooting-star-btn').addEventListener('click', () => {
    // Play Audio
    audio.play();
    fadeAudio(0.2, 3); // Gently fade to 20%

    // WebGL Magic Burst Effect
    gsap.to(particlesMesh.scale, { x: 3, y: 3, z: 3, duration: 2, ease: "power2.in" });
    gsap.to(camera.position, { z: 50, duration: 2, ease: "power2.inOut" });

    // Transition to Scene 2
    setTimeout(() => {
        switchScene('scene-1', 'scene-2');
        runStorybook();
        // Reset camera scale for next scenes
        gsap.to(particlesMesh.scale, { x: 1, y: 1, z: 1, duration: 3 });
    }, 2000);
});

// -- SCENE 2: STORYBOOK --
function runStorybook() {
    const pages = document.querySelectorAll('.page');
    const texts = [
        "Every story begins with a stranger.",
        "Some strangers become friends.",
        "Some friends become the reason you smile.",
        "And this is where my story changed."
    ];

    // Setup initial 3D positions
    gsap.set(pages, { rotationY: 0, zIndex: (i, target, targets) => targets.length - i });

    let tl = gsap.timeline();

    pages.forEach((page, index) => {
        let pText = page.querySelector('.type-target');
        
        tl.call(() => {
            new Typed(pText, { strings: [texts[index]], typeSpeed: 40, showCursor: false });
        }, null, `+=${index === 0 ? 1 : 2.5}`) // Wait for previous text
        
        // Flip page if not the last one
        if(index < pages.length - 1) {
            tl.to(page, { 
                rotationY: -160, 
                duration: 1.8, 
                ease: "power2.inOut",
                delay: 2.5
            });
        }
    });

    // End Storybook
    tl.to('.book', { scale: 0.8, opacity: 0, duration: 2, delay: 3, onComplete: () => {
        switchScene('scene-2', 'scene-3');
        runConstellations();
    }});
}

// -- SCENE 3: CONSTELLATIONS --
function runConstellations() {
    const words = ['#cw-1', '#cw-2', '#cw-3', '#cw-4'];
    let tl = gsap.timeline();

    words.forEach(word => {
        tl.to(word, { opacity: 1, y: 0, duration: 1.5, ease: "power1.out" })
          .to(word, { opacity: 0, duration: 1, delay: 1.5 });
    });

    tl.call(() => {
        const heart = document.querySelector('.glowing-heart');
        heart.classList.remove('hidden');
        gsap.fromTo(heart, {scale: 0, opacity: 0}, {scale: 1, opacity: 1, duration: 2, ease: "elastic.out(1, 0.5)"});
        
        // Pulse heartbeat
        gsap.to(heart, {scale: 1.1, repeat: 3, yoyo: true, duration: 0.6, delay: 2});

        setTimeout(() => {
            gsap.to(heart, {opacity: 0, scale: 3, filter: "blur(10px)", duration: 1.5});
            switchScene('scene-3', 'scene-4');
            runCherryBlossoms();
        }, 4500);
    });
}

// -- SCENE 4: CHERRY BLOSSOMS --
function runCherryBlossoms() {
    // Transform Stars to Petals (Three.js modification)
    isPetals = true;
    const colors = particlesGeometry.attributes.color.array;
    for(let i = 0; i < colors.length; i+=3) {
        colors[i] = 0.97;   // R (#F8BBD0 approx)
        colors[i+1] = 0.73; // G
        colors[i+2] = 0.81; // B
    }
    particlesGeometry.attributes.color.needsUpdate = true;
    particlesMaterial.size = 1.5;

    // Text Animation
    const texts = document.querySelectorAll('.blossom-text');
    let tl = gsap.timeline();

    texts.forEach(text => {
        tl.to(text, { opacity: 1, y: 0, duration: 1.5, ease: "power1.out" })
          .to(text, { opacity: 0, duration: 1, delay: 1.5 });
    });

    tl.call(() => {
        switchScene('scene-4', 'scene-5');
        runProposal();
    });
}

// -- SCENE 5: THE PROPOSAL --
function runProposal() {
    fadeAudio(0.4, 2); // Increase volume slightly
    
    let tl = gsap.timeline();
    const preQ = document.querySelectorAll('.pre-question');
    
    tl.to(preQ[0], { opacity: 1, y: 0, duration: 1.5 })
      .to(preQ[0], { opacity: 0, duration: 1, delay: 1 })
      .to(preQ[1], { opacity: 1, y: 0, duration: 1.5 })
      .to(preQ[1], { opacity: 0, duration: 1, delay: 1 })
      .call(() => {
          const mainTitle = document.querySelector('.main-proposal');
          const btns = document.querySelector('.button-group');
          
          mainTitle.classList.remove('hidden');
          btns.classList.remove('hidden');
          
          gsap.fromTo(mainTitle, {opacity: 0, scale: 0.9}, {opacity: 1, scale: 1, duration: 2, ease: "power3.out"});
          gsap.fromTo(btns, {opacity: 0, y: 20}, {opacity: 1, y: 0, duration: 1.5, delay: 1});
      });

    // Button Logic
    document.getElementById('btn-yes').addEventListener('click', triggerCelebration);
    
    // Cute UX trick for the "Time" button
    document.getElementById('btn-time').addEventListener('mouseenter', function() {
        gsap.to(this, { x: (Math.random() - 0.5) * 100, y: (Math.random() - 0.5) * 50, duration: 0.3 });
    });
}

function triggerCelebration() {
    fadeAudio(0.8, 3); // Emotional peak volume
    
    // Hide buttons, show final message
    gsap.to('.button-group', {opacity: 0, duration: 1});
    const finalMsg = document.getElementById('final-message');
    finalMsg.classList.remove('hidden');
    gsap.fromTo(finalMsg, {opacity: 0, y: 20}, {opacity: 1, y: 0, duration: 2, delay: 1});

    // Camera zooms out
    gsap.to(camera.position, { z: 150, duration: 5, ease: "power1.inOut" });

    // Confetti / Fireworks (using canvas-confetti)
    const duration = 15 * 1000;
    const end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#FFD166', '#F8BBD0', '#FFFFFF']
        });
        confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#FFD166', '#F8BBD0', '#FFFFFF']
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}
