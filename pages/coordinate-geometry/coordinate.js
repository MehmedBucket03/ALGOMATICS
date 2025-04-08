document.addEventListener("DOMContentLoaded", function () {
    const calculatorElement = document.getElementById("desmos-calculator");
    const calculator = Desmos.GraphingCalculator(calculatorElement);
    const breakdown = document.getElementById("breakdown-container");

    document.getElementById("graph-btn").addEventListener("click", function () {
        calculateAndGraph();
    });

    document.getElementById("midpoint-btn").addEventListener("click", function () {
        fadeInBreakdown();
        calculateMidpoint();
    });

    document.getElementById("slope-btn").addEventListener("click", function () {
        fadeInBreakdown();
        calculateSlope();
    });

    document.getElementById("equation-btn").addEventListener("click", function () {
        fadeInBreakdown();
        calculateEquation();
    });

    function fadeInBreakdown() {
        breakdown.style.display = "block";
        breakdown.style.opacity = 0;
        setTimeout(() => {
            breakdown.style.transition = "opacity 0.5s ease";
            breakdown.style.opacity = 1;
        }, 10);
    }

    function getValues() {
        const x1 = parseFloat(document.getElementById("x1").value);
        const y1 = parseFloat(document.getElementById("y1").value);
        const x2 = parseFloat(document.getElementById("x2").value);
        const y2 = parseFloat(document.getElementById("y2").value);

        if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
            alert("Please enter valid numbers for both points.");
            return null;
        }
        return { x1, y1, x2, y2 };
    }

    function calculateAndGraph() {
        const vals = getValues();
        if (!vals) return;

        const { x1, y1, x2, y2 } = vals;
        const midpointX = (x1 + x2) / 2;
        const midpointY = (y1 + y2) / 2;
        const slope = (x2 - x1) !== 0 ? (y2 - y1) / (x2 - x1) : "undefined";
        const equation =
            slope !== "undefined"
                ? `y = ${slope.toFixed(2)}(x - ${x1}) + ${y1}`
                : `x = ${x1}`;

        calculator.setBlank();
        calculator.setExpressions([
            { id: "pointA", latex: `(${x1}, ${y1})`, color: "blue" },
            { id: "pointB", latex: `(${x2}, ${y2})`, color: "purple" },
            {
                id: "midpoint",
                latex: `(${midpointX}, ${midpointY})`,
                color: "red",
                label: "Midpoint",
            },
            { id: "line", latex: equation, color: "green" },
        ]);
    }

    function calculateMidpoint() {
        const vals = getValues();
        if (!vals) return;
        const { x1, y1, x2, y2 } = vals;

        const midpointX = (x1 + x2) / 2;
        const midpointY = (y1 + y2) / 2;

        document.getElementById(
            "midpoint-text"
        ).innerHTML = `
    <strong class="text-pink-400 text-lg">Step 1:</strong> Use midpoint formula  
    <br><code class="text-white">Midpoint = ((x₁ + x₂) / 2, (y₁ + y₂) / 2)</code>
    <br><strong class="text-pink-400 text-lg">Step 2:</strong> Plug in your values:
    <br><code class="text-white">Midpoint = ((${x1} + ${x2}) / 2, (${y1} + ${y2}) / 2)</code>
    <br><strong class="text-pink-400 text-lg">Final Answer:</strong> 
    <span class="text-white">(${midpointX.toFixed(2)}, ${midpointY.toFixed(2)})</span>
  `;
    }

    function calculateSlope() {
        const vals = getValues();
        if (!vals) return;
        const { x1, y1, x2, y2 } = vals;

        const slope = x2 - x1 !== 0 ? (y2 - y1) / (x2 - x1) : "undefined";

        document.getElementById(
            "slope-text"
        ).innerHTML = `
    <strong class="text-blue-400 text-lg">Step 1:</strong> Use slope formula  
    <br><code class="text-white">m = (y₂ - y₁) / (x₂ - x₁)</code>
    <br><strong class="text-blue-400 text-lg">Step 2:</strong> Plug in your values:
    <br><code class="text-white">m = (${y2} - ${y1}) / (${x2} - ${x1})</code>
    <br><strong class="text-blue-400 text-lg">Final Answer:</strong> 
    <span class="text-white">${slope === "undefined" ? "undefined (vertical line)" : slope.toFixed(2)}</span>
  `;
    }

    function calculateEquation() {
        const vals = getValues();
        if (!vals) return;
        const { x1, y1, x2, y2 } = vals;

        const slope = x2 - x1 !== 0 ? (y2 - y1) / (x2 - x1) : "undefined";
        const equation =
            slope !== "undefined"
                ? `y = ${slope.toFixed(2)}(x - ${x1}) + ${y1}`
                : `x = ${x1}`;

        document.getElementById(
            "equation-text"
        ).innerHTML = `
    <strong class="text-purple-400 text-lg">Step 1:</strong> Use point-slope form:
    <br><code class="text-white">y - y₁ = m(x - x₁)</code>
    <br><strong class="text-purple-400 text-lg">Step 2:</strong> Plug in values:
    <br><code class="text-white">${slope === "undefined" ? `Vertical Line: x = ${x1}` : `y = ${slope.toFixed(2)}(x - ${x1}) + ${y1}`}</code>
    <br><strong class="text-purple-400 text-lg">Final Answer:</strong> 
    <span class="text-white">${equation}</span>
  `;
    }
});
