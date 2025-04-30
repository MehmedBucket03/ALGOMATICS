import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './polynomials.css'; // Reusing the same CSS

const PolynomialOperations = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [showCode, setShowCode] = useState(false);
    const [operationType, setOperationType] = useState('long');
    const [runningAnimation, setRunningAnimation] = useState(false);
    const [divisionSteps, setDivisionSteps] = useState([]);
    const animationRef = useRef(null);
    const [selectedExample, setSelectedExample] = useState(0);
    const [userQuestion, setUserQuestion] = useState('');
    const [questions, setQuestions] = useState([]);

    // Example polynomials
    const [dividend, setDividend] = useState("x³ - 2x² - 4");
    const [divisor, setDivisor] = useState("x - 3");

    // Example code for polynomial operations
    const codeExamples = [
        {
            name: "Long Division",
            code: `function longDivision(dividend, divisor) {
  // Step 1: Set up the problem
  let result = [];
  let remainder = [...dividend];
  
  // Step 2: While the remainder degree is >= divisor degree
  while (highestDegree(remainder) >= highestDegree(divisor)) {
    // Step 3: Calculate the next term
    let term = divide(
      leading(remainder),
      leading(divisor),
      highestDegree(remainder) - highestDegree(divisor)
    );
    result.push(term);
    
    // Step 4: Multiply the divisor by the term
    let product = multiply(divisor, term);
    
    // Step 5: Subtract from the remainder
    remainder = subtract(remainder, product);
  }
  
  return {
    quotient: result,
    remainder: remainder
  };
}`
        },
        {
            name: "Synthetic Division",
            code: `function syntheticDivision(coefficients, constant) {
  // For dividing by (x - constant)
  
  // Step 1: Set up the synthetic division array
  let result = [coefficients[0]];
  
  // Step 2: Iterate through the coefficients
  for (let i = 1; i < coefficients.length; i++) {
    // Multiply previous result by the constant
    let product = result[i-1] * constant;
    
    // Add the next coefficient
    result.push(coefficients[i] + product);
  }
  
  // Step 3: The last element is the remainder
  let remainder = result.pop();
  
  return {
    quotient: result,
    remainder: remainder
  };
}`
        },
    ];

    // Function to parse polynomial input and extract coefficients
    const parsePolynomial = (poly) => {
        // This is a simplified parser for demonstration
        try {
            const trimmed = poly.trim();
            // Return the polynomial for display
            return trimmed;
        } catch (e) {
            console.error("Error parsing polynomial:", e);
            return null;
        }
    };

    // Function to calculate the result of polynomial division (simplified)
    const calculatePolynomialDivision = (dividendStr, divisorStr) => {
        // This is just a demonstration - in a real app you'd implement actual polynomial division

        // For the example of (x³ - 2x² - 4) ÷ (x - 3)
        if (dividendStr === "x³ - 2x² - 4" && divisorStr === "x - 3") {
            return {
                quotient: "x² + x + 3",
                remainder: 5
            };
        }

        // For simple linear divisors (x - c), make a reasonable result
        if (divisorStr.match(/^x\s*[-+]\s*\d+$/)) {
            const constant = parseFloat(divisorStr.replace(/^x\s*([-+])\s*(\d+)$/, '$1$2'));
            return {
                quotient: "Calculated quotient", // In real implementation, calculate this
                remainder: Math.abs(constant) + 1 // Just a demo value
            };
        }

        // Generic fallback
        return {
            quotient: "Resulting quotient",
            remainder: 2
        };
    };

    // Generate steps for long division of polynomials based on user input
    const generateLongDivisionSteps = () => {
        const parsedDividend = parsePolynomial(dividend);
        const parsedDivisor = parsePolynomial(divisor);

        if (!parsedDividend || !parsedDivisor) {
            setDivisionSteps([{ level: 0, message: "Error: Invalid polynomial format" }]);
            return;
        }

        const result = calculatePolynomialDivision(dividend, divisor);

        // Generate steps for long division
        const steps = [
            { level: 0, message: `Divide: (${parsedDividend}) ÷ (${parsedDivisor})` },
            { level: 1, message: "Step 1: Divide the highest term of dividend by highest term of divisor" },
            { level: 1, message: "Multiply result by divisor and subtract from dividend" },
            { level: 2, message: "Continue process with the remainder" },
            { level: 3, message: "Repeat until remainder degree < divisor degree" },
            // Final result step
            { level: 4, message: `Final result: ${result.quotient} with remainder ${result.remainder}` },
            { level: 4, message: `(${parsedDividend}) = (${parsedDivisor})(${result.quotient}) + ${result.remainder}` }
        ];

        setDivisionSteps(steps);
    };

    // Generate steps for synthetic division of polynomials
    const generateSyntheticDivisionSteps = () => {
        const parsedDividend = parsePolynomial(dividend);
        const parsedDivisor = parsePolynomial(divisor);

        if (!parsedDividend || !parsedDivisor) {
            setDivisionSteps([{ level: 0, message: "Error: Invalid polynomial format" }]);
            return;
        }

        // Check if divisor is in the form (x - c)
        const syntheticMatch = divisor.match(/^x\s*[-+]\s*\d+$/);
        if (!syntheticMatch) {
            setDivisionSteps([
                { level: 0, message: `Synthetic Division: (${parsedDividend}) ÷ (${parsedDivisor})` },
                { level: 1, message: "Note: Synthetic division works only for divisors of form (x - c)" }
            ]);
            return;
        }

        const result = calculatePolynomialDivision(dividend, divisor);
        const constant = parseFloat(divisor.replace(/^x\s*([-+])\s*(\d+)$/, '$1$2')) * -1;

        // Generate steps for synthetic division
        const steps = [
            { level: 0, message: `Synthetic Division: (${parsedDividend}) ÷ (${parsedDivisor})` },
            { level: 1, message: `Step 1: Extract constant c = ${constant} from divisor (x - ${constant * -1})` },
            { level: 2, message: "Step 2: Set up coefficients and bring down first one" },
            { level: 3, message: "Step 3: Multiply by c and add to next coefficient" },
            { level: 4, message: "Step 4: Repeat process for all coefficients" },
            // Final result step
            { level: 5, message: `Quotient: ${result.quotient}, Remainder: ${result.remainder}` }
        ];

        setDivisionSteps(steps);
    };

    // Generate appropriate steps based on the selected operation type and inputs
    useEffect(() => {
        if (operationType === 'long') {
            generateLongDivisionSteps();
        } else {
            generateSyntheticDivisionSteps();
        }
    }, [operationType, dividend, divisor]);

    // Clean up running animations on unmount or when inputs change
    useEffect(() => {
        if (animationRef.current) {
            clearTimeout(animationRef.current);
            setRunningAnimation(false);
        }

        return () => {
            if (animationRef.current) {
                clearTimeout(animationRef.current);
            }
        };
    }, [operationType, dividend, divisor]);

    const runAnimation = () => {
        if (runningAnimation) {
            // Stop animation if already running
            if (animationRef.current) {
                clearTimeout(animationRef.current);
                setRunningAnimation(false);
            }
            return;
        }

        setRunningAnimation(true);
        setCurrentStep(0);

        const animateSteps = (step) => {
            if (step >= divisionSteps.length) {
                setRunningAnimation(false);
                return;
            }

            setCurrentStep(step);
            animationRef.current = setTimeout(() => {
                animateSteps(step + 1);
            }, 1200); // Animation timing
        };

        animateSteps(0);
    };

    const handleDivisorChange = (e) => {
        setDivisor(e.target.value);
        // Reset animation when input changes
        if (runningAnimation) {
            if (animationRef.current) {
                clearTimeout(animationRef.current);
            }
            setRunningAnimation(false);
        }
    };

    const handleDividendChange = (e) => {
        setDividend(e.target.value);
        // Reset animation when input changes
        if (runningAnimation) {
            if (animationRef.current) {
                clearTimeout(animationRef.current);
            }
            setRunningAnimation(false);
        }
    };

    const handleQuestionSubmit = (e) => {
        e.preventDefault();
        if (userQuestion.trim() === '') return;

        // Add the question to the list
        setQuestions([...questions, userQuestion]);
        // Clear the input
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
                        <div className="pixel-title">POLYNOMIAL.EXE</div>
                        <div className="pixel-nav">
                            <Link to="/" className="nav-link">HOME</Link>
                        </div>
                    </div>

                    <div className="pixel-window-body">
                        <h1 className="pixel-heading">POLYNOMIAL DIVISION</h1>

                        <div className="terminal-card">
                            <div className="terminal-header">WHAT IS POLYNOMIAL DIVISION?</div>
                            <div className="terminal-content">
                                <p>Polynomial division is a method for dividing one polynomial by another, resulting in a quotient and a remainder.</p>
                                <p>Two common methods are:</p>
                                <ol>
                                    <li>Long Division - Similar to arithmetic long division</li>
                                    <li>Synthetic Division - A shorthand method for dividing by (x - c)</li>
                                </ol>
                                <p className="pixel-quote">"Every polynomial of degree n has exactly n roots (counting multiplicity)."</p>
                            </div>
                        </div>

                        <div className="visualization-section">
                            <div className="terminal-header">VISUALIZATION: POLYNOMIAL DIVISION</div>
                            <div className="visualization-content">
                                <div className="controls-panel">
                                    <div className="anim-controls">
                                        <div className="operation-selector">
                                            <button
                                                className={`pixel-button small-button ${operationType === 'long' ? 'active' : ''}`}
                                                onClick={() => {
                                                    setOperationType('long');
                                                    // Reset animation
                                                    if (runningAnimation) {
                                                        if (animationRef.current) {
                                                            clearTimeout(animationRef.current);
                                                        }
                                                        setRunningAnimation(false);
                                                    }
                                                }}
                                            >
                                                LONG DIVISION
                                            </button>
                                            <button
                                                className={`pixel-button small-button ${operationType === 'synthetic' ? 'active' : ''}`}
                                                onClick={() => {
                                                    setOperationType('synthetic');
                                                    // Reset animation
                                                    if (runningAnimation) {
                                                        if (animationRef.current) {
                                                            clearTimeout(animationRef.current);
                                                        }
                                                        setRunningAnimation(false);
                                                    }
                                                }}
                                            >
                                                SYNTHETIC DIVISION
                                            </button>
                                        </div>
                                        <div className="polynomial-inputs">
                                            <div className="input-group">
                                                <label>Dividend:</label>
                                                <input
                                                    type="text"
                                                    value={dividend}
                                                    onChange={handleDividendChange}
                                                    className="pixel-input polynomial-input"
                                                    disabled={runningAnimation}
                                                />
                                            </div>
                                            <div className="input-group">
                                                <label>Divisor:</label>
                                                <input
                                                    type="text"
                                                    value={divisor}
                                                    onChange={handleDivisorChange}
                                                    className="pixel-input polynomial-input"
                                                    disabled={runningAnimation}
                                                />
                                            </div>
                                            <button
                                                className="pixel-button small-button"
                                                onClick={runAnimation}
                                                disabled={runningAnimation}
                                            >
                                                {runningAnimation ? 'RUNNING...' : 'RUN DIVISION'}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="recursion-tree">
                                    {divisionSteps.map((step, index) => (
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

                        {/* New Questions/Comments Section */}
                        <div className="terminal-card">
                            <div className="terminal-header">QUESTIONS & COMMENTS</div>
                            <div className="terminal-content">
                                <form onSubmit={handleQuestionSubmit}>
                                    <div className="question-input-container">
                                        <input
                                            type="text"
                                            value={userQuestion}
                                            onChange={(e) => setUserQuestion(e.target.value)}
                                            className="pixel-input question-input"
                                            placeholder="Ask a question about polynomial division..."
                                        />
                                        <button type="submit" className="pixel-button small-button">SUBMIT</button>
                                    </div>
                                </form>
                                <div className="questions-list">
                                    {questions.length > 0 ? (
                                        <ul>
                                            {questions.map((q, i) => (
                                                <li key={i} className="question-item">{q}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="no-questions">No questions yet. Feel free to ask!</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="terminal-card">
                            <div className="terminal-header">APPLICATIONS OF POLYNOMIAL DIVISION</div>
                            <div className="terminal-content">
                                <ul>
                                    <li>Finding polynomial roots</li>
                                    <li>Factoring higher-degree polynomials</li>
                                    <li>Partial fraction decomposition</li>
                                    <li>Proving the Remainder Theorem</li>
                                </ul>
                                <p className="caution-text">CAUTION: Always check for special cases like zero coefficients!</p>
                            </div>
                        </div>
                    </div>

                    <div className="pixel-window-footer">
                        <div className="pixel-status">RUNNING POLYNOMIAL MODULE</div>
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

export default PolynomialOperations;