const canvas = document.getElementById("geometryCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 400;
canvas.height = 400;

const angleSlider = document.getElementById("angleSlider");
const angleValue = document.getElementById("angleValue");
const explanationBox = document.getElementById("theoremExplanation");

const trianglesMenu = document.getElementById("triangleOptions");
const mainMenu = document.getElementById("mainMenu");

let selectedTriangle = null;
let activeSection = "";

const theoremButtons = document.createElement("div");
theoremButtons.style.display = "none";
theoremButtons.innerHTML = `
    <button onclick="showTheorem('SSS')">SSS</button>
    <button onclick="showTheorem('SAS')">SAS</button>
    <button onclick="showTheorem('ASA')">ASA</button>
    <button onclick="showTheorem('AAS')">AAS</button>
    <button onclick="showTheorem('HL')">HL</button>
`;
const buttonContainer = document.getElementById("congruenceButtons");
buttonContainer.appendChild(theoremButtons);

function updateAngle() {
    let angle = parseInt(angleSlider.value);
    angleValue.textContent = angle;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.moveTo(200, 200);
    ctx.lineTo(350, 200);
    ctx.strokeStyle = "#d4a4ff";
    ctx.lineWidth = 3;
    ctx.stroke();

    const rad = angle * Math.PI / 180;
    ctx.beginPath();
    ctx.moveTo(200, 200);
    ctx.lineTo(200 + Math.cos(rad) * 150, 200 - Math.sin(rad) * 150);
    ctx.stroke();

    let arcColor = "#ff6f61";
    let type = "Right";

    if (angle < 90) {
        arcColor = "#00bcd4";
        type = "Acute";
    } else if (angle === 90) {
        arcColor = "#ff6f61";
        type = "Right";
    } else if (angle > 90 && angle < 180) {
        arcColor = "#ffc107";
        type = "Obtuse";
    } else if (angle === 180) {
        arcColor = "#ff69b4";
        type = "Straight";
    }

    ctx.beginPath();
    ctx.arc(200, 200, 40, 0, -rad, true);
    ctx.strokeStyle = arcColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = arcColor;
    ctx.font = "16px Arial";
    ctx.fillText(`${angle}°`, 230, 180);
    ctx.fillText(`${type} Angle`, 160, 160);
}

angleSlider.addEventListener("input", updateAngle);
updateAngle();

function setAngle(val) {
    angleSlider.value = val;
    updateAngle();
}
function showSection(section) {
    activeSection = section;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    explanationBox.innerText = "";

    trianglesMenu.style.display = "none";
    theoremButtons.style.display = "none";

    const angleControls = document.getElementById("angleControls");
    if (section === "angles") {
        angleControls.style.display = "block";
        explanationBox.innerText = "Use the slider or buttons to explore different angles.";
        updateAngle();
    } else {
        angleControls.style.display = "none"; // Hide angle slider and buttons
    }

    if (section === "triangles") {
        trianglesMenu.style.display = "block";
        explanationBox.innerText = "Click a triangle type to see its visualization.";
    } else if (section === "congruence") {
        theoremButtons.style.display = "block";
        explanationBox.innerText = "Select a theorem to explore different triangle congruencies.";
    }

    gsap.fromTo(canvas, { opacity: 0 }, { opacity: 1, duration: 1 });
}

function drawTriangle(type) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#d4a4ff";
    ctx.font = "16px Arial";

    if (type === "equilateral") {
        ctx.beginPath();
        ctx.moveTo(200, 50);
        ctx.lineTo(100, 200);
        ctx.lineTo(300, 200);
        ctx.closePath();
        ctx.strokeStyle = "#ff6f61";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillText("Equilateral Triangle", 130, 250);
        explanationBox.innerText = "An equilateral triangle has all three sides equal and all angles measuring 60°.";
    } else if (type === "isosceles") {
        ctx.beginPath();
        ctx.moveTo(200, 60);      // Top vertex
        ctx.lineTo(120, 240);     // Bottom-left vertex
        ctx.lineTo(280, 240);     // Bottom-right vertex
        ctx.closePath();
        ctx.strokeStyle = "#ff6f61";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillText("Isosceles Triangle", 130, 270);
        explanationBox.innerText = "An isosceles triangle has two equal sides and two equal angles.";
    } else if (type === "scalene") {
        ctx.beginPath();
        ctx.moveTo(220, 50);
        ctx.lineTo(90, 200);
        ctx.lineTo(310, 180);
        ctx.closePath();
        ctx.strokeStyle = "#ff6f61";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillText("Scalene Triangle", 140, 250);
        explanationBox.innerText = "A scalene triangle has all sides and angles different.";
    }

    gsap.fromTo(canvas, { opacity: 0 }, { opacity: 1, duration: 1 });
}

function showEquilateral() { drawTriangle("equilateral"); }
function showIsosceles() { drawTriangle("isosceles"); }
function showScalene() { drawTriangle("scalene"); }

function showTheorem(type) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const explanations = {
        SSS: "Side-Side-Side (SSS): If all three sides of one triangle are equal to another, they are congruent.",
        SAS: "Side-Angle-Side (SAS): If two sides and the included angle are equal, the triangles are congruent.",
        ASA: "Angle-Side-Angle (ASA): If two angles and the included side are equal, the triangles are congruent.",
        AAS: "Angle-Angle-Side (AAS): If two angles and a non-included side are equal, the triangles are congruent.",
        HL: "Hypotenuse-Leg (HL): If the hypotenuse and one leg of a right triangle are equal, they are congruent."
    };

    explanationBox.innerText = explanations[type];
    drawCongruenceTheorem(type);

    gsap.fromTo(canvas, { opacity: 0 }, { opacity: 1, duration: 1 });
}

let currentRotation = 0;

function drawCongruenceTheorem(type) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // First triangle (common shape for SSS, SAS, ASA, AAS)
    const baseTriangle = { x1: 100, y1: 100, x2: 50, y2: 200, x3: 150, y3: 200 };

    // HL triangle uses a right triangle
    const hlTriangle = { x1: 100, y1: 180, x2: 140, y2: 180, x3: 100, y3: 120 };
    const secondHL = { x1: 300, y1: 180, x2: 340, y2: 180, x3: 300, y3: 120 };

    // Triangle to animate (second one)
    const secondTriangle = { x1: 300, y1: 100, x2: 250, y2: 200, x3: 350, y3: 200 };

    let triangle1 = baseTriangle;
    let triangle2 = secondTriangle;
    let rotation = 0;

    switch (type) {
        case "SSS": rotation = 360; break;
        case "SAS": rotation = 180; break;
        case "ASA": rotation = 20; break;
        case "AAS": rotation = -20; break;
        case "HL":
            triangle1 = hlTriangle;
            triangle2 = secondHL;
            rotation = 0;
            break;
    }
    gsap.to({ rot: currentRotation }, {
        rot: rotation,
        duration: 1,
        onUpdate: function () {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            drawRotatedTickedTriangle(triangle1, "#76c7c0", 0, type, true);  // Base triangle
            drawRotatedTickedTriangle(triangle2, "#ffcc00", this.targets()[0].rot, type, false);  // Animated triangle
            drawMatchingArrows(triangle1, triangle2);
        },
        onComplete: function () {
            currentRotation = rotation;
        }
    });

    explanationBox.innerText = explanations[type];
}

function drawTriangleShape(x1, y1, x2, y2, x3, y3, color) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.closePath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();
}

function drawRightTriangle(x1, y1, x2, y2, x3, y3, color) {
    drawTriangleShape(x1, y1, x2, y2, x3, y3, color);
}
function drawMatchingArrows(tri1, tri2) {
    drawArrow(tri1.x1, tri1.y1, tri2.x1, tri2.y1); // A to A
    drawArrow(tri1.x2, tri1.y2, tri2.x2, tri2.y2); // B to B
    drawArrow(tri1.x3, tri1.y3, tri2.x3, tri2.y3); // C to C
}

function drawArrow(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = "#ff6f61";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Arrowhead
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const headlen = 6;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headlen * Math.cos(angle - Math.PI / 6), y2 - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x2 - headlen * Math.cos(angle + Math.PI / 6), y2 - headlen * Math.sin(angle + Math.PI / 6));
    ctx.lineTo(x2, y2);
    ctx.fillStyle = "#ff6f61";
    ctx.fill();
}
function drawSideTick(x1, y1, x2, y2, count, color) {
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const dx = y2 - y1;
    const dy = x1 - x2;
    const length = Math.sqrt(dx * dx + dy * dy);
    const normX = dx / length;
    const normY = dy / length;

    for (let i = 0; i < count; i++) {
        const offset = (i - (count - 1) / 2) * 6;
        const tickX1 = midX + offset * normX - 5 * normY;
        const tickY1 = midY + offset * normY - 5 * normX;
        const tickX2 = midX + offset * normX + 5 * normY;
        const tickY2 = midY + offset * normY + 5 * normX;

        ctx.beginPath();
        ctx.moveTo(tickX1, tickY1);
        ctx.lineTo(tickX2, tickY2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }
}
function drawRotatedTickedTriangle(triangle, color, rotation, type, isBase) {
    const center = isBase ? { x: 100, y: 150 } : { x: 300, y: 150 };
    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.translate(-center.x, -center.y);

    const { x1, y1, x2, y2, x3, y3 } = triangle;

    // Draw triangle outline
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.closePath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();

    if (type === "SSS") {
        drawSideTick(x1, y1, x2, y2, 1, color);
        drawSideTick(x2, y2, x3, y3, 2, color);
        drawSideTick(x3, y3, x1, y1, 3, color);
    }

    if (type === "SAS") {
        drawSideTick(x1, y1, x2, y2, 1, color); // AB
        drawSideTick(x2, y2, x3, y3, 2, color); // BC
        drawAngleMark(x2, y2, color);          // Included angle
    }

    if (type === "ASA") {
        drawAngleMark(x1, y1, color);          // angle A
        drawAngleMark(x3, y3, color);          // angle C
        drawSideTick(x1, y1, x3, y3, 1, color); // included side AC
    }

    if (type === "AAS") {
        drawAngleMark(x3, y3, color);          // angle C (flipped side)
        drawAngleMark(x2, y2, color);          // angle B
        drawSideTick(x1, y1, x2, y2, 1, color); // side AB (not between angles)
    }

    if (type === "HL") {
        drawSideTick(x1, y1, x2, y2, 1, color); // leg
        drawSideTick(x1, y1, x3, y3, 2, color); // hypotenuse
        ctx.strokeStyle = "#ffffff";
        ctx.strokeRect(x1, y1 - 10, 10, 10);    // right angle box
    }

    ctx.restore();
}

function drawAngleMark(x, y, color) {
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
}
