import React, { useState, useEffect, useRef } from 'react';
import './SystemEquations.css';

const InteractiveGraph = () => {
    const [equation1, setEquation1] = useState('2x + y = 5');
    const [equation2, setEquation2] = useState('y = x - 1');
    const [intersection, setIntersection] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragPoint, setDragPoint] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

    const svgRef = useRef(null);
    const dragStartRef = useRef(null);

    // SVG viewport settings
    const svgWidth = 400;
    const svgHeight = 400;
    const padding = 40;
    const xMin = -10 / zoomLevel - panOffset.x;
    const xMax = 10 / zoomLevel - panOffset.x;
    const yMin = -10 / zoomLevel - panOffset.y;
    const yMax = 10 / zoomLevel - panOffset.y;

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
                        y={toSvgY(0) + 15}
                        textAnchor="middle"
                        fill="#a29bfe"
                        fontSize="6"
                        className="tick-text"
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
                        x={toSvgX(0) - 15}
                        y={y + 3}
                        textAnchor="middle"
                        fill="#a29bfe"
                        fontSize="6"
                        className="tick-text"
                    >
                        {i}
                    </text>
                </g>
            );
        }

        return [...xTicks, ...yTicks];
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

    // Initialize with default equations
    useEffect(() => {
        handleGraphEquations();
    }, []);

    // Update graph when zoom or pan changes
    useEffect(() => {
        handleGraphEquations();
    }, [zoomLevel, panOffset]);

    // Handle mouse wheel for zooming
    const handleWheel = (e) => {
        e.preventDefault();
        const delta = e.deltaY;
        setZoomLevel(prev => Math.max(0.5, Math.min(5, prev - delta * 0.001)));
    };

    // Handle mouse down for dragging
    const handleMouseDown = (e) => {
        if (e.target.tagName === 'circle' && intersection && intersection.type === 'point') {
            // If clicking on intersection point
            setIsDragging(true);
            setDragPoint('intersection');
            return;
        }

        // Otherwise start panning
        setIsDragging(true);
        setDragPoint('canvas');
        dragStartRef.current = {
            x: e.clientX,
            y: e.clientY,
            panOffset: { ...panOffset }
        };
    };

    // Handle mouse move for dragging
    const handleMouseMove = (e) => {
        if (!isDragging) return;

        if (dragPoint === 'intersection' && intersection && intersection.type === 'point') {
            // Get SVG coordinates
            const svgRect = svgRef.current.getBoundingClientRect();
            const x = ((e.clientX - svgRect.left - padding) / (svgWidth - 2 * padding)) * (xMax - xMin) + xMin;
            const y = -((e.clientY - svgRect.top - padding) / (svgHeight - 2 * padding)) * (yMax - yMin) + yMax;

            // Update equations based on new point
            const line1 = parseEquation(equation1);
            const line2 = parseEquation(equation2);

            if (line1 && line2) {
                // For simplicity, just update the y-intercept of both lines to pass through the new point
                const newB1 = y - line1.m * x;
                const newB2 = y - line2.m * x;

                // Update equations
                if (equation1.match(/y=/)) {
                    setEquation1(`y = ${line1.m}x + ${newB1.toFixed(2)}`);
                }
                if (equation2.match(/y=/)) {
                    setEquation2(`y = ${line2.m}x + ${newB2.toFixed(2)}`);
                }

                handleGraphEquations();
            }
        } else if (dragPoint === 'canvas' && dragStartRef.current) {
            // Calculate pan distance in pixels
            const dx = e.clientX - dragStartRef.current.x;
            const dy = e.clientY - dragStartRef.current.y;

            // Convert to coordinate system units
            const scaleX = (xMax - xMin) / (svgWidth - 2 * padding);
            const scaleY = (yMax - yMin) / (svgHeight - 2 * padding);

            // Update pan offset
            setPanOffset({
                x: dragStartRef.current.panOffset.x - dx * scaleX,
                y: dragStartRef.current.panOffset.y + dy * scaleY
            });
        }
    };

    // Handle mouse up to stop dragging
    const handleMouseUp = () => {
        setIsDragging(false);
        setDragPoint(null);
        dragStartRef.current = null;
    };

    // Reset view
    const resetView = () => {
        setZoomLevel(1);
        setPanOffset({ x: 0, y: 0 });
    };

    // Update graph when equations change
    const handleGraphEquations = () => {
        const intersectionPoint = findIntersection(equation1, equation2);
        setIntersection(intersectionPoint);
    };

    return (
        <div className="retro-container">
            <h1 className="retro-title">SYSTEM OF EQUATIONS</h1>

            <div className="retro-input-container">
                <div className="retro-input-group">
                    <label className="retro-label">EQUATION 1:</label>
                    <input
                        type="text"
                        value={equation1}
                        onChange={(e) => setEquation1(e.target.value)}
                        className="retro-input"
                    />
                </div>

                <div className="retro-input-group">
                    <label className="retro-label">EQUATION 2:</label>
                    <input
                        type="text"
                        value={equation2}
                        onChange={(e) => setEquation2(e.target.value)}
                        className="retro-input"
                    />
                </div>
            </div>

            <div className="retro-buttons">
                <button
                    onClick={handleGraphEquations}
                    className="retro-button"
                >
                    CALCULATE
                </button>

                <div className="retro-button-group">
                    <button
                        onClick={() => setZoomLevel(prev => Math.min(5, prev + 0.2))}
                        className="retro-button"
                    >
                        ZOOM IN
                    </button>
                    <button
                        onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.2))}
                        className="retro-button"
                    >
                        ZOOM OUT
                    </button>
                </div>

                <button
                    onClick={resetView}
                    className="retro-button"
                >
                    RESET VIEW
                </button>
            </div>

            <div className="retro-solution">
                <h2 className="retro-subtitle">SOLUTION:</h2>
                {intersection && intersection.type === 'point' && (
                    <div className="retro-result">({intersection.x}, {intersection.y})</div>
                )}
                {intersection && intersection.type === 'infinite' && (
                    <div className="retro-result infinite">INFINITE SOLUTIONS</div>
                )}
                {intersection && intersection.type === 'none' && (
                    <div className="retro-result no-solution">NO SOLUTION</div>
                )}
            </div>

            <div className="retro-interactions">
                <h2 className="retro-subtitle">INTERACTIONS:</h2>
                <ul className="retro-list">
                    <li>· DRAG THE INTERSECTION POINT TO MODIFY EQUATIONS</li>
                    <li>· DRAG ON GRAPH TO PAN THE VIEW</li>
                    <li>· USE MOUSE WHEEL TO ZOOM IN/OUT</li>
                    <li>· USE BUTTONS TO CONTROL ZOOM LEVEL</li>
                </ul>
            </div>

            <div className="retro-graph-container">
                <svg
                    ref={svgRef}
                    width={svgWidth}
                    height={svgHeight}
                    className="retro-graph"
                    onWheel={handleWheel}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
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
                            r="8"
                            fill="#6c5ce7"
                            stroke="white"
                            strokeWidth="2"
                            className="retro-point"
                        />
                    )}

                    {/* Axis labels */}
                    <text
                        x={svgWidth - padding + 10}
                        y={toSvgY(0) + 10}
                        fill="#fd79a8"
                        fontSize="8"
                    >
                        X
                    </text>
                    <text
                        x={toSvgX(0) - 10}
                        y={padding - 10}
                        fill="#fd79a8"
                        fontSize="8"
                    >
                        Y
                    </text>

                    {/* Zoom level indicator */}
                    <text
                        x={padding + 8}
                        y={padding + 16}
                        fill="#a29bfe"
                        fontSize="6"
                        className="retro-zoom-text"
                    >
                        ZOOM: {zoomLevel.toFixed(1)}x
                    </text>
                </svg>
            </div>

            <div className="retro-legend">
                <div className="retro-legend-item">
                    <div className="retro-legend-color line1"></div>
                    <span>Equation 1</span>
                </div>
                <div className="retro-legend-item">
                    <div className="retro-legend-color line2"></div>
                    <span>Equation 2</span>
                </div>
                <div className="retro-legend-item">
                    <div className="retro-legend-color point"></div>
                    <span>Intersection</span>
                </div>
            </div>
        </div>
    );
};

export default InteractiveGraph;