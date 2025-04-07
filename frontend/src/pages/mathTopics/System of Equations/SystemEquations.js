import React, { useState, useEffect } from 'react';
import './SystemEquations.css';

const SystemEquations = () => {
    const [equation1, setEquation1] = useState('2x + y = 5');
    const [equation2, setEquation2] = useState('y = x - 1');
    const [intersection, setIntersection] = useState(null);

    // SVG viewport settings
    const svgWidth = 500;
    const svgHeight = 400;
    const padding = 40;
    const xMin = -10;
    const xMax = 10;
    const yMin = -10;
    const yMax = 10;

    // Convert math coordinates to SVG coordinates
    const toSvgX = (x) => ((x - xMin) / (xMax - xMin)) * (svgWidth - 2 * padding) + padding;
    const toSvgY = (y) => svgHeight - (((y - yMin) / (yMax - yMin)) * (svgHeight - 2 * padding) + padding);

    // Generate path for a line equation
    const generateLinePath = (equation) => {
        const parsed = parseEquation(equation);
        if (!parsed) return '';

        // Get y values for min and max x
        const y1 = parsed.m * xMin + parsed.b;
        const y2 = parsed.m * xMax + parsed.b;

        // Convert to SVG coordinates
        const x1 = toSvgX(xMin);
        const y1Svg = toSvgY(y1);
        const x2 = toSvgX(xMax);
        const y2Svg = toSvgY(y2);

        return `M ${x1} ${y1Svg} L ${x2} ${y2Svg}`;
    };

    // Parse equation to get slope (m) and y-intercept (b)
    const parseEquation = (equation) => {
        try {
            // Remove all spaces
            const cleanEq = equation.replace(/\s+/g, '');

            // Check for y = mx + b format
            let match = cleanEq.match(/y=(-?\d*\.?\d*)x([+-]\d*\.?\d*)?/);
            if (match) {
                const m = match[1] === '-' ? -1 : (match[1] === '' ? 1 : parseFloat(match[1]));
                const b = match[2] ? parseFloat(match[2]) : 0;
                return { m, b };
            }

            // Check for ax + by = c format
            match = cleanEq.match(/(-?\d*\.?\d*)x([+-]\d*\.?\d*)y=(-?\d*\.?\d*)/);
            if (match) {
                const a = parseFloat(match[1] || '1');
                const bSign = match[2].startsWith('-') ? -1 : 1;
                const b = parseFloat(match[2].substring(1) || '1') * bSign;
                const c = parseFloat(match[3]);

                // Convert to slope-intercept form: y = (-a/b)x + (c/b)
                return { m: -a / b, b: c / b };
            }

            return null;
        } catch (error) {
            console.error("Error parsing equation:", error);
            return null;
        }
    };

    // Find intersection point of two lines
    const findIntersection = (eq1, eq2) => {
        try {
            const line1 = parseEquation(eq1);
            const line2 = parseEquation(eq2);

            if (!line1 || !line2) {
                return null;
            }

            // If slopes are the same, lines are parallel
            if (line1.m === line2.m) {
                return null; // No intersection or infinite intersections
            }

            // x = (b2 - b1) / (m1 - m2)
            const x = (line2.b - line1.b) / (line1.m - line2.m);
            // y = m1 * x + b1
            const y = line1.m * x + line1.b;

            return {
                x: parseFloat(x.toFixed(2)),
                y: parseFloat(y.toFixed(2)),
                svgX: toSvgX(x),
                svgY: toSvgY(y)
            };
        } catch (error) {
            console.error("Error finding intersection:", error);
            return null;
        }
    };

    // Generate axis ticks
    const generateTicks = () => {
        const xTicks = [];
        const yTicks = [];

        // X-axis ticks
        for (let i = xMin; i <= xMax; i += 2) {
            const x = toSvgX(i);
            xTicks.push(
                <g key={`x-tick-${i}`}>
                    <line
                        x1={x}
                        y1={toSvgY(0) - 5}
                        x2={x}
                        y2={toSvgY(0) + 5}
                        stroke="#a29bfe"
                        strokeWidth="1"
                    />
                    <text
                        x={x}
                        y={toSvgY(0) + 20}
                        textAnchor="middle"
                        fill="#a29bfe"
                        fontSize="12"
                    >
                        {i}
                    </text>
                </g>
            );
        }

        // Y-axis ticks
        for (let i = yMin; i <= yMax; i += 2) {
            const y = toSvgY(i);
            yTicks.push(
                <g key={`y-tick-${i}`}>
                    <line
                        x1={toSvgX(0) - 5}
                        y1={y}
                        x2={toSvgX(0) + 5}
                        y2={y}
                        stroke="#a29bfe"
                        strokeWidth="1"
                    />
                    <text
                        x={toSvgX(0) - 20}
                        y={y + 5}
                        textAnchor="middle"
                        fill="#a29bfe"
                        fontSize="12"
                    >
                        {i}
                    </text>
                </g>
            );
        }

        return [...xTicks, ...yTicks];
    };

    // Update graph when equations change
    const handleGraphEquations = () => {
        const intersectionPoint = findIntersection(equation1, equation2);
        setIntersection(intersectionPoint);
    };

    // Initialize with default equations
    useEffect(() => {
        handleGraphEquations();
    }, []);

    const showExplanation = (method) => {
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
                <p>Substituting: x + (2x + 3) = 5 → 3x + 3 = 5 → 3x = 2 → x = 2/3</p>
                <p>Then y = 2(2/3) + 3 = 4/3 + 3 = 4/3 + 9/3 = 13/3</p>
                <p>Solution: (2/3, 13/3)</p>
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
                <p>Adding both equations: 6x + 0y = 18 → x = 3</p>
                <p>Substitute back: 2(3) + 3y = 6 → 6 + 3y = 6 → 3y = 0 → y = 0</p>
                <p>Solution: (3, 0)</p>
            `;
        }

        const explanationContent = document.getElementById("explanation-content");
        const explanationBox = document.getElementById("explanation-box");

        if (explanationContent && explanationBox) {
            explanationContent.innerHTML = content;
            explanationBox.style.display = "block";
            explanationBox.style.opacity = 1;
        }
    };

    const handleCloseExplanation = () => {
        const explanationBox = document.getElementById("explanation-box");

        if (explanationBox) {
            explanationBox.style.opacity = 0;
            setTimeout(() => {
                explanationBox.style.display = "none";
            }, 500);
        }
    };

    return (
        <div className="system-equations-container">
            {/* Background */}
            <div className="video-container">
                <div className="pixel-grid-overlay"></div>
            </div>

            <div className="system-content">
                <main className="py-8 pixel-main">
                    <div className="pixel-terminal">
                        <div className="terminal-header">
                            <div className="terminal-dots">
                                <span className="terminal-dot red"></span>
                                <span className="terminal-dot yellow"></span>
                                <span className="terminal-dot green"></span>
                            </div>
                            <div className="terminal-title">SYSTEM-OF-EQUATIONS.EXE</div>
                        </div>
                        <div className="terminal-body">
                            <h1 className="text-3xl font-bold pixel-heading">SYSTEM OF EQUATIONS</h1>
                            <p className="pixel-description">
                                Solve and visualize systems of linear equations using substitution or elimination methods.
                            </p>
                        </div>
                    </div>

                    <div className="system-grid">
                        <div className="input-section">
                            <div className="pixel-card">
                                <h2 className="card-title">Enter Your Equations</h2>
                                <div className="equation-inputs">
                                    <div className="input-group">
                                        <label htmlFor="equation1">Equation 1 (e.g., y=2x+1 or 2x+y=5):</label>
                                        <input
                                            type="text"
                                            className="equation-input"
                                            value={equation1}
                                            onChange={(e) => setEquation1(e.target.value)}
                                            placeholder="2x + y = 5"
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label htmlFor="equation2">Equation 2 (e.g., y=x-2 or x-y=3):</label>
                                        <input
                                            type="text"
                                            className="equation-input"
                                            value={equation2}
                                            onChange={(e) => setEquation2(e.target.value)}
                                            placeholder="y = x - 1"
                                        />
                                    </div>
                                </div>
                                <button className="pixel-button" onClick={handleGraphEquations}>
                                    GRAPH EQUATIONS
                                </button>
                            </div>

                            <div className="pixel-card">
                                <h2 className="card-title">Solution Methods</h2>
                                <div className="methods-buttons">
                                    <button className="pixel-button method-btn" onClick={() => showExplanation("Substitution")}>
                                        SUBSTITUTION
                                    </button>
                                    <button className="pixel-button method-btn" onClick={() => showExplanation("Elimination")}>
                                        ELIMINATION
                                    </button>
                                </div>
                            </div>

                            {intersection && (
                                <div className="pixel-card">
                                    <h2 className="card-title">Solution</h2>
                                    <div className="solution-display">
                                        <p>The equations intersect at point:</p>
                                        <div className="intersection-point">
                                            ( {intersection.x}, {intersection.y} )
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="graph-section">
                            <div className="pixel-card graph-card">
                                <h2 className="card-title">Graph Visualization</h2>
                                <div className="custom-chart-container">
                                    <svg width={svgWidth} height={svgHeight} className="svg-chart">
                                        {/* Background */}
                                        <rect x="0" y="0" width={svgWidth} height={svgHeight} fill="#191932" />

                                        {/* Grid lines */}
                                        <line
                                            x1={padding}
                                            y1={toSvgY(0)}
                                            x2={svgWidth - padding}
                                            y2={toSvgY(0)}
                                            stroke="#4834d4"
                                            strokeWidth="2"
                                        />
                                        <line
                                            x1={toSvgX(0)}
                                            y1={padding}
                                            x2={toSvgX(0)}
                                            y2={svgHeight - padding}
                                            stroke="#4834d4"
                                            strokeWidth="2"
                                        />

                                        {/* Grid ticks */}
                                        {generateTicks()}

                                        {/* Axis labels */}
                                        <text
                                            x={svgWidth - padding + 20}
                                            y={toSvgY(0) + 5}
                                            fill="#fd79a8"
                                            fontSize="14"
                                        >
                                            x
                                        </text>
                                        <text
                                            x={toSvgX(0) - 5}
                                            y={padding - 15}
                                            fill="#fd79a8"
                                            fontSize="14"
                                        >
                                            y
                                        </text>

                                        {/* Equation lines */}
                                        <path
                                            d={generateLinePath(equation1)}
                                            stroke="#fd79a8"
                                            strokeWidth="3"
                                            fill="none"
                                        />
                                        <path
                                            d={generateLinePath(equation2)}
                                            stroke="#55efc4"
                                            strokeWidth="3"
                                            fill="none"
                                        />

                                        {/* Intersection point */}
                                        {intersection && (
                                            <circle
                                                cx={intersection.svgX}
                                                cy={intersection.svgY}
                                                r="6"
                                                fill="#6c5ce7"
                                                stroke="white"
                                                strokeWidth="2"
                                            />
                                        )}

                                        {/* Legend */}
                                        <rect x={svgWidth - 140} y="15" width="12" height="12" fill="#fd79a8" />
                                        <text x={svgWidth - 120} y="25" fill="#dfe6e9" fontSize="12">Equation 1</text>
                                        <rect x={svgWidth - 140} y="35" width="12" height="12" fill="#55efc4" />
                                        <text x={svgWidth - 120} y="45" fill="#dfe6e9" fontSize="12">Equation 2</text>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Explanation Box */}
                    <div id="explanation-box" className="explanation-box">
                        <div className="explanation-header">
                            <button id="close-btn" className="close-button" onClick={handleCloseExplanation}>×</button>
                        </div>
                        <div id="explanation-content" className="explanation-content"></div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SystemEquations;