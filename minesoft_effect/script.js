const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particlesArray = [];

// Handle mouse
const mouse = {
    x: null,
    y: null,
    radius: 100, // Reduced radius for "local" feel
    speed: 0
}

let lastMouseX = 0;
let lastMouseY = 0;

window.addEventListener('mousemove', function (event) {
    mouse.x = event.x;
    mouse.y = event.y;

    // Calculate speed approx
    const dx = mouse.x - lastMouseX;
    const dy = mouse.y - lastMouseY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    mouse.speed = distance;

    lastMouseX = mouse.x;
    lastMouseY = mouse.y;
});

window.addEventListener('mouseout', function () {
    mouse.x = null;
    mouse.y = null;
});

ctx.textAlign = 'center';
ctx.textBaseline = 'middle';

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 1.5;
        this.baseX = x;
        this.baseY = y;
        this.density = (Math.random() * 10) + 5; // Mass/Weight

        // Physics properties
        this.vx = 0;
        this.vy = 0;
        this.friction = 0.95; // Damping 
        this.returnSpeed = 0.05; // Spring strength to return
    }
    draw() {
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }
    update() {
        // 1. Calculate Mouse Interaction (Repulsion)
        let dx = this.x - mouse.x; // Vector pointing AWAY from mouse
        let dy = this.y - mouse.y;

        // Important: check mouse presence first
        if (mouse.x != null) {
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouse.radius) {
                // Force Direction
                let forceDirectionX = dx / distance;
                let forceDirectionY = dy / distance;

                // Force Strength: closer = stronger
                // Also scale by mouse speed for "impact"
                let force = (mouse.radius - distance) / mouse.radius;
                let speedFactor = 1 + (mouse.speed * 0.2); // Boost force if moving fast

                // Explode outwards
                // This is an IMPULSE force added to velocity
                this.vx += forceDirectionX * force * this.density * speedFactor;
                this.vy += forceDirectionY * force * this.density * speedFactor;
            }
        }

        // 2. Return to Base (Spring Force)
        // Only pull back if we aren't being pushed hard? 
        // Or always pull back (spring).
        // Let's calculate vector to base
        let dxBase = this.baseX - this.x;
        let dyBase = this.baseY - this.y;

        // Apply spring force
        this.vx += dxBase * this.returnSpeed * 0.1; // * 0.1 to make it gentle acceleration
        this.vy += dyBase * this.returnSpeed * 0.1;

        // 3. Apply Velocity
        this.x += this.vx;
        this.y += this.vy;

        // 4. Apply Friction (Damping)
        this.vx *= this.friction;
        this.vy *= this.friction;

        // 5. Boundary Checks (Bounce)
        if (this.x < 0) {
            this.x = 0;
            this.vx *= -1; // Bounce
        }
        if (this.x > canvas.width) {
            this.x = canvas.width;
            this.vx *= -1;
        }
        if (this.y < 0) {
            this.y = 0;
            this.vy *= -1;
        }
        if (this.y > canvas.height) {
            this.y = canvas.height;
            this.vy *= -1;
        }
    }
}

function init() {
    particlesArray = [];

    // Adjust text size based on screen width
    let fontSize = Math.min(window.innerWidth / 6, 200);
    let offX = window.innerWidth / 2;
    let offY = window.innerHeight / 2;

    // Draw text to canvas first
    ctx.font = 'bold ' + fontSize + 'px Verdana';

    // Draw text to canvas first
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('MINESOFT', offX, offY);

    // Scan pixel data
    const gap = 3;
    const textCoordinates = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Clear the text immediately
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0, y2 = textCoordinates.height; y < y2; y += gap) {
        for (let x = 0, x2 = textCoordinates.width; x < x2; x += gap) {
            if (textCoordinates.data[(y * 4 * textCoordinates.width) + (x * 4) + 3] > 128) {
                let positionX = x;
                let positionY = y;
                particlesArray.push(new Particle(positionX, positionY));
            }
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Decay mouse speed
    mouse.speed *= 0.95;
    if (mouse.speed < 0.1) mouse.speed = 0;

    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].draw();
        particlesArray[i].update();
    }
    requestAnimationFrame(animate);
}

// Reset on resize
window.addEventListener('resize', function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init();
});

init();
animate();
