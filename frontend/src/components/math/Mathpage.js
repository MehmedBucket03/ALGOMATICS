import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './MathPage.css';

// Math topics data - updated with correct routing
const mathTopics = [
    {
        id: 'linear-equations',
        title: 'LINEAR EQUATIONS AND INEQUALITIES',
        color: '#6c5ce7',
        description: 'SOLVE FOR X AND GRAPH STRAIGHT LINES',
        implemented: true  // Mark as implemented
    },
    {
        id: 'sequences-series',
        title: 'SEQUENCES AND SERIES',
        color: '#fd79a8',
        description: 'FIND PATTERNS AND CALCULATE SUMS',
        implemented: true  // Mark as implemented
    },
    {
        id: 'logarithms-exponential',
        title: 'LOGARITHMS & EXPONENTIAL EQUATIONS',
        color: '#00b894',
        description: 'SOLVE COMPLEX GROWTH AND DECAY PROBLEMS',
        implemented: true  // Not implemented yet
    },
    {
        id: 'quadratic',  // Already implemented with QuadraticSolver
        title: 'QUADRATIC EQUATIONS',
        color: '#e17055',
        description: 'MASTER THE ART OF PARABOLAS',
        implemented: true
    },
    {
        id: 'system-of-equations',
        title: 'SYSTEM OF EQUATIONS',
        color: '#0984e3',
        description: 'FIND WHERE MULTIPLE EQUATIONS INTERSECT',
        implemented: true
    },
    {
        id: 'polynomial-operations',
        title: 'POLYNOMIAL OPERATIONS',
        color: '#6c5ce7',
        description: 'ADD, SUBTRACT, MULTIPLY, AND DIVIDE POLYNOMIALS',
        implemented: true
    },
    {
        id: 'circle-stuff',
        title: 'Circle Geometry',
        color: '#fd79a8',
        description: 'Circles and their properties',
        implemented: true
    },
    {
        id: 'functions',
        title: 'FUNCTIONS',
        color: '#00b894',
        description: 'UNDERSTAND THE BUILDING BLOCKS OF ALGEBRA',
        implemented: false
    }
];

const MathPage = () => {
    const [hoveredCard, setHoveredCard] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Simulating page loading
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    // Handle card hover
    const handleCardHover = (id) => {
        setHoveredCard(id);
    };

    return (
        <div className="math-page-container">
            {/* Background */}
            <div className="pixel-background">
                <div className="gif-container"></div>
                <div className="pixel-overlay"></div>
            </div>

            <div className="math-content">
                <div className="nav-bar">
                    <Link to="/" className="home-link">
                        <div className="pixel-home-btn">
                            <span className="home-icon">◄</span> HOME
                        </div>
                    </Link>
                </div>

                <main className="py-8 pixel-main">
                    {isLoading ? (
                        <div className="loading-screen">
                            <div className="pixel-loading">
                                <div className="pixel-loading-text">LOADING MATH MODULES</div>
                                <div className="pixel-loading-bar">
                                    <div className="pixel-loading-progress"></div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="pixel-terminal">
                                <div className="terminal-header">
                                    <div className="terminal-dots">
                                        <span className="terminal-dot red"></span>
                                        <span className="terminal-dot yellow"></span>
                                        <span className="terminal-dot green"></span>
                                    </div>
                                    <div className="terminal-title">MATH.EXE</div>
                                </div>
                                <div className="terminal-body">
                                    <h1 className="pixel-heading">MATH</h1>
                                    <p className="pixel-description">
                                        Explore math concepts through interactive lessons, real-time graphing,
                                        and step-by-step explanations.
                                    </p>
                                </div>
                            </div>

                            <div className="pixel-grid">
                                {mathTopics.map((topic) => (
                                    <Link
                                        to={topic.implemented ? `/${topic.id}` : "#"}
                                        key={topic.id}
                                        className={`pixel-card ${!topic.implemented ? 'disabled-card' : ''} ${hoveredCard === topic.id ? 'hovered' : ''}`}
                                        onMouseEnter={() => handleCardHover(topic.id)}
                                        onMouseLeave={() => handleCardHover(null)}
                                        onClick={(e) => {
                                            if (!topic.implemented) {
                                                e.preventDefault();
                                                alert("This topic is coming soon!");
                                            }
                                        }}
                                    >
                                        <div
                                            className="card-title-bar"
                                            style={{ backgroundColor: topic.color }}
                                        >
                                            <div className="card-title">{topic.title}</div>
                                        </div>

                                        <div className="pixel-pattern-container">
                                            <div className="pixel-pattern" data-topic={topic.id}>
                                                {/* Generate 64 individual pixels */}
                                                {[...Array(64)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className="pixel"
                                                        style={{
                                                            opacity: Math.random() > 0.5 ? 0.9 : 0.4,
                                                            backgroundColor: topic.color
                                                        }}
                                                    ></div>
                                                ))}
                                            </div>
                                        </div>

                                        <div
                                            className="card-description-bar"
                                            style={{ borderTopColor: topic.color }}
                                        >
                                            <div className="card-description">{topic.description}</div>
                                        </div>

                                        {hoveredCard === topic.id && (
                                            <div
                                                className="card-cta"
                                                style={{ backgroundColor: topic.color }}
                                            >
                                                {topic.implemented ? 'SELECT' : 'COMING SOON'}
                                            </div>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </>
                    )}
                </main>
            </div>

            {/* Add floating pixels for decoration */}
            <div className="floating-pixels">
                <div className="floating-pixel p1"></div>
                <div className="floating-pixel p2"></div>
                <div className="floating-pixel p3"></div>
                <div className="floating-pixel p4"></div>
            </div>
        </div>
    );
};

export default MathPage;