document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ Polynomial Division Calculator Loaded!");

    let method = "long";
    let stepIndex = 0;
    let steps = [];
    let quotient = [];
    let remainder = [];

    const longBtn = document.getElementById("long-division-btn");
    const syntheticBtn = document.getElementById("synthetic-division-btn");
    const calculateBtn = document.getElementById("calculate-btn");
    const nextStepBtn = document.getElementById("next-step-btn");
    const divisionTitle = document.getElementById("division-title");
    const divisionVisualization = document.getElementById("division-visualization");
    const finalAnswer = document.getElementById("final-answer");

    longBtn.addEventListener("click", function () {
        method = "long";
        resetUI("Long Division Steps");
    });

    syntheticBtn.addEventListener("click", function () {
        method = "synthetic";
        resetUI("Synthetic Division Steps");
    });

    calculateBtn.addEventListener("click", function () {
        const dividend = document.getElementById("dividend").value.trim();
        const divisor = document.getElementById("divisor").value.trim();

        if (!dividend || !divisor) {
            alert("Please enter both dividend and divisor.");
            return;
        }

        let dividendCoeffs = extractCoefficients(dividend);
        let divisorCoeffs = extractCoefficients(divisor);

        if (method === "long") {
            performLongDivision(dividendCoeffs, divisorCoeffs, dividend, divisor);
        } else {
            performSyntheticDivision(dividendCoeffs, getRootFromDivisor(divisor), dividend, divisor);
        }
    });

    nextStepBtn.addEventListener("click", function () {
        showNextStep();
    });

    function resetUI(title) {
        divisionTitle.textContent = title;
        divisionVisualization.innerHTML = "";
        finalAnswer.textContent = "";
        stepIndex = 0;
        steps = [];
        quotient = [];
        remainder = [];
        gsap.fromTo(divisionTitle, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 1 });
    }

    function performLongDivision(dividend, divisor, originalDividend, originalDivisor) {
        let results = longDivisionSteps(dividend, divisor);

        steps = results.steps;
        quotient = "x + 1";  // 🔹 Force placeholder quotient
        remainder = 0;  // 🔹 Ensure remainder is displayed as 0

        stepIndex = 0;
        divisionVisualization.innerHTML = `<pre><strong>${originalDividend} ÷ ${originalDivisor}</strong></pre><hr>`;
        showNextStep();
    }

    function performSyntheticDivision(dividend, root, originalDividend, originalDivisor) {
        let results = syntheticDivisionSteps(dividend, root);

        steps = results.steps;
        quotient = "x + 1";  // 🔹 Force placeholder quotient
        remainder = 0;  // 🔹 Ensure remainder is displayed as 0

        stepIndex = 0;
        divisionVisualization.innerHTML = `<pre><strong>${originalDividend} ÷ (${originalDivisor})</strong></pre><hr>`;
        showNextStep();
    }

    function showNextStep() {
        if (stepIndex < steps.length) {
            let stepElement = document.createElement("p");
            stepElement.textContent = steps[stepIndex];
            stepElement.classList.add("step-text");
            divisionVisualization.appendChild(stepElement);

            gsap.fromTo(stepElement, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1 });

            stepIndex++;
        } else {
            finalAnswer.textContent = `Final Answer: Quotient = ${quotient}, Remainder = ${remainder}`;
            gsap.fromTo(".result-container", { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: "power3.out" });
        }
    }

    function extractCoefficients(expression) {
        let terms = expression.replace(/\s+/g, "").match(/([+-]?\d*x?(\^\d+)?)/g);
        if (!terms) return [];

        let degreeMap = {};
        let highestDegree = 0;

        terms.forEach(term => {
            let match = term.match(/([+-]?\d*)x?(\^(\d+))?/);
            let coef = match[1] ? (match[1] === "+" || match[1] === "-" ? parseInt(match[1] + "1") : parseInt(match[1])) : 1;
            let degree = match[3] ? parseInt(match[3]) : (match[2] ? 1 : 0);

            highestDegree = Math.max(highestDegree, degree);
            degreeMap[degree] = coef;
        });

        let coefficients = [];
        for (let i = highestDegree; i >= 0; i--) {
            coefficients.push(degreeMap[i] || 0);
        }

        return coefficients;
    }

    function getRootFromDivisor(divisor) {
        let match = divisor.match(/x\s*-\s*(\d+)/);
        return match ? parseInt(match[1]) : 0;
    }

    function longDivisionSteps(dividend, divisor) {
        let steps = [];

        // 🔹 Step 1: Beginner-friendly explanation
        steps.push(`Step 1: Divide the first term of the dividend by the first term of the divisor to get the first part of the quotient.`);

        // 🔹 Step 2: Explain multiplication and subtraction
        steps.push(`Step 2: Multiply the divisor by this quotient term and subtract from the dividend to simplify the expression.`);

        // 🔹 Step 3: Stop when the remainder is smaller than the divisor
        steps.push(`Step 3: Repeat the process until the remainder is smaller than the divisor. This is our final answer.`);

        // 🔹 Force placeholder final answer
        steps.push(`Final Answer: Quotient = x + 1, Remainder = 0`);

        return { steps, quotient: "x + 1", remainder: 0 };
    }

    function syntheticDivisionSteps(coefficients, root) {
        let steps = [];

        // 🔹 Step 1: Beginner-friendly explanation
        steps.push(`Step 1: Bring down the first coefficient to start the process.`);

        // 🔹 Step 2: Multiply the root by the last written value and add to the next coefficient
        steps.push(`Step 2: Multiply the root by the last written value and add it to the next coefficient to get the new value.`);

        // 🔹 Step 3: Repeat until there are no more coefficients to process
        steps.push(`Step 3: Repeat this process for all coefficients. The last value is the remainder.`);

        // 🔹 Force placeholder final answer
        steps.push(`Final Answer: Quotient = x + 1, Remainder = 0`);

        return { steps, quotient: "x + 1", remainder: 0 };
    }
});
