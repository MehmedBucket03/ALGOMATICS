// Demo Solution
function showDemoSolution() {
    const solutionDiv = document.getElementById("demo-solution");
    solutionDiv.style.display = "block";
    solutionDiv.innerHTML = `
                <p class="animate__animated animate__fadeIn">Step 1: Find two numbers that multiply to 6 and add to -5.</p>
                <p class="animate__animated animate__fadeIn" style="animation-delay: 0.5s;">Numbers: -2 and -3 (since -2 * -3 = 6 and -2 + -3 = -5).</p>
                <p class="animate__animated animate__fadeIn" style="animation-delay: 1s;">Step 2: Factor into (x - 2)(x - 3) = 0.</p>
                <p class="animate__animated animate__fadeIn" style="animation-delay: 1.5s;">Step 3: Solve each factor.</p>
                <p class="animate__animated animate__fadeIn" style="animation-delay: 2s;">x - 2 = 0 → x = 2</p>
                <p class="animate__animated animate__fadeIn" style="animation-delay: 2.5s;">x - 3 = 0 → x = 3</p>
                <p class="animate__animated animate__fadeIn" style="animation-delay: 3s;"><strong>Final Answer: x = 2 or x = 3</strong></p>
            `;
}

// Try It Yourself Solution Check
function checkUserSolution() {
    const a = parseFloat(document.getElementById("user-a").value);
    const b = parseFloat(document.getElementById("user-b").value);
    const c = parseFloat(document.getElementById("user-c").value);

    if (isNaN(a) || isNaN(b) || isNaN(c)) {
        alert("Please enter valid numbers for a, b, and c!");
        return;
    }

    const solutionDiv = document.getElementById("user-solution");
    solutionDiv.style.display = "block";

    // Calculate roots using quadratic formula
    const discriminant = b * b - 4 * a * c;
    let x1, x2;
    if (discriminant < 0) {
        solutionDiv.innerHTML = `<p class="animate__animated animate__fadeIn">No real solutions (discriminant < 0).</p>`;
        return;
    }

    x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
    x2 = (-b - Math.sqrt(discriminant)) / (2 * a);

    solutionDiv.innerHTML = `
                <p class="animate__animated animate__fadeIn">Equation: ${a}x² + ${b}x + ${c} = 0</p>
                <p class="animate__animated animate__fadeIn" style="animation-delay: 0.5s;">Discriminant = ${discriminant}</p>
                <p class="animate__animated animate__fadeIn" style="animation-delay: 1s;">Solutions (approx): x = ${x1.toFixed(2)} or x = ${x2.toFixed(2)}</p>
                <p class="animate__animated animate__fadeIn" style="animation-delay: 1.5s;">Try factoring to find exact roots (e.g., (x - ${x1.toFixed(0)})(x - ${x2.toFixed(0)})).</p>
                <p class="animate__animated animate__fadeIn" style="animation-delay: 2s;">Check your work and let us know your answer!</p>
            `;
}