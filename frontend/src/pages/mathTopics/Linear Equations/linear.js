import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './linear.css';

const saveProgressToFirestore = async (inputString) => {
    const user = auth.currentUser;
    if (!user) return;

    const topicId = 'linear';
    const docRef = doc(db, 'users', user.uid);
    await setDoc(docRef, {
        lastTopicVisited: topicId,
        [`topics.${topicId}`]: {
            input: inputString,
            timestamp: new Date().toISOString()
        }
    }, { merge: true });
};

const LinearEquations = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [equation, setEquation] = useState('y = 2x + 1');
    const [xCoefficient, setXCoefficient] = useState(2);
    const [constant, setConstant] = useState(1);
    const [points, setPoints] = useState([]);
    const [solution, setSolution] = useState({ x: 0, y: 0 });
    const [showSolution, setShowSolution] = useState(false);
    const [targetY, setTargetY] = useState(5);
    const canvasRef = useRef(null);

    // Simulate loading
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    // Handle equation updates
    useEffect(() => {
        setEquation(`y = ${xCoefficient}x ${constant >= 0 ? '+' : ''} ${constant}`);
        generatePoints();
    }, [xCoefficient, constant]);

    // Set up canvas and draw graph whenever equation changes
    useEffect(() => {
        if (!isLoading && canvasRef.current) {
            drawGraph();
        }
    }, [isLoading, equation, points, showSolution]);

    const generatePoints = () => {
        const newPoints = [];
        for (let x = -10; x <= 10; x++) {
            const y = xCoefficient * x + constant;
            newPoints.push({ x, y });
        }
        setPoints(newPoints);

        // Calculate solution for y = targetY
        const solutionX = (targetY - constant) / xCoefficient;
        setSolution({ x: solutionX, y: targetY });
    };

    const handleSolve = () => {
        setShowSolution(true);
        setTimeout(() => {
            drawGraph();
        }, 100);
    };

    const clearSolution = () => {
        setShowSolution(false);
    };

    const drawGraph = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Set scale (pixels per unit)
        const scale = 20;
        const originX = width / 2;
        const originY = height / 2;

        // Draw grid
        ctx.strokeStyle = '#2c2c54';
        ctx.lineWidth = 1;

        // Draw grid lines
        for (let x = -Math.floor(width / (2 * scale)); x <= Math.floor(width / (2 * scale)); x++) {
            ctx.beginPath();
            ctx.moveTo(originX + x * scale, 0);
            ctx.lineTo(originX + x * scale, height);
            ctx.stroke();
        }

        for (let y = -Math.floor(height / (2 * scale)); y <= Math.floor(height / (2 * scale)); y++) {
            ctx.beginPath();
            ctx.moveTo(0, originY + y * scale);
            ctx.lineTo(width, originY + y * scale);
            ctx.stroke();
        }

        // Draw axes
        ctx.strokeStyle = '#a29bfe';
        ctx.lineWidth = 2;

        // x-axis
        ctx.beginPath();
        ctx.moveTo(0, originY);
        ctx.lineTo(width, originY);
        ctx.stroke();

        // y-axis
        ctx.beginPath();
        ctx.moveTo(originX, 0);
        ctx.lineTo(originX, height);
        ctx.stroke();

        // Draw axis labels
        ctx.fillStyle = '#fd79a8';
        ctx.font = '14px Silkscreen';

        // x-axis labels
        for (let x = -10; x <= 10; x += 2) {
            if (x !== 0) {
                ctx.fillText(x.toString(), originX + x * scale - 7, originY + 20);
            }
        }

        // y-axis labels
        for (let y = -10; y <= 10; y += 2) {
            if (y !== 0) {
                ctx.fillText(y.toString(), originX + 10, originY - y * scale + 5);
            }
        }

        // Origin label
        ctx.fillText('0', originX + 5, originY + 15);

        // Draw line for the equation
        ctx.strokeStyle = '#fd79a8';
        ctx.lineWidth = 3;
        ctx.beginPath();

        for (let i = 0; i < points.length - 1; i++) {
            const startX = originX + points[i].x * scale;
            const startY = originY - points[i].y * scale;
            const endX = originX + points[i+1].x * scale;
            const endY = originY - points[i+1].y * scale;

            if (i === 0) {
                ctx.moveTo(startX, startY);
            }
            ctx.lineTo(endX, endY);
        }

        ctx.stroke();

        // Draw solution point if showing
        if (showSolution) {
            const solutionScreenX = originX + solution.x * scale;
            const solutionScreenY = originY - solution.y * scale;

            // Draw target y line
            ctx.strokeStyle = '#55efc4';
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(0, originY - targetY * scale);
            ctx.lineTo(width, originY - targetY * scale);
            ctx.stroke();
            ctx.setLineDash([]);

            // Draw solution point
            ctx.fillStyle = '#55efc4';
            ctx.beginPath();
            ctx.arc(solutionScreenX, solutionScreenY, 6, 0, Math.PI * 2);
            ctx.fill();

            // Draw solution coordinates
            ctx.fillStyle = '#55efc4';
            ctx.font = '14px Silkscreen';
            ctx.fillText(`(${solution.x.toFixed(2)}, ${solution.y})`, solutionScreenX + 10, solutionScreenY - 10);
        }
    };

    // Update coefficient handlers
    const incrementX = () => setXCoefficient(prev => prev + 1);
    const decrementX = () => setXCoefficient(prev => prev - 1);
    const incrementC = () => setConstant(prev => prev + 1);
    const decrementC = () => setConstant(prev => prev - 1);
    const incrementTargetY = () => setTargetY(prev => prev + 1);
    const decrementTargetY = () => setTargetY(prev => prev - 1);

    return (
        <div className="linear-equation-page">
            {/* Background */}
            <div className="pixel-background">
                <div className="gif-container"></div>
                <div className="pixel-overlay"></div>
            </div>

            {/* Navigation */}
            <div className="nav-bar">
                <Link to="/math" className="home-link">
                    <div className="pixel-home-btn">
                        <span className="home-icon">◄</span> BACK TO MATH
                    </div>
                </Link>
                <Link to="/" className="home-link">
                    <div className="pixel-home-btn">
                        <span className="home-icon">◄</span> HOME
                    </div>
                </Link>
            </div>

            <div className="pixel-content">
                {isLoading ? (
                    <div className="loading-screen">
                        <div className="pixel-loading">
                            <div className="pixel-loading-text">LOADING LINEAR EQUATIONS</div>
                            <div className="pixel-loading-bar">
                                <div className="pixel-loading-progress"></div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="pixel-window linear-window">
                        <div className="pixel-window-header">
                            <div className="pixel-dots">
                                <span className="pixel-dot red"></span>
                                <span className="pixel-dot yellow"></span>
                                <span className="pixel-dot green"></span>
                            </div>
                            <div className="pixel-title">LINEAR_EQUATIONS.EXE</div>
                        </div>

                        <div className="pixel-window-body">
                            <h1 className="pixel-heading">LINEAR EQUATIONS</h1>

                            <div className="linear-calculator">
                                <div className="equation-display">
                                    <div className="terminal-text">
                                        <span className="prompt">$&gt;&nbsp;</span>
                                        <span className="typing-text">{equation}</span>
                                        <span className="blinking-cursor">▋</span>
                                    </div>
                                </div>

                                <div className="equation-controls">
                                    <div className="control-group">
                                        <div className="control-label">X COEFFICIENT</div>
                                        <div className="control-buttons">
                                            <button className="pixel-button control-btn" onClick={decrementX}>-</button>
                                            <div className="control-value">{xCoefficient}</div>
                                            <button className="pixel-button control-btn" onClick={incrementX}>+</button>
                                        </div>
                                    </div>

                                    <div className="control-group">
                                        <div className="control-label">CONSTANT TERM</div>
                                        <div className="control-buttons">
                                            <button className="pixel-button control-btn" onClick={decrementC}>-</button>
                                            <div className="control-value">{constant}</div>
                                            <button className="pixel-button control-btn" onClick={incrementC}>+</button>
                                        </div>
                                    </div>

                                    <div className="control-group">
                                        <div className="control-label">TARGET Y VALUE</div>
                                        <div className="control-buttons">
                                            <button className="pixel-button control-btn" onClick={decrementTargetY}>-</button>
                                            <div className="control-value">{targetY}</div>
                                            <button className="pixel-button control-btn" onClick={incrementTargetY}>+</button>
                                        </div>
                                    </div>
                                </div>

                                <div className="pixel-button-container">
                                    <button
                                        className="pixel-button solve-btn"
                                        onClick={handleSolve}
                                    >
                                        FIND X WHEN Y = {targetY}
                                    </button>

                                    <button
                                        className="pixel-button clear-btn"
                                        onClick={clearSolution}
                                    >
                                        CLEAR SOLUTION
                                    </button>
                                </div>

                                <div className="graph-container">
                                    <canvas
                                        ref={canvasRef}
                                        className="graph-canvas"
                                        width="600"
                                        height="400"
                                    />
                                </div>

                                {showSolution && (
                                    <div className="solution-panel">
                                        <div className="terminal-text solution-text">
                                            <span className="prompt">$&gt;&nbsp;</span>
                                            <span className="typing-text">
                                                SOLUTION: When y = {targetY}, x = {solution.x.toFixed(2)}
                                            </span>
                                            <span className="blinking-cursor">▋</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="pixel-info-section">
                                <h2 className="pixel-subheading">ABOUT LINEAR EQUATIONS</h2>
                                <div className="pixel-info-content">
                                    <p>A linear equation can be written in the form: <span className="highlight">y = mx + b</span></p>
                                    <p>Where:</p>
                                    <ul>
                                        <li><span className="highlight">m</span> is the slope (x coefficient)</li>
                                        <li><span className="highlight">b</span> is the y-intercept (constant term)</li>
                                    </ul>
                                    <p>Linear equations create straight lines when graphed.</p>
                                    <p>To find the value of x for a specific y:</p>
                                    <ol>
                                        <li>Substitute the y value into the equation</li>
                                        <li>Solve for x: <span className="highlight">x = (y - b) / m</span></li>
                                    </ol>
                                </div>
                            </div>
                        </div>

                        <div className="pixel-window-footer">
                            <div className="pixel-status">LINEAR EQUATION SYSTEM READY</div>
                            <div className="pixel-memory">MEM: 640K</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LinearEquations;