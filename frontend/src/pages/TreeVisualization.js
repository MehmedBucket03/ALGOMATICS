import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './TreeVisualization.css';

const EnhancedTreeVisualization = () => {
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const animationSpeedRef = useRef(1);
    const [currentTreeType, setCurrentTreeType] = useState('bst');
    const [nodeValue, setNodeValue] = useState('');
    const [description, setDescription] = useState('');
    const [trieWords, setTrieWords] = useState([]);
    const [hoverInfo, setHoverInfo] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [draggedNode, setDraggedNode] = useState(null);
    const [showTutorial, setShowTutorial] = useState(false);
    const [nodeHistory, setNodeHistory] = useState([]);
    const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
    const [isAnimating, setIsAnimating] = useState(false);
    const [autoBalanceAvl, setAutoBalanceAvl] = useState(true);
    const [themeColor, setThemeColor] = useState('#d4a4ff'); // Default BST color

    // State for each tree type
    const [bstNodes, setBstNodes] = useState([]);
    const [avlNodes, setAvlNodes] = useState([]);
    const [rbtNodes, setRbtNodes] = useState([]);
    const [trieNodes, setTrieNodes] = useState([]);

    // State for connections between nodes
    const [bstConnections, setBstConnections] = useState([]);
    const [avlConnections, setAvlConnections] = useState([]);
    const [rbtConnections, setRbtConnections] = useState([]);
    const [trieConnections, setTrieConnections] = useState([]);

    // Initialize canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = 1000;
        canvas.height = 500;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctxRef.current = ctx;

        // Set initial description
        selectTree('bst');

        // Set up mouse event listeners for canvas interactions
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('click', handleCanvasClick);

        // Clean up event listeners on unmount
        return () => {
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('click', handleCanvasClick);
        };
    }, []);

    // Effect to update theme color based on tree type
    useEffect(() => {
        switch(currentTreeType) {
            case 'bst':
                setThemeColor('#d4a4ff');
                break;
            case 'avl':
                setThemeColor('#a4f7ff');
                break;
            case 'rbt':
                setThemeColor('#ff5e78');
                break;
            case 'trie':
                setThemeColor('#90ee90');
                break;
            default:
                setThemeColor('#d4a4ff');
        }
    }, [currentTreeType]);

    // After the theme color effect
// Handle window resizing
    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current) {
                // Maintain canvas dimensions on window resize
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');

                // Save original image data
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

                // Update canvas dimensions
                const container = canvas.parentElement;
                if (container) {
                    const containerWidth = container.clientWidth;
                    canvas.width = containerWidth > 1000 ? 1000 : containerWidth - 20;
                }

                // Restore image data
                ctx.putImageData(imageData, 0, 0);

                // Redraw the tree
                drawTree();
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Update drawing when any relevant state changes
    useEffect(() => {
        drawTree();
    }, [
        currentTreeType,
        bstNodes, bstConnections,
        avlNodes, avlConnections,
        rbtNodes, rbtConnections,
        trieNodes, trieConnections,
        hoverInfo
    ]);

    // Mouse event handlers for canvas interactions
    const handleMouseMove = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Get current nodes based on tree type
        let nodes = getCurrentNodes();

        // Check if mouse is over any node
        const hoveredNode = nodes.find(node =>
            Math.sqrt(Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2)) < 20
        );

        if (hoveredNode) {
            canvas.style.cursor = 'pointer';
            setHoverInfo({
                node: hoveredNode,
                x: x,
                y: y
            });

            // Handle dragging
            if (isDragging && draggedNode && draggedNode.id === hoveredNode.id) {
                const updatedNodes = nodes.map(node => {
                    if (node.id === draggedNode.id) {
                        return { ...node, x, y };
                    }
                    return node;
                });

                // Update the connections
                let connections = getCurrentConnections();
                const updatedConnections = connections.map(conn => {
                    if (conn.fromX === draggedNode.x && conn.fromY === draggedNode.y) {
                        return { ...conn, fromX: x, fromY: y };
                    }
                    if (conn.toX === draggedNode.x && conn.toY === draggedNode.y) {
                        return { ...conn, toX: x, toY: y };
                    }
                    return conn;
                });

                // Update state based on tree type
                updateNodesAndConnections(updatedNodes, updatedConnections);
            }
        } else {
            canvas.style.cursor = 'default';
            setHoverInfo(null);
        }
    };

    const handleMouseDown = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Get current nodes based on tree type
        let nodes = getCurrentNodes();

        // Check if mouse is down on any node
        const clickedNode = nodes.find(node =>
            Math.sqrt(Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2)) < 20
        );

        if (clickedNode) {
            setIsDragging(true);
            setDraggedNode(clickedNode);
            canvas.style.cursor = 'grabbing';

            // Save the current state for undo/redo
            saveState();
        }
    };

    const handleMouseUp = () => {
        if (isDragging) {
            setIsDragging(false);
            setDraggedNode(null);
            canvasRef.current.style.cursor = 'default';
        }
    };

    const handleCanvasClick = (e) => {
        if (isDragging) return; // Don't handle as a click if we were dragging

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Get current nodes based on tree type
        let nodes = getCurrentNodes();

        // Check if click is on any node
        const clickedNode = nodes.find(node =>
            Math.sqrt(Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2)) < 20
        );

        if (clickedNode) {
            // Highlight node and show details
            highlightNode(clickedNode);
        } else if (x < 100 && y < 100) {
            // If clicking in the top-left corner, toggle tutorial
            setShowTutorial(!showTutorial);
        } else {
            // Double click to add a node at this position (only for BST, not implemented for other trees)
            if (currentTreeType === 'bst' && e.detail === 2) {
                handleDoubleClickAddNode(x, y);
            }
        }
    };

    const handleDoubleClickAddNode = (x, y) => {
        // Prompt for a value
        const value = prompt("Enter a value for the new node:");
        if (value === null || value === "") return;

        const parsedValue = parseInt(value);
        if (isNaN(parsedValue)) {
            setDescription("Please enter a valid number");
            return;
        }

        // For BST, add the node directly at the position
        const newNodes = [...bstNodes];
        const newNode = {
            id: newNodes.length + 1,
            value: parsedValue,
            x: x,
            y: y
        };

        // If there are existing nodes, try to connect to the closest one
        if (newNodes.length > 0) {
            let closestNode = null;
            let minDistance = Infinity;

            for (const node of newNodes) {
                const distance = Math.sqrt(Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2));
                if (distance < minDistance) {
                    minDistance = distance;
                    closestNode = node;
                }
            }

            if (closestNode && minDistance < 150) {
                const newConnections = [...bstConnections];
                newConnections.push({
                    fromX: closestNode.x,
                    fromY: closestNode.y,
                    toX: x,
                    toY: y
                });

                setBstConnections(newConnections);
            }
        }

        newNodes.push(newNode);
        setBstNodes(newNodes);

        // Save state for undo/redo
        saveState();

        setDescription(`Added node with value ${parsedValue} at (${Math.round(x)}, ${Math.round(y)})`);
    };

    // Helper function to get current nodes based on tree type
    const getCurrentNodes = () => {
        switch (currentTreeType) {
            case 'bst': return bstNodes;
            case 'avl': return avlNodes;
            case 'rbt': return rbtNodes;
            case 'trie': return trieNodes;
            default: return [];
        }
    };

    // Helper function to get current connections based on tree type
    const getCurrentConnections = () => {
        switch (currentTreeType) {
            case 'bst': return bstConnections;
            case 'avl': return avlConnections;
            case 'rbt': return rbtConnections;
            case 'trie': return trieConnections;
            default: return [];
        }
    };

    // Helper function to update nodes and connections based on tree type
    const updateNodesAndConnections = (updatedNodes, updatedConnections) => {
        switch (currentTreeType) {
            case 'bst':
                setBstNodes(updatedNodes);
                setBstConnections(updatedConnections);
                break;
            case 'avl':
                setAvlNodes(updatedNodes);
                setAvlConnections(updatedConnections);
                break;
            case 'rbt':
                setRbtNodes(updatedNodes);
                setRbtConnections(updatedConnections);
                break;
            case 'trie':
                setTrieNodes(updatedNodes);
                setTrieConnections(updatedConnections);
                break;
            default:
                break;
        }
    };

    // History management for undo/redo
    const saveState = () => {
        let currentState;
        switch (currentTreeType) {
            case 'bst':
                currentState = {
                    nodes: [...bstNodes],
                    connections: [...bstConnections],
                    type: 'bst'
                };
                break;
            case 'avl':
                currentState = {
                    nodes: [...avlNodes],
                    connections: [...avlConnections],
                    type: 'avl'
                };
                break;
            case 'rbt':
                currentState = {
                    nodes: [...rbtNodes],
                    connections: [...rbtConnections],
                    type: 'rbt'
                };
                break;
            case 'trie':
                currentState = {
                    nodes: [...trieNodes],
                    connections: [...trieConnections],
                    type: 'trie',
                    words: [...trieWords]
                };
                break;
            default:
                return;
        }

        // Remove future states if we're not at the end of the history
        const newHistory = nodeHistory.slice(0, currentHistoryIndex + 1);
        newHistory.push(currentState);

        setNodeHistory(newHistory);
        setCurrentHistoryIndex(newHistory.length - 1);
    };

    const handleUndo = () => {
        if (currentHistoryIndex <= 0) return;

        const prevState = nodeHistory[currentHistoryIndex - 1];
        restoreState(prevState);
        setCurrentHistoryIndex(currentHistoryIndex - 1);
    };

    const handleRedo = () => {
        if (currentHistoryIndex >= nodeHistory.length - 1) return;

        const nextState = nodeHistory[currentHistoryIndex + 1];
        restoreState(nextState);
        setCurrentHistoryIndex(currentHistoryIndex + 1);
    };

    const restoreState = (state) => {
        switch (state.type) {
            case 'bst':
                setBstNodes(state.nodes);
                setBstConnections(state.connections);
                break;
            case 'avl':
                setAvlNodes(state.nodes);
                setAvlConnections(state.connections);
                break;
            case 'rbt':
                setRbtNodes(state.nodes);
                setRbtConnections(state.connections);
                break;
            case 'trie':
                setTrieNodes(state.nodes);
                setTrieConnections(state.connections);
                if (state.words) setTrieWords(state.words);
                break;
            default:
                break;
        }
    };

    // Function to draw the current tree
    const drawTree = () => {
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        if (!canvas || !ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Select nodes and connections based on tree type
        let nodes = [];
        let connections = [];

        switch (currentTreeType) {
            case 'bst':
                nodes = bstNodes;
                connections = bstConnections;
                break;
            case 'avl':
                nodes = avlNodes;
                connections = avlConnections;
                break;
            case 'rbt':
                nodes = rbtNodes;
                connections = rbtConnections;
                break;
            case 'trie':
                nodes = trieNodes;
                connections = trieConnections;
                break;
            default:
                break;
        }

        // Draw connections
        ctx.lineWidth = 2;
        connections.forEach(conn => {
            ctx.beginPath();
            ctx.moveTo(conn.fromX, conn.fromY);
            ctx.lineTo(conn.toX, conn.toY);
            ctx.strokeStyle = conn.color || '#ffffff';

            // Draw arrow tips for directed connections
            const angle = Math.atan2(conn.toY - conn.fromY, conn.toX - conn.fromX);
            const arrowSize = 8;

            ctx.stroke();

            // For Trie, draw character labels on edges
            if (currentTreeType === 'trie' && conn.char) {
                const midX = (conn.fromX + conn.toX) / 2;
                const midY = (conn.fromY + conn.toY) / 2;

                ctx.fillStyle = '#ffffff';
                ctx.font = '14px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                // Draw a small background circle
                ctx.beginPath();
                ctx.arc(midX, midY, 10, 0, Math.PI * 2);
                ctx.fillStyle = '#333333';
                ctx.fill();

                // Draw the character
                ctx.fillStyle = '#ffffff';
                ctx.fillText(conn.char, midX, midY);
            }
        });

        // Draw nodes
        nodes.forEach(node => {
            // Node shadow (for 3D effect)
            ctx.beginPath();
            ctx.arc(node.x + 3, node.y + 3, 20, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fill();

            // Node circle
            ctx.beginPath();
            ctx.arc(node.x, node.y, 20, 0, Math.PI * 2);

            // Gradient fill for nodes
            const gradient = ctx.createRadialGradient(node.x - 5, node.y - 5, 2, node.x, node.y, 20);
            const baseColor = node.color ||
                (currentTreeType === 'avl' ? '#a4f7ff' :
                    currentTreeType === 'bst' ? '#d4a4ff' :
                        currentTreeType === 'trie' ? '#90ee90' : '#ffffff');

            gradient.addColorStop(0, lightenColor(baseColor, 50));
            gradient.addColorStop(1, baseColor);

            ctx.fillStyle = gradient;
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.stroke();

            // Node text
            ctx.fillStyle = node.textColor || '#000000';
            ctx.font = `${node.fontSize || 16}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(node.value.toString(), node.x, node.y);

            // Special indicators (for Trie end nodes or balance factors)
            if (node.isEnd) {
                ctx.beginPath();
                ctx.arc(node.x + 15, node.y - 15, 5, 0, Math.PI * 2);
                ctx.fillStyle = "#ff69b4";
                ctx.fill();
            }

            if (currentTreeType === 'avl' && node.balanceFactor !== undefined) {
                ctx.fillStyle = '#ffffff';
                ctx.font = '12px Arial';
                ctx.fillText(`BF: ${node.balanceFactor}`, node.x, node.y + 30);
            }

            // Highlight hovered node
            if (hoverInfo && hoverInfo.node.id === node.id) {
                ctx.beginPath();
                ctx.arc(node.x, node.y, 23, 0, Math.PI * 2);
                ctx.strokeStyle = "#ffff00";
                ctx.lineWidth = 2;
                ctx.stroke();

                // Show node details on hover
                ctx.fillStyle = '#000000';
                ctx.fillRect(hoverInfo.x + 10, hoverInfo.y - 10, 100, 60);
                ctx.strokeStyle = '#ffffff';
                ctx.strokeRect(hoverInfo.x + 10, hoverInfo.y - 10, 100, 60);

                ctx.fillStyle = '#ffffff';
                ctx.font = '12px Arial';
                ctx.textAlign = 'left';
                ctx.fillText(`Value: ${node.value}`, hoverInfo.x + 15, hoverInfo.y + 10);
                ctx.fillText(`ID: ${node.id}`, hoverInfo.x + 15, hoverInfo.y + 25);

                if (currentTreeType === 'avl') {
                    ctx.fillText(`BF: ${node.balanceFactor || 0}`, hoverInfo.x + 15, hoverInfo.y + 40);
                } else if (currentTreeType === 'rbt') {
                    ctx.fillText(`Color: ${node.isRed ? 'Red' : 'Black'}`, hoverInfo.x + 15, hoverInfo.y + 40);
                } else if (currentTreeType === 'trie') {
                    ctx.fillText(`End: ${node.isEnd ? 'Yes' : 'No'}`, hoverInfo.x + 15, hoverInfo.y + 40);
                }
            }
        });

        // Draw tutorial overlay if enabled
        if (showTutorial) {
            drawTutorial(ctx, canvas);
        }
    };

    // Helper function to draw tutorial overlay
    const drawTutorial = (ctx, canvas) => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#ffffff';
        ctx.font = '20px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        const tutorialText = [
            '🔍 INTERACTIVE CONTROLS:',
            '',
            '• Click on node to highlight',
            '• Drag nodes to reposition',
            '• Double-click on canvas to add node (BST only)',
            '• Hover over nodes to see details',
            '• CTRL+Z / CTRL+Y for undo/redo',
            '• Use animation slider to control speed',
            '',
            'Click anywhere to close tutorial'
        ];

        let y = 50;
        tutorialText.forEach(line => {
            ctx.fillText(line, 50, y);
            y += 30;
        });
    };

    // Helper function to lighten a color
    const lightenColor = (color, percent) => {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;

        return '#' + (
            0x1000000 +
            (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
            (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
            (B < 255 ? (B < 1 ? 0 : B) : 255)
        ).toString(16).slice(1);
    };

    // Handle tree type selection
    const selectTree = (type) => {
        setCurrentTreeType(type);

        const descriptions = {
            bst: "Binary Search Tree: Nodes with left children < parent < right children. O(log n) search in average case.",
            avl: "AVL Tree: A self-balancing BST. Keeps height difference ≤ 1 for all nodes.",
            rbt: "Red-Black Tree: A self-balancing BST using red/black coloring rules.",
            trie: "Trie: A prefix tree for storing words or characters like a dictionary."
        };

        setDescription(descriptions[type]);

        // Save state when changing tree type
        saveState();
    };

    // Add getTabFullName function
    const getTabFullName = (tabName) => {
        switch(tabName) {
            case 'bst': return 'Binary Search Tree';
            case 'avl': return 'AVL Tree';
            case 'rbt': return 'Red-Black Tree';
            case 'trie': return 'Trie';
            default: return tabName;
        }
    };

    // Helper function to highlight a specific node
    const highlightNode = (node) => {
        // Find all nodes connected to this one
        let connections = getCurrentConnections();
        let connectedNodes = [];

        // Find nodes that are connected to the selected node
        connections.forEach(conn => {
            if (conn.fromX === node.x && conn.fromY === node.y) {
                const toNode = getCurrentNodes().find(n => n.x === conn.toX && n.y === conn.toY);
                if (toNode) connectedNodes.push(toNode);
            }
            if (conn.toX === node.x && conn.toY === node.y) {
                const fromNode = getCurrentNodes().find(n => n.x === conn.fromX && n.y === conn.fromY);
                if (fromNode) connectedNodes.push(fromNode);
            }
        });

        // Create animation sequence
        const animSequence = [
            { node, color: '#ffff00', textColor: '#000000' },
            ...connectedNodes.map(n => ({ node: n, color: '#ff9900', textColor: '#000000' }))
        ];

        setIsAnimating(true);

        // Function to animate highlighting
        let i = 0;
        const animate = () => {
            if (i >= animSequence.length) {
                // Reset after animation
                drawTree();
                setIsAnimating(false);
                return;
            }

            const item = animSequence[i];

            // Store current state
            const nodes = getCurrentNodes();
            const highlightedNodes = nodes.map(n => {
                if (n.id === item.node.id) {
                    return { ...n, color: item.color, textColor: item.textColor };
                }
                return n;
            });

            // Update state based on tree type
            switch (currentTreeType) {
                case 'bst':
                    setBstNodes(highlightedNodes);
                    break;
                case 'avl':
                    setAvlNodes(highlightedNodes);
                    break;
                case 'rbt':
                    setRbtNodes(highlightedNodes);
                    break;
                case 'trie':
                    setTrieNodes(highlightedNodes);
                    break;
                default:
                    break;
            }

            // Show node details
            setDescription(`Node: ${item.node.value} | Connections: ${connectedNodes.length}`);

            // Move to next node after delay
            i++;
            setTimeout(animate, 300 / animationSpeedRef.current);
        };

        animate();
    };

    /*
     * BST Operations
     */
    const insertBST = (value) => {
        if (bstNodes.length === 0) {
            // Add root node
            const newNodes = [
                {
                    id: 1,
                    value: value,
                    x: canvasRef.current.width / 2,
                    y: 50
                }
            ];
            setBstNodes(newNodes);
            saveState();
            setDescription(`Created root node with value ${value}`);
            return;
        }

        // Clone current nodes and connections
        const newNodes = [...bstNodes];
        const newConnections = [...bstConnections];

        // Find insertion path and position
        const path = findBSTInsertionPath(newNodes, value);
        if (!path) {
            setDescription(`Value ${value} already exists in the tree`);
            return;
        }

        const parentNode = path[path.length - 1];
        const isLeft = value < parentNode.value;

        // Calculate position for new node
        const nodeX = isLeft ? parentNode.x - 80 / (path.length * 0.5) : parentNode.x + 80 / (path.length * 0.5);
        const nodeY = parentNode.y + 60;

        // Create new node
        const newNode = {
            id: newNodes.length + 1,
            value: value,
            x: nodeX,
            y: nodeY
        };

        // Add connection from parent to new node
        newConnections.push({
            fromX: parentNode.x,
            fromY: parentNode.y,
            toX: nodeX,
            toY: nodeY
        });

        // Add the new node to the tree
        newNodes.push(newNode);

        // Update state
        setBstNodes(newNodes);
        setBstConnections(newConnections);
        saveState();
        setDescription(`Inserted ${value} into the BST`);

        // Highlight insertion path (for visual effect)
        highlightPath(path.concat(newNode));
    };

    const findBSTInsertionPath = (nodes, value) => {
        if (nodes.length === 0) return [];

        const path = [];
        let currentNodeIndex = 0; // Root

        while (true) {
            const currentNode = nodes[currentNodeIndex];
            path.push(currentNode);

            if (value === currentNode.value) {
                return null; // Value already exists
            }

            const isLeft = value < currentNode.value;

            // Find child node index
            const childIndex = nodes.findIndex(node => {
                const connection = getCurrentConnections().find(conn =>
                    conn.fromX === currentNode.x &&
                    conn.fromY === currentNode.y &&
                    node.x === conn.toX &&
                    node.y === conn.toY);

                return connection && ((isLeft && node.x < currentNode.x) || (!isLeft && node.x > currentNode.x));
            });

            if (childIndex === -1) {
                return path; // Found insertion point
            }

            currentNodeIndex = childIndex;
        }
    };

    const searchBST = (value) => {
        if (bstNodes.length === 0) {
            setDescription("Tree is empty");
            return;
        }

        const path = findBSTPath(bstNodes, value);
        if (!path) {
            setDescription(`Value ${value} not found in the tree`);
            return;
        }

        // Highlight the path
        highlightPath(path);

        if (path[path.length - 1].value === value) {
            setDescription(`Found value ${value} in the tree!`);
        } else {
            setDescription(`Value ${value} not found in the tree`);
        }
    };

    const findBSTPath = (nodes, value) => {
        if (nodes.length === 0) return null;

        const path = [];
        let currentNodeIndex = 0; // Root

        while (currentNodeIndex !== -1) {
            const currentNode = nodes[currentNodeIndex];
            path.push(currentNode);

            if (value === currentNode.value) {
                return path; // Found the value
            }

            const isLeft = value < currentNode.value;

            // Find child node index
            const childIndex = nodes.findIndex(node => {
                const connection = getCurrentConnections().find(conn =>
                    conn.fromX === currentNode.x &&
                    conn.fromY === currentNode.y &&
                    node.x === conn.toX &&
                    node.y === conn.toY);

                return connection && ((isLeft && node.x < currentNode.x) || (!isLeft && node.x > currentNode.x));
            });

            if (childIndex === -1) {
                return path; // Reached leaf node, value not found
            }

            currentNodeIndex = childIndex;
        }

        return null;
    };

    /*
 * AVL Tree Operations
 */
    const insertAVL = (value) => {
        if (avlNodes.length === 0) {
            // Add root node
            const newNodes = [
                {
                    id: 1,
                    value: value,
                    x: canvasRef.current.width / 2,
                    y: 50,
                    height: 1 // Track height for balance factor calculation
                }
            ];
            setAvlNodes(newNodes);
            saveState();
            setDescription(`Created root node with value ${value}`);
            return;
        }

        // Clone current nodes and connections
        let newNodes = [...avlNodes];
        let newConnections = [...avlConnections];

        // Find insertion path and position
        const path = findAVLInsertionPath(newNodes, value);
        if (!path) {
            setDescription(`Value ${value} already exists in the tree`);
            return;
        }

        const parentNode = path[path.length - 1];
        const isLeft = value < parentNode.value;

        // Calculate position for new node
        const nodeX = isLeft ? parentNode.x - 80 / (path.length * 0.5) : parentNode.x + 80 / (path.length * 0.5);
        const nodeY = parentNode.y + 60;

        // Create new node
        const newNode = {
            id: newNodes.length + 1,
            value: value,
            x: nodeX,
            y: nodeY,
            height: 1 // Leaf node has height 1
        };

        // Add connection from parent to new node
        newConnections.push({
            fromX: parentNode.x,
            fromY: parentNode.y,
            toX: nodeX,
            toY: nodeY
        });

        // Add the new node to the tree
        newNodes.push(newNode);

        // Update heights along the path
        updateHeights(newNodes, newConnections, path);

        // Check for imbalance and perform rotations if necessary
        const { nodes: balancedNodes, connections: balancedConnections } =
            balanceAVLTree(newNodes, newConnections, path);

        newNodes = balancedNodes;
        newConnections = balancedConnections;

        // Update state
        setAvlNodes(newNodes);
        setAvlConnections(newConnections);
        saveState();
        setDescription(`Inserted ${value} into the AVL tree and rebalanced if needed`);

        // Highlight insertion path (for visual effect)
        highlightPath([...path, newNode]);
    };

    const findAVLInsertionPath = (nodes, value) => {
        if (nodes.length === 0) return [];

        const path = [];
        let currentNodeIndex = 0; // Root

        while (true) {
            const currentNode = nodes[currentNodeIndex];
            path.push(currentNode);

            if (value === currentNode.value) {
                return null; // Value already exists
            }

            const isLeft = value < currentNode.value;

            // Find child node index
            const childIndex = nodes.findIndex(node => {
                const connection = getCurrentAVLConnections().find(conn =>
                    conn.fromX === currentNode.x &&
                    conn.fromY === currentNode.y &&
                    node.x === conn.toX &&
                    node.y === conn.toY);

                return connection && ((isLeft && node.x < currentNode.x) || (!isLeft && node.x > currentNode.x));
            });

            if (childIndex === -1) {
                return path; // Found insertion point
            }

            currentNodeIndex = childIndex;
        }
    };

// Get height of a node (0 if null)
    const getHeight = (nodes, node) => {
        return node ? node.height : 0;
    };

// Get balance factor of a node
    const getBalanceFactor = (nodes, connections, node) => {
        if (!node) return 0;

        // Find left and right children
        const leftChild = findChildNode(nodes, connections, node, true);
        const rightChild = findChildNode(nodes, connections, node, false);

        return getHeight(nodes, leftChild) - getHeight(nodes, rightChild);
    };

// Find child node (left or right)
    const findChildNode = (nodes, connections, parentNode, isLeft) => {
        return nodes.find(node => {
            const connection = connections.find(conn =>
                conn.fromX === parentNode.x &&
                conn.fromY === parentNode.y &&
                node.x === conn.toX &&
                node.y === conn.toY);

            return connection && ((isLeft && node.x < parentNode.x) || (!isLeft && node.x > parentNode.x));
        });
    };

// Update heights of all nodes in the path
    const updateHeights = (nodes, connections, path) => {
        // Start from the bottom of the path (excluding the newly added node)
        for (let i = path.length - 1; i >= 0; i--) {
            const node = path[i];

            // Find left and right children
            const leftChild = findChildNode(nodes, connections, node, true);
            const rightChild = findChildNode(nodes, connections, node, false);

            // Update height
            node.height = 1 + Math.max(
                getHeight(nodes, leftChild),
                getHeight(nodes, rightChild)
            );
        }
    };

// Perform rotations to balance the tree
    const balanceAVLTree = (nodes, connections, path) => {
        // Start from the bottom of the path
        for (let i = path.length - 1; i >= 0; i--) {
            const node = path[i];
            const balanceFactor = getBalanceFactor(nodes, connections, node);

            // Left heavy
            if (balanceFactor > 1) {
                const leftChild = findChildNode(nodes, connections, node, true);
                const leftChildBalanceFactor = getBalanceFactor(nodes, connections, leftChild);

                // Left-Right case
                if (leftChildBalanceFactor < 0) {
                    // Perform left rotation on left child
                    const result = leftRotate(nodes, connections, leftChild);
                    nodes = result.nodes;
                    connections = result.connections;
                }

                // Left-Left case
                // Perform right rotation on node
                const result = rightRotate(nodes, connections, node);
                nodes = result.nodes;
                connections = result.connections;
            }
            // Right heavy
            else if (balanceFactor < -1) {
                const rightChild = findChildNode(nodes, connections, node, false);
                const rightChildBalanceFactor = getBalanceFactor(nodes, connections, rightChild);

                // Right-Left case
                if (rightChildBalanceFactor > 0) {
                    // Perform right rotation on right child
                    const result = rightRotate(nodes, connections, rightChild);
                    nodes = result.nodes;
                    connections = result.connections;
                }

                // Right-Right case
                // Perform left rotation on node
                const result = leftRotate(nodes, connections, node);
                nodes = result.nodes;
                connections = result.connections;
            }
        }

        return { nodes, connections };
    };

// Perform right rotation
    const rightRotate = (nodes, connections, node) => {
        const leftChild = findChildNode(nodes, connections, node, true);
        if (!leftChild) return { nodes, connections }; // Can't rotate

        // Identify the left-right child if it exists
        const leftRightChild = findChildNode(nodes, connections, leftChild, false);

        // Clone connections for modification
        let newConnections = connections.filter(conn =>
            !(conn.fromX === node.x && conn.fromY === node.y && conn.toX === leftChild.x && conn.toY === leftChild.y));

        // Remove connection from left child to left-right child if it exists
        if (leftRightChild) {
            newConnections = newConnections.filter(conn =>
                !(conn.fromX === leftChild.x && conn.fromY === leftChild.y &&
                    conn.toX === leftRightChild.x && conn.toY === leftRightChild.y));
        }

        // Find parent of the node we're rotating
        const nodeParent = findParentNode(nodes, connections, node);

        // Adjust positions for rotation
        const nodeOldX = node.x;
        const nodeOldY = node.y;
        const leftChildOldX = leftChild.x;
        const leftChildOldY = leftChild.y;

        // Swap positions of node and left child
        leftChild.x = nodeOldX;
        leftChild.y = nodeOldY;
        node.x = nodeOldX + 80; // Move to right
        node.y = nodeOldY + 60; // Move down

        // Update connections
        if (nodeParent) {
            // Update connection from parent to left child (new root)
            const parentConn = connections.find(conn =>
                conn.fromX === nodeParent.x && conn.fromY === nodeParent.y &&
                conn.toX === nodeOldX && conn.toY === nodeOldY);

            if (parentConn) {
                parentConn.toX = leftChild.x;
                parentConn.toY = leftChild.y;
            }
        }

        // Add connection from left child to node
        newConnections.push({
            fromX: leftChild.x,
            fromY: leftChild.y,
            toX: node.x,
            toY: node.y
        });

        // Move left-right child if exists
        if (leftRightChild) {
            leftRightChild.x = node.x - 40;
            leftRightChild.y = node.y;

            // Add connection from node to left-right child
            newConnections.push({
                fromX: node.x,
                fromY: node.y,
                toX: leftRightChild.x,
                toY: leftRightChild.y
            });
        }

        // Update heights
        const rightChild = findChildNode(nodes, newConnections, node, false);
        node.height = 1 + Math.max(
            getHeight(nodes, leftRightChild),
            getHeight(nodes, rightChild)
        );

        leftChild.height = 1 + Math.max(
            getHeight(nodes, findChildNode(nodes, newConnections, leftChild, true)),
            getHeight(nodes, node)
        );

        return { nodes, connections: newConnections };
    };

// Perform left rotation
    const leftRotate = (nodes, connections, node) => {
        const rightChild = findChildNode(nodes, connections, node, false);
        if (!rightChild) return { nodes, connections }; // Can't rotate

        // Identify the right-left child if it exists
        const rightLeftChild = findChildNode(nodes, connections, rightChild, true);

        // Clone connections for modification
        let newConnections = connections.filter(conn =>
            !(conn.fromX === node.x && conn.fromY === node.y && conn.toX === rightChild.x && conn.toY === rightChild.y));

        // Remove connection from right child to right-left child if it exists
        if (rightLeftChild) {
            newConnections = newConnections.filter(conn =>
                !(conn.fromX === rightChild.x && conn.fromY === rightChild.y &&
                    conn.toX === rightLeftChild.x && conn.toY === rightLeftChild.y));
        }

        // Find parent of the node we're rotating
        const nodeParent = findParentNode(nodes, connections, node);

        // Adjust positions for rotation
        const nodeOldX = node.x;
        const nodeOldY = node.y;
        const rightChildOldX = rightChild.x;
        const rightChildOldY = rightChild.y;

        // Swap positions of node and right child
        rightChild.x = nodeOldX;
        rightChild.y = nodeOldY;
        node.x = nodeOldX - 80; // Move to left
        node.y = nodeOldY + 60; // Move down

        // Update connections
        if (nodeParent) {
            // Update connection from parent to right child (new root)
            const parentConn = connections.find(conn =>
                conn.fromX === nodeParent.x && conn.fromY === nodeParent.y &&
                conn.toX === nodeOldX && conn.toY === nodeOldY);

            if (parentConn) {
                parentConn.toX = rightChild.x;
                parentConn.toY = rightChild.y;
            }
        }

        // Add connection from right child to node
        newConnections.push({
            fromX: rightChild.x,
            fromY: rightChild.y,
            toX: node.x,
            toY: node.y
        });

        // Move right-left child if exists
        if (rightLeftChild) {
            rightLeftChild.x = node.x + 40;
            rightLeftChild.y = node.y;

            // Add connection from node to right-left child
            newConnections.push({
                fromX: node.x,
                fromY: node.y,
                toX: rightLeftChild.x,
                toY: rightLeftChild.y
            });
        }

        // Update heights
        const leftChild = findChildNode(nodes, newConnections, node, true);
        node.height = 1 + Math.max(
            getHeight(nodes, leftChild),
            getHeight(nodes, rightLeftChild)
        );

        rightChild.height = 1 + Math.max(
            getHeight(nodes, node),
            getHeight(nodes, findChildNode(nodes, newConnections, rightChild, false))
        );

        return { nodes, connections: newConnections };
    };

// Helper to find parent node
    const findParentNode = (nodes, connections, childNode) => {
        return nodes.find(node => {
            return connections.some(conn =>
                conn.fromX === node.x &&
                conn.fromY === node.y &&
                conn.toX === childNode.x &&
                conn.toY === childNode.y
            );
        });
    };

// Search in AVL tree (similar to BST search)
    const searchAVL = (value) => {
        if (avlNodes.length === 0) {
            setDescription("Tree is empty");
            return;
        }

        const path = findAVLPath(avlNodes, value);
        if (!path) {
            setDescription(`Value ${value} not found in the tree`);
            return;
        }

        // Highlight the path
        highlightPath(path);

        if (path[path.length - 1].value === value) {
            setDescription(`Found value ${value} in the AVL tree!`);
        } else {
            setDescription(`Value ${value} not found in the AVL tree`);
        }
    };

    const findAVLPath = (nodes, value) => {
        if (nodes.length === 0) return null;

        const path = [];
        let currentNodeIndex = 0; // Root

        while (currentNodeIndex !== -1) {
            const currentNode = nodes[currentNodeIndex];
            path.push(currentNode);

            if (value === currentNode.value) {
                return path; // Found the value
            }

            const isLeft = value < currentNode.value;

            // Find child node index
            const childIndex = nodes.findIndex(node => {
                const connection = getCurrentAVLConnections().find(conn =>
                    conn.fromX === currentNode.x &&
                    conn.fromY === currentNode.y &&
                    node.x === conn.toX &&
                    node.y === conn.toY);

                return connection && ((isLeft && node.x < currentNode.x) || (!isLeft && node.x > currentNode.x));
            });

            if (childIndex === -1) {
                return path; // Reached leaf node, value not found
            }

            currentNodeIndex = childIndex;
        }

        return null;
    };

    // After findAVLPath function
// Search in Trie
    const searchTrie = (word) => {
        if (trieNodes.length === 0) {
            setDescription("Trie is empty");
            return;
        }

        // Implement a basic trie search
        let currentNode = trieNodes[0]; // Root node
        const path = [currentNode];

        for (let i = 0; i < word.length; i++) {
            const char = word[i];
            const nextNode = trieNodes.find(node => {
                const connection = trieConnections.find(conn =>
                    conn.fromX === currentNode.x &&
                    conn.fromY === currentNode.y &&
                    node.x === conn.toX &&
                    node.y === conn.toY &&
                    conn.char === char
                );
                return !!connection;
            });

            if (!nextNode) {
                setDescription(`Word "${word}" not found in the trie`);
                highlightPath(path);
                return;
            }

            path.push(nextNode);
            currentNode = nextNode;
        }

        if (currentNode.isEnd) {
            setDescription(`Found word "${word}" in the trie!`);
        } else {
            setDescription(`Prefix "${word}" found, but it's not a complete word`);
        }

        highlightPath(path);
    };

// Helper to get current AVL connections
    const getCurrentAVLConnections = () => {
        return avlConnections;
    };
    // After getCurrentAVLConnections function
    /*
     * Red-Black Tree Operations
     */
    const insertRBT = (value) => {
        if (rbtNodes.length === 0) {
            // Add root node (black)
            const newNodes = [
                {
                    id: 1,
                    value: value,
                    x: canvasRef.current.width / 2,
                    y: 50,
                    isRed: false // Root is always black
                }
            ];
            setRbtNodes(newNodes);
            saveState();
            setDescription(`Created root node with value ${value}`);
            return;
        }

        // For now, implement a basic BST insert without balancing
        // (a complete RBT would require more complex balancing logic)
        const newNodes = [...rbtNodes];
        const newConnections = [...rbtConnections];

        // Find insertion path
        const path = findBSTInsertionPath(newNodes, value);
        if (!path) {
            setDescription(`Value ${value} already exists in the tree`);
            return;
        }

        const parentNode = path[path.length - 1];
        const isLeft = value < parentNode.value;

        // Calculate position for new node
        const nodeX = isLeft ? parentNode.x - 80 / (path.length * 0.5) : parentNode.x + 80 / (path.length * 0.5);
        const nodeY = parentNode.y + 60;

        // Create new node (initially red)
        const newNode = {
            id: newNodes.length + 1,
            value: value,
            x: nodeX,
            y: nodeY,
            isRed: true // New nodes are always red
        };

        // Add connection
        newConnections.push({
            fromX: parentNode.x,
            fromY: parentNode.y,
            toX: nodeX,
            toY: nodeY
        });

        // Add the node
        newNodes.push(newNode);

        setRbtNodes(newNodes);
        setRbtConnections(newConnections);
        saveState();
        setDescription(`Inserted ${value} into the Red-Black Tree (simplified without balancing)`);

        highlightPath(path.concat(newNode));
    };

// Search in Red-Black Tree
    const searchRBT = (value) => {
        if (rbtNodes.length === 0) {
            setDescription("Tree is empty");
            return;
        }

        // Similar to BST search
        const path = findBSTPath(rbtNodes, value);
        if (!path) {
            setDescription(`Value ${value} not found in the tree`);
            return;
        }

        // Highlight the path
        highlightPath(path);

        if (path[path.length - 1].value === value) {
            setDescription(`Found value ${value} in the Red-Black Tree!`);
        } else {
            setDescription(`Value ${value} not found in the Red-Black Tree`);
        }
    };
    // Highlight path
    const highlightPath = (path) => {
        if (!path || path.length === 0) return;

        setIsAnimating(true);

        // Function to animate highlighting
        let i = 0;
        const animate = () => {
            if (i >= path.length) {
                // Reset after animation
                drawTree();
                setIsAnimating(false);
                return;
            }

            const node = path[i];

            // Store current state
            const nodes = getCurrentNodes();
            const highlightedNodes = nodes.map(n => {
                if (n.id === node.id) {
                    return { ...n, color: '#ffff00', textColor: '#000000' };
                }
                return n;
            });

            // Update state based on tree type
            updateNodesAndConnections(highlightedNodes, getCurrentConnections());

            // Move to next node after delay
            i++;
            setTimeout(animate, 300 / animationSpeedRef.current);
        };

        animate();
    };
    /*
     * Trie Operations
     */
    const insertTrie = (word) => {
        if (!word || word.trim() === '') {
            setDescription("Please enter a valid word");
            return;
        }

        word = word.toLowerCase();

        // Check if word already exists
        if (trieWords.includes(word)) {
            setDescription(`Word "${word}" already exists in the trie`);
            return;
        }

        // If no nodes exist, create the root node
        if (trieNodes.length === 0) {
            const rootNode = {
                id: 1,
                value: "",
                x: canvasRef.current.width / 2,
                y: 50,
                isEnd: false
            };

            setTrieNodes([rootNode]);
        }

        // Clone current nodes and connections
        const newNodes = [...trieNodes];
        const newConnections = [...trieConnections];
        const newWords = [...trieWords, word];

        let currentNode = newNodes[0]; // Root node
        const path = [currentNode];

        // For each character in the word
        for (let i = 0; i < word.length; i++) {
            const char = word[i];

            // Check if there's already a node for this character
            let nextNode = newNodes.find(node => {
                const connection = newConnections.find(conn =>
                    conn.fromX === currentNode.x &&
                    conn.fromY === currentNode.y &&
                    node.x === conn.toX &&
                    node.y === conn.toY &&
                    conn.char === char
                );
                return !!connection;
            });

            if (!nextNode) {
                // Create a new node for this character
                const isEnd = i === word.length - 1;

                // Calculate position
                const angle = (newNodes.length % 5) * (Math.PI / 6) - Math.PI / 3;
                const distance = 80;
                const nodeX = currentNode.x + Math.cos(angle) * distance;
                const nodeY = currentNode.y + 60;

                nextNode = {
                    id: newNodes.length + 1,
                    value: char,
                    x: nodeX,
                    y: nodeY,
                    isEnd: isEnd
                };

                // Add connection
                newConnections.push({
                    fromX: currentNode.x,
                    fromY: currentNode.y,
                    toX: nodeX,
                    toY: nodeY,
                    char: char
                });

                newNodes.push(nextNode);
            } else if (i === word.length - 1) {
                // Mark existing node as word end
                nextNode.isEnd = true;
            }

            path.push(nextNode);
            currentNode = nextNode;
        }

        // Update state
        setTrieNodes(newNodes);
        setTrieConnections(newConnections);
        setTrieWords(newWords);
        saveState();
        setDescription(`Inserted word "${word}" into the trie`);

        // Highlight the path
        highlightPath(path);
    };
    return (
        <div className="enhanced-tree-visualization">
            <h1>Tree Data Structure Visualizer</h1>

            <div className="controls-container">
                <div className="tree-selector">
                    <button
                        className={currentTreeType === 'bst' ? 'active' : ''}
                        onClick={() => selectTree('bst')}
                    >Binary Search Tree</button>
                    <button
                        className={currentTreeType === 'avl' ? 'active' : ''}
                        onClick={() => selectTree('avl')}
                    >AVL Tree</button>
                    <button
                        className={currentTreeType === 'rbt' ? 'active' : ''}
                        onClick={() => selectTree('rbt')}
                    >Red-Black Tree</button>
                    <button
                        className={currentTreeType === 'trie' ? 'active' : ''}
                        onClick={() => selectTree('trie')}
                    >Trie</button>
                </div>

                <div className="enhanced-controls">
                    <div className="animation-speed-control">
                        <label htmlFor="animation-speed">Animation Speed:</label>
                        <input
                            type="range"
                            id="animation-speed"
                            min="1"
                            max="5"
                            value={animationSpeedRef.current}
                            onChange={(e) => animationSpeedRef.current = parseInt(e.target.value)}
                        />
                    </div>

                    <div className="history-buttons">
                        <button
                            onClick={handleUndo}
                            disabled={currentHistoryIndex <= 0 || isAnimating}
                        >
                            <span role="img" aria-label="Undo">↩️</span> Undo
                        </button>
                        <button
                            onClick={handleRedo}
                            disabled={currentHistoryIndex >= nodeHistory.length - 1 || isAnimating}
                        >
                            <span role="img" aria-label="Redo">↪️</span> Redo
                        </button>
                    </div>

                    <div className="quick-actions">
                        <button
                            onClick={() => {
                                switch (currentTreeType) {
                                    case 'bst':
                                        setBstNodes([]);
                                        setBstConnections([]);
                                        break;
                                    case 'avl':
                                        setAvlNodes([]);
                                        setAvlConnections([]);
                                        break;
                                    case 'rbt':
                                        setRbtNodes([]);
                                        setRbtConnections([]);
                                        break;
                                    case 'trie':
                                        setTrieNodes([]);
                                        setTrieConnections([]);
                                        setTrieWords([]);
                                        break;
                                    default:
                                        break;
                                }
                                saveState();
                                setDescription(`Reset ${getTabFullName(currentTreeType)}`);
                            }}
                            disabled={isAnimating}
                        >
                            <span role="img" aria-label="Reset">🔄</span> Reset
                        </button>
                        <button
                            onClick={() => {
                                const generateRandomValues = (count) => {
                                    const values = [];
                                    for (let i = 0; i < count; i++) {
                                        values.push(Math.floor(Math.random() * 100));
                                    }
                                    return values;
                                };

                                const values = generateRandomValues(7);
                                switch (currentTreeType) {
                                    case 'bst':
                                        setBstNodes([]);
                                        setBstConnections([]);
                                        values.forEach(val => insertBST(val));
                                        break;
                                    case 'avl':
                                        setAvlNodes([]);
                                        setAvlConnections([]);
                                        values.forEach(val => insertAVL(val));
                                        break;
                                    default:
                                        break;
                                }
                                setDescription(`Generated random ${getTabFullName(currentTreeType)}`);
                            }}
                            disabled={isAnimating}
                        >
                            <span role="img" aria-label="Random">🎲</span> Random
                        </button>
                    </div>
                </div>

                {currentTreeType === 'avl' && (
                    <div className="avl-settings">
                        <label>
                            <input
                                type="checkbox"
                                checked={autoBalanceAvl}
                                onChange={() => setAutoBalanceAvl(!autoBalanceAvl)}
                            />
                            Auto-balance tree
                        </label>
                    </div>
                )}
            </div>

            <div className="message-box" style={{ borderColor: themeColor }}>
                {description}
            </div>

            <div className="node-input">
                <input
                    type={currentTreeType === 'trie' ? 'text' : 'number'}
                    value={nodeValue}
                    onChange={(e) => setNodeValue(e.target.value)}
                    placeholder={currentTreeType === 'trie' ? "Enter a word..." : "Enter a number..."}
                    style={{ borderColor: themeColor }}
                />

                <div className="operation-buttons">
                    <button
                        onClick={() => {
                            if (!nodeValue) {
                                setDescription("Please enter a value");
                                return;
                            }

                            const value = currentTreeType === 'trie' ?
                                nodeValue :
                                parseInt(nodeValue);

                            switch (currentTreeType) {
                                case 'bst':
                                    insertBST(value);
                                    break;
                                case 'avl':
                                    insertAVL(value);
                                    break;
                                case 'rbt':
                                    insertRBT(value);
                                    break;
                                case 'trie':
                                    insertTrie(value);
                                    break;
                                default:
                                    setDescription("Insert not implemented for this tree type yet");
                            }

                            setNodeValue('');
                        }}
                        disabled={isAnimating}
                        style={{ borderColor: themeColor }}
                    >
                        Insert
                    </button>
                    <button
                        onClick={() => {
                            if (!nodeValue) {
                                setDescription("Please enter a value");
                                return;
                            }

                            const value = currentTreeType === 'trie' ?
                                nodeValue :
                                parseInt(nodeValue);

                            switch (currentTreeType) {
                                case 'bst':
                                    searchBST(value);
                                    break;
                                case 'avl':
                                    searchAVL(value);
                                    break;
                                default:
                                    setDescription("Search not implemented for this tree type yet");
                            }
                        }}
                        disabled={isAnimating}
                        style={{ borderColor: themeColor }}
                    >
                        Search
                    </button>
                    <button
                        onClick={() => {
                            setDescription("Delete operation is not implemented yet");
                        }}
                        disabled={isAnimating}
                        style={{ borderColor: themeColor }}
                    >
                        Delete
                    </button>
                </div>
            </div>

            <div className="canvas-container">
                <canvas
                    ref={canvasRef}
                    className="tree-canvas"
                    width={1000}
                    height={500}
                    style={{ borderColor: themeColor }}
                ></canvas>

                {showTutorial && (
                    <div className="tutorial-overlay" onClick={() => setShowTutorial(false)}>
                        <div className="tutorial-content">
                            <h3>Interactive Tree Visualizer</h3>
                            <ul>
                                <li>Click on nodes to highlight them</li>
                                <li>Drag nodes to reposition</li>
                                <li>Double-click on canvas to add a node (BST only)</li>
                                <li>Use controls to manipulate the tree</li>
                            </ul>
                            <p>Click anywhere to close</p>
                        </div>
                    </div>
                )}
            </div>

            {currentTreeType === 'trie' && (
                <div className="trie-words-box">
                    <h3>Words in Trie</h3>
                    <div className="trie-words-table">
                        <table>
                            <tbody>
                            {trieWords.length === 0 ? (
                                <tr><td>No words yet</td></tr>
                            ) : (
                                trieWords.map((word, index) => (
                                    <tr key={index}>
                                        <td>{word}</td>
                                        <td>
                                            <button
                                                className="mini-button"
                                                onClick={() => searchTrie(word)}
                                            >
                                                Search
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="explanation-box" style={{ borderColor: themeColor }}>
                <h3>{getTabFullName(currentTreeType)}</h3>
                {currentTreeType === 'bst' && (
                    <>
                        <p>A Binary Search Tree (BST) is a tree data structure where each node has at most two children, and for each node, all elements in the left subtree are less than the node's value, and all elements in the right subtree are greater.</p>
                        <ul className="feature-list">
                            <li><span role="img" aria-label="Properties">📝</span> Left child &lt; Parent &lt; Right child</li>
                            <li><span role="img" aria-label="Time">⏱️</span> Average search/insert/delete: O(log n)</li>
                            <li><span role="img" aria-label="Warning">⚠️</span> Worst case: O(n) if unbalanced</li>
                        </ul>
                    </>
                )}

                {currentTreeType === 'avl' && (
                    <>
                        <p>An AVL Tree is a self-balancing binary search tree where the height difference between left and right subtrees cannot be more than one for any node.</p>
                        <ul className="feature-list">
                            <li><span role="img" aria-label="Balance">⚖️</span> Self-balancing with rotation operations</li>
                            <li><span role="img" aria-label="Height">📏</span> Balance factor = height(left) - height(right)</li>
                            <li><span role="img" aria-label="Time">⏱️</span> All operations: O(log n) guaranteed</li>
                        </ul>
                    </>
                )}

                {currentTreeType === 'rbt' && (
                    <>
                        <p>A Red-Black Tree is a self-balancing binary search tree where nodes are colored red or black according to specific rules to maintain balance.</p>
                        <ul className="feature-list">
                            <li><span role="img" aria-label="Rule">🔴</span> Every node is red or black</li>
                            <li><span role="img" aria-label="Rule">⚫</span> The root is black</li>
                            <li><span role="img" aria-label="Rule">🔴</span> No red node has a red child</li>
                            <li><span role="img" aria-label="Rule">⚫</span> All paths from root to leaf have the same number of black nodes</li>
                        </ul>
                    </>
                )}

                {currentTreeType === 'trie' && (
                    <>
                        <p>A Trie (prefix tree) is a tree-like data structure used to store a dynamic set of strings, typically used for efficient prefix-based searches.</p>
                        <ul className="feature-list">
                            <li><span role="img" aria-label="Use">📚</span> Dictionary/autocomplete implementation</li>
                            <li><span role="img" aria-label="Search">🔍</span> O(m) search time where m is key length</li>
                            <li><span role="img" aria-label="Space">💾</span> Space-efficient for common prefixes</li>
                        </ul>
                    </>
                )}
            </div>

            <div className="footer">
                <button
                    className="help-button"
                    onClick={() => setShowTutorial(true)}
                >
                    <span role="img" aria-label="Help">❓</span> Help
                </button>
                <div className="status">
                    <span>Nodes: {getCurrentNodes().length}</span>
                </div>
            </div>
        </div>
    );
};

export default EnhancedTreeVisualization;