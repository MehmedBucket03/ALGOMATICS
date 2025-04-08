import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './algorithms.css';

// Algorithms and data structures topics data
const algoTopics = [
    {
        id: 'stack-queue',
        title: 'STACK & QUEUE',
        color: '#6c5ce7',
        description: 'LAST-IN FIRST-OUT AND FIRST-IN FIRST-OUT DATA STRUCTURES',
        implemented: true
    },
    {
        id: 'linked-list',
        title: 'LINKED LIST',
        color: '#fd79a8',
        description: 'SEQUENCE OF LINKED ELEMENTS WITH DYNAMIC MEMORY ALLOCATION',
        implemented: true
    },
    {
        id: 'hash-table',
        title: 'HASH TABLE',
        color: '#00b894',
        description: 'EFFICIENT KEY-VALUE LOOKUPS WITH O(1) TIME COMPLEXITY',
        implemented: true
    },
    {
        id: 'arrays',
        title: 'ARRAYS',
        color: '#e17055',
        description: 'CONTIGUOUS MEMORY BLOCKS WITH CONSTANT-TIME ACCESS',
        implemented: true,
        path: '/arrays' // Direct path to the Arrays page
    },
    {
        id: 'binary-search',
        title: 'BINARY & LINEAR SEARCH',
        color: '#0984e3',
        description: 'EFFICIENT ALGORITHMS FOR FINDING ELEMENTS IN COLLECTIONS',
        implemented: true
    },
    {
        id: 'sorting',
        title: 'SORTING',
        color: '#6c5ce7',
        description: 'ALGORITHMS FOR ORGANIZING DATA IN A SPECIFIC ORDER',
        implemented: true,
        path: '/sorting' // Direct path to the Sorting page
    },
    {
        id: 'recursion',
        title: 'RECURSION',
        color: '#fd79a8',
        description: 'FUNCTIONS THAT CALL THEMSELVES TO SOLVE PROBLEMS',
        implemented: false
    },
    {
        id: 'trees',
        title: 'TREE STRUCTURES',
        color: '#00cec9',
        description: 'HIERARCHICAL DATA STRUCTURES WITH PARENT-CHILD RELATIONSHIPS',
        implemented: true,
        path: '/trees' // Direct path to the Tree Visualization page
    }
];

const AlgorithmsPage = () => {
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
        <div className="algorithms-page-container">
            {/* Background */}
            <div className="pixel-background">
                <div className="gif-container"></div>
                <div className="pixel-overlay"></div>
            </div>

            <div className="algorithms-content">
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
                                <div className="pixel-loading-text">LOADING ALGORITHMS</div>
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
                                    <div className="terminal-title">ALGORITHMS.EXE</div>
                                </div>
                                <div className="terminal-body">
                                    <h1 className="pixel-heading">DATA STRUCTURES & ALGORITHMS</h1>
                                    <p className="pixel-description">
                                        Discover algorithmic concepts through dynamic visualizations and detailed breakdowns.
                                    </p>
                                </div>
                            </div>

                            <div className="pixel-grid">
                                {algoTopics.map((topic) => (
                                    <Link
                                        to={topic.implemented ? (topic.path || `/algorithms/${topic.id}`) : "#"}
                                        key={topic.id}
                                        className={`pixel-card ${!topic.implemented ? 'disabled-card' : ''} ${hoveredCard === topic.id ? 'hovered' : ''}`}
                                        onMouseEnter={() => handleCardHover(topic.id)}
                                        onMouseLeave={() => handleCardHover(null)}
                                        onClick={(e) => {
                                            if (!topic.implemented) {
                                                e.preventDefault();
                                                alert("This algorithm is coming soon!");
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

export default AlgorithmsPage;