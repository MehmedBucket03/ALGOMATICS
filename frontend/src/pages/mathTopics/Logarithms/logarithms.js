import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Logarithms.css';

const saveProgressToFirestore = async (inputString) => {
    const user = auth.currentUser;
    if (!user) return;

    const topicId = 'logarithms';
    const docRef = doc(db, 'users', user.uid);
    await setDoc(docRef, {
        lastTopicVisited: topicId,
        [`topics.${topicId}`]: {
            input: inputString,
            timestamp: new Date().toISOString()
        }
    }, { merge: true });
};

const Logarithms = () => {
    const [activeTab, setActiveTab] = useState('introduction');
    const [animatedText, setAnimatedText] = useState('');
    const [sliderBase, setSliderBase] = useState(2);
    const [sliderValue, setSliderValue] = useState(8);
    const [expBase, setExpBase] = useState(2);
    const [expResult, setExpResult] = useState(8);
    const [logInput, setLogInput] = useState(8);
    const [logBase, setLogBase] = useState(2);
    const [logResult, setLogResult] = useState(3);
    const [equation, setEquation] = useState('y = 2^x');
    const [showSolution, setShowSolution] = useState(false);
    const canvasRef = useRef(null);

    // Practice problem state
    const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
    const [practiceProblems, setPracticeProblems] = useState([
        {
            problem: "2^x = 32",
            steps: [
                {
                    step: "Take the logarithm (base 2) of both sides:",
                    equation: "log₂(2^x) = log₂(32)"
                },
                {
                    step: "Use the property log₂(2^x) = x:",
                    equation: "x = log₂(32)"
                },
                {
                    step: "Calculate log₂(32):",
                    equation: "x = 5",
                    note: "(Because 2^5 = 32)"
                }
            ]
        },
        {
            problem: "log₃(x) = 4",
            steps: [
                {
                    step: "Convert to exponential form:",
                    equation: "x = 3^4"
                },
                {
                    step: "Calculate:",
                    equation: "x = 81"
                }
            ]
        },
        {
            problem: "5^(x+1) = 125",
            steps: [
                {
                    step: "Use the property 5^3 = 125:",
                    equation: "5^(x+1) = 5^3"
                },
                {
                    step: "Equate the exponents:",
                    equation: "x + 1 = 3"
                },
                {
                    step: "Solve for x:",
                    equation: "x = 2"
                }
            ]
        },
        {
            problem: "log₁₀(100x) = 3",
            steps: [
                {
                    step: "Convert to exponential form:",
                    equation: "100x = 10^3"
                },
                {
                    step: "Simplify:",
                    equation: "100x = 1000"
                },
                {
                    step: "Solve for x:",
                    equation: "x = 10"
                }
            ]
        }
    ]);

    // Introduction text for typing effect
    const introText = "Logarithms and exponential equations are powerful mathematical tools that model growth, decay, and various natural phenomena.";
    const typingSpeed = 30; // milliseconds per character

    // Typing effect
    useEffect(() => {
        let i = 0;
        if (activeTab === 'introduction') {
            const typing = setInterval(() => {
                if (i < introText.length) {
                    setAnimatedText(introText.substring(0, i + 1));
                    i++;
                } else {
                    clearInterval(typing);
                }
            }, typingSpeed);

            return () => clearInterval(typing);
        }
    }, [activeTab]);

    // Update log result
    useEffect(() => {
        const result = Math.log(logInput) / Math.log(logBase);
        setLogResult(parseFloat(result.toFixed(4)));
    }, [logInput, logBase]);

    // Draw graph
    useEffect(() => {
        if (activeTab === 'visualization' && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const width = canvas.width;
            const height = canvas.height;

            // Clear canvas
            ctx.fillStyle = '#191932';
            ctx.fillRect(0, 0, width, height);

            // Draw grid
            ctx.strokeStyle = '#2c2c54';
            ctx.lineWidth = 1;

            // Vertical grid lines
            for (let x = 0; x <= width; x += 20) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
            }

            // Horizontal grid lines
            for (let y = 0; y <= height; y += 20) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }

            // Draw axes
            ctx.strokeStyle = '#a29bfe';
            ctx.lineWidth = 2;

            // x-axis
            ctx.beginPath();
            ctx.moveTo(0, height / 2);
            ctx.lineTo(width, height / 2);
            ctx.stroke();

            // y-axis
            ctx.beginPath();
            ctx.moveTo(width / 2, 0);
            ctx.lineTo(width / 2, height);
            ctx.stroke();

            // Draw exponential curve: y = base^x
            ctx.strokeStyle = '#fd79a8';
            ctx.lineWidth = 3;
            ctx.beginPath();

            const baseValue = parseFloat(expBase);

            for (let pixelX = 0; pixelX < width; pixelX++) {
                // Convert pixel coordinates to math coordinates
                const x = (pixelX - width / 2) / 25;
                const y = Math.pow(baseValue, x);

                // Convert math coordinates back to pixel coordinates
                const pixelY = height / 2 - y * 25;

                if (pixelX === 0) {
                    ctx.moveTo(pixelX, pixelY);
                } else {
                    ctx.lineTo(pixelX, pixelY);
                }
            }
            ctx.stroke();

            // Draw logarithmic curve: y = log_base(x)
            ctx.strokeStyle = '#55efc4';
            ctx.lineWidth = 3;
            ctx.beginPath();

            for (let pixelX = width / 2 + 1; pixelX < width; pixelX++) {
                // Convert pixel coordinates to math coordinates
                const x = (pixelX - width / 2) / 25;
                const y = Math.log(x) / Math.log(baseValue);

                // Convert math coordinates back to pixel coordinates
                const pixelY = height / 2 - y * 25;

                if (pixelX === width / 2 + 1) {
                    ctx.moveTo(pixelX, pixelY);
                } else {
                    ctx.lineTo(pixelX, pixelY);
                }
            }
            ctx.stroke();

            // Add labels
            ctx.fillStyle = '#dfe6e9';
            ctx.font = "12px 'Silkscreen', monospace";
            ctx.fillText(`y = ${expBase}^x`, width - 80, 20);
            ctx.fillText(`y = log_${expBase}(x)`, width - 120, 40);

            // Axis labels
            ctx.fillText("X", width - 10, height / 2 - 5);
            ctx.fillText("Y", width / 2 + 5, 15);

            // Plot points at integer coordinates
            ctx.fillStyle = '#ffeaa7';
            for (let x = -5; x <= 5; x++) {
                if (x === 0) continue;
                const pixelX = width / 2 + x * 25;

                // Plot points on exponential curve
                const expY = Math.pow(baseValue, x);
                const pixelExpY = height / 2 - expY * 25;

                if (pixelExpY > 0 && pixelExpY < height) {
                    ctx.beginPath();
                    ctx.arc(pixelX, pixelExpY, 4, 0, Math.PI * 2);
                    ctx.fill();

                    // Label coordinates
                    ctx.fillStyle = '#fd79a8';
                    ctx.fillText(`(${x},${expY.toFixed(1)})`, pixelX + 5, pixelExpY - 5);
                    ctx.fillStyle = '#ffeaa7';
                }

                // Plot points on logarithmic curve for positive x
                if (x > 0) {
                    const logY = Math.log(x) / Math.log(baseValue);
                    const pixelLogY = height / 2 - logY * 25;

                    if (pixelLogY > 0 && pixelLogY < height) {
                        ctx.beginPath();
                        ctx.arc(pixelX, pixelLogY, 4, 0, Math.PI * 2);
                        ctx.fill();

                        // Label coordinates
                        ctx.fillStyle = '#55efc4';
                        ctx.fillText(`(${x},${logY.toFixed(1)})`, pixelX + 5, pixelLogY - 5);
                        ctx.fillStyle = '#ffeaa7';
                    }
                }
            }
        }
    }, [activeTab, expBase]);

    // Handle changing exponential base
    const handleExpBaseChange = (e) => {
        const base = parseFloat(e.target.value);
        setExpBase(base);
        // Update equation
        setEquation(`y = ${base}^x`);
    };

    // Handle changing exponential result
    const handleExpResultChange = (e) => {
        setExpResult(parseFloat(e.target.value));
    };

    // Calculate exponential value
    const calculateExp = () => {
        return Math.pow(expBase, expResult).toFixed(4);
    };

    // Handle next problem
    const handleNextProblem = () => {
        setShowSolution(false);
        setCurrentProblemIndex((prevIndex) =>
            (prevIndex + 1) % practiceProblems.length
        );
    };

    // Handle previous problem
    const handlePrevProblem = () => {
        setShowSolution(false);
        setCurrentProblemIndex((prevIndex) =>
            (prevIndex - 1 + practiceProblems.length) % practiceProblems.length
        );
    };

    // Interactive logarithm demo with base and value sliders
    const logDemo = () => {
        const result = Math.log(sliderValue) / Math.log(sliderBase);
        return (
            <div className="pixel-demo-container">
                <div className="pixel-demo-equation">
                    log<sub>{sliderBase}</sub>({sliderValue}) = {result.toFixed(4)}
                </div>
                <div className="pixel-sliders">
                    <div className="pixel-slider-group">
                        <label>Base (b):</label>
                        <input
                            type="range"
                            min="2"
                            max="10"
                            step="1"
                            value={sliderBase}
                            onChange={(e) => setSliderBase(parseInt(e.target.value))}
                            className="pixel-slider"
                        />
                        <span className="pixel-slider-value">{sliderBase}</span>
                    </div>
                    <div className="pixel-slider-group">
                        <label>Value (x):</label>
                        <input
                            type="range"
                            min="1"
                            max="100"
                            step="1"
                            value={sliderValue}
                            onChange={(e) => setSliderValue(parseInt(e.target.value))}
                            className="pixel-slider"
                        />
                        <span className="pixel-slider-value">{sliderValue}</span>
                    </div>
                </div>
                <div className="pixel-demo-explanation">
                    <p>This is the value of y in b<sup>y</sup> = x</p>
                    <p>So {sliderBase}<sup>{result.toFixed(4)}</sup> = {sliderValue}</p>
                </div>
            </div>
        );
    };

    // Render calculator for logarithms
    const logCalculator = () => {
        return (
            <div className="pixel-calculator">
                <div className="pixel-calculator-title">Logarithm Calculator</div>
                <div className="pixel-calculator-form">
                    <div className="pixel-input-group">
                        <label>Value (x):</label>
                        <input
                            type="number"
                            value={logInput}
                            onChange={(e) => setLogInput(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                            className="pixel-input"
                            min="0.1"
                            step="0.1"
                        />
                    </div>
                    <div className="pixel-input-group">
                        <label>Base (b):</label>
                        <input
                            type="number"
                            value={logBase}
                            onChange={(e) => setLogBase(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                            className="pixel-input"
                            min="0.1"
                            step="0.1"
                        />
                    </div>
                    <div className="pixel-output">
                        <div className="pixel-output-label">log<sub>{logBase}</sub>({logInput}) =</div>
                        <div className="pixel-output-value">{logResult}</div>
                    </div>
                </div>
                <div className="pixel-calculator-explanation">
                    <p>The logarithm log<sub>b</sub>(x) is the exponent y such that b<sup>y</sup> = x</p>
                    <p>So {logBase}<sup>{logResult}</sup> ≈ {logInput}</p>
                </div>
            </div>
        );
    };

    // Example practice problem
    const practiceExercise = () => {
        const currentProblem = practiceProblems[currentProblemIndex];

        return (
            <div className="pixel-practice">
                <div className="pixel-practice-problem">
                    <h3>Solve the exponential equation:</h3>
                    <div className="pixel-equation">{currentProblem.problem}</div>
                </div>

                <div className="pixel-navigation-buttons">
                    <button
                        className="pixel-button pixel-small-button"
                        onClick={handlePrevProblem}
                    >
                        Previous
                    </button>
                    <span className="pixel-problem-counter">
                        Problem {currentProblemIndex + 1} of {practiceProblems.length}
                    </span>
                    <button
                        className="pixel-button pixel-small-button"
                        onClick={handleNextProblem}
                    >
                        Next
                    </button>
                </div>

                {!showSolution ? (
                    <button
                        className="pixel-button pixel-small-button"
                        onClick={() => setShowSolution(true)}
                    >
                        Show Solution
                    </button>
                ) : (
                    <div className="pixel-solution">
                        {currentProblem.steps.map((step, index) => (
                            <div className="pixel-step" key={index}>
                                <div className="pixel-step-number">Step {index + 1}:</div>
                                <div className="pixel-step-text">
                                    {step.step}
                                    <div className="pixel-equation" dangerouslySetInnerHTML={{__html: step.equation.replace(/₂/g, '<sub>2</sub>').replace(/₃/g, '<sub>3</sub>').replace(/₁₀/g, '<sub>10</sub>')}} />
                                    {step.note && <div className="pixel-note">{step.note}</div>}
                                </div>
                            </div>
                        ))}
                        <button
                            className="pixel-button pixel-small-button"
                            onClick={() => setShowSolution(false)}
                        >
                            Hide Solution
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="math-container">
            {/* Header */}
            <div className="pixel-window pixel-header">
                <div className="pixel-window-header">
                    <div className="pixel-dots">
                        <span className="pixel-dot red"></span>
                        <span className="pixel-dot yellow"></span>
                        <span className="pixel-dot green"></span>
                    </div>
                    <div className="pixel-title">MATH.EXE</div>
                </div>
                <div className="pixel-header-content">
                    <h1 className="pixel-heading-small">LOGARITHMS & EXPONENTIAL EQUATIONS</h1>
                    <Link to="/" className="pixel-button pixel-small-button">
                        Back to Home
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="pixel-content-grid">
                {/* Navigation */}
                <div className="pixel-window pixel-navigation">
                    <div className="pixel-window-header">
                        <div className="pixel-title">NAVIGATION</div>
                    </div>
                    <div className="pixel-navigation-links">
                        <button
                            className={`pixel-nav-link ${activeTab === 'introduction' ? 'active' : ''}`}
                            onClick={() => setActiveTab('introduction')}
                        >
                            Introduction
                        </button>
                        <button
                            className={`pixel-nav-link ${activeTab === 'logarithms' ? 'active' : ''}`}
                            onClick={() => setActiveTab('logarithms')}
                        >
                            Logarithms
                        </button>
                        <button
                            className={`pixel-nav-link ${activeTab === 'exponential' ? 'active' : ''}`}
                            onClick={() => setActiveTab('exponential')}
                        >
                            Exponential
                        </button>
                        <button
                            className={`pixel-nav-link ${activeTab === 'visualization' ? 'active' : ''}`}
                            onClick={() => setActiveTab('visualization')}
                        >
                            Visualization
                        </button>
                        <button
                            className={`pixel-nav-link ${activeTab === 'practice' ? 'active' : ''}`}
                            onClick={() => setActiveTab('practice')}
                        >
                            Practice
                        </button>
                    </div>
                </div>

                {/* Main Display Area */}
                <div className="pixel-window pixel-main-display">
                    <div className="pixel-window-header">
                        <div className="pixel-title">
                            {activeTab === 'introduction' && 'INTRODUCTION'}
                            {activeTab === 'logarithms' && 'LOGARITHMS'}
                            {activeTab === 'exponential' && 'EXPONENTIAL FUNCTIONS'}
                            {activeTab === 'visualization' && 'VISUALIZATION'}
                            {activeTab === 'practice' && 'PRACTICE EXERCISES'}
                        </div>
                    </div>
                    <div className="pixel-display-content">
                        {/* Introduction Content */}
                        {activeTab === 'introduction' && (
                            <div className="pixel-introduction">
                                <div className="terminal-text">
                                    <span className="prompt">$&gt;&nbsp;</span>
                                    <span className="typing-text">{animatedText}</span>
                                    <span className="blinking-cursor">▋</span>
                                </div>
                                <div className="pixel-card">
                                    <h3>Logarithms - The Inverse of Exponents</h3>
                                    <p>If b<sup>y</sup> = x, then log<sub>b</sub>(x) = y</p>
                                    <div className="pixel-card-content">
                                        <div className="pixel-example">
                                            <div>For example:</div>
                                            <div>2<sup>3</sup> = 8</div>
                                            <div>Therefore: log<sub>2</sub>(8) = 3</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="pixel-card">
                                    <h3>Key Properties</h3>
                                    <div className="pixel-properties">
                                        <div className="pixel-property">
                                            <strong>Product Rule:</strong> log<sub>b</sub>(xy) = log<sub>b</sub>(x) + log<sub>b</sub>(y)
                                        </div>
                                        <div className="pixel-property">
                                            <strong>Quotient Rule:</strong> log<sub>b</sub>(x/y) = log<sub>b</sub>(x) - log<sub>b</sub>(y)
                                        </div>
                                        <div className="pixel-property">
                                            <strong>Power Rule:</strong> log<sub>b</sub>(x<sup>n</sup>) = n · log<sub>b</sub>(x)
                                        </div>
                                        <div className="pixel-property">
                                            <strong>Change of Base:</strong> log<sub>b</sub>(x) = log<sub>c</sub>(x) / log<sub>c</sub>(b)
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Logarithms Content */}
                        {activeTab === 'logarithms' && (
                            <div className="pixel-logarithms">
                                <div className="pixel-definition">
                                    <h3>Definition</h3>
                                    <p>
                                        The logarithm of a number is the exponent to which another fixed number,
                                        the base, must be raised to produce that number.
                                    </p>
                                    <div className="pixel-formula">
                                        If b<sup>y</sup> = x, then log<sub>b</sub>(x) = y
                                    </div>
                                </div>

                                {logDemo()}

                                <div className="pixel-section">
                                    <h3>Common Logarithm Types</h3>
                                    <div className="pixel-log-types">
                                        <div className="pixel-log-type">
                                            <strong>Natural Logarithm (ln):</strong> Base e ≈ 2.71828
                                            <div className="pixel-formula">ln(x) = log<sub>e</sub>(x)</div>
                                        </div>
                                        <div className="pixel-log-type">
                                            <strong>Common Logarithm (log):</strong> Base 10
                                            <div className="pixel-formula">log(x) = log<sub>10</sub>(x)</div>
                                        </div>
                                        <div className="pixel-log-type">
                                            <strong>Binary Logarithm:</strong> Base 2
                                            <div className="pixel-formula">log<sub>2</sub>(x)</div>
                                        </div>
                                    </div>
                                </div>

                                {logCalculator()}
                            </div>
                        )}

                        {/* Exponential Content */}
                        {activeTab === 'exponential' && (
                            <div className="pixel-exponential">
                                <div className="pixel-definition">
                                    <h3>Definition</h3>
                                    <p>
                                        An exponential function has the form f(x) = b<sup>x</sup>, where b is the base
                                        and x is the exponent.
                                    </p>
                                    <div className="pixel-formula">
                                        f(x) = b<sup>x</sup>
                                    </div>
                                </div>

                                <div className="pixel-demo-container">
                                    <div className="pixel-demo-equation">
                                        {expBase}<sup>{expResult}</sup> = {calculateExp()}
                                    </div>
                                    <div className="pixel-sliders">
                                        <div className="pixel-slider-group">
                                            <label>Base (b):</label>
                                            <input
                                                type="range"
                                                min="0.1"
                                                max="10"
                                                step="0.1"
                                                value={expBase}
                                                onChange={handleExpBaseChange}
                                                className="pixel-slider"
                                            />
                                            <span className="pixel-slider-value">{expBase}</span>
                                        </div>
                                        <div className="pixel-slider-group">
                                            <label>Exponent (x):</label>
                                            <input
                                                type="range"
                                                min="-5"
                                                max="5"
                                                step="0.1"
                                                value={expResult}
                                                onChange={handleExpResultChange}
                                                className="pixel-slider"
                                            />
                                            <span className="pixel-slider-value">{expResult}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pixel-section">
                                    <h3>Characteristics of Exponential Functions</h3>
                                    <div className="pixel-exp-properties">
                                        <div className="pixel-property">
                                            <strong>Domain:</strong> All real numbers
                                        </div>
                                        <div className="pixel-property">
                                            <strong>Range:</strong> All positive real numbers
                                        </div>
                                        <div className="pixel-property">
                                            <strong>y-intercept:</strong> (0, 1) because b<sup>0</sup> = 1
                                        </div>
                                        <div className="pixel-property">
                                            <strong>Growth/Decay:</strong>
                                            <ul>
                                                <li>If b > 1: Exponential growth</li>
                                                <li>If 0 &lt; b &lt; 1: Exponential decay</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div className="pixel-application">
                                    <h3>Real-World Applications</h3>
                                    <div className="pixel-examples">
                                        <div className="pixel-example">
                                            <strong>Compound Interest:</strong> A = P(1 + r)<sup>t</sup>
                                        </div>
                                        <div className="pixel-example">
                                            <strong>Population Growth:</strong> P(t) = P<sub>0</sub>e<sup>rt</sup>
                                        </div>
                                        <div className="pixel-example">
                                            <strong>Radioactive Decay:</strong> N(t) = N<sub>0</sub>e<sup>-λt</sup>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Visualization Content */}
                        {activeTab === 'visualization' && (
                            <div className="pixel-visualization">
                                <div className="pixel-graph-controls">
                                    <div className="pixel-control-group">
                                        <label>Base Value:</label>
                                        <input
                                            type="range"
                                            min="1.1"
                                            max="5"
                                            step="0.1"
                                            value={expBase}
                                            onChange={(e) => setExpBase(parseFloat(e.target.value))}
                                            className="pixel-slider"
                                        />
                                        <span>{expBase}</span>
                                    </div>
                                    <div className="pixel-equation-display">
                                        Current Equation: {equation}
                                    </div>
                                </div>

                                <div className="pixel-graph">
                                    <canvas
                                        ref={canvasRef}
                                        width={500}
                                        height={300}
                                        className="pixel-canvas"
                                    />
                                </div>

                                <div className="pixel-graph-legend">
                                    <div className="pixel-legend-item">
                                        <span className="pixel-legend-color exponential"></span>
                                        <span>Exponential Function: y = b<sup>x</sup></span>
                                    </div>
                                    <div className="pixel-legend-item">
                                        <span className="pixel-legend-color logarithmic"></span>
                                        <span>Logarithmic Function: y = log<sub>b</sub>(x)</span>
                                    </div>
                                </div>

                                <div className="pixel-graph-explanation">
                                    <h3>Relationship Between Functions</h3>
                                    <p>
                                        Notice how the logarithmic function is a reflection of the exponential function
                                        across the line y = x. This visualizes their inverse relationship.
                                    </p>
                                    <p>
                                        When b > 1:
                                    </p>
                                    <ul>
                                        <li>Exponential function (pink) grows rapidly</li>
                                        <li>Logarithmic function (teal) grows slowly</li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* Practice Content */}
                        {activeTab === 'practice' && (
                            <div className="pixel-practice-section">
                                <div className="pixel-rules">
                                    <h3>Key Rules to Remember</h3>
                                    <div className="pixel-rule-list">
                                        <div className="pixel-rule">log<sub>b</sub>(xy) = log<sub>b</sub>(x) + log<sub>b</sub>(y)</div>
                                        <div className="pixel-rule">log<sub>b</sub>(x/y) = log<sub>b</sub>(x) - log<sub>b</sub>(y)</div>
                                        <div className="pixel-rule">log<sub>b</sub>(x<sup>n</sup>) = n · log<sub>b</sub>(x)</div>
                                        <div className="pixel-rule">log<sub>b</sub>(b) = 1</div>
                                        <div className="pixel-rule">log<sub>b</sub>(1) = 0</div>
                                        <div className="pixel-rule">b<sup>log<sub>b</sub>(x)</sup> = x</div>
                                    </div>
                                </div>

                                {practiceExercise()}

                                <div className="pixel-more-practice">
                                    <h3>Try These Exercises</h3>
                                    <div className="pixel-exercise-list">
                                        <div className="pixel-exercise">
                                            1. Solve for x: log<sub>3</sub>(x) = 4
                                        </div>
                                        <div className="pixel-exercise">
                                            2. Simplify: log<sub>5</sub>(125)
                                        </div>
                                        <div className="pixel-exercise">
                                            3. Solve: 3<sup>x+1</sup> = 27
                                        </div>
                                        <div className="pixel-exercise">
                                            4. Express log<sub>6</sub>(18) in terms of log(2) and log(3)
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="pixel-window pixel-footer">
                <div className="pixel-window-footer">
                    <div className="pixel-status">SYSTEM READY</div>
                    <div className="pixel-memory">ALGOMATICS v1.0</div>
                </div>
            </div>
        </div>
    );
};

export default Logarithms;