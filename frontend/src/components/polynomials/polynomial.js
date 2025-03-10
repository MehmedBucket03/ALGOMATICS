document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ Polynomial Division Calculator Loaded!");

    let method = "long";

    document.getElementById("long-division-btn").addEventListener("click", function () {
        method = "long";
        document.getElementById("division-title").textContent = "Long Division Steps";
        gsap.fromTo("#division-title", { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 1 });
    });

    document.getElementById("synthetic-division-btn").addEventListener("click", function () {
        method = "synthetic";
        document.getElementById("division-title").textContent = "Synthetic Division Steps";
        gsap.fromTo("#division-title", { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 1 });
    });

    document.getElementById("calculate-btn").addEventListener("click", function () {
        const dividend = document.getElementById("dividend").value;
        const divisor = document.getElementById("divisor").value;

        if (!dividend || !divisor) {
            alert("Please enter both dividend and divisor.");
            return;
        }

        if (method === "long") {
            performLongDivision(dividend, divisor);
        } else {
            performSyntheticDivision(dividend, divisor);
        }
    });

    function performLongDivision(dividend, divisor) {
        let steps = `
        Step 1: Divide the first term of dividend by first term of divisor.
        Step 2: Multiply divisor by the quotient.
        Step 3: Subtract result from dividend.
        Step 4: Bring down next term and repeat.
        `;

        document.getElementById("division-visualization").innerHTML = `<pre>${steps}</pre>`;
        document.getElementById("final-answer").textContent = "Quotient: x^2 + x - 3 | Remainder: 2";

        gsap.fromTo(".division-grid pre", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, ease: "power2.out" });
        gsap.fromTo(".result-container", { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: "power3.out" });
    }

    function performSyntheticDivision(dividend, divisor) {
        let steps = `
        Step 1: Write down coefficients of the dividend.
        Step 2: Bring down the first coefficient.
        Step 3: Multiply divisor root by the first coefficient.
        Step 4: Add result to next coefficient.
        Step 5: Repeat for all coefficients.
        Step 6: Last value is remainder.
        `;

        document.getElementById("division-visualization").innerHTML = `<pre>${steps}</pre>`;
        document.getElementById("final-answer").textContent = "Quotient: x^2 + 3x + 4 | Remainder: 2";

        gsap.fromTo(".division-grid pre", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, ease: "power2.out" });
        gsap.fromTo(".result-container", { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: "power3.out" });
    }
});
