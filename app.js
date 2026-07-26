/** 
 * GLOBALS & CONFIG
 */
const videoElement = document.querySelector('.input_video');
const mainCanvas = document.getElementById('mainCanvas');
const ctx = mainCanvas.getContext('2d');

let width = window.innerWidth;
let height = window.innerHeight;

let time = 0;
let lastTime = performance.now();
let framesThisSecond = 0;
let lastFpsTime = performance.now();

let currentHands = []; 
const FINGER_TIPS = [4, 8, 12, 16, 20];
const GESTURE_LOCK_FRAMES = 2;

let activeGesture = "Calibrating...";
let activeHandForEffects = null;
let gestureCandidate = "Idle";
let gestureCandidateFrames = 0;

// Refined Palette
let currentTheme = 'Cosmic';
const themes = {
    'Cosmic':     (t, index, total) => `hsl(${260 + Math.sin(t + index)*60}, 100%, 70%)`,
    'Boreal':     (t, index, total) => `hsl(${140 + index * 20}, 90%, 65%)`,
    'Heat':       (t, index, total) => `hsl(${(10 + (index * 15)) % 50}, 100%, 60%)`,
    'Monochrome': (t, index, total) => `hsl(0, 0%, ${70 + (index%2)*30}%)`
};

// UI Elements
const uiHands = document.getElementById('ui-hands');
const uiFps = document.getElementById('ui-fps');
const uiGesture = document.getElementById('ui-gesture');
const uiSpread = document.getElementById('ui-spread');

/**
 * INITIALIZATION
 */
function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    mainCanvas.width = width;
    mainCanvas.height = height;
}
window.addEventListener('resize', resize);
resize();

// UI Theme Switcher
document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentTheme = e.target.getAttribute('data-theme');
        document.documentElement.style.setProperty('--accent', themes[currentTheme](0, 1, 1));
    });
});

// Start Hook
document.getElementById('startBtn').addEventListener('click', () => {
    document.getElementById('startOverlay').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
    document.getElementById('themes').classList.remove('hidden');
    initMediaPipe();
    requestAnimationFrame(renderLoop);
});

/**
 * MATH LOGIC
 */
function getDist(p1, p2) {
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

function mapToCanvas(point) {
    return { x: point.x * width, y: point.y * height };
}

function detectGestures() {
    if (!currentHands.length) {
        activeGesture = "Searching...";
        activeHandForEffects = null;
        gestureCandidate = "Idle";
        gestureCandidateFrames = 0;
        uiGesture.innerText = activeGesture;
        uiSpread.innerText = '0%';
        return;
    }
    
    let primaryGesture = "Idle";
    const h1 = currentHands[0];
    const wrist = h1[0];
    
    // Spread calculation
    const spread = getDist(h1[8], h1[20]);
    let spreadPct = Math.min(Math.round(spread * 300), 100);
    uiSpread.innerText = spreadPct + '%';

    // Extend Analysis
    const isExt = (tipIdx, pipIdx) => getDist(h1[tipIdx], wrist) > getDist(h1[pipIdx], wrist) * 1.2;
    const thumbExt = isExt(4, 2); 
    const indexExt = isExt(8, 6);
    const middleExt = isExt(12, 10);
    const ringExt = isExt(16, 14);
    const pinkyExt = isExt(20, 18);
    
    if (thumbExt && !indexExt && !middleExt && !ringExt && !pinkyExt) primaryGesture = "Thumbs Up";
    else if (!thumbExt && indexExt && middleExt && !ringExt && !pinkyExt) primaryGesture = "Peace Sign";
    else if (indexExt && middleExt && ringExt && pinkyExt) primaryGesture = "Open Palm";
    else if (!thumbExt && !indexExt && !middleExt && !ringExt && !pinkyExt) primaryGesture = "Closed Fist";

    // Pinch 
    if (getDist(h1[4], h1[8]) < 0.05) primaryGesture = "Pinching";
    
    // Two hand interactions
    if (currentHands.length === 2) {
        if (getDist(currentHands[0][0], currentHands[1][0]) < 0.1 && indexExt) {
            primaryGesture = "Clapping";
        }
    }
    
    if (primaryGesture === gestureCandidate) {
        gestureCandidateFrames++;
    } else {
        gestureCandidate = primaryGesture;
        gestureCandidateFrames = 1;
    }

    if (gestureCandidateFrames >= GESTURE_LOCK_FRAMES || primaryGesture === "Pinching" || primaryGesture === "Clapping") {
        activeGesture = primaryGesture;
    }

    activeHandForEffects = h1;
    uiGesture.innerText = activeGesture;
}

function drawThumbsUpEffect(hand) {
    if (!hand) return;

    const thumbTip = mapToCanvas(hand[4]);
    const wrist = mapToCanvas(hand[0]);
    const palm = mapToCanvas(hand[9]);
    const centerX = (wrist.x + palm.x) * 0.5;
    const centerY = (wrist.y + palm.y) * 0.5;

    const pulse = 0.65 + 0.35 * Math.sin(time * 11);
    const auraRadius = 45 + 18 * pulse;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    const aura = ctx.createRadialGradient(centerX, centerY, 4, centerX, centerY, auraRadius);
    aura.addColorStop(0, `hsla(45, 100%, 70%, ${0.55 * pulse})`);
    aura.addColorStop(0.55, `hsla(200, 100%, 65%, ${0.25 * pulse})`);
    aura.addColorStop(1, 'hsla(260, 100%, 65%, 0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(centerX, centerY, auraRadius, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 7; i++) {
        const angle = time * 2.6 + i * (Math.PI * 2 / 7);
        const dist = 22 + 10 * Math.sin(time * 6 + i);
        const x = thumbTip.x + Math.cos(angle) * dist;
        const y = thumbTip.y + Math.sin(angle) * dist;
        const r = 1.8 + 1.6 * pulse;

        ctx.fillStyle = themes[currentTheme](time + i * 0.5, i, 7);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    const beam = ctx.createLinearGradient(wrist.x, wrist.y, thumbTip.x, thumbTip.y);
    beam.addColorStop(0, 'rgba(255,255,255,0)');
    beam.addColorStop(0.45, 'rgba(255,255,255,0.45)');
    beam.addColorStop(1, 'rgba(255,230,140,0.95)');
    ctx.strokeStyle = beam;
    ctx.lineWidth = 3 + pulse;
    ctx.beginPath();
    ctx.moveTo(wrist.x, wrist.y);
    ctx.lineTo(thumbTip.x, thumbTip.y);
    ctx.stroke();

    ctx.fillStyle = '#fff7c9';
    ctx.beginPath();
    ctx.arc(thumbTip.x, thumbTip.y, 4 + 3 * pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

/**
 * RENDER PIPELINE
 */
function renderLoop(timestamp) {
    requestAnimationFrame(renderLoop);
    
    let dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;
    time += dt;

    // FPS Loop
    framesThisSecond++;
    if (timestamp > lastFpsTime + 1000) {
        uiFps.innerText = framesThisSecond + ' fps';
        framesThisSecond = 0;
        lastFpsTime = timestamp;
    }

    // Clean canvas entirely every frame (No more ghosting trails or matrix drops)
    ctx.clearRect(0, 0, width, height);

    if (currentHands.length > 0) {
        
        // 1. Draw Skeleton Nodes
        currentHands.forEach((hand, handIndex) => {
            const glowColor = themes[currentTheme](time, handIndex, 2);
            
            drawConnectors(ctx, hand, HAND_CONNECTIONS, {
                color: 'rgba(255,255,255,0.15)',
                lineWidth: 1
            });
            
            FINGER_TIPS.forEach((tipIndex, idx) => {
                const pt = mapToCanvas(hand[tipIndex]);
                const tipCol = themes[currentTheme](time, idx, FINGER_TIPS.length);
                
                // Outer glow dot
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
                ctx.fillStyle = tipCol;
                ctx.fill();
                
                // Inner pure core
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, 1.5, 0, Math.PI * 2);
                ctx.fillStyle = '#fff';
                ctx.fill();
            });
        });

        // 2. Connect precisely between the hands (The Core Feature)
        if (currentHands.length >= 2) {
            const h1 = currentHands[0];
            const h2 = currentHands[1];

            FINGER_TIPS.forEach((tipIndex, idx) => {
                const pt1 = mapToCanvas(h1[tipIndex]);
                const pt2 = mapToCanvas(h2[tipIndex]);
                
                // Draw elegant connecting beam
                ctx.beginPath();
                ctx.moveTo(pt1.x, pt1.y);
                ctx.lineTo(pt2.x, pt2.y);
                
                let grad = ctx.createLinearGradient(pt1.x, pt1.y, pt2.x, pt2.y);
                grad.addColorStop(0, themes[currentTheme](time, idx, 5));
                grad.addColorStop(1, themes[currentTheme](time, idx + 2, 5));
                
                ctx.strokeStyle = grad;
                ctx.lineWidth = 2.5; // Thinner, sharper lines
                ctx.stroke();
            });
        }
        
    }

    detectGestures();

    if (activeGesture === "Thumbs Up" && activeHandForEffects) {
        drawThumbsUpEffect(activeHandForEffects);
    }
}

/**
 * MEDIAPIPE CORE
 */
function initMediaPipe() {
    const hands = new Hands({locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }});

    hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 0, // Lite Model for Top FPS
        minDetectionConfidence: 0.45,
        minTrackingConfidence: 0.45
    });

    hands.onResults((results) => {
        uiHands.innerText = results.multiHandLandmarks ? results.multiHandLandmarks.length : '0';
        currentHands = results.multiHandLandmarks || [];
    });

    const camera = new Camera(videoElement, {
        onFrame: async () => {
            await hands.send({image: videoElement});
        },
        width: 960,
        height: 540,
        facingMode: 'user'
    });
    
    camera.start();
}
