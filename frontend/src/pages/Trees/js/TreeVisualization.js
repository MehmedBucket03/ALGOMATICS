import React, { useState, useEffect, useRef, useCallback } from 'react';
import Sketch from 'react-p5';
import TreeExample from './example/exampleTree';
import { setupTree, renderTree } from './script';

const TreeVisualization = () => {
    const [treeType, setTreeType] = useState('bst');
    const [nodeValue, setNodeValue] = useState('');
    const canvasRef = useRef(null);
    const p5InstanceRef = useRef(null);
    const [mounted, setMounted] = useState(false);
    const [message, setMessage] = useState('');

    // Tree data
    const [treeData, setTreeData] = useState({
        nodes: [],
        edges: []
    });

    // Component mounted state
    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Reset message after 5 seconds
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    // Setup function for p5
    const setup = (p5, canvasParentRef) => {
        // Store p5 instance for cleanup
        p5InstanceRef.current = p5;

        if (!canvasParentRef) return;

        try {
            // Create canvas
            const canvas = p5.createCanvas(800, 500);
            canvas.parent(canvasParentRef);

            // Initialize with theme colors
            setupTree(p5, treeType);
        } catch (err) {
            console.error("Error in p5 setup:", err);
        }
    };

    // Draw function for p5
    const draw = (p5) => {
        if (!mounted) return;

        try {
            // Set dark background
            p5.background(0);

            // Render tree data
            renderTree(p5, treeData, treeType);
        } catch (err) {
            console.error("Error in p5 draw:", err);
        }
    };

    // Add a new node to the tree
    const handleAddNode = () => {
        if (!nodeValue.trim()) {
            setMessage('Please enter a node value');
            return;
        }

        const value = parseInt(nodeValue);

        if (isNaN(value)) {
            setMessage('Please enter a valid number');
            return;
        }

        // BST insertion logic
        const newTreeData = { ...treeData };

        // If tree is empty, add root node
        if (newTreeData.nodes.length === 0) {
            newTreeData.nodes.push({
                id: 1,
                value: value,
                x: 400,
                y: 50
            });
        } else {
            // Find node placement by traversing the tree
            let currentNode = newTreeData.nodes[0];
            let placed = false;
            let parentNode = null;

            while (!placed) {
                parentNode = currentNode;

                if (value < currentNode.value) {
                    // Go left
                    const leftChildEdge = newTreeData.edges.find(
                        edge => edge.source === currentNode.id && edge.direction === 'left'
                    );

                    if (leftChildEdge) {
                        currentNode = newTreeData.nodes.find(
                            node => node.id === leftChildEdge.target
                        );
                    } else {
                        // Create new node as left child
                        const newNodeId = newTreeData.nodes.length + 1;
                        const newNode = {
                            id: newNodeId,
                            value: value,
                            x: parentNode.x - (100 / Math.log2(newTreeData.nodes.length + 1)),
                            y: parentNode.y + 100
                        };

                        newTreeData.nodes.push(newNode);
                        newTreeData.edges.push({
                            source: parentNode.id,
                            target: newNodeId,
                            direction: 'left'
                        });

                        placed = true;
                    }
                } else if (value > currentNode.value) {
                    // Go right
                    const rightChildEdge = newTreeData.edges.find(
                        edge => edge.source === currentNode.id && edge.direction === 'right'
                    );

                    if (rightChildEdge) {
                        currentNode = newTreeData.nodes.find(
                            node => node.id === rightChildEdge.target
                        );
                    } else {
                        // Create new node as right child
                        const newNodeId = newTreeData.nodes.length + 1;
                        const newNode = {
                            id: newNodeId,
                            value: value,
                            x: parentNode.x + (100 / Math.log2(newTreeData.nodes.length + 1)),
                            y: parentNode.y + 100
                        };

                        newTreeData.nodes.push(newNode);
                        newTreeData.edges.push({
                            source: parentNode.id,
                            target: newNodeId,
                            direction: 'right'
                        });

                        placed = true;
                    }
                } else {
                    // Equal value - not allowed in BST
                    setMessage('Duplicate values are not allowed in BST');
                    return;
                }
            }
        }

        setTreeData(newTreeData);
        setNodeValue('');
        setMessage(`Node ${value} added successfully`);
    };

    // Safe cleanup function for p5
    const componentWillUnmount = useCallback(() => {
        try {
            if (p5InstanceRef.current && p5InstanceRef.current.remove) {
                p5InstanceRef.current.remove();
            }
        } catch (err) {
            console.error("Error during p5 cleanup:", err);
        }
    }, []);

    // Tree operations
    const handleClearTree = () => {
        setTreeData({
            nodes: [],
            edges: []
        });
        setMessage('Tree cleared');
    };

    const handleBalanceTree = () => {
        // In a real implementation, add AVL or RB tree balancing here
        setMessage('Tree balancing not implemented yet');
    };

    return (
        <div className="tree-visualization">
            <div className="controls">
                <select
                    value={treeType}
                    onChange={(e) => setTreeType(e.target.value)}
                    className="tree-type-select"
                >
                    <option value="bst">Binary Search Tree</option>
                    <option value="avl">AVL Tree</option>
                    <option value="rbt">Red-Black Tree</option>
                </select>

                <div className="input-group">
                    <input
                        type="text"
                        value={nodeValue}
                        onChange={(e) => setNodeValue(e.target.value)}
                        placeholder="Enter node value"
                        className="node-input"
                    />
                    <button
                        onClick={handleAddNode}
                        className="action-button insert-button"
                    >
                        Insert
                    </button>
                </div>

                <div className="tree-operations">
                    <button
                        onClick={handleClearTree}
                        className="action-button clear-button"
                    >
                        Clear
                    </button>
                    <button
                        onClick={handleBalanceTree}
                        className="action-button balance-button"
                    >
                        Balance
                    </button>
                </div>
            </div>

            {message && <div className="message">{message}</div>}

            <div className="canvas-container">
                {mounted && (
                    <Sketch
                        setup={setup}
                        draw={draw}
                        componentWillUnmount={componentWillUnmount}
                    />
                )}
            </div>

            <TreeExample treeType={treeType} />
        </div>
    );
};

export default TreeVisualization;