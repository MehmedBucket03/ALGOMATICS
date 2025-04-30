import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './circles.css'; // Reusing the same CSS

const CirclesComponent = () => {
    const [currentTopic, setCurrentTopic] = useState('intro');
    const [showCode, setShowCode] = useState(false);
    const [selectedExample, setSelectedExample] = useState(0);
    const [animating, setAnimating] = useState(false);
    const [userQuestion, setUserQuestion] = useState('');
    const [questions, setQuestions] = useState([]);

    // Refs for all canvas elements
    const introCanvasRef = useRef(null);
    const chordsCanvasRef = useRef(null);
    const arcsCanvasRef = useRef(null);
    const sectorsCanvasRef = useRef(null);
    const tangentsCanvasRef = useRef(null);

    // Animation reference for cleanup
    const animationRef = useRef(null);

    // Code examples
    const codeExamples = [
        {
            name: "Draw Circle",
            code: `function drawCircle(ctx, x, y, radius) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();
}

// Usage
const canvas = document.getElementById('circleCanvas');
const ctx = canvas.getContext('2d');
drawCircle(ctx, 100, 100, 50); // Circle at (100,100) with radius 50`
        },
        {
            name: "Calculate Chord Length",
            code: `function chordLength(radius, centralAngle) {
  // Central angle in radians
  return 2 * radius * Math.sin(centralAngle / 2);
}

// Example: Chord with 60° (π/3 radians) central angle
const radius = 10;
const angle = Math.PI / 3;
const length = chordLength(radius, angle);
console.log("Chord length:", length);`
        },
        {
            name: "Calculate Arc Length",
            code: `function arcLength(radius, centralAngle) {
  // Central angle in radians
  return radius * centralAngle;
}

// Example: Arc with 90° (π/2 radians) central angle
const radius = 8;
const angle = Math.PI / 2;
const length = arcLength(radius, angle);
console.log("Arc length:", length);`
        },
        {
            name: "Calculate Sector Area",
            code: `function sectorArea(radius, centralAngle) {
  // Central angle in radians
  return (radius * radius * centralAngle) / 2;
}

// Example: Sector with 120° (2π/3 radians) central angle
const radius = 6;
const angle = (2 * Math.PI) / 3;
const area = sectorArea(radius, angle);
console.log("Sector area:", area);`
        },
        {
            name: "Draw Tangent",
            code: `function drawTangent(ctx, circleX, circleY, radius, pointX, pointY) {
  // Distance from circle center to point
  const dx = pointX - circleX;
  const dy = pointY - circleY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Exit if point is inside the circle
  if (distance < radius) return;
  
  // Calculate perpendicular line (tangent)
  const normalX = dx / distance;
  const normalY = dy / distance;
  
  // Tangent points
  const tangentX = circleX + normalX * radius;
  const tangentY = circleY + normalY * radius;
  
  // Draw tangent line (perpendicular to radius)
  ctx.beginPath();
  ctx.moveTo(tangentX, tangentY);
  ctx.lineTo(
    tangentX + normalY * radius * 2,
    tangentY - normalX * radius * 2
  );
  ctx.stroke();
}

// Usage
const canvas = document.getElementById('tangentCanvas');
const ctx = canvas.getContext('2d');
drawTangent(ctx, 100, 100, 50, 170, 100); // Tangent at point (170, 100)`
        }
    ];

    // Initialize and handle animations
    useEffect(() => {
        // First render all canvas elements
        drawIntroCanvas();
        drawChordsCanvas();
        drawArcsCanvas();
        drawSectorsCanvas();
        drawTangentsCanvas();

        // Cleanup function to cancel any animations
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }
        };
    }, []);

    // Draw Introduction Canvas
    const drawIntroCanvas = () => {
        const canvas = introCanvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Set styles
        ctx.strokeStyle = '#00FF00';
        ctx.fillStyle = '#00FF00';
        ctx.lineWidth = 2;

        // Draw main circle
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 30;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Draw center point
        ctx.beginPath();
        ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
        ctx.fill();

        // Draw radius line
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + radius, centerY);
        ctx.stroke();

        // Label parts
        ctx.font = '16px VT323';
        ctx.fillStyle = '#00FF00';
        ctx.fillText('Center', centerX - 20, centerY - 10);
        ctx.fillText('Radius', centerX + radius / 2 - 20, centerY - 10);
        ctx.fillText('Circle', centerX + radius + 10, centerY);
    };

    // Draw Chords Canvas
    const drawChordsCanvas = () => {
        const canvas = chordsCanvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Set styles
        ctx.strokeStyle = '#00FF00';
        ctx.fillStyle = '#00FF00';
        ctx.lineWidth = 2;

        // Draw main circle
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 30;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Draw center point
        ctx.beginPath();
        ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
        ctx.fill();

        // Draw a chord
        const angle1 = Math.PI / 6; // 30 degrees
        const angle2 = Math.PI / 6 * 5; // 150 degrees

        const chordX1 = centerX + radius * Math.cos(angle1);
        const chordY1 = centerY + radius * Math.sin(angle1);
        const chordX2 = centerX + radius * Math.cos(angle2);
        const chordY2 = centerY + radius * Math.sin(angle2);

        ctx.beginPath();
        ctx.moveTo(chordX1, chordY1);
        ctx.lineTo(chordX2, chordY2);
        ctx.stroke();

        // Draw radius lines to show the central angle
        ctx.setLineDash([5, 3]);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(chordX1, chordY1);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(chordX2, chordY2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Label parts
        ctx.font = '16px VT323';
        ctx.fillText('Chord', (chordX1 + chordX2) / 2 - 20, (chordY1 + chordY2) / 2 + 20);
        ctx.fillText('Central Angle', centerX - 40, centerY - 20);

        // Draw the angle arc
        ctx.beginPath();
        ctx.arc(centerX, centerY, 20, angle1, angle2);
        ctx.stroke();
    };

    // Draw Arcs Canvas
    const drawArcsCanvas = () => {
        const canvas = arcsCanvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Set styles
        ctx.strokeStyle = '#00FF00';
        ctx.fillStyle = '#00FF00';
        ctx.lineWidth = 2;

        // Draw main circle
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 30;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Draw center point
        ctx.beginPath();
        ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
        ctx.fill();

        // Draw an arc
        const startAngle = -Math.PI / 4; // -45 degrees
        const endAngle = Math.PI / 2; // 90 degrees

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.strokeStyle = '#FF00FF'; // Highlight the arc
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 2;

        // Draw radius lines
        const arcX1 = centerX + radius * Math.cos(startAngle);
        const arcY1 = centerY + radius * Math.sin(startAngle);
        const arcX2 = centerX + radius * Math.cos(endAngle);
        const arcY2 = centerY + radius * Math.sin(endAngle);

        ctx.setLineDash([5, 3]);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(arcX1, arcY1);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(arcX2, arcY2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Label parts
        ctx.font = '16px VT323';
        const midAngle = (startAngle + endAngle) / 2;
        const textX = centerX + (radius + 20) * Math.cos(midAngle);
        const textY = centerY + (radius + 20) * Math.sin(midAngle);
        ctx.fillText('Arc', textX - 15, textY);

        // Label the central angle
        ctx.fillText('Central Angle', centerX - 40, centerY - 20);

        // Draw the angle arc
        ctx.beginPath();
        ctx.arc(centerX, centerY, 20, startAngle, endAngle);
        ctx.stroke();
    };

    // Draw Sectors Canvas
    const drawSectorsCanvas = () => {
        const canvas = sectorsCanvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Set styles
        ctx.strokeStyle = '#00FF00';
        ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
        ctx.lineWidth = 2;

        // Draw main circle
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 30;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Draw a sector
        const startAngle = -Math.PI / 6; // -30 degrees
        const endAngle = Math.PI / 3; // 60 degrees

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Label parts
        ctx.fillStyle = '#00FF00';
        ctx.font = '16px VT323';
        const midAngle = (startAngle + endAngle) / 2;
        const textX = centerX + (radius / 2) * Math.cos(midAngle);
        const textY = centerY + (radius / 2) * Math.sin(midAngle);
        ctx.fillText('Sector', textX - 20, textY);

        // Label the central angle
        ctx.fillText('Central Angle', centerX - 40, centerY - 20);

        // Draw the angle arc
        ctx.beginPath();
        ctx.arc(centerX, centerY, 20, startAngle, endAngle);
        ctx.stroke();
    };

    // Draw Tangents Canvas
    const drawTangentsCanvas = () => {
        const canvas = tangentsCanvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Set styles
        ctx.strokeStyle = '#00FF00';
        ctx.fillStyle = '#00FF00';
        ctx.lineWidth = 2;

        // Draw main circle
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 50;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Draw center point
        ctx.beginPath();
        ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
        ctx.fill();

        // Draw an external point
        const pointX = centerX + radius + 50;
        const pointY = centerY;

        ctx.beginPath();
        ctx.arc(pointX, pointY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillText('P', pointX + 10, pointY + 5);

        // Calculate tangent points
        const d = Math.sqrt((pointX - centerX) ** 2 + (pointY - centerY) ** 2);
        const angle = Math.asin(radius / d);
        const baseAngle = Math.atan2(pointY - centerY, pointX - centerX);

        const tangentAngle1 = baseAngle + angle;
        const tangentAngle2 = baseAngle - angle;

        const tangentX1 = centerX + radius * Math.cos(tangentAngle1);
        const tangentY1 = centerY + radius * Math.sin(tangentAngle1);

        const tangentX2 = centerX + radius * Math.cos(tangentAngle2);
        const tangentY2 = centerY + radius * Math.sin(tangentAngle2);

        // Draw tangent lines
        ctx.beginPath();
        ctx.moveTo(pointX, pointY);
        ctx.lineTo(tangentX1, tangentY1);
        ctx.strokeStyle = '#FF00FF';
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(pointX, pointY);
        ctx.lineTo(tangentX2, tangentY2);
        ctx.stroke();
        ctx.strokeStyle = '#00FF00';

        // Draw tangent points
        ctx.fillStyle = '#FF00FF';
        ctx.beginPath();
        ctx.arc(tangentX1, tangentY1, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(tangentX2, tangentY2, 5, 0, Math.PI * 2);
        ctx.fill();

        // Draw radius to tangent points (to show perpendicular)
        ctx.setLineDash([5, 3]);
        ctx.strokeStyle = '#00FF00';
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(tangentX1, tangentY1);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(tangentX2, tangentY2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw right angle marks
        drawRightAngleMark(ctx, centerX, centerY, tangentX1, tangentY1, pointX, pointY);
        drawRightAngleMark(ctx, centerX, centerY, tangentX2, tangentY2, pointX, pointY);

        // Labels
        ctx.fillStyle = '#00FF00';
        ctx.font = '16px VT323';
        ctx.fillText('Tangent Lines', pointX - 20, pointY - 20);
        ctx.fillText('Tangent Points', tangentX1 - 30, tangentY1 - 15);
    };

    // Helper to draw a right angle mark
    const drawRightAngleMark = (ctx, cx, cy, tx, ty, px, py) => {
        // Vectors
        const v1x = tx - cx;
        const v1y = ty - cy;
        const v2x = tx - px;
        const v2y = ty - py;

        // Normalize vectors
        const v1Length = Math.sqrt(v1x * v1x + v1y * v1y);
        const v1nx = v1x / v1Length;
        const v1ny = v1y / v1Length;

        const v2Length = Math.sqrt(v2x * v2x + v2y * v2y);
        const v2nx = v2x / v2Length;
        const v2ny = v2y / v2Length;

        // Calculate right angle mark points
        const size = 15;
        const p1x = tx;
        const p1y = ty;
        const p2x = tx - v1nx * size;
        const p2y = ty - v1ny * size;
        const p3x = p2x - v2nx * size;
        const p3y = p2y - v2ny * size;

        // Draw right angle mark
        ctx.strokeStyle = '#FFFF00';
        ctx.beginPath();
        ctx.moveTo(p1x, p1y);
        ctx.lineTo(p2x, p2y);
        ctx.lineTo(p3x, p3y);
        ctx.stroke();
        ctx.strokeStyle = '#00FF00';
    };

    // Handle question submission
    const handleQuestionSubmit = (e) => {
        e.preventDefault();
        if (userQuestion.trim() === '') return;

        setQuestions([...questions, userQuestion]);
        setUserQuestion('');
    };

    return (
        <div className="recursion-container">
            {/* Background elements */}
            <div className="pixel-background">
                <div className="pixel-overlay"></div>
            </div>

            {/* Main Content */}
            <div className="pixel-content">
                <div className="pixel-window recursion-window">
                    <div className="pixel-window-header">
                        <div className="pixel-dots">
                            <span className="pixel-dot red"></span>
                            <span className="pixel-dot yellow"></span>
                            <span className="pixel-dot green"></span>
                        </div>
                        <div className="pixel-title">CIRCLES.EXE</div>
                        <div className="pixel-nav">
                            <Link to="/" className="nav-link">HOME</Link>
                            <Link to="/math" className="nav-link">MATH</Link>
                        </div>
                    </div>

                    <div className="pixel-window-body">
                        <h1 className="pixel-heading">CIRCLES: CHORDS, ARCS, SECTORS, AND TANGENTS</h1>

                        <div className="terminal-card">
                            <div className="terminal-header">WHAT ARE CIRCLES?</div>
                            <div className="terminal-content">
                                <p>A circle is the set of all points in a plane that are a fixed distance (the radius) from a fixed point (the center).</p>
                                <p>Key elements of circles include:</p>
                                <ul>
                                    <li><strong>Radius:</strong> The distance from the center to any point on the circle</li>
                                    <li><strong>Diameter:</strong> A line segment passing through the center, connecting two points on the circle</li>
                                    <li><strong>Circumference:</strong> The distance around the circle (2πr)</li>
                                    <li><strong>Area:</strong> The space inside the circle (πr²)</li>
                                </ul>
                                <p className="pixel-quote">"A circle is a round straight line with a hole in the middle." — Mark Twain</p>
                            </div>
                        </div>

                        <div className="topic-navigation">
                            <div className="terminal-header">TOPICS</div>
                            <div className="topic-buttons" style={{ display: 'flex', gap: '10px', padding: '10px', backgroundColor: '#1a1a1a' }}>
                                <button
                                    className={`pixel-button ${currentTopic === 'intro' ? 'active' : ''}`}
                                    onClick={() => setCurrentTopic('intro')}
                                >
                                    INTRODUCTION
                                </button>
                                <button
                                    className={`pixel-button ${currentTopic === 'chords' ? 'active' : ''}`}
                                    onClick={() => setCurrentTopic('chords')}
                                >
                                    CHORDS
                                </button>
                                <button
                                    className={`pixel-button ${currentTopic === 'arcs' ? 'active' : ''}`}
                                    onClick={() => setCurrentTopic('arcs')}
                                >
                                    ARCS
                                </button>
                                <button
                                    className={`pixel-button ${currentTopic === 'sectors' ? 'active' : ''}`}
                                    onClick={() => setCurrentTopic('sectors')}
                                >
                                    SECTORS
                                </button>
                                <button
                                    className={`pixel-button ${currentTopic === 'tangents' ? 'active' : ''}`}
                                    onClick={() => setCurrentTopic('tangents')}
                                >
                                    TANGENTS
                                </button>
                            </div>
                        </div>

                        {/* Introduction Content */}
                        {currentTopic === 'intro' && (
                            <div className="topic-content">
                                <div className="terminal-card">
                                    <div className="terminal-header">CIRCLE BASICS</div>
                                    <div className="terminal-content">
                                        <div className="content-columns" style={{ display: 'flex', gap: '20px' }}>
                                            <div className="text-column" style={{ flex: 1 }}>
                                                <p><strong>Fundamental Properties:</strong></p>
                                                <ul>
                                                    <li>All points on the circle are equidistant from the center</li>
                                                    <li>The diameter is twice the radius (d = 2r)</li>
                                                    <li>The circumference is proportional to the diameter (C = πd = 2πr)</li>
                                                    <li>The ratio of circumference to diameter is π (approximately 3.14159)</li>
                                                    <li>The area is πr²</li>
                                                </ul>
                                                <p><strong>Circle Equation:</strong></p>
                                                <p>For a circle with center (h,k) and radius r:</p>
                                                <p className="formula">(x - h)² + (y - k)² = r²</p>
                                                <p>For a circle with center at origin:</p>
                                                <p className="formula">x² + y² = r²</p>
                                            </div>
                                            <div className="visual-column" style={{ flex: 1 }}>
                                                <canvas
                                                    ref={introCanvasRef}
                                                    width={300}
                                                    height={300}
                                                    style={{ backgroundColor: '#111', borderRadius: '4px' }}
                                                ></canvas>
                                                <div className="canvas-caption" style={{ textAlign: 'center', marginTop: '10px' }}>
                                                    Basic components of a circle
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Chords Content */}
                        {currentTopic === 'chords' && (
                            <div className="topic-content">
                                <div className="terminal-card">
                                    <div className="terminal-header">CHORDS</div>
                                    <div className="terminal-content">
                                        <div className="content-columns" style={{ display: 'flex', gap: '20px' }}>
                                            <div className="text-column" style={{ flex: 1 }}>
                                                <p><strong>Definition:</strong> A chord is a line segment that connects two points on a circle.</p>
                                                <p><strong>Properties:</strong></p>
                                                <ul>
                                                    <li>The diameter is the longest chord and passes through the center</li>
                                                    <li>Equal chords are equidistant from the center</li>
                                                    <li>The perpendicular from the center to a chord bisects the chord</li>
                                                </ul>
                                                <p><strong>Chord Length Formula:</strong></p>
                                                <p>For a chord with central angle θ (in radians) in a circle with radius r:</p>
                                                <p className="formula">Chord length = 2r·sin(θ/2)</p>
                                                <p><strong>Distance Formula:</strong></p>
                                                <p>The distance d from the center to a chord with length c:</p>
                                                <p className="formula">d = √(r² - (c/2)²)</p>
                                            </div>
                                            <div className="visual-column" style={{ flex: 1 }}>
                                                <canvas
                                                    ref={chordsCanvasRef}
                                                    width={300}
                                                    height={300}
                                                    style={{ backgroundColor: '#111', borderRadius: '4px' }}
                                                ></canvas>
                                                <div className="canvas-caption" style={{ textAlign: 'center', marginTop: '10px' }}>
                                                    Chord and central angle
                                                </div>
                                            </div>
                                        </div>
                                        <div className="theorem-box" style={{ marginTop: '20px', backgroundColor: '#222', padding: '10px', borderRadius: '4px' }}>
                                            <p><strong>Power of a Point Theorem:</strong></p>
                                            <p>If a point P is outside a circle and a line through P intersects the circle at points A and B, then PA × PB is constant for all such lines.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Arcs Content */}
                        {currentTopic === 'arcs' && (
                            <div className="topic-content">
                                <div className="terminal-card">
                                    <div className="terminal-header">ARCS</div>
                                    <div className="terminal-content">
                                        <div className="content-columns" style={{ display: 'flex', gap: '20px' }}>
                                            <div className="text-column" style={{ flex: 1 }}>
                                                <p><strong>Definition:</strong> An arc is a portion of the circumference of a circle.</p>
                                                <p><strong>Types:</strong></p>
                                                <ul>
                                                    <li>Minor Arc: Less than a semicircle</li>
                                                    <li>Major Arc: Greater than a semicircle</li>
                                                    <li>Semicircle: Exactly half of a circle</li>
                                                </ul>
                                                <p><strong>Arc Length Formula:</strong></p>
                                                <p>For an arc with central angle θ (in radians):</p>
                                                <p className="formula">Arc length = r·θ</p>
                                                <p>If θ is in degrees:</p>
                                                <p className="formula">Arc length = (π·r·θ)/180</p>
                                                <p><strong>Arc Measure:</strong></p>
                                                <p>The measure of an arc equals the measure of its central angle (in degrees or radians).</p>
                                            </div>
                                            <div className="visual-column" style={{ flex: 1 }}>
                                                <canvas
                                                    ref={arcsCanvasRef}
                                                    width={300}
                                                    height={300}
                                                    style={{ backgroundColor: '#111', borderRadius: '4px' }}
                                                ></canvas>
                                                <div className="canvas-caption" style={{ textAlign: 'center', marginTop: '10px' }}>
                                                    Arc and central angle
                                                </div>
                                            </div>
                                        </div>
                                        <div className="theorem-box" style={{ marginTop: '20px', backgroundColor: '#222', padding: '10px', borderRadius: '4px' }}>
                                            <p><strong>Inscribed Angle Theorem:</strong></p>
                                            <p>An inscribed angle is half the measure of its intercepted arc. If an angle is inscribed in a semicircle, then it is a right angle.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Sectors Content */}
                        {currentTopic === 'sectors' && (
                            <div className="topic-content">
                                <div className="terminal-card">
                                    <div className="terminal-header">SECTORS</div>
                                    <div className="terminal-content">
                                        <div className="content-columns" style={{ display: 'flex', gap: '20px' }}>
                                            <div className="text-column" style={{ flex: 1 }}>
                                                <p><strong>Definition:</strong> A sector is a region of a circle bounded by an arc and two radii.</p>
                                                <p><strong>Types:</strong></p>
                                                <ul>
                                                    <li>Minor Sector: Region bounded by a minor arc and two radii</li>
                                                    <li>Major Sector: Region bounded by a major arc and two radii</li>
                                                    <li>Semicircular Sector: Half of a circle</li>
                                                </ul>
                                                <p><strong>Sector Area Formula:</strong></p>
                                                <p>For a sector with central angle θ (in radians):</p>
                                                <p className="formula">Area = (r² × θ) / 2</p>
                                                <p>If θ is in degrees:</p>
                                                <p className="formula">Area = (π × r² × θ) / 360</p>
                                                <p><strong>Applications:</strong></p>
                                                <p>Sectors are used in pie charts, calculating areas of irregular shapes, and in engineering for designing circular segments.</p>
                                            </div>
                                            <div className="visual-column" style={{ flex: 1 }}>
                                                <canvas
                                                    ref={sectorsCanvasRef}
                                                    width={300}
                                                    height={300}
                                                    style={{ backgroundColor: '#111', borderRadius: '4px' }}
                                                ></canvas>
                                                <div className="canvas-caption" style={{ textAlign: 'center', marginTop: '10px' }}>
                                                    Sector showing area as portion of circle
                                                </div>
                                            </div>
                                        </div>
                                        <div className="example-box" style={{ marginTop: '20px', backgroundColor: '#222', padding: '10px', borderRadius: '4px' }}>
                                            <p><strong>Example:</strong> If a sector has a central angle of 60° in a circle with radius 10 cm, then:</p>
                                            <p>Area = (π × 10² × 60) / 360 = (π × 100 × 60) / 360 = (π × 100 × 1/6) = πr² × 1/6 = (1/6) × π × 100 ≈ 52.36 cm²</p>
                                            <p>Arc length = (π × 10 × 60) / 180 = (π × 10 × 1/3) = (π × 10) / 3 ≈ 10.47 cm</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tangents Content */}
                        {currentTopic === 'tangents' && (
                            <div className="topic-content">
                                <div className="terminal-card">
                                    <div className="terminal-header">TANGENTS</div>
                                    <div className="terminal-content">
                                        <div className="content-columns" style={{ display: 'flex', gap: '20px' }}>
                                            <div className="text-column" style={{ flex: 1 }}>
                                                <p><strong>Definition:</strong> A tangent to a circle is a line that intersects the circle at exactly one point, called the point of tangency.</p>
                                                <p><strong>Properties:</strong></p>
                                                <ul>
                                                    <li>A tangent is perpendicular to the radius at the point of tangency</li>
                                                    <li>From any external point, two tangents can be drawn to a circle</li>
                                                    <li>These two tangents are equal in length</li>
                                                    <li>The line from the external point to the center bisects the angle between the tangents</li>
                                                </ul>
                                                <p><strong>Tangent-Secant Theorem:</strong></p>
                                                <p>If from an external point P, a tangent PT and a secant PAB are drawn to a circle, then:</p>
                                                <p className="formula">PT² = PA × PB</p>
                                                <p>Where PT is the length of the tangent and PA and PB are the lengths of the secant segments.</p>
                                            </div>
                                            <div className="visual-column" style={{ flex: 1 }}>
                                                <canvas
                                                    ref={tangentsCanvasRef}
                                                    width={300}
                                                    height={300}
                                                    style={{ backgroundColor: '#111', borderRadius: '4px' }}
                                                ></canvas>
                                                <div className="canvas-caption" style={{ textAlign: 'center', marginTop: '10px' }}>
                                                    Tangent lines from an external point
                                                </div>
                                            </div>
                                        </div>
                                        <div className="theorem-box" style={{ marginTop: '20px', backgroundColor: '#222', padding: '10px', borderRadius: '4px' }}>
                                            <p><strong>Application in Geometry:</strong></p>
                                            <p>Tangent lines are used in constructing circles that are tangent to other circles or lines, in solving problems involving external points, and in defining the derivative in calculus.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="code-section">
                            <div className="terminal-header">
                                <div className="header-content">
                                    <span>CODE EXAMPLES</span>
                                    <button
                                        className="pixel-button small-button"
                                        onClick={() => setShowCode(!showCode)}
                                    >
                                        {showCode ? 'HIDE CODE' : 'SHOW CODE'}
                                    </button>
                                </div>
                            </div>

                            {showCode && (
                                <div className="code-content">
                                    <div className="code-tabs">
                                        {codeExamples.map((example, index) => (
                                            <button
                                                key={index}
                                                className={`code-tab ${selectedExample === index ? 'active' : ''}`}
                                                onClick={() => setSelectedExample(index)}
                                            >
                                                {example.name}
                                            </button>
                                        ))}
                                    </div>
                                    <pre className="code-display">{codeExamples[selectedExample].code}</pre>
                                </div>
                            )}
                        </div>

                        {/* Interactive elements section */}
                        <div className="terminal-card">
                            <div className="terminal-header">CIRCLE FORMULAS & RELATIONSHIPS</div>
                            <div className="terminal-content">
                                <div className="formulas-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                                    <div className="formula-card">
                                        <h3>Basic Circle Formulas</h3>
                                        <p>Circumference: C = 2πr = πd</p>
                                        <p>Area: A = πr²</p>
                                        <p>Diameter: d = 2r</p>
                                    </div>
                                    <div className="formula-card">
                                        <h3>Chord Formulas</h3>
                                        <p>Chord Length: c = 2r·sin(θ/2)</p>
                                        <p>Distance from center to chord: d = r·cos(θ/2)</p>
                                        <p>Central angle (in radians): θ = 2·arcsin(c/2r)</p>
                                    </div>
                                    <div className="formula-card">
                                        <h3>Arc Formulas</h3>
                                        <p>Arc Length: L = r·θ (θ in radians)</p>
                                        <p>Arc Length: L = (πr·θ)/180° (θ in degrees)</p>
                                    </div>
                                    <div className="formula-card">
                                        <h3>Sector Formulas</h3>
                                        <p>Sector Area: A = (r²·θ)/2 (θ in radians)</p>
                                        <p>Sector Area: A = (πr²·θ)/360° (θ in degrees)</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Questions/Comments Section */}
                        <div className="terminal-card">
                            <div className="terminal-header">QUESTIONS & COMMENTS</div>
                            <div className="terminal-content">
                                <form onSubmit={handleQuestionSubmit}>
                                    <div className="question-input-container" style={{ display: 'flex', gap: '10px' }}>
                                        <input
                                            type="text"
                                            value={userQuestion}
                                            onChange={(e) => setUserQuestion(e.target.value)}
                                            className="pixel-input"
                                            style={{ flex: 1 }}
                                            placeholder="Ask a question about circles..."
                                        />
                                        <button type="submit" className="pixel-button small-button">SUBMIT</button>
                                    </div>
                                </form>
                                <div className="questions-list" style={{ marginTop: '10px', maxHeight: '150px', overflowY: 'auto' }}>
                                    {questions.length > 0 ? (
                                        <ul style={{ paddingLeft: '20px' }}>
                                            {questions.map((q, i) => (
                                                <li key={i} className="question-item" style={{ marginBottom: '5px' }}>{q}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="no-questions">No questions yet. Feel free to ask!</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="terminal-card">
                            <div className="terminal-header">CIRCLE THEOREMS</div>
                            <div className="terminal-content">
                                <div className="theorems-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div className="theorem-box">
                                        <h3>The Inscribed Angle Theorem</h3>
                                        <p>An inscribed angle is half the measure of its intercepted arc.</p>
                                    </div>
                                    <div className="theorem-box">
                                        <h3>Power of a Point</h3>
                                        <p>If a point P is outside a circle and two secants are drawn from P, then the product of the distances from P to the two points of intersection is the same for both secants.</p>
                                    </div>
                                    <div className="theorem-box">
                                        <h3>Tangent-Secant Theorem</h3>
                                        <p>If from a point P outside a circle, a tangent PT and a secant PAB are drawn, then PT² = PA × PB.</p>
                                    </div>
                                    <div className="theorem-box">
                                        <h3>Inscribed Quadrilateral</h3>
                                        <p>A quadrilateral can be inscribed in a circle if and only if the sum of its opposite angles is 180°.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pixel-window-footer">
                        <div className="pixel-status">RUNNING CIRCLES MODULE</div>
                        <div className="pixel-memory">STACK SPACE: 640K</div>
                    </div>
                </div>

                <div className="pixel-decorations">
                    <div className="recursive-pixels">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className={`recursive-pixel p${i+1}`}></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CirclesComponent;