import React from 'react';
import TreeVisualization from './js/TreeVisualization';
import './css/styles.css';

const Trees = () => {
    return (
        <div className="trees-container">
            <div className="trees-header">
                <h1>Tree Data Structures</h1>
                <p className="trees-description">
                    A tree data structure where each node has at most two children, with left child values less than the parent
                    and right child values greater.
                </p>
            </div>
            <TreeVisualization />
        </div>
    );
};

export default Trees;