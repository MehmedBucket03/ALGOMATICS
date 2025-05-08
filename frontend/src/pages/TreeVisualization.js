import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Sketch from 'react-p5';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { debounce } from 'lodash';
import * as d3 from 'd3';
import './TreeVisualization.css';
import { auth, db } from '../firebase/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Tree type constants
const TREE_TYPES = {
    BST: 'bst',
    AVL: 'avl',
    RBT: 'rbt',
    TRIE: 'trie'
};

// Theme colors by tree type
const THEME_COLORS = {
    [TREE_TYPES.BST]: '#d4a4ff',
    [TREE_TYPES.AVL]: '#a4f7ff',
    [TREE_TYPES.RBT]: '#ff5e78',
    [TREE_TYPES.TRIE]: '#90ee90'
};

// Tree descriptions
const TREE_DESCRIPTIONS = {
    [TREE_TYPES.BST]: 'Binary Search Tree: Nodes with left children < parent < right children.',
    [TREE_TYPES.AVL]: 'AVL Tree: Self-balancing BST with balance factor [-1, 0, 1].',
    [TREE_TYPES.RBT]: 'Red-Black Tree: Self-balancing BST with red/black nodes.',
    [TREE_TYPES.TRIE]: 'Trie: Prefix tree for storing strings.'
};

// Animation variants for Framer Motion
const pageVariants = {
    initial: { opacity: 0 },
    in: { opacity: 1, transition: { duration: 0.3 } },
    out: { opacity: 0, transition: { duration: 0.3 } }
};

const listItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: i => ({
        opacity: 1,
        x: 0,
        transition: {
            delay: i * 0.1,
            duration: 0.4
        }
    })
};

const EnhancedTreeVisualization = () => {
    // Refs
    const canvasContainerRef = useRef(null);
    const animationSpeedRef = useRef(1);
    const animationTimeoutsRef = useRef([]);
    const isDraggingRef = useRef(false);
    const draggedNodeRef = useRef(null);
    const gsapContextRef = useRef(null);
    const d3ContainerRef = useRef(null);

    // State
    const [currentTreeType, setCurrentTreeType] = useState(TREE_TYPES.BST);
    const [nodeValue, setNodeValue] = useState('');
    const [description, setDescription] = useState(TREE_DESCRIPTIONS[TREE_TYPES.BST]);
    const [hoverInfo, setHoverInfo] = useState(null);
    const [showTutorial, setShowTutorial] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [themeColor, setThemeColor] = useState(THEME_COLORS[TREE_TYPES.BST]);
    const [useD3Layout, setUseD3Layout] = useState(false);
    const [useGsapAnimations, setUseGsapAnimations] = useState(true);

    // Tree data
    const [treeData, setTreeData] = useState({
        [TREE_TYPES.BST]: { nodes: [], connections: [] },
        [TREE_TYPES.AVL]: { nodes: [], connections: [] },
        [TREE_TYPES.RBT]: { nodes: [], connections: [] },
        [TREE_TYPES.TRIE]: { nodes: [], connections: [], words: [] }
    });

    // History
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // Memoized selectors
    const currentNodes = useMemo(() => treeData[currentTreeType].nodes, [treeData, currentTreeType]);
    const currentConnections = useMemo(() => treeData[currentTreeType].connections, [treeData, currentTreeType]);
    const trieWords = useMemo(() => treeData[TREE_TYPES.TRIE].words, [treeData]);

    // GSAP context setup
    useEffect(() => {
        gsapContextRef.current = gsap.context(() => {}, canvasContainerRef);
        return () => gsapContextRef.current.revert();
    }, []);

    // Cleanup timeouts
    useEffect(() => {
        return () => {
            animationTimeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
        };
    }, []);

    // Theme color update
    useEffect(() => {
        document.documentElement.style.setProperty('--theme-color', THEME_COLORS[currentTreeType]);
    }, [currentTreeType]);

    // Firestore serialization
    const getSerializedTreeData = useCallback(() => {
        const data = treeData[currentTreeType];
        return JSON.stringify({
            nodes: data.nodes,
            connections: data.connections,
            ...(currentTreeType === TREE_TYPES.TRIE ? { words: data.words } : {})
        });
    }, [treeData, currentTreeType]);

    // Save to Firestore
    const saveProgressToFirestore = useCallback(debounce(async () => {
        const user = auth.currentUser;
        if (!user) return;

        try {
            const topicId = 'tree-visualization';
            const inputString = getSerializedTreeData();
            const docRef = doc(db, 'users', user.uid);

            const docSnap = await getDoc(docRef);
            const data = docSnap.exists() ? docSnap.data() : {};

            await setDoc(
                docRef,
                {
                    lastTopicVisited: topicId,
                    [`themes.${topicId}`]: {
                        input: inputString,
                        history: [
                            ...(data?.topics?.[topicId]?.history || []),
                            { input: inputString, timestamp: new Date().toISOString() },
                        ],
                        timestamp: new Date().toISOString(),
                    },
                },
                { merge: true }
            );
        } catch (error) {
            console.error('Error saving to Firestore:', error);
        }
    }, 1000), [getSerializedTreeData]);

    // Load from Firestore
    const fetchProgress = useCallback(async () => {
        const user = auth.currentUser;
        if (!user) return;

        try {
            const docRef = doc(db, 'users', user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                const saved = data.topics?.['tree-visualization']?.input;

                if (saved) {
                    const parsed = JSON.parse(saved);

                    setTreeData(prevData => ({
                        ...prevData,
                        [currentTreeType]: {
                            nodes: parsed.nodes || [],
                            connections: parsed.connections || [],
                            ...(currentTreeType === TREE_TYPES.TRIE ? { words: parsed.words || [] } : {})
                        }
                    }));
                }
            }
        } catch (error) {
            console.error('Error fetching from Firestore:', error);
        }
    }, [currentTreeType]);

    // Load data on tree type change
    useEffect(() => {
        fetchProgress();
        setDescription(TREE_DESCRIPTIONS[currentTreeType]);
        setThemeColor(THEME_COLORS[currentTreeType]);
    }, [currentTreeType, fetchProgress]);

    // Save progress on tree data change
    useEffect(() => {
        const currentData = treeData[currentTreeType];
        if (currentData.nodes.length > 0) {
            saveProgressToFirestore();
        }
    }, [treeData, currentTreeType, saveProgressToFirestore]);

    // Update tree data
    const updateTreeData = useCallback((nodes, connections, words = null) => {
        setTreeData(prevData => ({
            ...prevData,
            [currentTreeType]: {
                nodes,
                connections,
                ...(words && currentTreeType === TREE_TYPES.TRIE ? { words } :
                    currentTreeType === TREE_TYPES.TRIE ? { words: prevData[TREE_TYPES.TRIE].words } : {})
            }
        }));

        if (useGsapAnimations && gsapContextRef.current && nodes.length > 0) {
            gsapContextRef.current.add(() => {
                const nodeElements = document.querySelectorAll('.node-circle');
                gsap.to(nodeElements, {
                    scale: 1.1,
                    duration: 0.3,
                    stagger: 0.05,
                    yoyo: true,
                    repeat: 1,
                    ease: "power2.inOut"
                });
            });
        }
    }, [currentTreeType, useGsapAnimations]);

    // D3 layout
    const applyD3Layout = useCallback(() => {
        if (!useD3Layout || currentNodes.length <= 1) return;

        const simulation = d3.forceSimulation(currentNodes)
            .force("link", d3.forceLink(currentConnections)
                .id(d => d.id)
                .distance(100)
                .strength(0.1))
            .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(500, 250))
            .force("x", d3.forceX(500).strength(0.05))
            .force("y", d3.forceY(250).strength(0.05))
            .stop();

        for (let i = 0; i < 100; i++) {
            simulation.tick();
        }

        const updatedConnections = currentConnections.map(conn => {
            const sourceNode = currentNodes.find(n => n.id === conn.sourceId);
            const targetNode = currentNodes.find(n => n.id === conn.targetId);

            if (sourceNode && targetNode) {
                return {
                    ...conn,
                    fromX: sourceNode.x,
                    fromY: sourceNode.y,
                    toX: targetNode.x,
                    toY: targetNode.y
                };
            }
            return conn;
        });

        updateTreeData(
            currentNodes.map(node => ({
                ...node,
                x: Math.max(50, Math.min(950, node.x)),
                y: Math.max(50, Math.min(450, node.y))
            })),
            updatedConnections
        );
    }, [currentNodes, currentConnections, updateTreeData, useD3Layout]);

    // History management
    const saveState = useCallback(() => {
        const currentState = {
            type: currentTreeType,
            ...treeData[currentTreeType]
        };

        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(currentState);

        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    }, [history, historyIndex, treeData, currentTreeType]);

    const restoreState = useCallback((state) => {
        updateTreeData(
            state.nodes,
            state.connections,
            state.type === TREE_TYPES.TRIE ? state.words : null
        );
    }, [updateTreeData]);

    const handleUndo = useCallback(() => {
        if (historyIndex <= 0) return;
        const prevState = history[historyIndex - 1];
        restoreState(prevState);
        setHistoryIndex(historyIndex - 1);
    }, [historyIndex, history, restoreState]);

    const handleRedo = useCallback(() => {
        if (historyIndex >= history.length - 1) return;
        const nextState = history[historyIndex + 1];
        restoreState(nextState);
        setHistoryIndex(historyIndex + 1);
    }, [historyIndex, history, restoreState, history.length]);

    // Animation utilities
    const addTimeout = useCallback((callback, delay) => {
        const timeoutId = setTimeout(() => {
            callback();
            animationTimeoutsRef.current = animationTimeoutsRef.current.filter(id => id !== timeoutId);
        }, delay);

        animationTimeoutsRef.current.push(timeoutId);
        return timeoutId;
    }, []);

    const clearAllTimeouts = useCallback(() => {
        animationTimeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
        animationTimeoutsRef.current = [];
    }, []);

    // Node utilities
    const findNodeAtCoordinates = useCallback((x, y, radius = 20) => {
        const radiusSquared = radius * radius;
        return currentNodes.find(node => {
            const distanceSquared = Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2);
            return distanceSquared < radiusSquared;
        });
    }, [currentNodes]);

    // BST insertion
    const insertBSTNode = useCallback((value) => {
        const parsedValue = parseInt(value);
        if (isNaN(parsedValue)) {
            setDescription('Please enter a valid number');
            return;
        }

        setIsAnimating(true);
        clearAllTimeouts();

        const newNodes = [...currentNodes];
        const newConnections = [...currentConnections];
        const path = [];
        let currentX = 500;
        let currentY = 50;
        let parentNode = null;
        let currentNode = null;

        if (newNodes.length === 0) {
            const newNode = {
                id: 1,
                value: parsedValue,
                x: currentX,
                y: currentY,
            };
            newNodes.push(newNode);
        } else {
            currentNode = newNodes.find(node => node.x === 500 && node.y === 50) || newNodes[0];
            path.push(currentNode);

            while (currentNode) {
                if (parsedValue < currentNode.value) {
                    const leftChild = newNodes.find(node =>
                        newConnections.some(conn =>
                            conn.fromX === currentNode.x &&
                            conn.fromY === currentNode.y &&
                            conn.toX === node.x &&
                            node.x < currentNode.x
                        )
                    );

                    if (!leftChild) {
                        const newNode = {
                            id: newNodes.length + 1,
                            value: parsedValue,
                            x: currentNode.x - 100,
                            y: currentNode.y + 100,
                            sourceId: currentNode.id,
                            targetId: newNodes.length + 1
                        };
                        newNodes.push(newNode);
                        newConnections.push({
                            id: `conn-${currentNode.id}-${newNode.id}`,
                            fromX: currentNode.x,
                            fromY: currentNode.y,
                            toX: newNode.x,
                            toY: newNode.y,
                            sourceId: currentNode.id,
                            targetId: newNode.id
                        });
                        parentNode = currentNode;
                        break;
                    }
                    currentNode = leftChild;
                    path.push(currentNode);
                } else if (parsedValue > currentNode.value) {
                    const rightChild = newNodes.find(node =>
                        newConnections.some(conn =>
                            conn.fromX === currentNode.x &&
                            conn.fromY === currentNode.y &&
                            conn.toX === node.x &&
                            node.x > currentNode.x
                        )
                    );

                    if (!rightChild) {
                        const newNode = {
                            id: newNodes.length + 1,
                            value: parsedValue,
                            x: currentNode.x + 100,
                            y: currentNode.y + 100,
                            sourceId: currentNode.id,
                            targetId: newNodes.length + 1
                        };
                        newNodes.push(newNode);
                        newConnections.push({
                            id: `conn-${currentNode.id}-${newNode.id}`,
                            fromX: currentNode.x,
                            fromY: currentNode.y,
                            toX: newNode.x,
                            toY: newNode.y,
                            sourceId: currentNode.id,
                            targetId: newNode.id
                        });
                        parentNode = currentNode;
                        break;
                    }
                    currentNode = rightChild;
                    path.push(currentNode);
                } else {
                    setDescription('Duplicate values are not allowed in BST');
                    setIsAnimating(false);
                    return;
                }
            }
        }

        updateTreeData(newNodes, newConnections);

        if (useGsapAnimations && path.length > 0) {
            const timeline = gsap.timeline({
                onComplete: () => {
                    const newNode = newNodes[newNodes.length - 1];
                    gsap.to(`#node-${newNode.id}`, {
                        scale: 1.5,
                        fill: '#ffff00',
                        duration: 0.3,
                        repeat: 3,
                        yoyo: true,
                        ease: "elastic.out(1, 0.3)",
                        onComplete: () => {
                            setIsAnimating(false);
                            saveState();
                        }
                    });
                }
            });

            path.forEach((node, index) => {
                timeline.to(`#node-${node.id}`, {
                    scale: 1.3,
                    fill: '#ff9900',
                    duration: 0.3,
                    onStart: () => setDescription(`Traversing node ${node.value}`),
                    onComplete: () => {
                        gsap.to(`#node-${node.id}`, {
                            scale: 1,
                            fill: themeColor,
                            duration: 0.2
                        });
                    }
                }, index * 0.5);
            });
        } else {
            let i = 0;
            const animatePath = () => {
                if (i >= path.length) {
                    const newNode = newNodes[newNodes.length - 1];
                    updateTreeData(
                        newNodes.map(node =>
                            node.id === newNode.id ?
                                { ...node, color: '#ffff00', textColor: '#000000' } :
                                { ...node, color: themeColor, textColor: '#000000' }
                        ),
                        newConnections
                    );

                    setDescription(`Inserted node with value ${parsedValue}`);
                    saveState();

                    addTimeout(() => {
                        updateTreeData(
                            newNodes.map(node => ({ ...node, color: themeColor, textColor: '#000000' })),
                            newConnections
                        );
                        setIsAnimating(false);
                    }, 1000 / animationSpeedRef.current);

                    return;
                }

                updateTreeData(
                    newNodes.map(node =>
                        node.id === path[i].id ?
                            { ...node, color: '#ff9900', textColor: '#000000' } :
                            { ...node, color: themeColor, textColor: '#000000' }
                    ),
                    newConnections
                );

                setDescription(`Traversing node ${path[i].value}`);
                i++;
                addTimeout(animatePath, 1000 / animationSpeedRef.current);
            };

            animatePath();
        }
    }, [currentNodes, currentConnections, updateTreeData, themeColor, clearAllTimeouts, addTimeout, saveState, useGsapAnimations]);

    // Node highlighting
    const highlightNode = useCallback((node) => {
        let connectedNodes = [];

        currentConnections.forEach(conn => {
            if (conn.fromX === node.x && conn.fromY === node.y) {
                const toNode = currentNodes.find(n => n.x === conn.toX && n.y === conn.toY);
                if (toNode) connectedNodes.push(toNode);
            }
            if (conn.toX === node.x && conn.toY === node.y) {
                const fromNode = currentNodes.find(n => n.x === conn.fromX && n.y === conn.fromY);
                if (fromNode) connectedNodes.push(fromNode);
            }
        });

        setIsAnimating(true);

        if (useGsapAnimations) {
            const timeline = gsap.timeline({
                onComplete: () => setIsAnimating(false)
            });

            timeline.to(`#node-${node.id}`, {
                scale: 1.4,
                fill: '#ffff00',
                duration: 0.4,
                ease: "back.out(1.7)"
            });

            connectedNodes.forEach((connNode, index) => {
                const connection = currentConnections.find(
                    conn =>
                        (conn.fromX === node.x && conn.fromY === node.y && conn.toX === connNode.x && conn.toY === connNode.y) ||
                        (conn.toX === node.x && conn.toY === node.y && conn.fromX === connNode.x && conn.fromY === connNode.y)
                );

                if (connection) {
                    timeline.to(`#conn-${connection.id}`, {
                        stroke: '#ff9900',
                        strokeWidth: 3,
                        duration: 0.3,
                        ease: "power2.inOut"
                    }, "<+=0.1");
                }

                timeline.to(`#node-${connNode.id}`, {
                    scale: 1.2,
                    fill: '#ff9900',
                    duration: 0.3,
                    ease: "power2.inOut"
                }, "<");
            });

            timeline.to([
                `#node-${node.id}`,
                ...connectedNodes.map(n => `#node-${n.id}`),
                ...currentConnections
                    .filter(conn =>
                        (conn.fromX === node.x && conn.fromY === node.y) ||
                        (conn.toX === node.x && conn.toY === node.y)
                    )
                    .map(conn => `#conn-${conn.id}`)
            ], {
                scale: 1,
                fill: node => node.tagName === 'circle' ? themeColor : 'none',
                stroke: conn => conn.tagName === 'path' ? '#ffffff' : 'none',
                strokeWidth: 1,
                duration: 0.5,
                delay: 1,
                ease: "power2.inOut"
            });

            setDescription(`Node: ${node.value} | Connections: ${connectedNodes.length}`);
        } else {
            clearAllTimeouts();

            const animSequence = [
                { node, color: '#ffff00', textColor: '#000000' },
                ...connectedNodes.map(n => ({ node: n, color: '#ff9900', textColor: '#000000' })),
            ];

            let i = 0;
            const animate = () => {
                if (i >= animSequence.length) {
                    setIsAnimating(false);
                    return;
                }

                const item = animSequence[i];
                const highlightedNodes = currentNodes.map(n =>
                    n.id === item.node.id ?
                        { ...n, color: item.color, textColor: item.textColor } :
                        n
                );

                updateTreeData(highlightedNodes, currentConnections);
                setDescription(`Node: ${node.value} | Connections: ${connectedNodes.length}`);

                i++;
                addTimeout(animate, 300 / animationSpeedRef.current);
            };

            animate();
        }
    }, [currentNodes, currentConnections, updateTreeData, clearAllTimeouts, addTimeout, themeColor, useGsapAnimations]);

    // p5.js setup
    const setupSketch = useCallback((p5, canvasParentRef) => {
        const containerWidth = canvasContainerRef.current.clientWidth;
        const width = containerWidth > 1000 ? 1000 : containerWidth - 20;
        const canvas = p5.createCanvas(width, 500);
        canvas.parent(canvasParentRef);
    }, []);

    // p5.js draw
    const drawSketch = useCallback((p5) => {
        p5.background(26, 26, 46);
        p5.strokeWeight(2);

        if (useGsapAnimations && d3ContainerRef.current) {
            const svg = d3.select(d3ContainerRef.current);
            svg.selectAll("*").remove();

            currentConnections.forEach(conn => {
                svg.append("path")
                    .attr("id", `conn-${conn.id || `${conn.fromX}-${conn.fromY}-${conn.toX}-${conn.toY}`}`)
                    .attr("d", `M${conn.fromX},${conn.fromY} L${conn.toX},${conn.toY}`)
                    .attr("stroke", conn.color || "#ffffff")
                    .attr("stroke-width", 2)
                    .attr("fill", "none");

                if (conn.char) {
                    svg.append("text")
                        .attr("x", (conn.fromX + conn.toX) / 2)
                        .attr("y", (conn.fromY + conn.toY) / 2 - 10)
                        .attr("text-anchor", "middle")
                        .attr("fill", "#ffffff")
                        .attr("font-size", 12)
                        .text(conn.char);
                }
            });

            currentNodes.forEach(node => {
                svg.append("circle")
                    .attr("id", `node-${node.id}`)
                    .attr("class", "node-circle")
                    .attr("cx", node.x)
                    .attr("cy", node.y)
                    .attr("r", 20)
                    .attr("fill", node.color ||
                        (currentTreeType === TREE_TYPES.RBT && node.isRed ? '#ff0000' : themeColor));

                svg.append("text")
                    .attr("x", node.x)
                    .attr("y", node.y)
                    .attr("text-anchor", "middle")
                    .attr("dominant-baseline", "middle")
                    .attr("fill", node.textColor || "#000000")
                    .attr("font-size", 16)
                    .text(node.value.toString());

                if (node.isEnd) {
                    svg.append("circle")
                        .attr("cx", node.x + 15)
                        .attr("cy", node.y - 15)
                        .attr("r", 5)
                        .attr("fill", "#ff69b4");
                }

                if (currentTreeType === TREE_TYPES.AVL && node.balanceFactor !== undefined) {
                    svg.append("text")
                        .attr("x", node.x)
                        .attr("y", node.y + 30)
                        .attr("text-anchor", "middle")
                        .attr("fill", "#ffffff")
                        .attr("font-size", 12)
                        .text(`BF: ${node.balanceFactor}`);
                }
            });

            return;
        }

        currentConnections.forEach(conn => {
            p5.stroke(conn.color || 255);
            p5.line(conn.fromX, conn.fromY, conn.toX, conn.toY);

            if (conn.char) {
                p5.fill(255);
                p5.textAlign(p5.CENTER);
                p5.textSize(12);
                p5.text(conn.char, (conn.fromX + conn.toX) / 2, (conn.fromY + conn.toY) / 2 - 10);
            }
        });

        currentNodes.forEach(node => {
            p5.noStroke();
            const nodeColor = node.color ||
                (currentTreeType === TREE_TYPES.RBT && node.isRed ? '#ff0000' : themeColor);

            p5.fill(p5.color(nodeColor));
            p5.circle(node.x, node.y, 40);
            p5.fill(node.textColor || 0);
            p5.textAlign(p5.CENTER, p5.CENTER);
            p5.textSize(16);
            p5.text(node.value.toString(), node.x, node.y);

            if (node.isEnd) {
                p5.fill(255, 105, 180);
                p5.circle(node.x + 15, node.y - 15, 10);
            }

            if (currentTreeType === TREE_TYPES.AVL && node.balanceFactor !== undefined) {
                p5.fill(255);
                p5.textSize(12);
                p5.text(`BF: ${node.balanceFactor}`, node.x, node.y + 30);
            }
        });
    }, [currentNodes, currentConnections, currentTreeType, themeColor, useGsapAnimations]);

    // Mouse interaction
    const mousePressed = useCallback((p5) => {
        const node = findNodeAtCoordinates(p5.mouseX, p5.mouseY);
        if (node && !isAnimating) {
            isDraggingRef.current = true;
            draggedNodeRef.current = node;
        }
    }, [findNodeAtCoordinates, isAnimating]);

    const mouseReleased = useCallback(() => {
        if (isDraggingRef.current && draggedNodeRef.current && !isAnimating) {
            highlightNode(draggedNodeRef.current);
        }
        isDraggingRef.current = false;
        draggedNodeRef.current = null;
    }, [highlightNode, isAnimating]);

    const mouseDragged = useCallback((p5) => {
        if (isDraggingRef.current && draggedNodeRef.current && !isAnimating) {
            const newNodes = currentNodes.map(node =>
                node.id === draggedNodeRef.current.id
                    ? { ...node, x: p5.mouseX, y: p5.mouseY }
                    : node
            );

            const newConnections = currentConnections.map(conn => {
                if (conn.sourceId === draggedNodeRef.current.id) {
                    return { ...conn, fromX: p5.mouseX, fromY: p5.mouseY };
                }
                if (conn.targetId === draggedNodeRef.current.id) {
                    return { ...conn, toX: p5.mouseX, toY: p5.mouseY };
                }
                return conn;
            });

            updateTreeData(newNodes, newConnections);
        }
    }, [currentNodes, currentConnections, updateTreeData, isAnimating]);

    // Handle input submission
    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        if (!nodeValue || isAnimating) return;

        if (currentTreeType === TREE_TYPES.BST) {
            insertBSTNode(nodeValue);
        }
        // Add other tree type insertions here
        setNodeValue('');
    }, [nodeValue, currentTreeType, insertBSTNode, isAnimating]);

    // Render
    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="in"
            exit="out"
            className="tree-visualization-container"
        >
            <div className="controls">
                <select
                    value={currentTreeType}
                    onChange={(e) => setCurrentTreeType(e.target.value)}
                    disabled={isAnimating}
                >
                    {Object.values(TREE_TYPES).map(type => (
                        <option key={type} value={type}>
                            {type.toUpperCase()}
                        </option>
                    ))}
                </select>

                <div className="input-group">
                    <input
                        type="text"
                        value={nodeValue}
                        onChange={(e) => setNodeValue(e.target.value)}
                        placeholder="Enter node value"
                        disabled={isAnimating}
                    />
                    <button onClick={handleSubmit} disabled={isAnimating || !nodeValue}>
                        Insert
                    </button>
                </div>

                <div className="history-controls">
                    <button onClick={handleUndo} disabled={historyIndex <= 0 || isAnimating}>
                        Undo
                    </button>
                    <button onClick={handleRedo} disabled={historyIndex >= history.length - 1 || isAnimating}>
                        Redo
                    </button>
                </div>

                <div className="toggle-controls">
                    <label>
                        <input
                            type="checkbox"
                            checked={useD3Layout}
                            onChange={() => setUseD3Layout(!useD3Layout)}
                            disabled={isAnimating}
                        />
                        Use D3 Layout
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={useGsapAnimations}
                            onChange={() => setUseGsapAnimations(!useGsapAnimations)}
                            disabled={isAnimating}
                        />
                        Use GSAP Animations
                    </label>
                </div>
            </div>

            <div className="description">{description}</div>

            <div ref={canvasContainerRef} className="canvas-container">
                <Sketch
                    setup={setupSketch}
                    draw={drawSketch}
                    mousePressed={mousePressed}
                    mouseReleased={mouseReleased}
                    mouseDragged={mouseDragged}
                />
                {useGsapAnimations && (
                    <svg ref={d3ContainerRef} className="d3-overlay" width="1000" height="500" />
                )}
            </div>

            <AnimatePresence>
                {showTutorial && (
                    <motion.div
                        className="tutorial"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                    >
                        <h3>Tutorial</h3>
                        <ul>
                            {['Select tree type', 'Enter node value', 'Click insert', 'Drag nodes', 'Use undo/redo'].map((item, i) => (
                                <motion.li
                                    key={item}
                                    variants={listItemVariants}
                                    initial="hidden"
                                    animate="visible"
                                    custom={i}
                                >
                                    {item}
                                </motion.li>
                            ))}
                        </ul>
                        <button onClick={() => setShowTutorial(false)}>Close</button>
                    </motion.div>
                )}
            </AnimatePresence>

            <button className="tutorial-toggle" onClick={() => setShowTutorial(!showTutorial)}>
                {showTutorial ? 'Hide' : 'Show'} Tutorial
            </button>
        </motion.div>
    );
};

export default EnhancedTreeVisualization;