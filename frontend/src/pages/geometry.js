import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './GeometryExplorer.css';

const GeometryExplorer = () => {
    const canvasRef = useRef(null);
    const [activeSection, setActiveSection] = useState('');
    const [angle, setAngle] = useState(90);
    const [explanation, setExplanation] = useState('');
    const [showTrianglesMenu, setShowTrianglesMenu] = useState(false);
    const [showTheoremsMenu, setShowTheoremsMenu] = useState(false);

    // Initialize canvas and GSAP
    useEffect(() => {
        // Initialize any external libraries if needed
    }, []);

    // Canvas drawing functions
    const updateAngle = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.beginPath();
        ctx.moveTo(200, 200);
        ctx.lineTo(350, 200);
        ctx.strokeStyle = "#d4a4ff";
        ctx.lineWidth = 3;
        ctx.stroke();

        // Rotated line
        const rad = angle * Math.PI / 180;
        ctx.beginPath();
        ctx.moveTo(200, 200);
        ctx.lineTo(200 + Math.cos(rad) * 150, 200 - Math.sin(rad) * 150);
        ctx.stroke();

        let arcColor = "#ff6f61";
        let type = "Right";
        if (angle < 90) {
            arcColor = "#00bcd4";
            type = "Acute";
        } else if (angle > 90) {
            arcColor = "#ffc107";
            type = "Obtuse";
        }

        ctx.beginPath();
        ctx.arc(200, 200, 40, 0, -rad, true);
        ctx.strokeStyle = arcColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = arcColor;
        ctx.font = "16px Arial";
        ctx.fillText(`${angle}°`, 230, 180);
        ctx.fillText(`${type} Angle`, 160, 160);
    };

    const drawTriangle = (type) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#d4a4ff";
        ctx.font = "16px Arial";

        if (type === "equilateral") {
            ctx.beginPath();
            ctx.moveTo(200, 50);
            ctx.lineTo(100, 200);
            ctx.lineTo(300, 200);
            ctx.closePath();
            ctx.strokeStyle = "#ff6f61";
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.fillText("Equilateral Triangle", 130, 250);
            setExplanation("An equilateral triangle has all three sides equal and all angles measuring 60°.");
        } else if (type === "isosceles") {
            ctx.beginPath();
            ctx.moveTo(200, 60);      // Top vertex
            ctx.lineTo(120, 240);     // Bottom-left vertex
            ctx.lineTo(280, 240);     // Bottom-right vertex
            ctx.closePath();
            ctx.strokeStyle = "#ff6f61";
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.fillText("Isosceles Triangle", 130, 270);
            setExplanation("An isosceles triangle has two equal sides and two equal angles.");
        } else if (type === "scalene") {
            ctx.beginPath();
            ctx.moveTo(220, 50);
            ctx.lineTo(90, 200);
            ctx.lineTo(310, 180);
            ctx.closePath();
            ctx.strokeStyle = "#ff6f61";
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.fillText("Scalene Triangle", 140, 250);
            setExplanation("A scalene triangle has all sides and angles different.");
        }

        // Animation would be handled by GSAP in a real implementation
    };

    const showTheorem = (type) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const explanations = {
            SSS: "Side-Side-Side (SSS): If all three sides of one triangle are equal to another, they are congruent.",
            SAS: "Side-Angle-Side (SAS): If two sides and the included angle are equal, the triangles are congruent.",
            ASA: "Angle-Side-Angle (ASA): If two angles and the included side are equal, the triangles are congruent.",
            AAS: "Angle-Angle-Side (AAS): If two angles and a non-included side are equal, the triangles are congruent.",
            HL: "Hypotenuse-Leg (HL): If the hypotenuse and one leg of a right triangle are equal, they are congruent."
        };

        setExplanation(explanations[type]);

        // This would actually draw the theorem visualization
        // Simplified version shown here
        ctx.font = "20px Arial";
        ctx.fillStyle = "#d4a4ff";
        ctx.fillText(`${type} Congruence Theorem`, 100, 200);

        // Animation would be handled by GSAP in a real implementation
    };

    // Handle section changes
    const handleSectionChange = (section) => {
        setActiveSection(section);
        setShowTrianglesMenu(section === 'triangles');
        setShowTheoremsMenu(section === 'congruence');

        if (section === 'angles') {
            setExplanation("Use the slider or buttons to explore different angles.");
            setTimeout(updateAngle, 100); // Allow canvas to render
        } else if (section === 'triangles') {
            setExplanation("Click a triangle type to see its visualization.");
        } else if (section === 'congruence') {
            setExplanation("Select a theorem to explore different triangle congruencies.");
        }

        // Animation would be handled by GSAP in a real implementation
    };

    // Handle angle changes
    const handleAngleChange = (e) => {
        setAngle(parseInt(e.target.value));
    };

    useEffect(() => {
        if (activeSection === 'angles') {
            updateAngle();
        }
    }, [angle, activeSection]);

    return (
        <div className="explorer-container">
            <div className="floating-pixels">
                <div className="floating-pixel p1"></div>
                <div className="floating-pixel p2"></div>
                <div className="floating-pixel p3"></div>
                <div className="floating-pixel p4"></div>
            </div>

            <header className="header-bg">
                <nav>
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/math" className="nav-link">Math</Link>
                    <Link to="/algorithms" className="nav-link">Algorithms</Link>
                    <Link to="/about" className="nav-link">About</Link>
                </nav>
            </header>

            <div className="container">
                <div className="pixel-window">
                    <div className="pixel-window-header">
                        <div className="pixel-dots">
                            <span className="pixel-dot red"></span>
                            <span className="pixel-dot yellow"></span>
                            <span className="pixel-dot green"></span>
                        </div>
                        <div className="pixel-title">GEOMETRY.EXE</div>
                    </div>

                    <div className="pixel-window-body">
                        <h1>GEOMETRY EXPLORER</h1>

                        <div className="menu" id="mainMenu">
                            <button onClick={() => handleSectionChange('angles')}>ANGLES</button>
                            <button onClick={() => handleSectionChange('triangles')}>TRIANGLES</button>
                            <button onClick={() => handleSectionChange('congruence')}>CONGRUENCE</button>
                        </div>

                        {showTrianglesMenu && (
                            <div id="triangleOptions">
                                <button onClick={() => drawTriangle('equilateral')}>EQUILATERAL</button>
                                <button onClick={() => drawTriangle('isosceles')}>ISOSCELES</button>
                                <button onClick={() => drawTriangle('scalene')}>SCALENE</button>
                            </div>
                        )}

                        {showTheoremsMenu && (
                            <div id="congruenceButtons">
                                <button onClick={() => showTheorem('SSS')}>SSS</button>
                                <button onClick={() => showTheorem('SAS')}>SAS</button>
                                <button onClick={() => showTheorem('ASA')}>ASA</button>
                                <button onClick={() => showTheorem('AAS')}>AAS</button>
                                <button onClick={() => showTheorem('HL')}>HL</button>
                            </div>
                        )}

                        {activeSection === 'angles' && (
                            <div id="angleControls">
                                <input
                                    type="range"
                                    min="1"
                                    max="179"
                                    value={angle}
                                    onChange={handleAngleChange}
                                    id="angleSlider"
                                />
                                <p>Angle: <span id="angleValue">{angle}</span>°</p>

                                <div className="preset-angles">
                                    <button onClick={() => setAngle(30)}>30°</button>
                                    <button onClick={() => setAngle(45)}>45°</button>
                                    <button onClick={() => setAngle(60)}>60°</button>
                                    <button onClick={() => setAngle(90)}>90°</button>
                                    <button onClick={() => setAngle(120)}>120°</button>
                                    <button onClick={() => setAngle(135)}>135°</button>
                                    <button onClick={() => setAngle(150)}>150°</button>
                                </div>
                            </div>
                        )}

                        <canvas id="geometryCanvas" width="400" height="400" ref={canvasRef}></canvas>

                        <div id="theoremExplanation">
                            {explanation}
                        </div>
                    </div>

                    <div className="pixel-window-footer">
                        <div className="pixel-status">SYSTEM READY</div>
                        <div className="pixel-memory">MEM: 640K</div>
                    </div>
                </div>
            </div>

            <footer className="footer-bg">
                <p>© 2025 ALGOMATICS • ALL RIGHTS RESERVED</p>
            </footer>
        </div>
    );
};

export default GeometryExplorer;