document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM loaded, initializing...");

    const calculatorElement = document.getElementById("desmos-calculator");
    if (!calculatorElement) {
        console.error("❌ No graph container found on the page!");
        return;
    }
    const calculator = Desmos.GraphingCalculator(calculatorElement);

    document.getElementById("substitution-btn").addEventListener("click", function () {
        showExplanation("Substitution");
    });

    document.getElementById("elimination-btn").addEventListener("click", function () {
        showExplanation("Elimination");
    });

    document.getElementById("close-btn").addEventListener("click", function () {
        gsap.to("#explanation-box", { opacity: 0, duration: 0.5, onComplete: function () {
                document.getElementById("explanation-box").style.display = "none";
            }});
    });
    document.getElementById("graph-btn").addEventListener("click", function () {
        const eq1 = document.getElementById("equation1").value;
        const eq2 = document.getElementById("equation2").value;

        if (!eq1 || !eq2) {
            alert("Please enter both equations.");
            return;
        }

        calculator.setBlank();
        calculator.setExpression({ id: "eq1", latex: eq1, color: "red" });
        calculator.setExpression({ id: "eq2", latex: eq2, color: "blue" });
    });
    function showExplanation(method) {
        let content = "";
        if (method === "Substitution") {
            content = `
                <h2>Substitution Method</h2>
                <p><strong>Step 1:</strong> Solve one equation for a variable.</p>
                <p><strong>Step 2:</strong> Substitute it into the other equation.</p>
                <p><strong>Step 3:</strong> Solve for the unknown.</p>
                <p><strong>Example:</strong> Solve:</p>
                <p>y = 2x + 3</p>
                <p>x + y = 5</p>
                <p>Substituting: x + (2x + 3) = 5 → Solve for x.</p>
            `;
        } else if (method === "Elimination") {
            content = `
                <h2>Elimination Method</h2>
                <p><strong>Step 1:</strong> Multiply one or both equations to align coefficients.</p>
                <p><strong>Step 2:</strong> Add or subtract the equations to eliminate a variable.</p>
                <p><strong>Step 3:</strong> Solve for the remaining variable.</p>
                <p><strong>Example:</strong> Solve:</p>
                <p>2x + 3y = 6</p>
                <p>4x - 3y = 12</p>
                <p>Adding both equations: (2x + 4x) = (6 + 12) → Solve for x.</p>
            `;
        }
        document.getElementById("explanation-content").innerHTML = content;
        document.getElementById("explanation-box").style.display = "block";
        gsap.fromTo("#explanation-box", { opacity: 0 }, { opacity: 1, duration: 0.5 });
    }
});
