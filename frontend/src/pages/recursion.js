import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './recursion.css';

const Recursion = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [showCode, setShowCode] = useState(false);
    const [animationCount, setAnimationCount] = useState(5);
    const [runningAnimation, setRunningAnimation] = useState(false);
    const animationRef = useRef(null);

    // Example recursion steps for visualization
    const recursionSteps = [
        { level: 0, message: "factorial(5)" },
        { level: 1, message: "5 * factorial(4)" },
        { level: 2, message: "5 * 4 * factorial(3)" },
        { level: 3, message: "5 * 4 * 3 * factorial(2)" },
        { level: 4, message: "5 * 4 * 3 * 2 * factorial(1)" },
        { level: 5, message: "5 * 4 * 3 * 2 * 1" },
        { level: 4, message: "5 * 4 * 3 * 2" },
        { level: 3, message: "5 * 4 * 6" },
        { level: 2, message: "5 * 24" },
        { level: 1, message: "120" },
    ];

    // Examples of recursive functions
    const codeExamples = [
        {
            name: "Factorial",
            code: `function factorial(n) {
  // Base case
  if (n <= 1) {
    return 1;
  }
  
  // Recursive case
  return n * factorial(n - 1);
}

// Example: factorial(5) = 5 * 4 * 3 * 2 * 1 = 120`
        },
        {
            name: "Fibonacci",
            code: `function fibonacci(n) {
  // Base cases
  if (n <= 0) {
    return 0;
  }
  if (n === 1) {
    return 1;
  }
  
  // Recursive case
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Example: fibonacci(5) = fibonacci(4) + fibonacci(3) = 5`
        },
        {
            name: "Recursive Countdown",
            code: `function countdown(n) {
  // Base case
  if (n <= 0) {
    console.log("Blastoff!");
    return;
  }
  
  // Recursive case
  console.log(n);
  countdown(n - 1);
}

// Example: countdown(3) will print: 3, 2, 1, Blastoff!`
        }
    ];

    const [selectedExample, setSelectedExample] = useState(0);

    useEffect(() => {
        return () => {
            if (animationRef.current) {
                clearTimeout(animationRef.current);
            }
        };
    }, []);

    const runAnimation = () => {
        if (runningAnimation) return;

        setRunningAnimation(true);
        setCurrentStep(0);

        const animateSteps = (step) => {
            if (step >= recursionSteps.length) {
                setRunningAnimation(false);
                return;
            }

            setCurrentStep(step);
            animationRef.current = setTimeout(() => {
                animateSteps(step + 1);
            }, 800); // Adjust timing as needed
        };

        animateSteps(0);
    };

    const handleAnimationCountChange = (e) => {
        const count = parseInt(e.target.value, 10);
        if (!isNaN(count) && count >= 1 && count <= 10) {
            setAnimationCount(count);
        }
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
                        <div className="pixel-title">RECURSION.EXE</div>
                        <div className="pixel-nav">
                            <Link to="/" className="nav-link">HOME</Link>
                        </div>
                    </div>

                    <div className="pixel-window-body">
                        <h1 className="pixel-heading">RECURSION</h1>

                        <div className="terminal-card">
                            <div className="terminal-header">WHAT IS RECURSION?</div>
                            <div className="terminal-content">
                                <p>Recursion is when a function calls itself to solve a smaller instance of the same problem.</p>
                                <p>A recursive function needs:</p>
                                <ol>
                                    <li>Base case(s) - When to stop</li>
                                    <li>Recursive case - How to reduce the problem</li>
                                </ol>
                                <p className="pixel-quote">"To understand recursion, you must first understand recursion."</p>
                            </div>
                        </div>

                        <div className="visualization-section">
                            <div className="terminal-header">VISUALIZATION: FACTORIAL</div>
                            <div className="visualization-content">
                                <div className="controls-panel">
                                    <div className="anim-controls">
                                        <input
                                            type="number"
                                            min="1"
                                            max="10"
                                            value={animationCount}
                                            onChange={handleAnimationCountChange}
                                            className="pixel-input"
                                        />
                                        <button
                                            className="pixel-button small-button"
                                            onClick={runAnimation}
                                            disabled={runningAnimation}
                                        >
                                            RUN factorial({animationCount})
                                        </button>
                                    </div>
                                </div>

                                <div className="recursion-tree">
                                    {recursionSteps.map((step, index) => (
                                        <div
                                            key={index}
                                            className={`recursion-step ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
                                            style={{ marginLeft: `${step.level * 30}px` }}
                                        >
                                            <div className="step-content">
                                                <span className="step-message">{step.message}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

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

                        <div className="terminal-card">
                            <div className="terminal-header">WHEN TO USE RECURSION</div>
                            <div className="terminal-content">
                                <ul>
                                    <li>Tree and graph traversal</li>
                                    <li>Divide and conquer algorithms</li>
                                    <li>Backtracking problems</li>
                                    <li>Problems with recursive structures</li>
                                </ul>
                                <p className="caution-text">CAUTION: Beware of stack overflow with deep recursion!</p>
                            </div>
                        </div>
                    </div>

                    <div className="pixel-window-footer">
                        <div className="pixel-status">RUNNING RECURSION MODULE</div>
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

export default Recursion;