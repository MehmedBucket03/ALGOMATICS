document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded, starting setup...");

    // Load Desmos API dynamically
    const script = document.createElement("script");
    script.src = "https://www.desmos.com/api/v1.11/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6";
    script.onload = () => {
        console.log("✅ Desmos API Loaded Successfully!");
        initializeGraph();
    };
    script.onerror = () => {
        console.error("❌ Failed to load Desmos API! Check network tab for 403/404 or try a newer version.");
        alert("Failed to load graphing library. Please check your connection.");
    };
    document.head.appendChild(script);

    // GSAP animations with fallback
    if (typeof gsap !== "undefined") {
        console.log("Starting GSAP animations...");
        gsap.fromTo(".header-bg", { opacity: 0, y: -50 }, { duration: 1.5, opacity: 1, y: 0, ease: "power3.out" });
        gsap.from(".method-btn", { duration: 1.2, opacity: 0, y: 30, stagger: 0.3, ease: "power2.out" });
    } else {
        console.warn("⚠️ GSAP not loaded, skipping animations. Buttons will still be visible.");
        // Ensure buttons are visible without GSAP
        document.querySelectorAll(".method-btn").forEach(btn => {
            btn.style.opacity = "1";
            btn.style.transform = "translateY(0)";
        });
    }

    // Solve Button
    const solveButton = document.getElementById("solve-btn");
    if (solveButton) {
        solveButton.addEventListener("click", () => {
            const a = parseFloat(document.getElementById("input-a").value);
            const b = parseFloat(document.getElementById("input-b").value);
            const c = parseFloat(document.getElementById("input-c").value);

            if (isNaN(a) || isNaN(b) || isNaN(c)) {
                alert("Please enter valid numbers for a, b, and c.");
                return;
            }
            if (a === 0) {
                alert("Coefficient 'a' cannot be zero for a quadratic equation.");
                return;
            }

            console.log(`Solving: ${a}x^2 + ${b}x + ${c}`);
            plotQuadratic(a, b, c);
        });
    } else {
        console.warn("⚠️ Solve button (#solve-btn) not found!");
    }

    // Event Delegation for Method Buttons
    document.body.addEventListener("click", function (event) {
        const target = event.target;
        if (target.classList.contains("method-btn")) {
            const method = target.getAttribute("data-method");
            console.log(`✅ Method button clicked: ${method}`);
            if (method) {
                showExplanation(method);
            } else {
                console.warn("⚠️ No data-method attribute found on button:", target);
            }
        }
    });

    // Debug: Test buttons are in DOM
    const methodButtons = document.querySelectorAll(".method-btn");
    console.log(`Found ${methodButtons.length} method buttons:`, methodButtons);
    if (methodButtons.length === 0) {
        console.error("❌ No .method-btn elements found in DOM!");
    }
});

// Store the calculator globally
let calculator;

function initializeGraph() {
    const elt = document.getElementById("quadratic-graph");
    if (!elt) {
        console.error("❌ Quadratic graph container not found!");
        alert("Graph container not found on the page.");
        return;
    }

    try {
        calculator = Desmos.GraphingCalculator(elt, {
            expressionsCollapsed: true,
            settings: { showGrid: true,
                showXAxis: true,
                showYAxis: true,
                zoomButtons: false,  //hides zoom btns
                lockViewport: false //allow panning
            },
            zoomMode: 'none' //disable default zoom

        });
        console.log("✅ Desmos calculator initialized!");
        // Disable scroll wheel zooming
        elt.addEventListener('wheel', (event) => {
            event.preventDefault(); // Stop scroll from zooming
            // Optional: Implement custom scroll behavior if desired (e.g., vertical panning)
            const bounds = calculator.getState().graph.bounds;
            const deltaY = event.deltaY * 0.01; // Adjust sensitivity
            calculator.setMathBounds({
                left: bounds.left,
                right: bounds.right,
                bottom: bounds.bottom - deltaY,
                top: bounds.top - deltaY
            });
        }, { passive: false });

        plotQuadratic(1, -3, 2); // Default graph
    } catch (error) {
        console.error("❌ Error initializing Desmos calculator:", error);
        alert("Failed to initialize the graphing calculator.");
    }
}

function plotQuadratic(a, b, c) {
    if (!calculator) {
        console.error("❌ Desmos calculator not initialized!");
        return;
    }

    calculator.setBlank();
    calculator.setExpression({
        id: "quadratic",
        latex: `${a}x^2 + ${b}x + ${c}`,
        color: "#2d70b3",
        label: `y = ${a}x² + ${b}x + ${c}`
    });

    // Vertex calculation
    const vertexX = -b / (2 * a);
    const vertexY = a * vertexX ** 2 + b * vertexX + c;
    calculator.setExpression({
        id: "vertex",
        latex: `(${vertexX.toFixed(2)}, ${vertexY.toFixed(2)})`,
        color: "red",
        pointStyle: "OPEN",
        label: `Vertex (${vertexX.toFixed(2)}, ${vertexY.toFixed(2)})`,
        showLabel: true
    });

    // Quadratic formula: roots calculation
    const discriminant = b ** 2 - 4 * a * c;
    let rootsInfo = "";
    if (discriminant > 0) {
        const root1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const root2 = (-b - Math.sqrt(discriminant)) / (2 * a);
        rootsInfo = `Roots: x = ${root1.toFixed(2)}, x = ${root2.toFixed(2)}`;
        calculator.setExpression({
            id: "root1",
            latex: `(${root1.toFixed(2)}, 0)`,
            color: "green",
            pointStyle: "POINT",
            label: `Root (${root1.toFixed(2)}, 0)`,
            showLabel: true
        });
        calculator.setExpression({
            id: "root2",
            latex: `(${root2.toFixed(2)}, 0)`,
            color: "green",
            pointStyle: "POINT",
            label: `Root (${root2.toFixed(2)}, 0)`,
            showLabel: true
        });
    } else {
        rootsInfo = "No real roots (imaginary solutions)";
    }

    console.log(`Plotted: ${a}x^2 + ${b}x + ${c}`);
    console.log(`Vertex: (${vertexX.toFixed(2)}, ${vertexY.toFixed(2)})`);
    console.log(`Discriminant: ${discriminant}, ${rootsInfo}`);
    alert(`${a}x² + ${b}x + ${c}\nVertex: (${vertexX.toFixed(2)}, ${vertexY.toFixed(2)})\n${rootsInfo}`);
}

function showExplanation(method) {
    console.log(`Showing explanation for ${method}`);
    const explanationContainer = document.createElement("div");
    explanationContainer.classList.add("explanation-box");

    let explanationContent = "";
    if (method === "Factoring") {
        explanationContent = `
        <h2>Factoring Method</h2>
        <p><strong>Step 1:</strong> Write the equation in standard form: <span class="formula">ax² + bx + c = 0</span></p>
        <p><strong>Step 2:</strong> Find two numbers that multiply to 'ac' and add to 'b'.</p>
        <p><strong>Step 3:</strong> Factor into binomials.</p>
        <p><strong>Example:</strong> Solve x² - 5x + 6 = 0</p>
        <p>Factor: (x - 2)(x - 3) = 0</p>
        <p>Solutions: <span class="formula">x = 2, x = 3</span></p>
      `;
    } else if (method === "Completing the Square") {
        explanationContent = `
        <h2>Completing the Square</h2>
        <p><strong>Step 1:</strong> Move the constant to the other side.</p>
        <p><strong>Step 2:</strong> Take half of 'b', square it, and add to both sides.</p>
        <p><strong>Step 3:</strong> Rewrite as a perfect square trinomial.</p>
        <p><strong>Example:</strong> Solve x² + 6x + 5 = 0</p>
        <p>Rewrite: (x + 3)² = 4</p>
        <p>Solutions: <span class="formula">x = -1, x = -5</span></p>
      `;
    } else if (method === "Quadratic Formula") {
        explanationContent = `
        <h2>Quadratic Formula</h2>
        <p>The Quadratic Formula is: <span class="formula">x = (-b ± √(b² - 4ac)) / 2a</span></p>
        <p><strong>Step 1:</strong> Identify coefficients a, b, and c.</p>
        <p><strong>Step 2:</strong> Compute the discriminant <span class="formula">Δ = b² - 4ac</span>.</p>
        <p><strong>Step 3:</strong> Substitute into the formula and solve.</p>
        <p><strong>Example:</strong> Solve 2x² - 4x - 6 = 0</p>
        <p>Calculate: x = (4 ± 8) / 4</p>
        <p>Solutions: <span class="formula">x = 3, x = -1</span></p>
      `;
    } else {
        console.warn(`⚠️ Unknown method: ${method}`);
        return;
    }

    explanationContainer.innerHTML = `
      <div class="explanation-content">
        ${explanationContent}
        <button class="close-btn">Close</button>
      </div>
    `;
    document.body.appendChild(explanationContainer);

    if (typeof gsap !== "undefined") {
        gsap.fromTo(".explanation-content", { opacity: 0, y: 50 }, { duration: 1, opacity: 1, y: 0, ease: "power3.out", onComplete: () => console.log("Explanation pane faded in") });
        explanationContainer.querySelector(".close-btn").addEventListener("click", () => {
            gsap.to(".explanation-content", {
                duration: 0.8,
                opacity: 0,
                y: 50,
                ease: "power3.in",
                onComplete: () => {
                    document.body.removeChild(explanationContainer);
                    console.log("Explanation pane removed");
                }
            });
        });
    } else {
        // Fallback without GSAP
        const content = explanationContainer.querySelector(".explanation-content");
        content.style.opacity = "1";
        explanationContainer.querySelector(".close-btn").addEventListener("click", () => {
            document.body.removeChild(explanationContainer);
            console.log("Explanation pane removed (no GSAP)");
        });
    }
}