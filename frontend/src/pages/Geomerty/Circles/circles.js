const explanation = document.getElementById('explanation');
const formulas = document.getElementById('formulas'); // New reference to formulas div
const chord = document.getElementById('chord');
const arc = document.getElementById('arc');
const sector = document.getElementById('sector');
const tangent = document.getElementById('tangent');
const circle = document.getElementById('circle');

// Fixed circle center and base radius
const circleCenterX = 250;
const circleCenterY = 250;
const baseRadius = 150;

// Store current radius scale factor (1 = default size)
let radiusScale = 1;
let currentAnimation = null; // Track the current animation function

// Function to update radius and animate circle shape
function updateRadius() {
    const radius = baseRadius * radiusScale;
    if (circle) {
        gsap.to(circle, {
            attr: { r: radius },
            duration: 0.5,
            ease: "power2.out"
        });
    }
    return radius;
}

// Reset all elements with a fade transition
function resetElements(callback) {
    gsap.to([chord, arc, sector, tangent], {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: callback
    });
}

// Fade in explanation text
function showExplanation(text) {
    gsap.fromTo(explanation,
        { opacity: 0, y: 10 },
        {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
            onStart: () => {
                explanation.innerHTML = text;
            }
        }
    );
}

// Fade in formula text in the new container
function showFormula(text) {
    gsap.fromTo(formulas,
        { opacity: 0, y: 10 },
        {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
            onStart: () => {
                formulas.innerHTML = text;
            }
        }
    );
}

// ... (Keep your existing variable declarations) ...

// Function to show only the relevant controls
function showControls(activeClass) {
    const allControls = document.querySelectorAll('.controls-group');
    allControls.forEach(control => {
        if (control.classList.contains(activeClass)) {
            gsap.to(control, {
                opacity: 1,
                duration: 0.5,
                ease: "power2.out",
                onStart: () => {
                    control.style.display = 'block'; // Make visible
                }
            });
        } else {
            gsap.to(control, {
                opacity: 0,
                duration: 0.5,
                ease: "power2.in",
                onComplete: () => {
                    control.style.display = 'none'; // Hide after fade-out
                }
            });
        }
    });
}

// Chord Animation
function showChord() {
    const chordAngleInput = document.getElementById('chordAngle');
    const chordStartAngleInput = document.getElementById('chordStartAngle');
    const chordAngleValue = document.getElementById('chordAngleValue');
    const chordStartAngleValue = document.getElementById('chordStartAngleValue');

    function updateChord() {
        const radius = updateRadius();
        const chordAngleDeg = parseFloat(chordAngleInput.value);
        const chordStartAngleDeg = parseFloat(chordStartAngleInput.value);
        const chordAngleRad = chordAngleDeg * (Math.PI / 180);
        const startAngleRad = chordStartAngleDeg * (Math.PI / 180);
        const endAngleRad = startAngleRad + chordAngleRad;

        chordAngleValue.textContent = `${chordAngleDeg}°`;
        chordStartAngleValue.textContent = `${chordStartAngleDeg}°`;

        const startX = circleCenterX + radius * Math.cos(startAngleRad);
        const startY = circleCenterY + radius * Math.sin(startAngleRad);
        const endX = circleCenterX + radius * Math.cos(endAngleRad);
        const endY = circleCenterY + radius * Math.sin(endAngleRad);

        chord.setAttribute('x1', startX);
        chord.setAttribute('y1', startY);
        chord.setAttribute('x2', endX);
        chord.setAttribute('y2', endY);

        gsap.to(chord, {
            opacity: 1,
            duration: 0.5,
            ease: "power3.inOut",
            onComplete: () => {
                const chordLength = 2 * radius * Math.sin(chordAngleRad / 2);
                showExplanation("A <b>chord</b> is a straight line connecting two points on the circle.");
                showFormula(`
                    Formula: <b>c = 2r sin(θ/2)</b><br>
                    Current length: ${chordLength.toFixed(2)} units (r = ${radius}, θ = ${chordAngleDeg}°)
                `);
            }
        });
    }

    resetElements(() => {
        gsap.set(chord, { opacity: 0 });
        showControls('chord-controls'); // Show chord controls
        updateChord();
    });

    chordAngleInput.oninput = updateChord;
    chordStartAngleInput.oninput = updateChord;

    const sizeSlider = document.getElementById('sizeSlider');
    sizeSlider.oninput = (e) => {
        radiusScale = Math.max(0.5, Math.min(2, parseFloat(e.target.value)));
        updateRadius();
        updateChord();
    };

    currentAnimation = updateChord;
}

// Arc Animation
function showArc() {
    const arcAngleInput = document.getElementById('arcAngle');
    const arcStartAngleInput = document.getElementById('arcStartAngle');
    const arcAngleValue = document.getElementById('arcAngleValue');
    const arcStartAngleValue = document.getElementById('arcStartAngleValue');

    function updateArc() {
        const radius = updateRadius();
        const arcAngleDeg = parseFloat(arcAngleInput.value);
        const arcStartAngleDeg = parseFloat(arcStartAngleInput.value);
        const arcAngleRad = arcAngleDeg * (Math.PI / 180);
        const startAngleRad = arcStartAngleDeg * (Math.PI / 180);
        const endAngleRad = startAngleRad + arcAngleRad;

        arcAngleValue.textContent = `${arcAngleDeg}°`;
        arcStartAngleValue.textContent = `${arcStartAngleDeg}°`;

        const startX = circleCenterX + radius * Math.cos(startAngleRad);
        const startY = circleCenterY + radius * Math.sin(startAngleRad);
        const endX = circleCenterX + radius * Math.cos(endAngleRad);
        const endY = circleCenterY + radius * Math.sin(endAngleRad);

        const largeArcFlag = arcAngleDeg > 180 ? 1 : 0;
        const d = `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;

        arc.setAttribute('d', d);

        const arcLength = arc.getTotalLength();
        gsap.set(arc, { strokeDasharray: arcLength, strokeDashoffset: arcLength });
        gsap.to(arc, {
            strokeDashoffset: 0,
            opacity: 1,
            duration: 0.5,
            ease: "power3.out",
            onComplete: () => {
                const arcLengthCalc = radius * arcAngleRad;
                showExplanation("An <b>arc</b> is a part of the circle's circumference between two points.");
                showFormula(`
                    Formula: <b>L = rθ</b><br>
                    Current length: ${arcLengthCalc.toFixed(2)} units (r = ${radius}, θ = ${arcAngleDeg}°)
                `);
            }
        });
    }

    resetElements(() => {
        gsap.set(arc, { opacity: 0 });
        showControls('arc-controls'); // Show arc controls
        updateArc();
    });

    arcAngleInput.oninput = updateArc;
    arcStartAngleInput.oninput = updateArc;

    const sizeSlider = document.getElementById('sizeSlider');
    sizeSlider.oninput = (e) => {
        radiusScale = Math.max(0.5, Math.min(2, parseFloat(e.target.value)));
        updateRadius();
        updateArc();
    };

    currentAnimation = updateArc;
}

// Sector Animation
function showSector() {
    const sectorAngleInput = document.getElementById('sectorAngle');
    const startAngleInput = document.getElementById('startAngle');
    const sectorAngleValue = document.getElementById('sectorAngleValue');
    const startAngleValue = document.getElementById('startAngleValue');

    function updateSector() {
        const radius = updateRadius();
        const sectorAngleDeg = parseFloat(sectorAngleInput.value);
        const startAngleDeg = parseFloat(startAngleInput.value);
        const sectorAngleRad = sectorAngleDeg * (Math.PI / 180);
        const startAngleRad = startAngleDeg * (Math.PI / 180);
        const endAngleRad = startAngleRad + sectorAngleRad;

        sectorAngleValue.textContent = `${sectorAngleDeg}°`;
        startAngleValue.textContent = `${startAngleDeg}°`;

        const startX = circleCenterX + radius * Math.cos(startAngleRad);
        const startY = circleCenterY + radius * Math.sin(startAngleRad);
        const endX = circleCenterX + radius * Math.cos(endAngleRad);
        const endY = circleCenterY + radius * Math.sin(endAngleRad);

        const largeArcFlag = sectorAngleDeg > 180 ? 1 : 0;
        const d = `M ${circleCenterX} ${circleCenterY} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;

        sector.setAttribute('d', d);

        gsap.to(sector, {
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
            onComplete: () => {
                const sectorArea = (1 / 2) * radius * radius * sectorAngleRad;
                showExplanation("A <b>sector</b> is a 'pie slice' of the circle, enclosed by two radii and an arc.");
                showFormula(`
                    Formula: <b>A = ½ r²θ</b><br>
                    Current area: ${sectorArea.toFixed(2)} square units (r = ${radius}, θ = ${sectorAngleDeg}°)
                `);
            }
        });
    }

    resetElements(() => {
        gsap.set(sector, { opacity: 0 });
        showControls('sector-controls'); // Show sector controls
        updateSector();
    });

    sectorAngleInput.oninput = updateSector;
    startAngleInput.oninput = updateSector;

    const sizeSlider = document.getElementById('sizeSlider');
    sizeSlider.oninput = (e) => {
        radiusScale = Math.max(0.5, Math.min(2, parseFloat(e.target.value)));
        updateRadius();
        updateSector();
    };

    currentAnimation = updateSector;
}

// Tangent Animation
function showTangent() {
    const tangentAngleInput = document.getElementById('tangentAngle');
    const tangentLengthInput = document.getElementById('tangentLength');
    const tangentAngleValue = document.getElementById('tangentAngleValue');
    const tangentLengthValue = document.getElementById('tangentLengthValue');

    function updateTangent() {
        const radius = updateRadius();
        const tangentAngleDeg = parseFloat(tangentAngleInput.value);
        const tangentLength = parseFloat(tangentLengthInput.value);
        const tangentAngleRad = tangentAngleDeg * (Math.PI / 180);

        tangentAngleValue.textContent = `${tangentAngleDeg}°`;
        tangentLengthValue.textContent = `${tangentLength}`;

        const tangentX = circleCenterX + radius * Math.cos(tangentAngleRad);
        const tangentY = circleCenterY + radius * Math.sin(tangentAngleRad);

        const tangentDirX = -Math.sin(tangentAngleRad);
        const tangentDirY = Math.cos(tangentAngleRad);

        const halfLength = tangentLength / 2;
        const startX = tangentX + tangentDirX * halfLength;
        const startY = tangentY + tangentDirY * halfLength;
        const endX = tangentX - tangentDirX * halfLength;
        const endY = tangentY - tangentDirY * halfLength;

        tangent.setAttribute('x1', startX);
        tangent.setAttribute('y1', startY);
        tangent.setAttribute('x2', endX);
        tangent.setAttribute('y2', endY);

        gsap.to(tangent, {
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
            onComplete: () => {
                showExplanation("A <b>tangent</b> is a line that touches the circle at one point, perpendicular to the radius.");
                showFormula(`
                    Point of tangency: (${tangentX.toFixed(2)}, ${tangentY.toFixed(2)})<br>
                    Length: ${tangentLength} units
                `);
            }
        });
    }

    resetElements(() => {
        gsap.set(tangent, { opacity: 0 });
        showControls('tangent-controls'); // Show tangent controls
        updateTangent();
    });

    tangentAngleInput.oninput = updateTangent;
    tangentLengthInput.oninput = updateTangent;

    const sizeSlider = document.getElementById('sizeSlider');
    sizeSlider.oninput = (e) => {
        radiusScale = Math.max(0.5, Math.min(2, parseFloat(e.target.value)));
        updateRadius();
        updateTangent();
    };

    currentAnimation = updateTangent;
}

// ... (Keep your existing initial setup and slider code) ...

// Initial setup with fade-in
gsap.set(explanation, { opacity: 0 });
gsap.to(explanation, {
    opacity: 1,
    duration: 0.5,
    onStart: () => {
        explanation.innerHTML = "Click a button to explore circle geometry!";
    }
});

/*
Created this to show the points on the graph, don't know if it is needed.
Might come back in the future

function drawCirclePoints() {
    const radius = baseRadius;
    const numPoints = 12; // Number of points (adjust for more/less)
    const circlePointsGroup = document.getElementById('circlePoints');

    circlePointsGroup.innerHTML = ""; // Clear previous points

    for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * 2 * Math.PI;
        const x = circleCenterX + radius * Math.cos(angle);
        const y = circleCenterY + radius * Math.sin(angle);

        const point = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        point.setAttribute("cx", x);
        point.setAttribute("cy", y);
        point.setAttribute("r", 3); // Size of points
        point.setAttribute("fill", "black");

        circlePointsGroup.appendChild(point);
    }
}

// Call function after circle renders
drawCirclePoints();

 */






// Add size control with slider
const sizeSlider = document.getElementById('sizeSlider');
const sizeValue = document.getElementById('sizeValue'); // Reference to the span

if (sizeSlider) {
    sizeSlider.addEventListener('input', (e) => {
        radiusScale = Math.max(0.5, Math.min(2, parseFloat(e.target.value)));
        updateRadius();
        if (sizeValue) {
            sizeValue.textContent = `${radiusScale.toFixed(1)}x`; // Update displayed value
        }
        if (currentAnimation) {
            currentAnimation(); // Redraw current animation with new radius
        }
    });
}
// Set initial circle size
updateRadius();