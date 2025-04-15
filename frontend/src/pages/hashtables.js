import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './hashtables.css';

const HashTableAnimation = () => {
    const [tableSize, setTableSize] = useState(8);
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState('');
    const [animationStep, setAnimationStep] = useState(0);
    const [animatingItem, setAnimatingItem] = useState(null);
    const [hashValue, setHashValue] = useState(null);
    const [hashIndex, setHashIndex] = useState(null);
    const [isCollision, setIsCollision] = useState(false);
    const [collisionResolved, setCollisionResolved] = useState(false);
    const [showExplanation, setShowExplanation] = useState(true);
    const [animatedText, setAnimatedText] = useState('');
    const [activeTab, setActiveTab] = useState('visualization');

    // Introduction text for typing effect
    const introText = "Hash tables provide fast data access by transforming keys into table addresses using hash functions.";
    const typingSpeed = 30; // milliseconds per character

    // Typing effect
    useEffect(() => {
        let i = 0;
        if (activeTab === 'introduction') {
            const typing = setInterval(() => {
                if (i < introText.length) {
                    setAnimatedText(introText.substring(0, i + 1));
                    i++;
                } else {
                    clearInterval(typing);
                }
            }, typingSpeed);

            return () => clearInterval(typing);
        }
    }, [activeTab]);

    // Hash function (simple string hash)
    const hashFunction = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    };

    // Calculate table index from hash
    const getIndex = (hash, size) => {
        return hash % size;
    };

    // Reset animation state
    const resetAnimation = () => {
        setAnimationStep(0);
        setAnimatingItem(null);
        setHashValue(null);
        setHashIndex(null);
        setIsCollision(false);
        setCollisionResolved(false);
    };

    // Add a new item to the hash table
    const addItem = () => {
        if (!newItem.trim()) return;

        resetAnimation();
        setAnimatingItem(newItem);
        setAnimationStep(1);
    };

    // Handle animation steps
    useEffect(() => {
        if (!animatingItem) return;

        const timeouts = [];

        if (animationStep === 1) {
            // Calculate hash
            const hash = hashFunction(animatingItem);
            timeouts.push(setTimeout(() => {
                setHashValue(hash);
                setAnimationStep(2);
            }, 1000));
        }
        else if (animationStep === 2) {
            // Calculate index
            const index = getIndex(hashValue, tableSize);
            timeouts.push(setTimeout(() => {
                setHashIndex(index);
                setAnimationStep(3);
            }, 1000));
        }
        else if (animationStep === 3) {
            // Check for collision
            const index = hashIndex;
            const hasCollision = items.some(item => getIndex(hashFunction(item), tableSize) === index);
            timeouts.push(setTimeout(() => {
                setIsCollision(hasCollision);
                setAnimationStep(4);
            }, 1000));
        }
        else if (animationStep === 4) {
            // Resolve collision or insert directly
            timeouts.push(setTimeout(() => {
                setCollisionResolved(isCollision);
                setItems([...items, animatingItem]);
                setNewItem('');
                setAnimationStep(5);
            }, 1500));
        }
        else if (animationStep === 5) {
            // End animation
            timeouts.push(setTimeout(() => {
                resetAnimation();
            }, 1500));
        }

        return () => timeouts.forEach(timeout => clearTimeout(timeout));
    }, [animationStep, animatingItem, hashValue, hashIndex, isCollision, items, tableSize]);

    return (
        <div className="math-container">
            {/* Header */}
            <div className="pixel-window pixel-header">
                <div className="pixel-window-header">
                    <div className="pixel-dots">
                        <span className="pixel-dot red"></span>
                        <span className="pixel-dot yellow"></span>
                        <span className="pixel-dot green"></span>
                    </div>
                    <div className="pixel-title">DATA.EXE</div>
                </div>
                <div className="pixel-header-content">
                    <h1 className="pixel-heading-small">HASH TABLE ANIMATION</h1>
                    <Link to="/" className="pixel-button pixel-small-button">
                        Back to Home
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="pixel-content-grid">
                {/* Navigation */}
                <div className="pixel-window pixel-navigation">
                    <div className="pixel-window-header">
                        <div className="pixel-title">NAVIGATION</div>
                    </div>
                    <div className="pixel-navigation-links">
                        <button
                            className={`pixel-nav-link ${activeTab === 'introduction' ? 'active' : ''}`}
                            onClick={() => setActiveTab('introduction')}
                        >
                            Introduction
                        </button>
                        <button
                            className={`pixel-nav-link ${activeTab === 'visualization' ? 'active' : ''}`}
                            onClick={() => setActiveTab('visualization')}
                        >
                            Visualization
                        </button>
                        <button
                            className={`pixel-nav-link ${activeTab === 'explanation' ? 'active' : ''}`}
                            onClick={() => setActiveTab('explanation')}
                        >
                            How It Works
                        </button>
                    </div>
                </div>

                {/* Main Display Area */}
                <div className="pixel-window pixel-main-display">
                    <div className="pixel-window-header">
                        <div className="pixel-title">
                            {activeTab === 'introduction' && 'INTRODUCTION'}
                            {activeTab === 'visualization' && 'HASH TABLE VISUALIZATION'}
                            {activeTab === 'explanation' && 'HOW HASH TABLES WORK'}
                        </div>
                    </div>
                    <div className="pixel-display-content">
                        {/* Introduction Content */}
                        {activeTab === 'introduction' && (
                            <div className="pixel-introduction">
                                <div className="terminal-text">
                                    <span className="prompt">$&gt;&nbsp;</span>
                                    <span className="typing-text">{animatedText}</span>
                                    <span className="blinking-cursor">▋</span>
                                </div>

                                <div className="pixel-card">
                                    <h3>What is a Hash Table?</h3>
                                    <p>A hash table is a data structure that stores key-value pairs and provides fast access to values using keys.</p>
                                    <div className="pixel-example">
                                        <div>Features:</div>
                                        <div>• Fast access (O(1) average case)</div>
                                        <div>• Efficient lookups, insertions, and deletions</div>
                                        <div>• Used in databases, caches, and sets</div>
                                    </div>
                                </div>

                                <div className="pixel-card">
                                    <h3>Key Components</h3>
                                    <div className="pixel-properties">
                                        <div className="pixel-property">
                                            <strong>Hash Function:</strong> Converts keys into array indices
                                        </div>
                                        <div className="pixel-property">
                                            <strong>Hash Table:</strong> An array that stores the data
                                        </div>
                                        <div className="pixel-property">
                                            <strong>Collision Resolution:</strong> Methods to handle when different keys hash to the same index
                                        </div>
                                    </div>
                                </div>

                                <div className="pixel-card">
                                    <h3>Hash Table Applications</h3>
                                    <div className="pixel-properties">
                                        <div className="pixel-property">
                                            <strong>Database Indexing:</strong> Fast record retrieval
                                        </div>
                                        <div className="pixel-property">
                                            <strong>Caching:</strong> Storing recently accessed data
                                        </div>
                                        <div className="pixel-property">
                                            <strong>Symbol Tables:</strong> In compilers and interpreters
                                        </div>
                                        <div className="pixel-property">
                                            <strong>Unique Data:</strong> Implementing sets and preventing duplicates
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Visualization Content */}
                        {activeTab === 'visualization' && (
                            <div className="pixel-hash-visualization">
                                {/* Controls */}
                                <div className="pixel-hash-controls">
                                    <div className="pixel-input-group">
                                        <input
                                            type="text"
                                            value={newItem}
                                            onChange={(e) => setNewItem(e.target.value)}
                                            placeholder="Enter a value to insert"
                                            className="pixel-input"
                                            disabled={animationStep > 0}
                                        />
                                        <button
                                            onClick={addItem}
                                            disabled={!newItem.trim() || animationStep > 0}
                                            className={`pixel-button pixel-small-button ${(!newItem.trim() || animationStep > 0) ? 'disabled' : ''}`}
                                        >
                                            Add Item
                                        </button>
                                        <button
                                            onClick={() => {
                                                setItems([]);
                                                resetAnimation();
                                            }}
                                            className="pixel-button pixel-small-button clear-button"
                                        >
                                            Clear Table
                                        </button>
                                    </div>

                                    {/* Table Size Controls */}
                                    <div className="pixel-table-size">
                                        <label>Table Size:</label>
                                        <select
                                            value={tableSize}
                                            onChange={(e) => setTableSize(parseInt(e.target.value))}
                                            disabled={items.length > 0 || animationStep > 0}
                                            className="pixel-select"
                                        >
                                            {[4, 8, 16].map(size => (
                                                <option key={size} value={size}>{size}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Animation Status */}
                                <div className="pixel-status-display">
                                    {animationStep === 0 && (
                                        <p>Enter a value and click "Add Item" to see the insertion process.</p>
                                    )}
                                    {animationStep === 1 && (
                                        <p>Computing hash value for <span className="blue-text">{animatingItem}</span>...</p>
                                    )}
                                    {animationStep === 2 && (
                                        <p>
                                            Hash value for <span className="blue-text">{animatingItem}</span> is{' '}
                                            <span className="green-text">{hashValue}</span>.
                                            <br />Computing bucket index (hash % tableSize)...
                                        </p>
                                    )}
                                    {animationStep === 3 && (
                                        <p>
                                            Item <span className="blue-text">{animatingItem}</span> maps to index{' '}
                                            <span className="purple-text">{hashIndex}</span>.
                                            <br />Checking for collisions...
                                        </p>
                                    )}
                                    {animationStep === 4 && (
                                        <p>
                                            {isCollision ? (
                                                <>
                                                    <span className="red-text">Collision detected!</span> Using linear probing to find next available slot.
                                                </>
                                            ) : (
                                                <>
                                                    No collision detected. Inserting at index <span className="purple-text">{hashIndex}</span>.
                                                </>
                                            )}
                                        </p>
                                    )}
                                    {animationStep === 5 && (
                                        <p className="green-text">
                                            Item <span className="blue-text">{animatingItem}</span> has been successfully inserted!
                                        </p>
                                    )}
                                </div>

                                {/* Hash Table Visualization */}
                                <div className="pixel-hash-table">
                                    <div className="pixel-hash-indexes">
                                        {Array.from({ length: tableSize }).map((_, index) => (
                                            <div key={index} className="pixel-hash-index">
                                                {index}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pixel-hash-cells">
                                        {Array.from({ length: tableSize }).map((_, index) => {
                                            const isActiveIndex = hashIndex === index && animationStep >= 3;
                                            const itemsAtIndex = items.filter(item => getIndex(hashFunction(item), tableSize) === index);

                                            return (
                                                <div
                                                    key={index}
                                                    className={`pixel-hash-cell ${isActiveIndex ? 'active' : ''}`}
                                                >
                                                    {itemsAtIndex.length > 0 && (
                                                        <div className="pixel-hash-items">
                                                            {itemsAtIndex.map((item, i) => (
                                                                <div
                                                                    key={i}
                                                                    className={`pixel-hash-item ${item === animatingItem && animationStep >= 4 ? 'animating' : ''}`}
                                                                    title={item}
                                                                >
                                                                    {item}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Explanation Content */}
                        {activeTab === 'explanation' && (
                            <div className="pixel-explanation-content">
                                <div className="pixel-card">
                                    <h3>How Hash Table Insertion Works</h3>
                                    <div className="pixel-explanation-steps">
                                        <div className="pixel-explanation-step">
                                            <div className="pixel-step-number">1</div>
                                            <div className="pixel-step-text">
                                                A <strong>hash function</strong> converts the input key into a numeric hash value.
                                            </div>
                                        </div>
                                        <div className="pixel-explanation-step">
                                            <div className="pixel-step-number">2</div>
                                            <div className="pixel-step-text">
                                                The hash value is mapped to an array index (typically using modulo: hash % size).
                                            </div>
                                        </div>
                                        <div className="pixel-explanation-step">
                                            <div className="pixel-step-number">3</div>
                                            <div className="pixel-step-text">
                                                If the calculated index is empty, the item is placed there directly.
                                            </div>
                                        </div>
                                        <div className="pixel-explanation-step">
                                            <div className="pixel-step-number">4</div>
                                            <div className="pixel-step-text">
                                                If there's already an item at that index (a <strong>collision</strong>), we need to resolve it.
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pixel-card">
                                    <h3>Collision Resolution Strategies</h3>
                                    <div className="pixel-properties">
                                        <div className="pixel-property">
                                            <strong>Linear Probing:</strong> Check the next slot, then the next, until finding an empty slot.
                                        </div>
                                        <div className="pixel-property">
                                            <strong>Chaining:</strong> Store multiple items at the same index using a linked list.
                                        </div>
                                        <div className="pixel-property">
                                            <strong>Quadratic Probing:</strong> Check slots at a quadratically increasing distance.
                                        </div>
                                        <div className="pixel-property">
                                            <strong>Double Hashing:</strong> Use a second hash function to determine the probe interval.
                                        </div>
                                    </div>
                                </div>

                                <div className="pixel-card">
                                    <h3>Hash Function Properties</h3>
                                    <div className="pixel-properties">
                                        <div className="pixel-property">
                                            <strong>Deterministic:</strong> Same input always gives same output
                                        </div>
                                        <div className="pixel-property">
                                            <strong>Uniform:</strong> Distributes values evenly across the table
                                        </div>
                                        <div className="pixel-property">
                                            <strong>Efficient:</strong> Fast to compute
                                        </div>
                                        <div className="pixel-property">
                                            <strong>Low Collision:</strong> Different inputs rarely map to same output
                                        </div>
                                    </div>
                                </div>

                                <div className="pixel-note">
                                    This animation uses a simple string hash function and linear probing for collision resolution.
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="pixel-window pixel-footer">
                <div className="pixel-window-footer">
                    <div className="pixel-status">SYSTEM READY</div>
                    <div className="pixel-memory">ALGOMATICS v1.0</div>
                </div>
            </div>
        </div>
    );
};

export default HashTableAnimation;