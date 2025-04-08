import React, { useState, useEffect } from 'react';
import './SystemEquations.css';

const SystemEquations = () => {
    const [equation1, setEquation1] = useState('2x + y = 5');
    const [equation2, setEquation2] = useState('y = x - 1');
    const [intersection, setIntersection] = useState(null);
    const [activeTab, setActiveTab] = useState('graph');
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [showSteps, setShowSteps] = useState(false);

    // SVG viewport settings
    const svgWidth = 400;
    const svgHeight = 400;
    const padding = 40;
    const xMin = -10;
    const xMax = 10;
    const yMin = -10;
    const yMax = 10;

    // Convert math coordinates to SVG coordinates
    const toSvgX = (x) => ((x - xMin) / (xMax - xMin)) * (svgWidth - 2 * padding) + padding;
    const toSvgY = (y) => svgHeight - (((y - yMin) / (yMax - yMin)) * (svgHeight - 2 * padding) + padding);

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
                return {
                    type: line1.b === line2.b ? 'infinite' : 'none'
                };
            }

            // x = (b2 - b1) / (m1 - m2)
            const x = (line2.b - line1.b) / (line1.m - line2.m);
            // y = m1 * x + b1
            const y = line1.m * x + line1.b;

            return {
                type: 'point',
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

    // Get solution steps
    const getSolutionSteps = (method) => {
        if (!intersection) return [];

        if (method === 'substitution') {
            try {
                // Parse equations
                const eq1 = equation1.replace(/\s+/g, '');
                const eq2 = equation2.replace(/\s+/g, '');

                // For simplicity, assume one equation is already solved for y
                let solvedEq, otherEq;
                if (eq1.startsWith('y=')) {
                    solvedEq = equation1;
                    otherEq = equation2;
                } else if (eq2.startsWith('y=')) {
                    solvedEq = equation2;
                    otherEq = equation1;
                } else {
                    // Solve the first equation for y
                    solvedEq = "y = " + equation1 + " (solved for y)";
                    otherEq = equation2;
                }

                return [
                    `Step 1: Identify the equation solved for y: ${solvedEq}`,
                    `Step 2: Substitute this expression into the other equation: ${otherEq}`,
                    `Step 3: Solve for x: x = ${intersection.x}`,
                    `Step 4: Substitute x back to find y: y = ${intersection.y}`,
                    `Step 5: Solution: (${intersection.x}, ${intersection.y})`
                ];
            } catch (e) {
                return ['Could not generate steps automatically.'];
            }
        } else if (method === 'elimination') {
            return [
                'Step 1: Align coefficients of one variable by multiplying equations',
                'Step 2: Add or subtract equations to eliminate a variable',
                'Step 3: Solve for the remaining variable',
                'Step 4: Substitute back to find the other variable',
                `Step 5: Solution: (${intersection?.x}, ${intersection?.y})`
            ];
        }

        return [];
    };

    // Render grid lines
    const renderGridLines = () => {
        const lines = [];

        // Horizontal grid lines
        for (let i = 0; i < 21; i++) {
            lines.push(
                <line
                    key={`grid-h-${i}`}
                    x1={padding}
                    y1={toSvgY(-10 + i)}
                    x2={svgWidth - padding}
                    y2={toSvgY(-10 + i)}
                    stroke="#2d3748"
                    strokeWidth="1"
                />
            );
        }

        // Vertical grid lines
        for (let i = 0; i < 21; i++) {
            lines.push(
                <line
                    key={`grid-v-${i}`}
                    x1={toSvgX(-10 + i)}
                    y1={padding}
                    x2={toSvgX(-10 + i)}
                    y2={svgHeight - padding}
                    stroke="#2d3748"
                    strokeWidth="1"
                />
            );
        }

        return lines;
    };

    return (
        <div className="math-container">
            <div className="pixel-content">
                {/* Header */}
                <div className="pixel-window pixel-header">
                    <div className="pixel-window-header">
                        <div className="pixel-dots">
                            <div className="pixel-dot red"></div>
                            <div className="pixel-dot yellow"></div>
                            <div className="pixel-dot green"></div>
                        </div>
                        <div className="pixel-title">SYSTEM-OF-EQUATIONS.EXE</div>
                        <div className="pixel-version">v1.0.1</div>
                    </div>
                    <div className="pixel-window-body">
                        <h1 className="pixel-main-title">LINEAR SYSTEMS CALCULATOR</h1>
                        <p className="pixel-description">
                            <span className="pixel-prompt">&gt;</span> Visualize and solve systems of linear equations with this interactive tool
                        </p>
                    </div>
                </div>

                <div className="pixel-content-grid">
                    {/* Input Section */}
                    <div className="pixel-sidebar">
                        <div className="pixel-window pixel-input-box">
                            <div className="pixel-window-header">
                                <div className="pixel-title">
                                    <span role="img" aria-label="keyboard" className="pixel-icon">⌨️</span> INPUT EQUATIONS
                                </div>
                            </div>
                            <div className="pixel-window-body">
                                <div className="pixel-form-group">
                                    <label className="pixel-label">Equation 1:</label>
                                    <input
                                        type="text"
                                        value={equation1}
                                        onChange={(e) => setEquation1(e.target.value)}
                                        className="pixel-input"
                                    />
                                </div>
                                <div className="pixel-form-group">
                                    <label className="pixel-label">Equation 2:</label>
                                    <input
                                        type="text"
                                        value={equation2}
                                        onChange={(e) => setEquation2(e.target.value)}
                                        className="pixel-input"
                                    />
                                </div>
                                <button
                                    onClick={handleGraphEquations}
                                    className="pixel-button"
                                >
                                    CALCULATE ↻
                                </button>
                            </div>
                        </div>

                        {/* Methods Section */}
                        <div className="pixel-window pixel-methods-box">
                            <div className="pixel-window-header">
                                <div className="pixel-title">
                                    <span role="img" aria-label="info" className="pixel-icon">ℹ️</span> SOLUTION METHODS
                                </div>
                            </div>
                            <div className="pixel-window-body">
                                <div className="pixel-button-grid">
                                    <button
                                        onClick={() => {
                                            setSelectedMethod('substitution');
                                            setShowSteps(true);
                                            setActiveTab('steps');
                                        }}
                                        className={`pixel-tab-btn ${selectedMethod === 'substitution' ? 'active' : ''}`}
                                    >
                                        SUBSTITUTION
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedMethod('elimination');
                                            setShowSteps(true);
                                            setActiveTab('steps');
                                        }}
                                        className={`pixel-tab-btn ${selectedMethod === 'elimination' ? 'active' : ''}`}
                                    >
                                        ELIMINATION
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Solution Display */}
                        {intersection && (
                            <div className="pixel-window pixel-solution-box">
                                <div className="pixel-window-header">
                                    <div className="pixel-title">
                                        <span role="img" aria-label="magnifying glass" className="pixel-icon">🔍</span> SOLUTION
                                    </div>
                                </div>
                                <div className="pixel-window-body">
                                    {intersection.type === 'point' ? (
                                        <div className="pixel-solution-content">
                                            <p className="pixel-solution-label">Intersection Point:</p>
                                            <div className="pixel-solution-display">
                                                ({ intersection.x }, { intersection.y })
                                            </div>
                                        </div>
                                    ) : intersection.type === 'infinite' ? (
                                        <div className="pixel-solution-content">
                                            <p className="pixel-solution-label pixel-infinite">Infinite Solutions!</p>
                                            <div className="pixel-solution-display pixel-infinite">
                                                The lines are identical
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="pixel-solution-content">
                                            <p className="pixel-solution-label pixel-no-solution">No Solution!</p>
                                            <div className="pixel-solution-display pixel-no-solution">
                                                The lines are parallel
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Main Display Area */}
                    <div className="pixel-main-area">
                        <div className="pixel-window pixel-display-box">
                            <div className="pixel-window-header">
                                <div className="pixel-tabs">
                                    <button
                                        onClick={() => setActiveTab('graph')}
                                        className={`pixel-tab ${activeTab === 'graph' ? 'active' : ''}`}
                                    >
                                        GRAPH
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('steps')}
                                        className={`pixel-tab ${activeTab === 'steps' ? 'active' : ''}`}
                                    >
                                        STEPS
                                    </button>
                                </div>
                            </div>

                            <div className="pixel-window-body">
                                {activeTab === 'graph' ? (
                                    <div className="pixel-graph-container">
                                        <svg width={svgWidth} height={svgHeight} className="pixel-graph">
                                            {/* Grid lines */}
                                            {renderGridLines()}

                                            {/* Axes */}
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

                                            {/* Ticks */}
                                            {generateTicks()}

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
                                            {intersection && intersection.type === 'point' && (
                                                <circle
                                                    cx={intersection.svgX}
                                                    cy={intersection.svgY}
                                                    r="6"
                                                    fill="#6c5ce7"
                                                    stroke="white"
                                                    strokeWidth="2"
                                                />
                                            )}

                                            {/* Axis labels */}
                                            <text
                                                x={svgWidth - padding + 15}
                                                y={toSvgY(0) + 15}
                                                fill="#fd79a8"
                                                fontSize="14"
                                            >
                                                X
                                            </text>
                                            <text
                                                x={toSvgX(0) - 15}
                                                y={padding - 15}
                                                fill="#fd79a8"
                                                fontSize="14"
                                            >
                                                Y
                                            </text>
                                        </svg>

                                        {/* Legend */}
                                        <div className="pixel-graph-legend">
                                            <div className="pixel-legend-item">
                                                <div className="pixel-legend-color equation1"></div>
                                                <span>Equation 1</span>
                                            </div>
                                            <div className="pixel-legend-item">
                                                <div className="pixel-legend-color equation2"></div>
                                                <span>Equation 2</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="pixel-steps-container">
                                        {selectedMethod ? (
                                            <div className="pixel-steps-content">
                                                <h3 className="pixel-steps-title">
                                                    {selectedMethod === 'substitution' ? 'Substitution Method' : 'Elimination Method'}
                                                </h3>
                                                <div className="pixel-steps-list">
                                                    {getSolutionSteps(selectedMethod).map((step, index) => (
                                                        <div key={index} className="pixel-step">
                                                            <div className="pixel-step-marker">❯</div>
                                                            <div className={`pixel-step-text ${index === getSolutionSteps(selectedMethod).length - 1 ? 'pixel-step-final' : ''}`}>
                                                                {step}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="pixel-steps-empty">
                                                <div className="pixel-empty-icon" role="img" aria-label="info">ℹ️</div>
                                                <p>Select a solution method from the left panel to see the steps</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tips Box */}
                        <div className="pixel-window pixel-tips-box">
                            <div className="pixel-window-header">
                                <div className="pixel-title">
                                    <span role="img" aria-label="lightbulb" className="pixel-icon">💡</span> TIPS & FORMATS
                                </div>
                            </div>
                            <div className="pixel-window-body">
                                <div className="pixel-tips-grid">
                                    <div className="pixel-tip-card">
                                        <h3 className="pixel-tip-title">Equation Formats</h3>
                                        <ul className="pixel-tip-list">
                                            <li><span className="pixel-bullet">•</span> y = mx + b (Slope-intercept)</li>
                                            <li><span className="pixel-bullet">•</span> ax + by = c (Standard)</li>
                                        </ul>
                                    </div>
                                    <div className="pixel-tip-card">
                                        <h3 className="pixel-tip-title">Examples</h3>
                                        <ul className="pixel-tip-list">
                                            <li><span className="pixel-bullet">•</span> y = 2x + 3</li>
                                            <li><span className="pixel-bullet">•</span> 3x + 4y = 12</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="pixel-footer">
                    <p>PixelMath Systems v1.0.1 • Made with &lt;/&gt; and 💜</p>
                </div>
            </div>
        </div>
    );
};

export default SystemEquations;