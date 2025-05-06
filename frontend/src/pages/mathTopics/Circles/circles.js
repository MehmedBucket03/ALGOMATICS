import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
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

    // Refs for canvas elements and Three.js scenes
    const introCanvasRef = useRef(null);
    const introSceneRef = useRef(null);
    const introContainerRef = useRef(null);
    const chordsCanvasRef = useRef(null);
    const chordsSceneRef = useRef(null);
    const chordsContainerRef = useRef(null);
    const arcsCanvasRef = useRef(null);
    const arcsSceneRef = useRef(null);
    const arcsContainerRef = useRef(null);
    const sectorsCanvasRef = useRef(null);
    const sectorsSceneRef = useRef(null);
    const sectorsContainerRef = useRef(null);
    const tangentsCanvasRef = useRef(null);
    const tangentsSceneRef = useRef(null);
    const tangentsContainerRef = useRef(null);

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
drawCircle(ctx, 100, 100, 50);`
        },
        {
            name: "Calculate Chord Length",
            code: `function chordLength(radius, centralAngle) {
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

// Usage
const canvas = document.getElementById('tangentCanvas');
const ctx = canvas.getContext('2d');
drawTangent(ctx, 100, 100, 50, 170, 100);`
        }
    ];

    // Function to set scene size based on container
    const setSceneSize = (container) => {
        if (!container) return { width: 0, height: 0 };
        return { width: container.clientWidth, height: container.clientWidth };
    };

    // Initialize Three.js scene for Introduction
    const initIntroScene = () => {
        const canvas = introCanvasRef.current;
        const container = introContainerRef.current;
        if (!canvas || !container) return;

        const { width, height } = setSceneSize(container);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        renderer.setSize(width, height);
        renderer.setClearColor(0x111111);

        const geometry = new THREE.CircleGeometry(0.5, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
        const circle = new THREE.Mesh(geometry, material);
        circle.position.set(0, 0, 0);
        scene.add(circle);

        const centerPoint = new THREE.Mesh(
            new THREE.SphereGeometry(0.02, 16, 16),
            new THREE.MeshBasicMaterial({ color: 0x00ff00 })
        );
        scene.add(centerPoint);

        camera.position.z = 1.5;

        const animate = () => {
            requestAnimationFrame(animate);
            circle.rotation.z += 0.01;
            renderer.render(scene, camera);
        };
        animate();

        introSceneRef.current = { scene, camera, renderer, circle, animate };
    };

    // Initialize Three.js scene for Chords
    const initChordsScene = () => {
        const canvas = chordsCanvasRef.current;
        const container = chordsContainerRef.current;
        if (!canvas || !container) return;

        const { width, height } = setSceneSize(container);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        renderer.setSize(width, height);
        renderer.setClearColor(0x111111);

        const geometry = new THREE.CircleGeometry(0.5, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
        const circle = new THREE.Mesh(geometry, material);
        scene.add(circle);

        const chordPoints = [
            new THREE.Vector3(0.5 * Math.cos(Math.PI / 6), 0.5 * Math.sin(Math.PI / 6), 0),
            new THREE.Vector3(0.5 * Math.cos(5 * Math.PI / 6), 0.5 * Math.sin(5 * Math.PI / 6), 0)
        ];
        const chordGeometry = new THREE.BufferGeometry().setFromPoints(chordPoints);
        const chordMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
        const chord = new THREE.Line(chordGeometry, chordMaterial);
        scene.add(chord);

        camera.position.z = 1.5;

        const animate = () => {
            requestAnimationFrame(animate);
            circle.rotation.z += 0.01;
            renderer.render(scene, camera);
        };
        animate();

        chordsSceneRef.current = { scene, camera, renderer, circle, animate };
    };

    // Initialize Three.js scene for Arcs
    const initArcsScene = () => {
        const canvas = arcsCanvasRef.current;
        const container = arcsContainerRef.current;
        if (!canvas || !container) return;

        const { width, height } = setSceneSize(container);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        renderer.setSize(width, height);
        renderer.setClearColor(0x111111);

        const arcGeometry = new THREE.RingGeometry(0.4, 0.5, 32, 1, 0, Math.PI);
        const material = new THREE.MeshBasicMaterial({ color: 0xff00ff, side: THREE.DoubleSide });
        const arc = new THREE.Mesh(arcGeometry, material);
        arc.rotation.x = Math.PI / 2;
        scene.add(arc);

        camera.position.z = 1.5;

        const animate = () => {
            requestAnimationFrame(animate);
            arc.rotation.z += 0.01;
            renderer.render(scene, camera);
        };
        animate();

        arcsSceneRef.current = { scene, camera, renderer, arc, animate };
    };

    // Initialize Three.js scene for Sectors
    const initSectorsScene = () => {
        const canvas = sectorsCanvasRef.current;
        const container = sectorsContainerRef.current;
        if (!canvas || !container) return;

        const { width, height } = setSceneSize(container);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        renderer.setSize(width, height);
        renderer.setClearColor(0x111111);

        const sectorGeometry = new THREE.RingGeometry(0, 0.5, 32, 1, 0, 2 * Math.PI / 3);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
        const sector = new THREE.Mesh(sectorGeometry, material);
        sector.rotation.x = Math.PI / 2;
        scene.add(sector);

        camera.position.z = 1.5;

        const animate = () => {
            requestAnimationFrame(animate);
            sector.rotation.z += 0.01;
            renderer.render(scene, camera);
        };
        animate();

        sectorsSceneRef.current = { scene, camera, renderer, sector, animate };
    };

    // Initialize Three.js scene for Tangents
    const initTangentsScene = () => {
        const canvas = tangentsCanvasRef.current;
        const container = tangentsContainerRef.current;
        if (!canvas || !container) return;

        const { width, height } = setSceneSize(container);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        renderer.setSize(width, height);
        renderer.setClearColor(0x111111);

        const geometry = new THREE.CircleGeometry(0.5, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
        const circle = new THREE.Mesh(geometry, material);
        scene.add(circle);

        const pointGeometry = new THREE.SphereGeometry(0.02, 16, 16);
        const pointMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const point = new THREE.Mesh(pointGeometry, pointMaterial);
        point.position.set(0.7, 0, 0);
        scene.add(point);

        const tangent1 = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(0.7, 0, 0),
                new THREE.Vector3(0.5, -0.5, 0)
            ]),
            new THREE.LineBasicMaterial({ color: 0xff00ff })
        );
        const tangent2 = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(0.7, 0, 0),
                new THREE.Vector3(0.5, 0.5, 0)
            ]),
            new THREE.LineBasicMaterial({ color: 0xff00ff })
        );
        scene.add(tangent1, tangent2);

        camera.position.z = 1.5;

        const animate = () => {
            requestAnimationFrame(animate);
            circle.rotation.z += 0.01;
            renderer.render(scene, camera);
        };
        animate();

        tangentsSceneRef.current = { scene, camera, renderer, circle, animate };
    };

    // Cleanup function for a scene
    const cleanupScene = (sceneRef) => {
        if (sceneRef.current && sceneRef.current.renderer) {
            const { renderer, animate } = sceneRef.current;
            cancelAnimationFrame(animate);
            renderer.dispose();
            sceneRef.current = null;
        }
    };

    // Handle question submission
    const handleQuestionSubmit = () => {
        if (userQuestion.trim() === '') return;
        setQuestions([...questions, userQuestion]);
        setUserQuestion('');
    };

    // Handle formula copy
    const handleFormulaCopy = (e) => {
        const formulaText = e.target.textContent;
        navigator.clipboard.writeText(formulaText).then(() => {
            e.target.classList.add('copied');
            setTimeout(() => {
                e.target.classList.remove('copied');
            }, 2000);
        });
    };

    // Initialize or update scenes based on current topic
    useEffect(() => {
        // Cleanup previous scene
        cleanupScene(introSceneRef);
        cleanupScene(chordsSceneRef);
        cleanupScene(arcsSceneRef);
        cleanupScene(sectorsSceneRef);
        cleanupScene(tangentsSceneRef);

        // Initialize new scene based on current topic
        switch (currentTopic) {
            case 'intro':
                initIntroScene();
                break;
            case 'chords':
                initChordsScene();
                break;
            case 'arcs':
                initArcsScene();
                break;
            case 'sectors':
                initSectorsScene();
                break;
            case 'tangents':
                initTangentsScene();
                break;
            default:
                break;
        }

        // Handle resize
        const handleResize = () => {
            const updateScene = (canvasRef, sceneRef, containerRef) => {
                const canvas = canvasRef.current;
                const container = containerRef.current;
                if (!canvas || !container || !sceneRef.current) return;

                const { width, height } = setSceneSize(container);
                const { camera, renderer } = sceneRef.current;
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                renderer.setSize(width, height);
            };

            updateScene(introCanvasRef, introSceneRef, introContainerRef);
            updateScene(chordsCanvasRef, chordsSceneRef, chordsContainerRef);
            updateScene(arcsCanvasRef, arcsSceneRef, arcsContainerRef);
            updateScene(sectorsCanvasRef, sectorsSceneRef, sectorsContainerRef);
            updateScene(tangentsCanvasRef, tangentsSceneRef, tangentsContainerRef);
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cleanupScene(introSceneRef);
            cleanupScene(chordsSceneRef);
            cleanupScene(arcsSceneRef);
            cleanupScene(sectorsSceneRef);
            cleanupScene(tangentsSceneRef);
        };
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
                                <button
                                    className={`pixel-button ${currentTopic === 'intro' ? 'active' : ''}`}
                                    onClick={() => {
                                        setIsTransitioning(true);
                                        setTimeout(() => {
                                            setCurrentTopic('intro');
                                            setIsTransitioning(false);
                                        }, 300);
                                    }}
                                >
                                    INTRODUCTION
                                </button>
                                <button
                                    className={`pixel-button ${currentTopic === 'chords' ? 'active' : ''}`}
                                    onClick={() => {
                                        setIsTransitioning(true);
                                        setTimeout(() => {
                                            setCurrentTopic('chords');
                                            setIsTransitioning(false);
                                        }, 300);
                                    }}
                                >
                                    CHORDS
                                </button>
                                <button
                                    className={`pixel-button ${currentTopic === 'arcs' ? 'active' : ''}`}
                                    onClick={() => {
                                        setIsTransitioning(true);
                                        setTimeout(() => {
                                            setCurrentTopic('arcs');
                                            setIsTransitioning(false);
                                        }, 300);
                                    }}
                                >
                                    ARCS
                                </button>
                                <button
                                    className={`pixel-button ${currentTopic === 'sectors' ? 'active' : ''}`}
                                    onClick={() => {
                                        setIsTransitioning(true);
                                        setTimeout(() => {
                                            setCurrentTopic('sectors');
                                            setIsTransitioning(false);
                                        }, 300);
                                    }}
                                >
                                    SECTORS
                                </button>
                                <button
                                    className={`pixel-button ${currentTopic === 'tangents' ? 'active' : ''}`}
                                    onClick={() => {
                                        setIsTransitioning(true);
                                        setTimeout(() => {
                                            setCurrentTopic('tangents');
                                            setIsTransitioning(false);
                                        }, 300);
                                    }}
                                >
                                    TANGENTS
                                </button>
                            </div>
                        </div>

                        {currentTopic === 'intro' && (
                            <div className={`topic-content ${isTransitioning ? 'fade-out' : 'fade-in'}`}>
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
                                                <p className="formula" onClick={handleFormulaCopy}>(x - h)² + (y - k)² = r²</p>
                                                <p>For a circle with center at origin:</p>
                                                <p className="formula" onClick={handleFormulaCopy}>x² + y² = r²</p>
                                            </div>
                                            <div className="visual-column" style={{ flex: 1 }} ref={introContainerRef}>
                                                <canvas ref={introCanvasRef} style={{ width: '100%', height: '100%', backgroundColor: '#111', borderRadius: '4px' }}></canvas>
                                                <div className="canvas-caption" style={{ textAlign: 'center', marginTop: '10px' }}>
                                                    Basic components of a circle
                                                </div>
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
                                                <p className="formula" onClick={handleFormulaCopy}>Chord length = 2r·sin(θ/2)</p>
                                                <p><strong>Distance Formula:</strong></p>
                                                <p>The distance d from the center to a chord with length c:</p>
                                                <p className="formula" onClick={handleFormulaCopy}>d = √(r² - (c/2)²)</p>
                                            </div>
                                            <div className="visual-column" style={{ flex: 1 }} ref={chordsContainerRef}>
                                                <canvas ref={chordsCanvasRef} style={{ width: '100%', height: '100%', backgroundColor: '#111', borderRadius: '4px' }}></canvas>
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

                        {currentTopic === 'arcs' && (
                            <div className={`topic-content ${isTransitioning ? 'fade-out' : 'fade-in'}`}>
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
                                                <p className="formula" onClick={handleFormulaCopy}>Arc length = r·θ</p>
                                                <p>If θ is in degrees:</p>
                                                <p className="formula" onClick={handleFormulaCopy}>Arc length = (π·r·θ)/180</p>
                                                <p><strong>Arc Measure:</strong></p>
                                                <p>The measure of an arc equals the measure of its central angle (in degrees or radians).</p>
                                            </div>
                                            <div className="visual-column" style={{ flex: 1 }} ref={arcsContainerRef}>
                                                <canvas ref={arcsCanvasRef} style={{ width: '100%', height: '100%', backgroundColor: '#111', borderRadius: '4px' }}></canvas>
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

                        {currentTopic === 'sectors' && (
                            <div className={`topic-content ${isTransitioning ? 'fade-out' : 'fade-in'}`}>
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
                                                <p className="formula" onClick={handleFormulaCopy}>Area = (r² × θ) / 2</p>
                                                <p>If θ is in degrees:</p>
                                                <p className="formula" onClick={handleFormulaCopy}>Area = (π × r² × θ) / 360</p>
                                                <p><strong>Applications:</strong></p>
                                                <p>Sectors are used in pie charts, calculating areas of irregular shapes, and in engineering for designing circular segments.</p>
                                            </div>
                                            <div className="visual-column" style={{ flex: 1 }} ref={sectorsContainerRef}>
                                                <canvas ref={sectorsCanvasRef} style={{ width: '100%', height: '100%', backgroundColor: '#111', borderRadius: '4px' }}></canvas>
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

                        {currentTopic === 'tangents' && (
                            <div className={`topic-content ${isTransitioning ? 'fade-out' : 'fade-in'}`}>
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
                                                <p className="formula" onClick={handleFormulaCopy}>PT² = PA × PB</p>
                                                <p>Where PT is the length of the tangent and PA and PB are the lengths of the secant segments.</p>
                                            </div>
                                            <div className="visual-column" style={{ flex: 1 }} ref={tangentsContainerRef}>
                                                <canvas ref={tangentsCanvasRef} style={{ width: '100%', height: '100%', backgroundColor: '#111', borderRadius: '4px' }}></canvas>
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

