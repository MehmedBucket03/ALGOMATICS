import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './algorithms.css';

// Algorithms and data structures topics data
const algoTopics = [
    {
        id: 'stack-queue',
        title: 'Stack & Queue',
        color: '#6c5ce7',
        description: 'Last-in First-out and First-in First-out data structures'
    },
    {
        id: 'linked-list',
        title: 'Linked List',
        color: '#fd79a8',
        description: 'Sequence of linked elements with dynamic memory allocation'
    },
    {
        id: 'hash-table',
        title: 'Hash Table',
        color: '#00b894',
        description: 'Efficient key-value lookups with O(1) time complexity'
    },
    {
        id: 'arrays',
        title: 'Arrays',
        color: '#e17055',
        description: 'Contiguous memory blocks with constant-time access',
        path: '/arrays' // Direct path to the Arrays page
    },
    {
        id: 'binary-search',
        title: 'Binary & Linear Search',
        color: '#0984e3',
        description: 'Efficient algorithms for finding elements in collections'
    },
    {
        id: 'sorting',
        title: 'Sorting',
        color: '#6c5ce7',
        description: 'Algorithms for organizing data in a specific order',
        path: '/sorting' // Direct path to the Sorting page
    },
    {
        id: 'recursion',
        title: 'Recursion',
        color: '#fd79a8',
        description: 'Functions that call themselves to solve problems'
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
            {/* Pixel grid background */}
            <div className="pixel-grid-overlay"></div>

            <div className="algorithms-content">
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
                                    <h1 className="text-3xl font-bold pixel-heading">DATA STRUCTURES & ALGORITHMS</h1>
                                    <p className="pixel-description">
                                        Discover algorithmic concepts through dynamic visualizations and detailed breakdowns.
                                    </p>
                                </div>
                            </div>

                            <div className="pixel-grid">
                                {algoTopics.map((topic) => (
                                    <Link
                                        to={topic.path || `/algorithms/${topic.id}`}
                                        key={topic.id}
                                        className={`pixel-card ${hoveredCard === topic.id ? 'hovered' : ''}`}
                                        style={{ '--card-color': topic.color }}
                                        onMouseEnter={() => handleCardHover(topic.id)}
                                        onMouseLeave={() => handleCardHover(null)}
                                    >
                                        <div className="card-content">
                                            <h2 className="card-title">{topic.title}</h2>
                                            <div className="card-icon">{topic.title.charAt(0)}</div>
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

export default AlgorithmsPage;