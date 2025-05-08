import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Sketch from 'react-p5';
import './circles.css';

const saveProgressToFirestore = async (inputString) => {
    const user = auth.currentUser;
    if (!user) return;

    const topicId = 'circles';
    const docRef = doc(db, 'users', user.uid);
    await setDoc(docRef, {
        lastTopicVisited: topicId,
        [`topics.${topicId}`]: {
            input: inputString,
            timestamp: new Date().toISOString()
        }
    }, { merge: true });
};

const CirclesComponent = () => {
    const [currentTopic, setCurrentTopic] = useState('intro');
    const [showCode, setShowCode] = useState(false);
    const [selectedExample, setSelectedExample] = useState(0);
    const [userQuestion, setUserQuestion] = useState('');
    const [questions, setQuestions] = useState([]);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const codeExamples = [
        {
            name: "Draw Circle",
            code: `function drawCircle(ctx, x, y, radius) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();
}
const canvas = document.getElementById('circleCanvas');
const ctx = canvas.getContext('2d');
drawCircle(ctx, 100, 100, 50);`
        },
        {
            name: "Calculate Chord Length",
            code: `function chordLength(radius, centralAngle) {
  return 2 * radius * Math.sin(centralAngle / 2);
}
const radius = 10;
const angle = Math.PI / 3;
const length = chordLength(radius, angle);
console.log("Chord length:", length);`
        },
        {
            name: "Calculate Arc Length",
            code: `function arcLength(radius, centralAngle) {
  return radius * centralAngle;
}
const radius = 8;
const angle = Math.PI / 2;
const length = arcLength(radius, angle);
console.log("Arc length:", length);`
        },
        {
            name: "Calculate Sector Area",
            code: `function sectorArea(radius, centralAngle) {
  return (radius * radius * centralAngle) / 2;
}
const radius = 6;
const angle = (2 * Math.PI) / 3;
const area = sectorArea(radius, angle);
console.log("Sector area:", area);`
        },
        {
            name: "Draw Tangent",
            code: `function drawTangent(ctx, circleX, circleY, radius, pointX, pointY) {
  const dx = pointX - circleX;
  const dy = pointY - circleY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  if (distance < radius) return;
  const normalX = dx / distance;
  const normalY = dy / distance;
  const tangentX = circleX + normalX * radius;
  const tangentY = circleY + normalY * radius;
  ctx.beginPath();
  ctx.moveTo(tangentX, tangentY);
  ctx.lineTo(tangentX + normalY * radius * 2, tangentY - normalX * radius * 2);
  ctx.stroke();
}
const canvas = document.getElementById('tangentCanvas');
const ctx = canvas.getContext('2d');
drawTangent(ctx, 100, 100, 50, 170, 100);`
        }
    ];

    const introContainerRef = useRef(null);
    const chordsContainerRef = useRef(null);
    const arcsContainerRef = useRef(null);
    const sectorsContainerRef = useRef(null);
    const tangentsContainerRef = useRef(null);

    const setupSketch = (p5, canvasParentRef) => {
        p5.createCanvas(300, 300).parent(canvasParentRef);
        p5.background(17);
        p5.strokeWeight(2);
    };

    const drawIntro = (p5) => {
        p5.background(17);
        p5.stroke(0, 255, 0);
        p5.noFill();
        p5.circle(p5.width / 2, p5.height / 2, 100);
        p5.fill(0, 255, 0);
        p5.circle(p5.width / 2, p5.height / 2, 5);
        p5.push();
        p5.translate(p5.width / 2, p5.height / 2);
        p5.rotate(p5.frameCount * 0.01);
        p5.line(0, 0, 50, 0);
        p5.pop();
    };

    const drawChords = (p5) => {
        p5.background(17);
        p5.stroke(0, 255, 0);
        p5.noFill();
        p5.circle(p5.width / 2, p5.height / 2, 100);
        const x1 = p5.width / 2 + 50 * Math.cos(Math.PI / 6);
        const y1 = p5.height / 2 + 50 * Math.sin(Math.PI / 6);
        const x2 = p5.width / 2 + 50 * Math.cos(5 * Math.PI / 6);
        const y2 = p5.height / 2 + 50 * Math.sin(5 * Math.PI / 6);
        p5.line(x1, y1, x2, y2);
        p5.fill(0, 255, 0);
        p5.circle(x1, y1, 5);
        p5.circle(x2, y2, 5);
    };

    const drawArcs = (p5) => {
        p5.background(17);
        p5.stroke(255, 0, 255);
        p5.noFill();
        p5.arc(p5.width / 2, p5.height / 2, 100, 100, 0, Math.PI);
        p5.push();
        p5.translate(p5.width / 2, p5.height / 2);
        p5.rotate(p5.frameCount * 0.01);
        p5.stroke(0, 255, 0);
        p5.line(0, 0, 50, 0);
        p5.pop();
    };

    const drawSectors = (p5) => {
        p5.background(17);
        p5.fill(0, 255, 0, 100);
        p5.noStroke();
        p5.arc(p5.width / 2, p5.height / 2, 100, 100, 0, 2 * Math.PI / 3);
        p5.stroke(0, 255, 0);
        p5.line(p5.width / 2, p5.height / 2, p5.width / 2 + 50, p5.height / 2);
        p5.line(p5.width / 2, p5.height / 2, p5.width / 2 + 50 * Math.cos(2 * Math.PI / 3), p5.height / 2 + 50 * Math.sin(2 * Math.PI / 3));
    };

    const drawTangents = (p5) => {
        p5.background(17);
        p5.stroke(0, 255, 0);
        p5.noFill();
        p5.circle(p5.width / 2, p5.height / 2, 100);
        const pointX = p5.width / 2 + 70;
        const pointY = p5.height / 2;
        p5.fill(0, 255, 0);
        p5.circle(pointX, pointY, 5);
        p5.stroke(255, 0, 255);
        p5.line(pointX, pointY, p5.width / 2 + 50, p5.height / 2 - 50);
        p5.line(pointX, pointY, p5.width / 2 + 50, p5.height / 2 + 50);
    };

    const handleQuestionSubmit = () => {
        if (userQuestion.trim() === '') return;
        setQuestions([...questions, userQuestion]);
        setUserQuestion('');
        saveProgressToFirestore(userQuestion);
    };

    const handleFormulaCopy = (e) => {
        const formulaText = e.target.textContent;
        navigator.clipboard.writeText(formulaText).then(() => {
            e.target.classList.add('copied');
            setTimeout(() => {
                e.target.classList.remove('copied');
            }, 2000);
        });
    };

    useEffect(() => {
        const handleResize = () => {
            const updateCanvasSize = (ref) => {
                if (ref.current) {
                    const canvas = ref.current.querySelector('canvas');
                    if (canvas) {
                        canvas.width = ref.current.clientWidth;
                        canvas.height = ref.current.clientWidth;
                    }
                }
            };
            updateCanvasSize(introContainerRef);
            updateCanvasSize(chordsContainerRef);
            updateCanvasSize(arcsContainerRef);
            updateCanvasSize(sectorsContainerRef);
            updateCanvasSize(tangentsContainerRef);
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, [currentTopic]);

    return (
        <div className="recursion-container">
            <div className="pixel-background">
                <div className="pixel-overlay"></div>
            </div>

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
                                {['intro', 'chords', 'arcs', 'sectors', 'tangents'].map((topic) => (
                                    <button
                                        key={topic}
                                        className={`pixel-button ${currentTopic === topic ? 'active' : ''}`}
                                        onClick={() => {
                                            setIsTransitioning(true);
                                            setTimeout(() => {
                                                setCurrentTopic(topic);
                                                setIsTransitioning(false);
                                            }, 300);
                                        }}
                                    >
                                        {topic.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {currentTopic === 'intro' && (
                            <div className={`topic-content ${isTransitioning ? 'fade-out' : 'fade-in'}`}>
                                <div className="terminal-card">
                                    <div className="terminal-header">CIRCLE BASICS</div>
                                    <div className="terminal-content">
                                        <div className="content-columns">
                                            <div className="text-column">
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
                                                <p className="formula" onClick={handleFormulaCopy}>(x - h)² + (y - k)² = r²</p>
                                                <p>For a circle with center at origin:</p>
                                                <p className="formula" onClick={handleFormulaCopy}>x² + y² = r²</p>
                                            </div>
                                            <div className="visual-column" ref={introContainerRef}>
                                                <Sketch setup={setupSketch} draw={drawIntro} className="w-full h-full bg-[#111] rounded" />
                                                <div className="canvas-caption">Basic components of a circle</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentTopic === 'chords' && (
                            <div className={`topic-content ${isTransitioning ? 'fade-out' : 'fade-in'}`}>
                                <div className="terminal-card">
                                    <div className="terminal-header">CHORDS</div>
                                    <div className="terminal-content">
                                        <div className="content-columns">
                                            <div className="text-column">
                                                <p><strong>Definition:</strong> A chord is a line segment that connects two points on a circle.</p>
                                                <p><strong>Properties:</strong></p>
                                                <ul>
                                                    <li>The diameter is the longest chord and passes through the center</li>
                                                    <li>Equal chords are equidistant from the center</li>
                                                    <li>The perpendicular from the center to a chord bisects the chord</li>
                                                </ul>
                                                <p><strong>Chord Length Formula:</strong></p>
                                                <p className="formula" onClick={handleFormulaCopy}>Chord length = 2r·sin(θ/2)</p>
                                                <p><strong>Distance Formula:</strong></p>
                                                <p className="formula" onClick={handleFormulaCopy}>d = √(r² - (c/2)²)</p>
                                            </div>
                                            <div className="visual-column" ref={chordsContainerRef}>
                                                <Sketch setup={setupSketch} draw={drawChords} className="w-full h-full bg-[#111] rounded" />
                                                <div className="canvas-caption">Chord and central angle</div>
                                            </div>
                                        </div>
                                        <div className="theorem-box">
                                            <p><strong>Power of a Point Theorem:</strong></p>
                                            <p>If a point P is outside a circle and a line through P intersects the circle at points A and B, then PA × PB is constant for all such lines.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentTopic === 'arcs' && (
                            <div className={`topic-content ${isTransitioning ? 'fade-out' : 'fade-in'}`}>
                                <div className="terminal-card">
                                    <div className="terminal-header">ARCS</div>
                                    <div className="terminal-content">
                                        <div className="content-columns">
                                            <div className="text-column">
                                                <p><strong>Definition:</strong> An arc is a portion of the circumference of a circle.</p>
                                                <p><strong>Types:</strong></p>
                                                <ul>
                                                    <li>Minor Arc: Less than a semicircle</li>
                                                    <li>Major Arc: Greater than a semicircle</li>
                                                    <li>Semicircle: Exactly half of a circle</li>
                                                </ul>
                                                <p><strong>Arc Length Formula:</strong></p>
                                                <p className="formula" onClick={handleFormulaCopy}>Arc length = r·θ</p>
                                                <p>If θ is in degrees:</p>
                                                <p className="formula" onClick={handleFormulaCopy}>Arc length = (π·r·θ)/180</p>
                                                <p><strong>Arc Measure:</strong></p>
                                                <p>The measure of an arc equals the measure of its central angle (in degrees or radians).</p>
                                            </div>
                                            <div className="visual-column" ref={arcsContainerRef}>
                                                <Sketch setup={setupSketch} draw={drawArcs} className="w-full h-full bg-[#111] rounded" />
                                                <div className="canvas-caption">Arc and central angle</div>
                                            </div>
                                        </div>
                                        <div className="theorem-box">
                                            <p><strong>Inscribed Angle Theorem:</strong></p>
                                            <p>An inscribed angle is half the measure of its intercepted arc. If an angle is inscribed in a semicircle, then it is a right angle.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentTopic === 'sectors' && (
                            <div className={`topic-content ${isTransitioning ? 'fade-out' : 'fade-in'}`}>
                                <div className="terminal-card">
                                    <div className="terminal-header">SECTORS</div>
                                    <div className="terminal-content">
                                        <div className="content-columns">
                                            <div className="text-column">
                                                <p><strong>Definition:</strong> A sector is a region of a circle bounded by an arc and two radii.</p>
                                                <p><strong>Types:</strong></p>
                                                <ul>
                                                    <li>Minor Sector: Region bounded by a minor arc and two radii</li>
                                                    <li>Major Sector: Region bounded by a major arc and two radii</li>
                                                    <li>Semicircular Sector: Half of a circle</li>
                                                </ul>
                                                <p><strong>Sector Area Formula:</strong></p>
                                                <p className="formula" onClick={handleFormulaCopy}>Area = (r² × θ) / 2</p>
                                                <p>If θ is in degrees:</p>
                                                <p className="formula" onClick={handleFormulaCopy}>Area = (π × r² × θ) / 360</p>
                                                <p><strong>Applications:</strong></p>
                                                <p>Sectors are used in pie charts, calculating areas of irregular shapes, and in engineering for designing circular segments.</p>
                                            </div>
                                            <div className="visual-column" ref={sectorsContainerRef}>
                                                <Sketch setup={setupSketch} draw={drawSectors} className="w-full h-full bg-[#111] rounded" />
                                                <div className="canvas-caption">Sector showing area as portion of circle</div>
                                            </div>
                                        </div>
                                        <div className="example-box">
                                            <p><strong>Example:</strong> If a sector has a central angle of 60° in a circle with radius 10 cm, then:</p>
                                            <p>Area = (π × 10² × 60) / 360 = (π × 100 × 60) / 360 = (π × 100 × 1/6) = πr² × 1/6 = (1/6) × π × 100 ≈ 52.36 cm²</p>
                                            <p>Arc length = (π × 10 × 60) / 180 = (π × 10 × 1/3) = (π × 10) / 3 ≈ 10.47 cm</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentTopic === 'tangents' && (
                            <div className={`topic-content ${isTransitioning ? 'fade-out' : 'fade-in'}`}>
                                <div className="terminal-card">
                                    <div className="terminal-header">TANGENTS</div>
                                    <div className="terminal-content">
                                        <div className="content-columns">
                                            <div className="text-column">
                                                <p><strong>Definition:</strong> A tangent to a circle is a line that intersects the circle at exactly one point, called the point of tangency.</p>
                                                <p><strong>Properties:</strong></p>
                                                <ul>
                                                    <li>A tangent is perpendicular to the radius at the point of tangency</li>
                                                    <li>From any external point, two tangents can be drawn to a circle</li>
                                                    <li>These two tangents are equal in length</li>
                                                    <li>The line from the external point to the center bisects the angle between the tangents</li>
                                                </ul>
                                                <p><strong>Tangent-Secant Theorem:</strong></p>
                                                <p className="formula" onClick={handleFormulaCopy}>PT² = PA × PB</p>
                                                <p>Where PT is the length of the tangent and PA and PB are the lengths of the secant segments.</p>
                                            </div>
                                            <div className="visual-column" ref={tangentsContainerRef}>
                                                <Sketch setup={setupSketch} draw={drawTangents} className="w-full h-full bg-[#111] rounded" />
                                                <div className="canvas-caption">Tangent lines from an external point</div>
                                            </div>
                                        </div>
                                        <div className="theorem-box">
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

                        <div className="terminal-card">
                            <div className="terminal-header">CIRCLE FORMULAS & RELATIONSHIPS</div>
                            <div className="terminal-content">
                                <div className="formulas-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                                    <div className="formula-card">
                                        <h3>Basic Circle Formulas</h3>
                                        <p>Circumference: <span className="formula" onClick={handleFormulaCopy}>C = 2πr = πd</span></p>
                                        <p>Area: <span className="formula" onClick={handleFormulaCopy}>A = πr²</span></p>
                                        <p>Diameter: <span className="formula" onClick={handleFormulaCopy}>d = 2r</span></p>
                                    </div>
                                    <div className="formula-card">
                                        <h3>Chord Formulas</h3>
                                        <p>Chord Length: <span className="formula" onClick={handleFormulaCopy}>c = 2r·sin(θ/2)</span></p>
                                        <p>Distance from center to chord: <span className="formula" onClick={handleFormulaCopy}>d = r·cos(θ/2)</span></p>
                                        <p>Central angle (in radians): <span className="formula" onClick={handleFormulaCopy}>θ = 2·arcsin(c/2r)</span></p>
                                    </div>
                                    <div className="formula-card">
                                        <h3>Arc Formulas</h3>
                                        <p>Arc Length: <span className="formula" onClick={handleFormulaCopy}>L = r·θ (θ in radians)</span></p>
                                        <p>Arc Length: <span className="formula" onClick={handleFormulaCopy}>L = (πr·θ)/180° (θ in degrees)</span></p>
                                    </div>
                                    <div className="formula-card">
                                        <h3>Sector Formulas</h3>
                                        <p>Sector Area: <span className="formula" onClick={handleFormulaCopy}>A = (r²·θ)/2 (θ in radians)</span></p>
                                        <p>Sector Area: <span className="formula" onClick={handleFormulaCopy}>A = (πr²·θ)/360° (θ in degrees)</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="terminal-card">
                            <div className="terminal-header">QUESTIONS & COMMENTS</div>
                            <div className="terminal-content">
                                <div className="question-input-container" style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        type="text"
                                        value={userQuestion}
                                        onChange={(e) => setUserQuestion(e.target.value)}
                                        className="pixel-input"
                                        style={{ flex: 1 }}
                                        placeholder="Ask a question about circles..."
                                    />
                                    <button
                                        type="button"
                                        onClick={handleQuestionSubmit}
                                        className="pixel-button small-button"
                                    >
                                        SUBMIT
                                    </button>
                                </div>
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