import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './arrays.css';

const ArraysPage = () => {
    const [array, setArray] = useState([]);
    const [itemValue, setItemValue] = useState('');
    const [deleteIndex, setDeleteIndex] = useState('');
    const [explanation, setExplanation] = useState('');
    const [showExplanation, setShowExplanation] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [isLoading, setIsLoading] = useState(true);

    // Simulating loading effect to match the Algorithms page style
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    // Add item to array
    const handleAddItem = () => {
        if (itemValue === '') return;

        setArray([...array, itemValue]);
        setExplanation('The item has been added to the end of the array.');
        setShowExplanation(true);
        setItemValue('');

        // Hide explanation after 3 seconds
        setTimeout(() => {
            setShowExplanation(false);
        }, 3000);
    };

    // Delete item from array
    const handleDeleteItem = () => {
        const index = parseInt(deleteIndex);
        if (deleteIndex === '' || index < 0 || index >= array.length) return;

        setHighlightedIndex(index);

        // Create a copy of the array without the deleted item
        const newArray = [...array];
        newArray.splice(index, 1);

        // Update after a short delay to show animation
        setTimeout(() => {
            setArray(newArray);
            setHighlightedIndex(-1);
            setDeleteIndex('');
            setExplanation('The item has been deleted and the array has been updated.');
            setShowExplanation(true);

            // Hide explanation after 3 seconds
            setTimeout(() => {
                setShowExplanation(false);
            }, 3000);
        }, 1000);
    };

    return (
        <div className="arrays-container">
            {/* Pixel grid background to match Algorithms page */}
            <div className="pixel-grid-overlay"></div>

            <div className="main-content">
                {isLoading ? (
                    <div className="loading-screen">
                        <div className="pixel-loading">
                            <div className="pixel-loading-text">LOADING ARRAYS</div>
                            <div className="pixel-loading-bar">
                                <div className="pixel-loading-progress"></div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="navigation-controls">
                            <Link to="/algorithms" className="back-button">
                                <span className="back-arrow">←</span> BACK TO ALGORITHMS
                            </Link>
                        </div>

                        <div className="pixel-window main-window">
                            <div className="pixel-window-header">
                                <div className="pixel-dots">
                                    <span className="pixel-dot red"></span>
                                    <span className="pixel-dot yellow"></span>
                                    <span className="pixel-dot green"></span>
                                </div>
                                <div className="pixel-title">ARRAYS.DAT</div>
                                <div className="pixel-status-indicator">PROCESSING...</div>
                            </div>

                            <div className="pixel-window-body">
                                <h1 className="pixel-heading">ARRAYS</h1>
                                <div className="terminal-text mb-6">
                                    <span className="prompt">$&gt;&nbsp;</span>
                                    <span className="typing-text">
                                        An <span className="highlight">array</span> is a linear data structure that collects elements of the same data type and stores them in contiguous and adjacent memory locations. Arrays work on an index system starting from 0 to (n-1), where n is the size of the array.
                                    </span>
                                </div>

                                <div className="array-demo-container">
                                    <h2 className="pixel-subheading">ARRAY ANIMATION</h2>
                                    <p className="demo-description">
                                        This animation demonstrates how items are added to an array data structure. When you enter a number and click "Add Item", the number is appended to the end of the array, and a visual representation of the array is updated to include the new item.
                                    </p>

                                    <div className="input-group">
                                        <input
                                            type="number"
                                            className="pixel-input"
                                            placeholder="Enter a number"
                                            value={itemValue}
                                            onChange={(e) => setItemValue(e.target.value)}
                                            min="0"
                                            step="1"
                                        />
                                        <button
                                            className="pixel-button primary-button"
                                            onClick={handleAddItem}
                                        >
                                            ADD ITEM
                                        </button>
                                    </div>

                                    <div className="array-display">
                                        {array.map((value, index) => (
                                            <div
                                                key={index}
                                                className="array-item-wrapper"
                                            >
                                                <div className={`array-item ${index >= highlightedIndex ? 'highlight' : ''}`}>
                                                    {value}
                                                </div>
                                                <div className="index-label">{index}</div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="array-length-info">
                                        Array Length: {array.length} (Next index: {array.length})
                                    </div>

                                    <div className="input-group">
                                        <input
                                            type="number"
                                            className="pixel-input"
                                            placeholder="Enter index to delete"
                                            value={deleteIndex}
                                            onChange={(e) => setDeleteIndex(e.target.value)}
                                            min="0"
                                            step="1"
                                        />
                                        <button
                                            className="pixel-button secondary-button"
                                            onClick={handleDeleteItem}
                                        >
                                            DELETE ITEM
                                        </button>
                                    </div>

                                    {showExplanation && (
                                        <div className="explanation">
                                            {explanation}
                                        </div>
                                    )}
                                </div>

                                <div className="array-complexity-section">
                                    <h3 className="complexity-heading">TIME COMPLEXITY</h3>
                                    <div className="complexity-grid">
                                        <div className="complexity-item">
                                            <div className="operation">Access</div>
                                            <div className="big-o">O(1)</div>
                                            <div className="description">Accessing an element by index is constant time</div>
                                        </div>
                                        <div className="complexity-item">
                                            <div className="operation">Search</div>
                                            <div className="big-o">O(n)</div>
                                            <div className="description">Linear search through elements in worst case</div>
                                        </div>
                                        <div className="complexity-item">
                                            <div className="operation">Insertion</div>
                                            <div className="big-o">O(n)</div>
                                            <div className="description">May require shifting elements</div>
                                        </div>
                                        <div className="complexity-item">
                                            <div className="operation">Deletion</div>
                                            <div className="big-o">O(n)</div>
                                            <div className="description">May require shifting elements</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pixel-window-footer">
                                <div className="pixel-status">ARRAY INITIALIZED</div>
                                <div className="pixel-memory">MEM: {array.length * 8} BYTES</div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ArraysPage;