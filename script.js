document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const mass1Input = document.getElementById('mass1');
    const mass2Input = document.getElementById('mass2');
    const width1Input = document.getElementById('width1');
    const width2Input = document.getElementById('width2');
    const height1Input = document.getElementById('height1');
    const height2Input = document.getElementById('height2');
    const piModeSelect = document.getElementById('piMode');
    const collideBtn = document.getElementById('collideBtn');
    const stopBtn = document.getElementById('stopBtn');
    const collisionCountEl = document.getElementById('collisionCount');
    const impactForceEl = document.getElementById('impactForce');
    const massRatioEl = document.getElementById('massRatio');
    const piDigitsEl = document.getElementById('piDigits');
    const explanationEl = document.getElementById('explanation');
    
    let collisionCount = 0;
    let animationId = null;
    let isRunning = false;
    let audioInitialized = false;
    
    let audioContext;
    
    function initAudio() {
        if (!audioInitialized) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            audioInitialized = true;
        }
    }
    
    const wallThickness = 4;
    
    const block1 = {
        x: 100,
        y: 20,
        width: parseInt(width1Input.value),
        height: parseInt(height1Input.value),
        mass: parseFloat(mass1Input.value),
        vx: 0,
        color: '#1976d2'
    };
    
    const block2 = {
        x: canvas.width - 100 - parseInt(width2Input.value),
        y: 20,
        width: parseInt(width2Input.value),
        height: parseInt(height2Input.value),
        mass: parseFloat(mass2Input.value),
        vx: 0,
        color: '#0d47a1'
    };
    
    function drawWalls() {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, wallThickness, canvas.height);
        ctx.fillRect(canvas.width - wallThickness, 0, wallThickness, canvas.height);
    }
    
    function drawBlock(block) {
        const gradient = ctx.createLinearGradient(block.x, block.y, block.x, block.y + block.height);
        gradient.addColorStop(0, '#64b5f6');
        gradient.addColorStop(1, block.color);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(block.x, block.y, block.width, block.height);
        
        ctx.strokeStyle = '#0d47a1';
        ctx.lineWidth = 2;
        ctx.strokeRect(block.x, block.y, block.width, block.height);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${block.mass} kg`, block.x + block.width / 2, block.y + block.height / 2);
    }
    
    function playCollisionSound(force) {
        if (!audioInitialized) return;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 150 + (force * 2);
        oscillator.type = 'sine';
        
        gainNode.gain.value = Math.min(0.3, force / 100);
        
        oscillator.start();
        
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
        
        oscillator.stop(audioContext.currentTime + 0.2);
    }
    
    function checkBlockCollision() {
        return block1.x + block1.width >= block2.x && 
               block1.x <= block2.x + block2.width &&
               block1.y + block1.height >= block2.y && 
               block1.y <= block2.y + block2.height;
    }
    
    function checkWallCollision(block) {
        return block.x <= wallThickness || 
               block.x + block.width >= canvas.width - wallThickness;
    }
    
    function calculateImpactForce(m1, v1, m2, v2) {
        const relativeVelocity = Math.abs(v1 - v2);
        const reducedMass = (m1 * m2) / (m1 + m2);
        return Math.round(reducedMass * relativeVelocity * 10);
    }
    
    function handleCollision() {
        const totalMass = block1.mass + block2.mass;
        const newV1 = ((block1.mass - block2.mass) * block1.vx + 2 * block2.mass * block2.vx) / totalMass;
        const newV2 = ((block2.mass - block1.mass) * block2.vx + 2 * block1.mass * block1.vx) / totalMass;
        
        block1.vx = newV1;
        block2.vx = newV2;
        
        const overlap = (block1.x + block1.width) - block2.x;
        block1.x -= overlap / 2;
        block2.x += overlap / 2;
        
        const impactForce = calculateImpactForce(block1.mass, block1.vx, block2.mass, block2.vx);
        impactForceEl.textContent = impactForce;
        
        playCollisionSound(impactForce);
        
        collisionCount++;
        collisionCountEl.textContent = collisionCount;
    }
    
    function handleWallCollision(block) {
        if (block.x <= wallThickness) {
            block.x = wallThickness;
            block.vx = -block.vx;
        } else if (block.x + block.width >= canvas.width - wallThickness) {
            block.x = canvas.width - wallThickness - block.width;
            block.vx = -block.vx;
        }
        
        const impactForce = Math.abs(block.vx * block.mass * 10);
        impactForceEl.textContent = impactForce;
        
        playCollisionSound(impactForce);
        
        collisionCount++;
        collisionCountEl.textContent = collisionCount;
    }
    
    function update() {
        if (!isRunning) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        drawWalls();
        
        const maxDisplacement = 15;
        const maxVel = Math.max(Math.abs(block1.vx), Math.abs(block2.vx));
        const steps = Math.ceil(maxVel / maxDisplacement);
        const dt = 1 / steps;
        
        for (let i = 0; i < steps; i++) {
            block1.x += block1.vx * dt;
            block2.x += block2.vx * dt;
            
            if (checkWallCollision(block1)) {
                handleWallCollision(block1);
            }
            if (checkWallCollision(block2)) {
                handleWallCollision(block2);
            }
            
            if (checkBlockCollision()) {
                handleCollision();
            }
        }
        
        drawBlock(block1);
        drawBlock(block2);
        
        if (Math.abs(block1.vx) > 0.01 || Math.abs(block2.vx) > 0.01) {
            animationId = requestAnimationFrame(update);
        } else {
            isRunning = false;
            collideBtn.textContent = "Start Simulation";
            
            if (piModeSelect.value !== "0") {
                const expectedCollisions = getExpectedCollisions(parseInt(piModeSelect.value));
                setTimeout(() => {
                    alert(`Simulation complete!\n\nActual collisions: ${collisionCount}\nExpected (π digits): ${expectedCollisions}\n\nMass ratio: ${massRatioEl.textContent}`);
                }, 500);
            }
        }
    }
    
    function getExpectedCollisions(mode) {
        switch(mode) {
            case 1: return 3;
            case 2: return 31;
            case 3: return 314;
            default: return 0;
        }
    }
    
    function updateExplanation() {
        const mass1 = parseFloat(mass1Input.value);
        const mass2 = parseFloat(mass2Input.value);
        const massRatio = mass1 / mass2;
        const piMode = parseInt(piModeSelect.value);
        
        let explanation = '<h3>Physics Explanation</h3>';
        
        if (piMode !== 0) {
            const expectedCollisions = getExpectedCollisions(piMode);
            const power = Math.pow(100, piMode);
            
            explanation += `<p>You've selected the <span class="scientific-term">Pi Phenomenon</span> mode with a mass ratio of <span class="highlight">${power}:1</span>. `;
            explanation += `This specific ratio creates <span class="scientific-term">elastic collisions</span> that will produce approximately <span class="highlight">${expectedCollisions}</span> total collisions, `;
            explanation += `corresponding to the first ${piMode+1} digits of π.</p>`;
            
            explanation += `<p>The physics behind this phenomenon involves <span class="scientific-term">conservation of momentum</span> and <span class="scientific-term">conservation of kinetic energy</span>. `;
            explanation += `When Block 1 (${mass1} kg) collides with Block 2 (${mass2} kg), momentum transfer occurs according to the equation:</p>`;
            
            explanation += `<div class="formula">v₁' = ((m₁ - m₂)v₁ + 2m₂v₂) / (m₁ + m₂)</div>`;
            
            explanation += `<p>Due to the extreme mass difference, Block 2 will bounce back with nearly its original speed while Block 1 gains a small velocity. `;
            explanation += `This creates multiple collisions as Block 2 oscillates between Block 1 and the wall.</p>`;
            
            explanation += `<p>The <span class="scientific-term">heavy block movement</span> you observe is physically correct - even massive objects move when momentum is transferred. `;
            explanation += `Each collision imparts a small velocity change of approximately <span class="highlight">${(2 * mass2 / (mass1 + mass2)).toFixed(6)}</span> times Block 2's velocity.</p>`;
        } else {
            explanation += `<p>You've configured a custom simulation with Block 1 at <span class="highlight">${mass1} kg</span> and Block 2 at <span class="highlight">${mass2} kg</span>, `;
            explanation += `creating a mass ratio of <span class="highlight">${massRatio.toFixed(2)}:1</span>.</p>`;
            
            if (massRatio > 100) {
                explanation += `<p>With this significant mass difference, you'll observe the <span class="scientific-term">Pi Phenomenon</span> behavior. `;
                explanation += `Block 2 will undergo multiple collisions between Block 1 and the wall before Block 1 moves away sufficiently.</p>`;
                
                explanation += `<p>The number of collisions will be approximately <span class="highlight">${Math.floor(Math.PI * Math.sqrt(massRatio))}</span>, `;
                explanation += `following the relationship: collisions ≈ π√(M/m).</p>`;
            } else if (massRatio > 10) {
                explanation += `<p>This moderate mass ratio will produce several collisions. Block 1 will move noticeably with each impact, `;
                explanation += `while Block 2 bounces back with reduced velocity due to <span class="scientific-term">momentum transfer</span>.</p>`;
            } else {
                explanation += `<p>With similar masses, both blocks will exchange velocities significantly during collisions. `;
                explanation += `This demonstrates <span class="scientific-term">Newton's Third Law</span> - equal and opposite reaction forces.</p>`;
            }
            
            explanation += `<p>The collision dynamics follow <span class="scientific-term">elastic collision</span> principles where both momentum and kinetic energy are conserved. `;
            explanation += `The velocity after collision for each block is determined by:</p>`;
            
            explanation += `<div class="formula">v₁' = ((m₁ - m₂)v₁ + 2m₂v₂) / (m₁ + m₂)<br>`;
            explanation += `v₂' = ((m₂ - m₁)v₂ + 2m₁v₁) / (m₁ + m₂)</div>`;
        }
        
        explanation += `<p>The <span class="scientific-term">impact force</span> displayed is calculated using the <span class="scientific-term">reduced mass</span> concept: `;
        explanation += `F = μ × Δv, where μ = (m₁ × m₂) / (m₁ + m₂).</p>`;
        
        explanationEl.innerHTML = explanation;
    }
    
    function startCollision() {
        if (isRunning) return;
        
        initAudio();
        
        isRunning = true;
        collideBtn.textContent = "Running...";
        
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        
        block1.width = parseInt(width1Input.value);
        block1.height = parseInt(height1Input.value);
        block2.width = parseInt(width2Input.value);
        block2.height = parseInt(height2Input.value);
        
        block1.x = 100;
        block2.x = canvas.width - 100 - block2.width;
        
        if (piModeSelect.value !== "0") {
            const mode = parseInt(piModeSelect.value);
            const ratio = Math.pow(100, mode);
            block1.mass = ratio;
            block2.mass = 1;
            mass1Input.value = ratio;
            mass2Input.value = 1;
            massRatioEl.textContent = ratio;
            
            block1.vx = 2;
            block2.vx = 0;
        } else {
            block1.mass = parseFloat(mass1Input.value);
            block2.mass = parseFloat(mass2Input.value);
            massRatioEl.textContent = (block1.mass / block2.mass).toFixed(2);
            
            block1.vx = 3;
            block2.vx = -2;
        }
        
        collisionCount = 0;
        collisionCountEl.textContent = collisionCount;
        impactForceEl.textContent = 0;
        
        updateExplanation();
        
        update();
    }
    
    function stopSimulation() {
        isRunning = false;
        collideBtn.textContent = "Start Simulation";
        
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        
        block1.x = 100;
        block2.x = canvas.width - 100 - block2.width;
        block1.vx = 0;
        block2.vx = 0;
        
        collisionCount = 0;
        collisionCountEl.textContent = collisionCount;
        impactForceEl.textContent = 0;
        
        updateExplanation();
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawWalls();
        drawBlock(block1);
        drawBlock(block2);
    }
    
    collideBtn.addEventListener('click', startCollision);
    stopBtn.addEventListener('click', stopSimulation);
    
    [mass1Input, mass2Input, width1Input, width2Input, height1Input, height2Input, piModeSelect].forEach(input => {
        input.addEventListener('input', updateExplanation);
        input.addEventListener('change', updateExplanation);
    });
    
    piModeSelect.addEventListener('change', function() {
        if (this.value !== "0") {
            const mode = parseInt(this.value);
            const ratio = Math.pow(100, mode);
            mass1Input.value = ratio;
            mass2Input.value = 1;
            massRatioEl.textContent = ratio;
            
            if (mode === 1) piDigitsEl.textContent = "3.14";
            else if (mode === 2) piDigitsEl.textContent = "3.1415926535";
            else if (mode === 3) piDigitsEl.textContent = "3.14159265358979";
        }
        updateExplanation();
    });
    
    drawWalls();
    drawBlock(block1);
    drawBlock(block2);
    updateExplanation();
});