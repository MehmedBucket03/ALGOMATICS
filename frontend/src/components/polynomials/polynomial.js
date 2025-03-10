document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ Polynomial Division Calculator Loaded!");

    let method = "long";
    let stepIndex = 0;
    let steps = [];
    let quotient = "";
    let remainder = "";

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

        if (method === "long") {
            performLongDivision(dividend, divisor);
        } else {
            performSyntheticDivision(dividend, divisor);
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
        quotient = "";
        remainder = "";
        gsap.fromTo(divisionTitle, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 1 });
    }

    function performLongDivision(dividend, divisor) {
        let dividendCoeffs = extractCoefficients(dividend);
        let divisorCoeffs = extractCoefficients(divisor);
        let results = longDivisionSteps(dividendCoeffs, divisorCoeffs);

        steps = results.steps;
        quotient = formatPolynomial(results.quotient);
        remainder = formatPolynomial(results.remainder);

        stepIndex = 0;
        divisionVisualization.innerHTML = `<pre><strong>${dividend} ÷ ${divisor}</strong></pre><hr>`;
        showNextStep();
    }

    function performSyntheticDivision(dividend, divisor) {
        let coefficients = extractCoefficients(dividend);
        let root = getRootFromDivisor(divisor);
        let results = syntheticDivisionSteps(coefficients, root);

        steps = results.steps;
        quotient = results.quotient.join("x + ");
        remainder = results.remainder;

        stepIndex = 0;
        divisionVisualization.innerHTML = `<pre><strong>${dividend} ÷ ${divisor}</strong></pre><hr>`;
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
        let matches = expression.match(/-?\d+/g);
        return matches ? matches.map(Number) : [];
    }

    function getRootFromDivisor(divisor) {
        let match = divisor.match(/x\s*-\s*(\d+)/);
        return match ? parseInt(match[1]) : 0;
    }

    function longDivisionSteps(dividend, divisor) {
        let steps = [];
        let quotient = [];
        let remainder = [...dividend];

        while (remainder.length >= divisor.length) {
            let leadingCoef = Math.floor(remainder[0] / divisor[0]); // Ensures no decimals
            quotient.push(leadingCoef);

            let subtracted = divisor.map(coef => coef * leadingCoef);
            remainder = remainder.map((coef, index) => coef - (subtracted[index] || 0));

            remainder.shift();
            steps.push(`Step ${quotient.length}: Divide ${remainder[0] || 0} by ${divisor[0]}, quotient term = ${leadingCoef}`);

            if (remainder.every(val => val === 0)) break;
        }

        return { steps, quotient, remainder };
    }

    function syntheticDivisionSteps(coefficients, root) {
        let steps = [];
        let result = [...coefficients];
        let stepProcess = [];

        stepProcess.push(result[0]);
        steps.push(`Step 1: Bring down first coefficient ${result[0]}`);

        for (let i = 1; i < result.length; i++) {
            let multiply = stepProcess[i - 1] * root;
            stepProcess.push(result[i] + multiply);
            steps.push(`Step ${i + 1}: Multiply ${stepProcess[i - 1]} * ${root} = ${multiply}, add to ${result[i]} → ${stepProcess[i]}`);
        }

        return { quotient: stepProcess.slice(0, -1), remainder: stepProcess.slice(-1)[0], steps };
    }

    function formatPolynomial(terms) {
        if (!terms || terms.length === 0) return "0";
        return terms.map((coef, index) => coef !== 0 ? `${coef}x^${terms.length - index - 1}` : "").filter(Boolean).join(" + ");
    }
});
