import React from 'react';

const TreeExample = ({ treeType }) => {
    // Example trees to demonstrate functionality
    const renderExample = () => {
        switch(treeType) {
            case 'avl':
                return (
                    <div className="example">
                        <h3>AVL Tree Properties</h3>
                        <ul>
                            <li>Self-balancing binary search tree</li>
                            <li>Balance factor (BF) = height(left subtree) - height(right subtree)</li>
                            <li>For all nodes, BF must be -1, 0, or 1</li>
                            <li>When balance is violated, rotations are performed</li>
                        </ul>
                        <div className="operations">
                            <h4>Operations</h4>
                            <ul>
                                <li>Search: O(log n)</li>
                                <li>Insert: O(log n)</li>
                                <li>Delete: O(log n)</li>
                            </ul>
                        </div>
                    </div>
                );
            case 'rbt':
                return (
                    <div className="example">
                        <h3>Red-Black Tree Properties</h3>
                        <ul>
                            <li>Self-balancing binary search tree</li>
                            <li>Each node is colored red or black</li>
                            <li>Root is always black</li>
                            <li>No two adjacent red nodes (red node's children must be black)</li>
                            <li>Every path from root to leaf has same number of black nodes</li>
                        </ul>
                        <div className="operations">
                            <h4>Operations</h4>
                            <ul>
                                <li>Search: O(log n)</li>
                                <li>Insert: O(log n)</li>
                                <li>Delete: O(log n)</li>
                            </ul>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="example">
                        <h3>Binary Search Tree Properties</h3>
                        <ul>
                            <li>For each node, all keys in left subtree are less than node's key</li>
                            <li>For each node, all keys in right subtree are greater than node's key</li>
                            <li>No duplicate keys allowed</li>
                            <li>Can become unbalanced, leading to O(n) operations in worst case</li>
                        </ul>
                        <div className="operations">
                            <h4>Operations</h4>
                            <ul>
                                <li>Search: O(log n) average, O(n) worst</li>
                                <li>Insert: O(log n) average, O(n) worst</li>
                                <li>Delete: O(log n) average, O(n) worst</li>
                            </ul>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="tree-example">
            {renderExample()}
            <div className="example-note">
                <p>Try adding values to visualize how the tree grows!</p>
            </div>
        </div>
    );
};

export default TreeExample;