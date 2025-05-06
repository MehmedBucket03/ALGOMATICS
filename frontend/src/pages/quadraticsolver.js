import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './quadraticsolver.css';
import { auth, db } from '../firebase/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const saveProgressToFirestore = async (inputString) => {
    const user = auth.currentUser;
    if (!user) return;

    const topicId = 'quadratic-solver';
    const docRef = doc(db, 'users', user.uid);
    await setDoc(docRef, {
        lastTopicVisited: topicId,
        [`topics.${topicId}`]: {
            input: inputString,
            timestamp: new Date().toISOString()
        }
    }, { merge: true });
};

const QuadraticSolver = () => {
    const [a, setA] = useState(1);
    const [b, setB] = useState(-3);
    const [c, setC] = useState(2);
    const [calculatorLoaded, setCalculatorLoaded] = useState(false);
    const [solutionInfo, setSolutionInfo] = useState(null);
    const calculatorRef = useRef(null);
    const graphContainerRef = useRef(null);

    useEffect(() => {
        const fetchProgress = async () => {
            const user = auth.currentUser;
            if (!user) return;

            const docRef = doc(db, 'users', user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                const saved = data.topics?.['quadratic-solver']?.input;
                if (saved) {
                    const [aVal, bVal, cVal] = saved.split(',').map(Number);
                    setA(aVal);
                    setB(bVal);
                    setC(cVal);
                }
            }
        };

        fetchProgress();
    }, []);

    // Initialize the Desmos calculator
    useEffect(() => {
        // Load Desmos API script
        const script = document.createElement("script");
        script.src = "https://www.desmos.com/api/v1.11/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6";
        script.async = true;

        script.onload = () => {
            console.log("✅ Desmos API Loaded Successfully!");
            initializeGraph();
        };

        script.onerror = () => {
            console.error("❌ Failed to load Desmos API!");
        };

        document.head.appendChild(script);

        return () => {
            // Cleanup
            if (document.head.contains(script)) {
                document.head.removeChild(script);
            }
            // Cleanup calculator instance if it exists
            if (calculatorRef.current) {
                calculatorRef.current = null;
            }
        };
    }, []);


    const initializeGraph = () => {
        if (!graphContainerRef.current) return;

        try {
            const calculator = window.Desmos.GraphingCalculator(graphContainerRef.current, {
                expressionsCollapsed: true,
                expressions: true,
                settingsMenu: false,
                keypad: false,
                invertedColors: false,
                theme: 'light',
                settings: {
                    showGrid: true,
                    showXAxis: true,
                    showYAxis: true,
                    zoomButtons: false,
                    lockViewport: false
                },
                zoomMode: 'none'
            });

            calculatorRef.current = calculator;
            setCalculatorLoaded(true);

            // Disable scroll wheel zooming
            graphContainerRef.current.addEventListener(
                'wheel',
                (event) => {
                    event.preventDefault();

                    try {
                        const state = calculator.getState();
                        const bounds = state.graph?.bounds;

                        if (!bounds) return;
                        //if bounds are undefined, eror prevented

                        const deltaY = event.deltaY * 0.01;
                        calculator.setMathBounds({
                            left: bounds.left,
                            right: bounds.right,
                            bottom: bounds.bottom - deltaY,
                            top: bounds.top - deltaY
                        });
                    } catch (error) {
                        console.error("Scroll zoom error:", error);
                    }
                },
                { passive: false }
            );
        } catch (error) {
            console.error("Graph initialization error:", error);
        }

        };

    const plotQuadratic = (a, b, c) => {
        if (!calculatorRef.current) return;

        const calculator = calculatorRef.current;
        calculator.setBlank();

        calculator.setExpression({
            id: "quadratic",
            latex: `${a}x^2 + ${b}x + ${c}`,
            color: "#fd79a8",
            label: `y = ${a}x² + ${b}x + ${c}`
        });

        // Vertex calculation
        const vertexX = -b / (2 * a);
        const vertexY = a * vertexX ** 2 + b * vertexX + c;

        calculator.setExpression({
            id: "vertex",
            latex: `(${vertexX.toFixed(2)}, ${vertexY.toFixed(2)})`,
            color: "#a29bfe",
            pointStyle: "OPEN",
            label: `Vertex (${vertexX.toFixed(2)}, ${vertexY.toFixed(2)})`,
            showLabel: true
        });

        // Quadratic formula: roots calculation
        const discriminant = b ** 2 - 4 * a * c;
        let rootsInfo = "";

        if (discriminant > 0) {
            const root1 = (-b + Math.sqrt(discriminant)) / (2 * a);
            const root2 = (-b - Math.sqrt(discriminant)) / (2 * a);

            rootsInfo = `Roots: x = ${root1.toFixed(2)}, x = ${root2.toFixed(2)}`;

            calculator.setExpression({
                id: "root1",
                latex: `(${root1.toFixed(2)}, 0)`,
                color: "#55efc4",
                pointStyle: "POINT",
                label: `Root (${root1.toFixed(2)}, 0)`,
                showLabel: true
            });

            calculator.setExpression({
                id: "root2",
                latex: `(${root2.toFixed(2)}, 0)`,
                color: "#55efc4",
                pointStyle: "POINT",
                label: `Root (${root2.toFixed(2)}, 0)`,
                showLabel: true
            });
        } else if (discriminant === 0) {
            const root = -b / (2 * a);
            rootsInfo = `One repeated root: x = ${root.toFixed(2)}`;

            calculator.setExpression({
                id: "root",
                latex: `(${root.toFixed(2)}, 0)`,
                color: "#55efc4",
                pointStyle: "POINT",
                label: `Root (${root.toFixed(2)}, 0)`,
                showLabel: true
            });
        } else {
            rootsInfo = "No real roots (imaginary solutions)";
        }

        const solutionText = {
            equation: `${a}x² + ${b}x + ${c}`,
            vertex: `Vertex: (${vertexX.toFixed(2)}, ${vertexY.toFixed(2)})`,
            roots: rootsInfo
        };

        setSolutionInfo(solutionText);
    };

    const handleSolve = () => {
        if (isNaN(a) || isNaN(b) || isNaN(c)) {
            alert("Please enter valid numbers for a, b, and c.");
            return;
        }

        if (a === 0) {
            alert("Coefficient 'a' cannot be zero for a quadratic equation.");
            return;
        }

        plotQuadratic(a, b, c);
        saveProgressToFirestore(`${a},${b},${c}`);
    };

    const [explanationVisible, setExplanationVisible] = useState(false);
    const [explanationMethod, setExplanationMethod] = useState("");

    const showExplanation = (method) => {
        setExplanationMethod(method);
        setExplanationVisible(true);
    };

    const closeExplanation = () => {
        setExplanationVisible(false);
    };

    // Render explanation content based on the selected method
    const renderExplanationContent = () => {
        switch (explanationMethod) {
            case "Factoring":
                return (
                    <>
                        <h2 className="pixel-heading-sm">Factoring Method</h2>
                        <div className="pixel-explanation-content">
                            <p><strong>Step 1:</strong> Write the equation in standard form: <span className="formula">ax² + bx + c = 0</span></p>
                            <p><strong>Step 2:</strong> Find two numbers that multiply to 'ac' and add to 'b'.</p>
                            <p><strong>Step 3:</strong> Factor into binomials.</p>
                            <p><strong>Example:</strong> Solve x² - 5x + 6 = 0</p>
                            <p>Factor: (x - 2)(x - 3) = 0</p>
                            <p>Solutions: <span className="formula">x = 2, x = 3</span></p>
                        </div>
                    </>
                );
            case "Completing the Square":
                return (
                    <>
                        <h2 className="pixel-heading-sm">Completing the Square</h2>
                        <div className="pixel-explanation-content">
                            <p><strong>Step 1:</strong> Move the constant to the other side.</p>
                            <p><strong>Step 2:</strong> Take half of 'b', square it, and add to both sides.</p>
                            <p><strong>Step 3:</strong> Rewrite as a perfect square trinomial.</p>
                            <p><strong>Example:</strong> Solve x² + 6x + 5 = 0</p>
                            <p>Rewrite: (x + 3)² = 4</p>
                            <p>Solutions: <span className="formula">x = -1, x = -5</span></p>
                        </div>
                    </>
                );
            case "Quadratic Formula":
                return (
                    <>
                        <h2 className="pixel-heading-sm">Quadratic Formula</h2>
                        <div className="pixel-explanation-content">
                            <p>The Quadratic Formula is: <span className="formula">x = (-b ± √(b² - 4ac)) / 2a</span></p>
                            <p><strong>Step 1:</strong> Identify coefficients a, b, and c.</p>
                            <p><strong>Step 2:</strong> Compute the discriminant <span className="formula">Δ = b² - 4ac</span>.</p>
                            <p><strong>Step 3:</strong> Substitute into the formula and solve.</p>
                            <p><strong>Example:</strong> Solve 2x² - 4x - 6 = 0</p>
                            <p>Calculate: x = (4 ± 8) / 4</p>
                            <p>Solutions: <span className="formula">x = 3, x = -1</span></p>
                        </div>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="quadratic-page">
            {/* Background */}
            <div className="pixel-background">
                <div className="gif-container"></div>
                <div className="pixel-overlay"></div>
            </div>

            {/* Main Content */}
            <div className="pixel-content">
                <div className="pixel-window quadratic-window">
                    <div className="pixel-window-header">
                        <div className="pixel-dots">
                            <span className="pixel-dot red"></span>
                            <span className="pixel-dot yellow"></span>
                            <span className="pixel-dot green"></span>
                        </div>
                        <div className="pixel-title">QUADRATIC.EXE</div>
                        <div className="pixel-nav">
                            <Link to="/math" className="pixel-nav-link">MATH</Link>
                            <Link to="/" className="pixel-nav-link">HOME</Link>
                        </div>
                    </div>

                    <div className="pixel-window-body">
                        <h1 className="pixel-heading">QUADRATIC SOLVER</h1>

                        <div className="pixel-section">
                            <div className="pixel-input-group">
                                <label className="pixel-label">
                                    a:
                                    <input
                                        type="number"
                                        className="pixel-input"
                                        value={a}
                                        onChange={(e) => setA(parseFloat(e.target.value))}
                                    />
                                </label>
                                <label className="pixel-label">
                                    b:
                                    <input
                                        type="number"
                                        className="pixel-input"
                                        value={b}
                                        onChange={(e) => setB(parseFloat(e.target.value))}
                                    />
                                </label>
                                <label className="pixel-label">
                                    c:
                                    <input
                                        type="number"
                                        className="pixel-input"
                                        value={c}
                                        onChange={(e) => setC(parseFloat(e.target.value))}
                                    />
                                </label>
                                <button className="pixel-button solve-btn" onClick={handleSolve}>
                                    SOLVE
                                </button>
                            </div>

                            <div className="pixel-graph-container">
                                <div
                                    id="quadratic-graph"
                                    ref={graphContainerRef}
                                    className="pixel-graph"
                                ></div>

                                {solutionInfo && (
                                    <div className="pixel-solution-info">
                                        <div className="terminal-text solution-text">
                                            <span className="prompt">$&gt;&nbsp;</span>
                                            <span className="typing-text">
                                                {solutionInfo.equation}<br/>
                                                {solutionInfo.vertex}<br/>
                                                {solutionInfo.roots}
                                            </span>
                                            <span className="blinking-cursor">▋</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pixel-method-buttons">
                            <h2 className="pixel-subheading">SOLVING METHODS</h2>
                            <div className="pixel-buttons">
                                <button
                                    className="pixel-button method-btn"
                                    data-method="Factoring"
                                    onClick={() => showExplanation("Factoring")}
                                >
                                    FACTORING
                                </button>
                                <button
                                    className="pixel-button method-btn"
                                    data-method="Completing the Square"
                                    onClick={() => showExplanation("Completing the Square")}
                                >
                                    COMPLETING THE SQUARE
                                </button>
                                <button
                                    className="pixel-button method-btn"
                                    data-method="Quadratic Formula"
                                    onClick={() => showExplanation("Quadratic Formula")}
                                >
                                    QUADRATIC FORMULA
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="pixel-window-footer">
                        <div className="pixel-status">CALC READY</div>
                        <div className="pixel-memory">MEM: 640K</div>
                    </div>
                </div>

                {/* Added navigation section */}
                <div className="quadratic-nav">
                    <Link to="/math" className="math-link">
                        RETURN TO MATH TOPICS
                    </Link>
                </div>

                {/* Explanation Modal */}
                {explanationVisible && (
                    <div className="pixel-modal-overlay">
                        <div className="pixel-modal">
                            <div className="pixel-window">
                                <div className="pixel-window-header">
                                    <div className="pixel-dots">
                                        <span className="pixel-dot red"></span>
                                        <span className="pixel-dot yellow"></span>
                                        <span className="pixel-dot green"></span>
                                    </div>
                                    <div className="pixel-title">METHOD.TXT</div>
                                </div>

                                <div className="pixel-window-body">
                                    {renderExplanationContent()}
                                    <button
                                        className="pixel-button close-btn"
                                        onClick={closeExplanation}
                                    >
                                        CLOSE
                                    </button>
                                </div>

                                <div className="pixel-window-footer">
                                    <div className="pixel-status">READING...</div>
                                    <div className="pixel-memory">MEM: 640K</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="pixel-decorations">
                    <div className="floating-pixels">
                        <div className="floating-pixel p1"></div>
                        <div className="floating-pixel p2"></div>
                        <div className="floating-pixel p3"></div>
                        <div className="floating-pixel p4"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuadraticSolver;