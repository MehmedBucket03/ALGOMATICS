import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './MathPage.css';

// Math topics data
const mathTopics = [
    {
        id: 'linear-equations',
        title: 'Linear Equations and Inequalities',
        img: 'img/linear.png',
        color: '#6c5ce7',
        description: 'Solve for x and graph straight lines'
    },
    {
        id: 'sequences-series',
        title: 'Sequences and Series',
        img: 'img/sequences.png',
        color: '#fd79a8',
        description: 'Find patterns and calculate sums'
    },
    {
        id: 'logarithms-exponential',
        title: 'Logarithms & Exponential Equations',
        img: 'img/logarithm.png',
        color: '#00b894',
        description: 'Solve complex growth and decay problems'
    },
    {
        id: 'quadratic-equations',
        title: 'Quadratic Equations',
        img: 'img/quad.png',
        color: '#e17055',
        description: 'Master the art of parabolas'
    },
    {
        id: 'system-of-equations',
        title: 'System of Equations',
        img: 'img/system.png',
        color: '#0984e3',
        description: 'Find where multiple equations intersect'
    },
    {
        id: 'polynomial-operations',
        title: 'Polynomial Operations',
        img: 'img/poly.png',
        color: '#6c5ce7',
        description: 'Add, subtract, multiply, and divide polynomials'
    },
    {
        id: 'rational-expressions',
        title: 'Rational Expressions & Equations',
        img: 'img/rational.png',
        color: '#fd79a8',
        description: 'Work with fractions containing variables'
    },
    {
        id: 'functions',
        title: 'Functions',
        img: 'img/function.png',
        color: '#00b894',
        description: 'Understand the building blocks of algebra'
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
            {/* Background Video */}
            <div className="video-container">
                <video autoPlay loop muted className="video-bg">
                    <source src="/assets/algomaticsbg2.mp4" type="video/mp4" />
                </video>
                <div className="pixel-grid-overlay"></div>
            </div>

            <div className="math-content">
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
                                    <h1 className="text-3xl font-bold pixel-heading">MATH</h1>
                                    <p className="pixel-description">
                                        Explore math concepts through interactive lessons, real-time graphing,
                                        and step-by-step explanations.
                                    </p>
                                </div>
                            </div>

                            <div className="pixel-grid">
                                {mathTopics.map((topic) => (
                                    <Link
                                        to={`/${topic.id}`}
                                        key={topic.id}
                                        className={`pixel-card ${hoveredCard === topic.id ? 'hovered' : ''}`}
                                        style={{ '--card-color': topic.color }}
                                        onMouseEnter={() => handleCardHover(topic.id)}
                                        onMouseLeave={() => handleCardHover(null)}
                                    >
                                        <div className="card-content">
                                            <h2 className="card-title">{topic.title}</h2>
                                            <div className="card-image-container">
                                                <img src={topic.img} alt={topic.title} className="card-image" />
                                            </div>
                                            <div className="card-description">{topic.description}</div>
                                        </div>
                                        <div className="card-shine"></div>
                                        {hoveredCard === topic.id && (
                                            <div className="card-cta">SELECT</div>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default MathPage;