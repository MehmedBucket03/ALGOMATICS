import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './TreeVisualization.css';

const CompleteTreeVisualization = () => {
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const animationSpeedRef = useRef(1);
    const [currentTreeType, setCurrentTreeType] = useState('bst');
    const [nodeValue, setNodeValue] = useState('');
    const [description, setDescription] = useState('');
    const [trieWords, setTrieWords] = useState([]);

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
    }, []);

    // Draw the appropriate tree when state changes
    useEffect(() => {
        drawTree();
    }, [
        currentTreeType,
        bstNodes, bstConnections,
        avlNodes, avlConnections,
        rbtNodes, rbtConnections,
        trieNodes, trieConnections
    ]);

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
            ctx.stroke();
        });

        // Draw nodes
        nodes.forEach(node => {
            // Node circle
            ctx.beginPath();
            ctx.arc(node.x, node.y, 20, 0, Math.PI * 2);
            ctx.fillStyle = node.color ||
                (currentTreeType === 'avl' ? '#a4f7ff' :
                    currentTreeType === 'bst' ? '#d4a4ff' : '#ffffff');
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.stroke();

            // Node text
            ctx.fillStyle = node.textColor || '#000000';
            ctx.font = `${node.fontSize || 16}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(node.value.toString(), node.x, node.y);

            // Special indicators (for Trie end nodes)
            if (node.isEnd) {
                ctx.beginPath();
                ctx.arc(node.x + 15, node.y - 15, 5, 0, Math.PI * 2);
                ctx.fillStyle = "#ff69b4";
                ctx.fill();
            }
        });
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

        // Clear any highlight effects
        drawTree();
    };

    /*
     * BST Operations
     */
    const insertBST = (value) => {
        if (bstNodes.length === 0) {
            // Add root node
            setBstNodes([
                {
                    id: 1,
                    value: value,
                    x: canvasRef.current.width / 2,
                    y: 50
                }
            ]);
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
                const connection = bstConnections.find(conn =>
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
                const connection = bstConnections.find(conn =>
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
            setAvlNodes([
                {
                    id: 1,
                    value: value,
                    x: canvasRef.current.width / 2,
                    y: 50,
                    height: 1,
                    color: '#a4f7ff'
                }
            ]);
            setDescription(`Created root node with value ${value}`);
            return;
        }

        // This is a simplified version - in a real implementation
        // we'd need to handle rebalancing, but that's complex for this demo

        // Clone current nodes and connections
        const newNodes = [...avlNodes];
        const newConnections = [...avlConnections];

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
            y: nodeY,
            height: 1,
            color: '#a4f7ff'
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
        setAvlNodes(newNodes);
        setAvlConnections(newConnections);
        setDescription(`Inserted ${value} into the AVL Tree`);

        // Highlight insertion path
        highlightPath(path.concat(newNode));
    };

    const searchAVL = (value) => {
        // AVL search is same as BST search
        if (avlNodes.length === 0) {
            setDescription("Tree is empty");
            return;
        }

        const path = findBSTPath(avlNodes, value);
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

    /*
     * Red-Black Tree Operations
     */
    const insertRBT = (value) => {
        if (rbtNodes.length === 0) {
            // Add root node (root is always black)
            setRbtNodes([
                {
                    id: 1,
                    value: value,
                    x: canvasRef.current.width / 2,
                    y: 50,
                    color: '#000000',
                    textColor: '#ffffff',
                    isRed: false
                }
            ]);
            setDescription(`Created root node with value ${value}`);
            return;
        }

        // Clone current nodes and connections
        const newNodes = [...rbtNodes];
        const newConnections = [...rbtConnections];

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

        // Create new node (inserted nodes are red by default)
        const newNode = {
            id: newNodes.length + 1,
            value: value,
            x: nodeX,
            y: nodeY,
            color: '#ff5e78', // Red
            textColor: '#ffffff',
            isRed: true
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

        // Update state (real implementation would do rebalancing)
        setRbtNodes(newNodes);
        setRbtConnections(newConnections);
        setDescription(`Inserted ${value} into the Red-Black Tree`);

        // Highlight insertion path
        highlightPath(path.concat(newNode));
    };

    const searchRBT = (value) => {
        // RBT search is same as BST search
        if (rbtNodes.length === 0) {
            setDescription("Tree is empty");
            return;
        }

        const path = findBSTPath(rbtNodes, value);
        if (!path) {
            setDescription(`Value ${value} not found in the tree`);
            return;
        }

        // Highlight the path
        highlightPath(path);

        if (path[path.length - 1].value === value) {
            setDescription(`Found value ${value} in the Red-Black tree!`);
        } else {
            setDescription(`Value ${value} not found in the Red-Black tree`);
        }
    };

    /*
     * Trie Operations
     */
    const insertTrie = (word) => {
        if (!word) {
            setDescription("Please enter a word");
            return;
        }

        // Initialize trie if empty
        if (trieNodes.length === 0) {
            const rootNode = {
                id: 1,
                value: 'ROOT',
                x: canvasRef.current.width / 2,
                y: 50,
                fontSize: 12
            };

            setTrieNodes([rootNode]);
        }

        // Clone current state
        const newNodes = [...trieNodes];
        const newConnections = [...trieConnections];
        let currentNode = newNodes.find(n => n.value === 'ROOT');

        if (!currentNode) return;

        let isNewWord = false;

        // Follow existing path or create new nodes for each character
        for (let i = 0; i < word.length; i++) {
            const char = word[i];

            // Find if this character is already a child
            const childConnection = newConnections.find(conn =>
                conn.fromX === currentNode.x &&
                conn.fromY === currentNode.y &&
                conn.char === char);

            let childNode;

            if (childConnection) {
                // Character exists, follow the path
                childNode = newNodes.find(n => n.x === childConnection.toX && n.y === childConnection.toY);
            } else {
                // Need to add new node for this character
                isNewWord = true;

                const xOffset = (i % 2 === 0) ? -50 - i * 5 : 50 + i * 5;

                childNode = {
                    id: newNodes.length + 1,
                    value: char,
                    x: currentNode.x + xOffset,
                    y: currentNode.y + 60,
                    isEnd: i === word.length - 1
                };

                // Add node
                newNodes.push(childNode);

                // Add connection
                newConnections.push({
                    fromX: currentNode.x,
                    fromY: currentNode.y,
                    toX: childNode.x,
                    toY: childNode.y,
                    char: char
                });
            }

            // Update current node to child for next iteration
            currentNode = childNode;

            // If this is the last character, mark as end of word
            if (i === word.length - 1) {
                childNode.isEnd = true;
            }
        }

        // Update state
        setTrieNodes(newNodes);
        setTrieConnections(newConnections);

        // Update the word list
        if (isNewWord) {
            setTrieWords([...trieWords, word]);
        }

        setDescription(`Word "${word}" added to trie`);
    };

    const searchTrie = (word) => {
        if (!word || trieNodes.length === 0) {
            setDescription("Please enter a word to search");
            return;
        }

        let currentNode = trieNodes.find(n => n.value === 'ROOT');
        if (!currentNode) return;

        const path = [currentNode];

        // Follow the path for each character
        for (let i = 0; i < word.length; i++) {
            const char = word[i];

            // Find connection with this character
            const connection = trieConnections.find(conn =>
                conn.fromX === currentNode.x &&
                conn.fromY === currentNode.y &&
                conn.char === char);

            if (!connection) {
                setDescription(`Word "${word}" not found in trie`);
                highlightPath(path);
                return;
            }

            // Find node at end of connection
            const nextNode = trieNodes.find(n =>
                n.x === connection.toX &&
                n.y === connection.toY);

            if (!nextNode) {
                setDescription(`Word "${word}" not found in trie`);
                highlightPath(path);
                return;
            }

            path.push(nextNode);
            currentNode = nextNode;
        }

        // Check if the final node is marked as end of word
        if (currentNode.isEnd) {
            setDescription(`Word "${word}" found in trie!`);
        } else {
            setDescription(`"${word}" is a prefix but not a complete word in the trie`);
        }

        highlightPath(path);
    };

    // Helper function to highlight a path in the tree
    const highlightPath = (path) => {
        if (!path || path.length === 0) return;

        let i = 0;
        const ctx = ctxRef.current;
        if (!ctx) return;

        // Original draw to clear any previous highlights
        drawTree();

        // Animation function
        const highlight = () => {
            if (i >= path.length) return;

            const node = path[i];

            // Store current state
            drawTree();

            // Highlight the current node
            ctx.beginPath();
            ctx.arc(node.x, node.y, 26, 0, Math.PI * 2);
            ctx.strokeStyle = "#ffff00";
            ctx.lineWidth = 3;
            ctx.stroke();

            // Move to next node after delay
            i++;
            if (i < path.length) {
                setTimeout(highlight, 400 / animationSpeedRef.current);
            }
        };

        highlight();
    };

    // Handle tree operations
    const handleInsert = () => {
        if (!nodeValue) return;

        if (currentTreeType === 'trie') {
            insertTrie(nodeValue);
        } else {
            const value = parseInt(nodeValue);
            if (isNaN(value)) {
                setDescription("Please enter a valid number");
                return;
            }

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
                default:
                    break;
            }
        }

        setNodeValue('');
    };

    const handleSearch = () => {
        if (!nodeValue) return;

        if (currentTreeType === 'trie') {
            searchTrie(nodeValue);
        } else {
            const value = parseInt(nodeValue);
            if (isNaN(value)) {
                setDescription("Please enter a valid number");
                return;
            }

            switch (currentTreeType) {
                case 'bst':
                    searchBST(value);
                    break;
                case 'avl':
                    searchAVL(value);
                    break;
                case 'rbt':
                    searchRBT(value);
                    break;
                default:
                    break;
            }
        }
    };

    const handleClear = () => {
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

        setDescription(`Cleared the ${currentTreeType.toUpperCase()} tree`);
    };

    const handleSpeedChange = (e) => {
        animationSpeedRef.current = parseFloat(e.target.value);
    };

    return (
        <div className="explorer-container">
            <div className="floating-pixels">
                <div className="floating-pixel p1"></div>
                <div className="floating-pixel p2"></div>
                <div className="floating-pixel p3"></div>
                <div className="floating-pixel p4"></div>
            </div>

            <header className="header-bg">
                <nav>
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/math" className="nav-link">Math</Link>
                    <Link to="/algorithms" className="nav-link">Algorithms</Link>
                    <Link to="/about" className="nav-link">About</Link>
                </nav>
            </header>

            <div className="container">
                <div className="pixel-window">
                    <div className="pixel-window-header">
                        <div className="pixel-dots">
                            <span className="pixel-dot red"></span>
                            <span className="pixel-dot yellow"></span>
                            <span className="pixel-dot green"></span>
                        </div>
                        <div className="pixel-title">TREES.EXE</div>
                    </div>

                    <div className="pixel-window-body">
                        <h1>TREE VISUALIZATION</h1>

                        <div className="menu" id="treeTypeMenu">
                            <button
                                onClick={() => selectTree('bst')}
                                className={currentTreeType === 'bst' ? 'active' : ''}
                            >
                                BINARY SEARCH TREE
                            </button>
                            <button
                                onClick={() => selectTree('avl')}
                                className={currentTreeType === 'avl' ? 'active' : ''}
                            >
                                AVL TREE
                            </button>
                            <button
                                onClick={() => selectTree('rbt')}
                                className={currentTreeType === 'rbt' ? 'active' : ''}
                            >
                                RED-BLACK TREE
                            </button>
                            <button
                                onClick={() => selectTree('trie')}
                                className={currentTreeType === 'trie' ? 'active' : ''}
                            >
                                TRIE
                            </button>
                        </div>

                        <div className="animation-speed-control">
                            <label htmlFor="speedSlider">Animation Speed:</label>
                            <input
                                type="range"
                                id="speedSlider"
                                min="0.5"
                                max="3"
                                step="0.5"
                                defaultValue="1"
                                onChange={handleSpeedChange}
                            />
                        </div>

                        <div className="tree-visualization">
                            <canvas
                                ref={canvasRef}
                                id="treeCanvas"
                                className="tree-canvas"
                            ></canvas>
                        </div>

                        <div className="message-box">
                            {description}
                        </div>

                        <div className="controls">
                            <div className="node-input">
                                <input
                                    type={currentTreeType === 'trie' ? 'text' : 'number'}
                                    value={nodeValue}
                                    onChange={(e) => setNodeValue(e.target.value)}
                                    placeholder={currentTreeType === 'trie' ? "Enter a word" : "Enter a number"}
                                />
                                <div className="operation-buttons">
                                    <button onClick={handleInsert}>INSERT</button>
                                    <button onClick={handleSearch}>SEARCH</button>
                                    <button onClick={handleClear}>CLEAR</button>
                                </div>
                            </div>
                        </div>

                        {currentTreeType === 'trie' && trieWords.length > 0 && (
                            <div className="trie-words-box">
                                <h3>Stored Words</h3>
                                <div className="trie-words-table">
                                    <table>
                                        <tbody>
                                        {trieWords.sort().map((word, index) => (
                                            <tr key={index}>
                                                <td>{word}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        <div className="explanation-box">
                            <p>
                                {currentTreeType === 'bst' &&
                                    "Binary Search Trees (BST) store data in a way that allows fast lookup, addition, and removal. Each node has at most two children, with all values in the left subtree being less than the parent node, and all values in the right subtree being greater."}

                                {currentTreeType === 'avl' &&
                                    "AVL Trees are self-balancing binary search trees. The heights of the two child subtrees of any node differ by at most one, ensuring O(log n) operations."}

                                {currentTreeType === 'rbt' &&
                                    "Red-Black Trees are self-balancing binary search trees where nodes are colored red or black according to specific rules. This ensures the tree remains approximately balanced during insertions and deletions."}

                                {currentTreeType === 'trie' &&
                                    "Tries (prefix trees) are specialized tree structures used to store strings. They're especially useful for dictionary implementations and provide O(m) lookup time where m is the length of the string."}
                            </p>
                        </div>
                    </div>

                    <div className="pixel-window-footer">
                        <div className="pixel-status">SYSTEM READY</div>
                        <div className="pixel-memory">MEM: 640K</div>
                    </div>
                </div>
            </div>

            <footer className="footer-bg">
                <p>© 2025 ALGOMATICS • ALL RIGHTS RESERVED</p>
            </footer>
        </div>
    );
};

export default CompleteTreeVisualization;