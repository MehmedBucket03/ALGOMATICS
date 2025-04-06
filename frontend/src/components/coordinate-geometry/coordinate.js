document.addEventListener("DOMContentLoaded", function () {
    const calculatorElement = document.getElementById("desmos-calculator");
    const calculator = Desmos.GraphingCalculator(calculatorElement);

    document.getElementById("graph-btn").addEventListener("click", function () {
        calculateAndGraph();
    });

    document.getElementById("midpoint-btn").addEventListener("click", function () {
        calculateMidpoint();
    });

    document.getElementById("slope-btn").addEventListener("click", function () {
        calculateSlope();
    });

    document.getElementById("equation-btn").addEventListener("click", function () {
        calculateEquation();
    });

    function calculateAndGraph() {
        const x1 = parseFloat(document.getElementById("x1").value);
        const y1 = parseFloat(document.getElementById("y1").value);
        const x2 = parseFloat(document.getElementById("x2").value);
        const y2 = parseFloat(document.getElementById("y2").value);

        if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
            alert("Please enter valid numerical values for both points.");
            return;
        }

        const midpointX = (x1 + x2) / 2;
        const midpointY = (y1 + y2) / 2;
        const slope = (x2 - x1) !== 0 ? (y2 - y1) / (x2 - x1) : "undefined";
        const equation = slope !== "undefined" ? `y = ${slope.toFixed(2)}(x - ${x1}) + ${y1}` : "Vertical Line";

        calculator.setBlank();
        calculator.setExpressions([
            { id: "pointA", latex: `(${x1}, ${y1})`, color: "blue" },
            { id: "pointB", latex: `(${x2}, ${y2})`, color: "purple" },
            { id: "midpoint", latex: `(${midpointX}, ${midpointY})`, color: "red", label: "Midpoint" },
            { id: "line", latex: slope !== "undefined" ? equation : `x = ${x1}`, color: "green" }
        ]);

        document.getElementById("midpoint-text").innerHTML = `Midpoint Formula: \\[ \\left( \\frac{x_1 + x_2}{2}, \\frac{y_1 + y_2}{2} \\right) \\] <br> Midpoint = (${midpointX.toFixed(2)}, ${midpointY.toFixed(2)})`;

        document.getElementById("slope-text").innerHTML = `Slope Formula: \\[ m = \\frac{y_2 - y_1}{x_2 - x_1} \\] <br> Slope = ${slope === "undefined" ? "undefined (vertical line)" : slope.toFixed(2)}`;

        document.getElementById("equation-text").innerHTML = `Equation of Line: ${equation}`;
    }

    function calculateMidpoint() {
        const x1 = parseFloat(document.getElementById("x1").value);
        const y1 = parseFloat(document.getElementById("y1").value);
        const x2 = parseFloat(document.getElementById("x2").value);
        const y2 = parseFloat(document.getElementById("y2").value);

        if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
            alert("Please enter valid numerical values for both points.");
            return;
        }

        const midpointX = (x1 + x2) / 2;
        const midpointY = (y1 + y2) / 2;

        document.getElementById("midpoint-text").innerHTML = `Midpoint Formula: \\[ \\left( \\frac{x_1 + x_2}{2}, \\frac{y_1 + y_2}{2} \\right) \\] <br> Midpoint = (${midpointX.toFixed(2)}, ${midpointY.toFixed(2)})`;
    }

    function calculateSlope() {
        const x1 = parseFloat(document.getElementById("x1").value);
        const y1 = parseFloat(document.getElementById("y1").value);
        const x2 = parseFloat(document.getElementById("x2").value);
        const y2 = parseFloat(document.getElementById("y2").value);

        if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
            alert("Please enter valid numerical values for both points.");
            return;
        }

        const slope = (x2 - x1) !== 0 ? (y2 - y1) / (x2 - x1) : "undefined";

        document.getElementById("slope-text").innerHTML = `Slope Formula: \\[ m = \\frac{y_2 - y_1}{x_2 - x_1} \\] <br> Slope = ${slope === "undefined" ? "undefined (vertical line)" : slope.toFixed(2)}`;
    }

    function calculateEquation() {
        const x1 = parseFloat(document.getElementById("x1").value);
        const y1 = parseFloat(document.getElementById("y1").value);
        const x2 = parseFloat(document.getElementById("x2").value);
        const y2 = parseFloat(document.getElementById("y2").value);

        if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
            alert("Please enter valid numerical values for both points.");
            return;
        }

        const slope = (x2 - x1) !== 0 ? (y2 - y1) / (x2 - x1) : "undefined";
        const equation = slope !== "undefined" ? `y = ${slope.toFixed(2)}(x - ${x1}) + ${y1}` : "Vertical Line";

        document.getElementById("equation-text").innerHTML = `Equation of Line: ${equation}`;
    }
});
