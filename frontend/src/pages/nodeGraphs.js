import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './nodeGraphs.css'; // Reusing the base CSS

const saveProgressToFirestore = async (inputString) => {
    const user = auth.currentUser;
    if (!user) return;

    const topicId = 'node-graphs';
    const docRef = doc(db, 'users', user.uid);
    await setDoc(docRef, {
        lastTopicVisited: topicId,
        [`topics.${topicId}`]: {
            input: inputString,
            timestamp: new Date().toISOString()
        }
    }, { merge: true });
};

const GraphTheory = () => {
    // State for graph data
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [nodeIdCounter, setNodeIdCounter] = useState(1);

    // State for graph creation
    const [nodeName, setNodeName] = useState('');
    const [sourceNode, setSourceNode] = useState('');
    const [targetNode, setTargetNode] = useState('');
    const [edgeWeight, setEdgeWeight] = useState(1);
    const [isDirected, setIsDirected] = useState(true);

    // State for algorithm visualization
    const [algorithm, setAlgorithm] = useState('dfs');
    const [startNode, setStartNode] = useState('');
    const [endNode, setEndNode] = useState('');
    const [currentStep, setCurrentStep] = useState(0);
    const [algorithmSteps, setAlgorithmSteps] = useState([]);
    const [visitedNodes, setVisitedNodes] = useState([]);
    const [currentPath, setCurrentPath] = useState([]);
    const [distances, setDistances] = useState({});
    const [runningAnimation, setRunningAnimation] = useState(false);

    // Other UI state
    const [showCode, setShowCode] = useState(false);
    const [selectedExample, setSelectedExample] = useState(0);
    const [userQuestion, setUserQuestion] = useState('');
    const [questions, setQuestions] = useState([]);

    // Animation ref
    const animationRef = useRef(null);
    const canvasRef = useRef(null);

    // Canvas dimensions
    const canvasWidth = 600;
    const canvasHeight = 400;

    // Example code for algorithms
    const codeExamples = [
        {
            name: "DFS",
            code: `function dfs(graph, startNode, visited = new Set()) {
  // Mark the current node as visited
  visited.add(startNode);
  console.log("Visiting node:", startNode);
  
  // Get all adjacent vertices of the node
  const neighbors = graph[startNode] || [];
  
  // Recursively visit all unvisited neighbors
  for (const neighbor of neighbors) {
    if (!visited.has(neighbor)) {
      dfs(graph, neighbor, visited);
    }
  }
  
  return visited;
}`
        },
        {
            name: "BFS",
            code: `function bfs(graph, startNode) {
  // Create a queue for BFS
  const queue = [startNode];
  // Keep track of visited nodes
  const visited = new Set([startNode]);
  
  // Process nodes level by level
  while (queue.length > 0) {
    // Dequeue a vertex from queue
    const currentNode = queue.shift();
    console.log("Visiting node:", currentNode);
    
    // Get all adjacent vertices of the dequeued vertex
    const neighbors = graph[currentNode] || [];
    
    // For each neighbor, if not visited, mark as visited
    // and enqueue it
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  
  return visited;
}`
        },
        {
            name: "Topological Sort",
            code: `function topologicalSort(graph) {
  const visited = new Set();
  const stack = [];
  
  // Helper function for DFS
  function dfsTopological(node) {
    // Mark the current node as visited
    visited.add(node);
    
    // Recursively visit all unvisited neighbors
    const neighbors = graph[node] || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        dfsTopological(neighbor);
      }
    }
    
    // After all neighbors are visited, push to stack
    stack.unshift(node); // Add to front of stack
  }
  
  // Call DFS for all unvisited nodes
  for (const node in graph) {
    if (!visited.has(node)) {
      dfsTopological(node);
    }
  }
  
  return stack;
}`
        },
        {
            name: "Dijkstra",
            code: `function dijkstra(graph, startNode) {
  // Initialize distances with infinity for all nodes except start
  const distances = {};
  const previous = {};
  const unvisited = new Set();
  
  // Setup initial distances and unvisited set
  for (const node in graph) {
    distances[node] = Infinity;
    previous[node] = null;
    unvisited.add(node);
  }
  distances[startNode] = 0;
  
  // Process nodes until all are visited or
  // remaining nodes are unreachable
  while (unvisited.size > 0) {
    // Find unvisited node with minimum distance
    let current = null;
    let minDistance = Infinity;
    for (const node of unvisited) {
      if (distances[node] < minDistance) {
        minDistance = distances[node];
        current = node;
      }
    }
    
    // If we can't find a node or if minimum
    // distance is infinity, we're done
    if (current === null || distances[current] === Infinity) {
      break;
    }
    
    // Remove current node from unvisited set
    unvisited.delete(current);
    
    // For each neighbor of current node
    for (const [neighbor, weight] of graph[current]) {
      // Calculate tentative distance
      const distance = distances[current] + weight;
      
      // If we found a better path to neighbor
      if (distance < distances[neighbor]) {
        // Update distance and previous node
        distances[neighbor] = distance;
        previous[neighbor] = current;
      }
    }
  }
  
  return { distances, previous };
}`
        },
        {
            name: "Bellman-Ford",
            code: `function bellmanFord(graph, startNode) {
  // Initialize distances with infinity for all nodes except start
  const distances = {};
  const previous = {};
  const nodes = Object.keys(graph);
  
  // Setup initial distances
  for (const node of nodes) {
    distances[node] = Infinity;
    previous[node] = null;
  }
  distances[startNode] = 0;
  
  // Relax edges |V| - 1 times
  for (let i = 0; i < nodes.length - 1; i++) {
    for (const node of nodes) {
      for (const [neighbor, weight] of graph[node]) {
        // If we can improve the path
        if (distances[node] !== Infinity && 
            distances[node] + weight < distances[neighbor]) {
          distances[neighbor] = distances[node] + weight;
          previous[neighbor] = node;
        }
      }
    }
  }
  
  // Check for negative weight cycles
  for (const node of nodes) {
    for (const [neighbor, weight] of graph[node]) {
      if (distances[node] !== Infinity && 
          distances[node] + weight < distances[neighbor]) {
        console.log("Graph contains negative weight cycle");
        return null; // Negative cycle exists
      }
    }
  }
  
  return { distances, previous };
}`
        },
        {
            name: "Floyd-Warshall",
            code: `function floydWarshall(graph) {
  const nodes = Object.keys(graph);
  const n = nodes.length;
  
  // Create initial distance matrix
  const dist = Array(n).fill().map(() => Array(n).fill(Infinity));
  
  // Map node names to matrix indices
  const nodeIndices = {};
  nodes.forEach((node, index) => {
    nodeIndices[node] = index;
  });
  
  // Initialize distances with direct edges
  for (const node of nodes) {
    const i = nodeIndices[node];
    dist[i][i] = 0; // Distance to self is 0
    
    for (const [neighbor, weight] of graph[node]) {
      const j = nodeIndices[neighbor];
      dist[i][j] = weight;
    }
  }
  
  // Compute shortest paths
  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (dist[i][k] !== Infinity && dist[k][j] !== Infinity &&
            dist[i][k] + dist[k][j] < dist[i][j]) {
          dist[i][j] = dist[i][k] + dist[k][j];
        }
      }
    }
  }
  
  // Convert matrix back to node-based result
  const result = {};
  for (const node1 of nodes) {
    result[node1] = {};
    for (const node2 of nodes) {
      const i = nodeIndices[node1];
      const j = nodeIndices[node2];
      result[node1][node2] = dist[i][j];
    }
  }
  
  return result;
}`
        }
    ];

    // Example graphs
    const exampleGraphs = [
        {
            name: "Simple Directed",
            nodes: [
                { id: 1, label: 'A', x: 100, y: 100 },
                { id: 2, label: 'B', x: 200, y: 100 },
                { id: 3, label: 'C', x: 300, y: 100 },
                { id: 4, label: 'D', x: 200, y: 200 }
            ],
            edges: [
                { source: 1, target: 2, weight: 1 },
                { source: 2, target: 3, weight: 1 },
                { source: 3, target: 4, weight: 1 },
                { source: 4, target: 1, weight: 1 }
            ],
            isDirected: true
        },
        {
            name: "Weighted Graph",
            nodes: [
                { id: 1, label: 'A', x: 100, y: 100 },
                { id: 2, label: 'B', x: 300, y: 100 },
                { id: 3, label: 'C', x: 100, y: 300 },
                { id: 4, label: 'D', x: 300, y: 300 },
                { id: 5, label: 'E', x: 200, y: 200 }
            ],
            edges: [
                { source: 1, target: 2, weight: 4 },
                { source: 1, target: 3, weight: 2 },
                { source: 2, target: 5, weight: 3 },
                { source: 3, target: 4, weight: 5 },
                { source: 3, target: 5, weight: 1 },
                { source: 4, target: 2, weight: 6 },
                { source: 5, target: 4, weight: 2 }
            ],
            isDirected: true
        },
        {
            name: "DAG (for Topological Sort)",
            nodes: [
                { id: 1, label: 'A', x: 100, y: 100 },
                { id: 2, label: 'B', x: 200, y: 50 },
                { id: 3, label: 'C', x: 200, y: 150 },
                { id: 4, label: 'D', x: 300, y: 100 },
                { id: 5, label: 'E', x: 400, y: 100 }
            ],
            edges: [
                { source: 1, target: 2, weight: 1 },
                { source: 1, target: 3, weight: 1 },
                { source: 2, target: 4, weight: 1 },
                { source: 3, target: 4, weight: 1 },
                { source: 4, target: 5, weight: 1 }
            ],
            isDirected: true
        }
    ];

    // Load example graph
    const loadExampleGraph = (index) => {
        const example = exampleGraphs[index];
        setNodes(example.nodes);
        setEdges(example.edges);
        setIsDirected(example.isDirected);
        setNodeIdCounter(Math.max(...example.nodes.map(n => n.id)) + 1);
        // Reset algorithm state
        setAlgorithmSteps([]);
        setVisitedNodes([]);
        setCurrentPath([]);
        setDistances({});
        setCurrentStep(0);
        setStartNode('');
        setEndNode('');
    };

    // Initialize with first example
    useEffect(() => {
        loadExampleGraph(0);
    }, []);

    // Draw graph on canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw edges
        edges.forEach(edge => {
            const source = nodes.find(n => n.id === edge.source);
            const target = nodes.find(n => n.id === edge.target);
            if (!source || !target) return;

            const isVisitedEdge =
                currentPath.some(path =>
                    path.source === source.id && path.target === target.id);

            ctx.beginPath();
            ctx.moveTo(source.x, source.y);
            ctx.lineTo(target.x, target.y);

            if (isVisitedEdge) {
                ctx.strokeStyle = '#00ff00'; // Highlight visited path
                ctx.lineWidth = 3;
            } else {
                ctx.strokeStyle = '#aaaaaa';
                ctx.lineWidth = 2;
            }

            ctx.stroke();

            // Draw arrow for directed graph
            if (isDirected) {
                const angle = Math.atan2(target.y - source.y, target.x - source.x);
                const arrowSize = 10;

                const arrowX = target.x - 15 * Math.cos(angle);
                const arrowY = target.y - 15 * Math.sin(angle);

                ctx.beginPath();
                ctx.moveTo(arrowX, arrowY);
                ctx.lineTo(
                    arrowX - arrowSize * Math.cos(angle - Math.PI/6),
                    arrowY - arrowSize * Math.sin(angle - Math.PI/6)
                );
                ctx.lineTo(
                    arrowX - arrowSize * Math.cos(angle + Math.PI/6),
                    arrowY - arrowSize * Math.sin(angle + Math.PI/6)
                );
                ctx.closePath();
                ctx.fillStyle = isVisitedEdge ? '#00ff00' : '#aaaaaa';
                ctx.fill();
            }

            // Draw weight
            const weightX = (source.x + target.x) / 2 + 10;
            const weightY = (source.y + target.y) / 2 + 10;
            ctx.font = '14px monospace';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(edge.weight, weightX, weightY);
        });

        // Draw nodes
        nodes.forEach(node => {
            ctx.beginPath();
            ctx.arc(node.x, node.y, 20, 0, Math.PI * 2);

            if (visitedNodes.includes(node.id)) {
                ctx.fillStyle = '#00aa00'; // Visited node
            } else if (node.id === parseInt(startNode)) {
                ctx.fillStyle = '#0000ff'; // Start node
            } else if (node.id === parseInt(endNode)) {
                ctx.fillStyle = '#ff0000'; // End node
            } else {
                ctx.fillStyle = '#444444'; // Normal node
            }

            ctx.fill();

            // Draw node label
            ctx.font = '16px monospace';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(node.label, node.x, node.y);

            // Draw distance for shortest path algorithms
            if (distances[node.id] !== undefined &&
                (algorithm === 'dijkstra' ||
                    algorithm === 'bellmanFord' ||
                    algorithm === 'floydWarshall')) {
                ctx.font = '12px monospace';
                ctx.fillStyle = '#ffff00';
                ctx.fillText(
                    distances[node.id] === Infinity ? '∞' : distances[node.id],
                    node.x, node.y + 30
                );
            }
        });
    }, [nodes, edges, visitedNodes, currentPath, distances, startNode, endNode, isDirected]);

    // Function to add a new node
    const handleAddNode = () => {
        if (!nodeName.trim()) return;

        // Find a reasonable position for the new node
        const x = Math.random() * (canvasWidth - 100) + 50;
        const y = Math.random() * (canvasHeight - 100) + 50;

        const newNode = {
            id: nodeIdCounter,
            label: nodeName,
            x, y
        };

        setNodes([...nodes, newNode]);
        setNodeIdCounter(nodeIdCounter + 1);
        setNodeName('');
    };

    // Function to add a new edge
    const handleAddEdge = () => {
        if (!sourceNode || !targetNode) return;

        const source = parseInt(sourceNode);
        const target = parseInt(targetNode);
        const weight = parseInt(edgeWeight) || 1;

        // Check if edge already exists
        const edgeExists = edges.some(e =>
            e.source === source && e.target === target);

        if (edgeExists) return;

        const newEdge = { source, target, weight };
        setEdges([...edges, newEdge]);

        // If undirected, add reverse edge as well
        if (!isDirected) {
            const reverseEdge = { source: target, target: source, weight };
            setEdges([...edges, newEdge, reverseEdge]);
        }

        setSourceNode('');
        setTargetNode('');
        setEdgeWeight(1);
    };

    // Function to clear the graph
    const handleClearGraph = () => {
        setNodes([]);
        setEdges([]);
        setNodeIdCounter(1);
        setAlgorithmSteps([]);
        setVisitedNodes([]);
        setCurrentPath([]);
        setDistances({});
        setCurrentStep(0);
    };

    // Convert graph to adjacency list format for algorithms
    const getAdjacencyList = () => {
        const adjList = {};

        // Initialize empty lists for all nodes
        nodes.forEach(node => {
            adjList[node.id] = [];
        });

        // Add edges
        edges.forEach(edge => {
            adjList[edge.source].push([edge.target, edge.weight]);
        });

        return adjList;
    };

    // Algorithms implementation
    const runDFS = (start) => {
        const adjList = getAdjacencyList();
        const visited = new Set();
        const steps = [];
        const path = [];

        const dfs = (node, depth = 0) => {
            steps.push({
                message: `Visit node ${nodes.find(n => n.id === node)?.label} (ID: ${node})`,
                visited: [...visited],
                path: [...path],
                level: depth
            });

            visited.add(node);

            const neighbors = adjList[node] || [];
            for (const [neighbor, _] of neighbors) {
                if (!visited.has(neighbor)) {
                    path.push({ source: node, target: neighbor });
                    dfs(neighbor, depth + 1);
                }
            }
        };

        dfs(parseInt(start));
        return steps;
    };

    const runBFS = (start) => {
        const adjList = getAdjacencyList();
        const visited = new Set([parseInt(start)]);
        const queue = [parseInt(start)];
        const steps = [];
        const path = [];

        steps.push({
            message: `Start BFS from node ${nodes.find(n => n.id === parseInt(start))?.label} (ID: ${start})`,
            visited: [...visited],
            path: [...path],
            level: 0
        });

        while (queue.length > 0) {
            const current = queue.shift();

            const neighbors = adjList[current] || [];
            for (const [neighbor, _] of neighbors) {
                if (!visited.has(neighbor)) {
                    steps.push({
                        message: `Visit node ${nodes.find(n => n.id === neighbor)?.label} (ID: ${neighbor})`,
                        visited: [...visited, neighbor],
                        path: [...path, { source: current, target: neighbor }],
                        level: 1
                    });

                    visited.add(neighbor);
                    queue.push(neighbor);
                    path.push({ source: current, target: neighbor });
                }
            }
        }

        return steps;
    };

    const runTopologicalSort = () => {
        const adjList = getAdjacencyList();
        const visited = new Set();
        const result = [];
        const steps = [];
        const path = [];

        const dfs = (node, depth = 0) => {
            visited.add(node);

            steps.push({
                message: `Visit node ${nodes.find(n => n.id === node)?.label} (ID: ${node})`,
                visited: [...visited],
                path: [...path],
                level: depth
            });

            const neighbors = adjList[node] || [];
            for (const [neighbor, _] of neighbors) {
                if (!visited.has(neighbor)) {
                    path.push({ source: node, target: neighbor });
                    dfs(neighbor, depth + 1);
                }
            }

            result.unshift(node);
            steps.push({
                message: `Add node ${nodes.find(n => n.id === node)?.label} (ID: ${node}) to result`,
                visited: [...visited],
                path: [...path],
                result: [...result, node],
                level: depth
            });
        };

        // Run DFS on all unvisited nodes
        for (const node of nodes) {
            if (!visited.has(node.id)) {
                dfs(node.id);
            }
        }

        // Final step showing complete ordering
        steps.push({
            message: `Final topological ordering: ${result.map(id => nodes.find(n => n.id === id)?.label).join(' -> ')}`,
            visited: [...visited],
            path: [...path],
            result: result,
            level: 0
        });

        return steps;
    };

    const runDijkstra = (start, end) => {
        const adjList = getAdjacencyList();
        const distances = {};
        const previous = {};
        const unvisited = new Set();
        const steps = [];
        const path = [];

        // Initialize
        nodes.forEach(node => {
            distances[node.id] = Infinity;
            previous[node.id] = null;
            unvisited.add(node.id);
        });

        distances[parseInt(start)] = 0;

        steps.push({
            message: `Initialize Dijkstra's algorithm from node ${nodes.find(n => n.id === parseInt(start))?.label} (ID: ${start})`,
            distances: {...distances},
            visited: [],
            path: [],
            level: 0
        });

        // Main algorithm
        while (unvisited.size > 0) {
            // Find unvisited node with minimum distance
            let current = null;
            let minDistance = Infinity;

            for (const nodeId of unvisited) {
                if (distances[nodeId] < minDistance) {
                    minDistance = distances[nodeId];
                    current = nodeId;
                }
            }

            // If we can't find a node or if minimum distance is infinity, we're done
            if (current === null || distances[current] === Infinity) {
                break;
            }

            steps.push({
                message: `Process node ${nodes.find(n => n.id === current)?.label} (ID: ${current}) with distance ${distances[current]}`,
                distances: {...distances},
                visited: [...steps[steps.length-1]?.visited || [], current],
                path: [...path],
                level: 1
            });

            // If we've reached the end node, we're done
            if (current === parseInt(end)) {
                break;
            }

            // Remove current node from unvisited set
            unvisited.delete(current);

            // For each neighbor of current node
            for (const [neighbor, weight] of (adjList[current] || [])) {
                // Calculate tentative distance
                const distance = distances[current] + weight;

                // If we found a better path to neighbor
                if (distance < distances[neighbor]) {
                    // Update path
                    if (previous[neighbor]) {
                        // Remove previous path
                        const idx = path.findIndex(p =>
                            p.source === previous[neighbor] && p.target === neighbor);
                        if (idx !== -1) {
                            path.splice(idx, 1);
                        }
                    }

                    // Update distance, previous node, and path
                    distances[neighbor] = distance;
                    previous[neighbor] = current;
                    path.push({ source: current, target: neighbor });

                    steps.push({
                        message: `Update distance to node ${nodes.find(n => n.id === neighbor)?.label} (ID: ${neighbor}) to ${distance}`,
                        distances: {...distances},
                        visited: [...steps[steps.length-1]?.visited || []],
                        path: [...path],
                        level: 2
                    });
                }
            }
        }

        // Reconstruct the shortest path
        if (parseInt(end) && previous[parseInt(end)]) {
            let current = parseInt(end);
            const shortestPath = [];

            while (current !== parseInt(start)) {
                shortestPath.unshift(current);
                current = previous[current];
                if (!current) break;
            }

            shortestPath.unshift(parseInt(start));

            steps.push({
                message: `Shortest path from ${nodes.find(n => n.id === parseInt(start))?.label} to ${nodes.find(n => n.id === parseInt(end))?.label}: ${shortestPath.map(id => nodes.find(n => n.id === id)?.label).join(' -> ')} (Distance: ${distances[parseInt(end)]})`,
                distances: {...distances},
                visited: [...steps[steps.length-1]?.visited || []],
                path: [...path],
                shortestPath: shortestPath,
                level: 0
            });
        }

        return steps;
    };

    const runBellmanFord = (start) => {
        const adjList = getAdjacencyList();
        const distances = {};
        const previous = {};
        const steps = [];
        const path = [];

        // Initialize
        nodes.forEach(node => {
            distances[node.id] = Infinity;
            previous[node.id] = null;
        });

        distances[parseInt(start)] = 0;

        steps.push({
            message: `Initialize Bellman-Ford algorithm from node ${nodes.find(n => n.id === parseInt(start))?.label} (ID: ${start})`,
            distances: {...distances},
            visited: [],
            path: [],
            level: 0
        });

        // Relax edges |V| - 1 times
        for (let i = 0; i < nodes.length - 1; i++) {
            steps.push({
                message: `Iteration ${i + 1} of ${nodes.length - 1}`,
                distances: {...distances},
                visited: [...steps[steps.length-1]?.visited || []],
                path: [...path],
                level: 1
            });

            let hasChanges = false;

            for (const node of nodes) {
                for (const [neighbor, weight] of (adjList[node.id] || [])) {
                    // If we can improve the path
                    if (distances[node.id] !== Infinity &&
                        distances[node.id] + weight < distances[neighbor]) {

                        // Update path
                        if (previous[neighbor]) {
                            // Remove previous path
                            const idx = path.findIndex(p =>
                                p.source === previous[neighbor] && p.target === neighbor);
                            if (idx !== -1) {
                                path.splice(idx, 1);
                            }
                        }

                        // Update distance, previous node, and path
                        distances[neighbor] = distances[node.id] + weight;
                        previous[neighbor] = node.id;
                        path.push({ source: node.id, target: neighbor });
                        hasChanges = true;

                        steps.push({
                            message: `Update distance to node ${nodes.find(n => n.id === neighbor)?.label} (ID: ${neighbor}) to ${distances[neighbor]}`,
                            distances: {...distances},
                            visited: [...steps[steps.length-1]?.visited || [], neighbor],
                            path: [...path],
                            level: 2
                        });
                    }
                }
            }

            // If no changes in this iteration, we can stop early
            if (!hasChanges) {
                steps.push({
                    message: `No changes in iteration ${i + 1}, algorithm converged early`,
                    distances: {...distances},
                    visited: [...steps[steps.length-1]?.visited || []],
                    path: [...path],
                    level: 1
                });
                break;
            }
        }

        // Check for negative weight cycles
        let hasNegativeCycle = false;

        for (const node of nodes) {
            for (const [neighbor, weight] of (adjList[node.id] || [])) {
                if (distances[node.id] !== Infinity &&
                    distances[node.id] + weight < distances[neighbor]) {

                    hasNegativeCycle = true;
                    steps.push({
                        message: `Negative weight cycle detected involving node ${nodes.find(n => n.id === node.id)?.label} and ${nodes.find(n => n.id === neighbor)?.label}`,
                        distances: {...distances},
                        visited: [...steps[steps.length-1]?.visited || []],
                        path: [...path],
                        level: 0
                    });
                }
            }
        }

        if (!hasNegativeCycle) {
            steps.push({
                message: `Bellman-Ford algorithm completed successfully. No negative weight cycles detected.`,
                distances: {...distances},
                visited: [...steps[steps.length-1]?.visited || []],
                path: [...path],
                level: 0
            });
        }

        return steps;
    };

    const runFloydWarshall = () => {
        const steps = [];
        const nodeMap = {};
        const n = nodes.length;

        // Create distance matrix
        const dist = Array(n).fill().map(() => Array(n).fill(Infinity));

        // Map node ids to matrix indices
        nodes.forEach((node, index) => {
            nodeMap[node.id] = index;
            dist[index][index] = 0; // Distance to self is 0
        });

        // Initialize with direct edges
        edges.forEach(edge => {
            const i = nodeMap[edge.source];
            const j = nodeMap[edge.target];
            dist[i][j] = edge.weight;
        });

        steps.push({
            message: `Initialize Floyd-Warshall algorithm with direct edges`,
            dist: JSON.parse(JSON.stringify(dist)),
            nodeMap: {...nodeMap},
            level: 0
        });

        // Main algorithm
        for (let k = 0; k < n; k++) {
            const kNode = nodes.find(node => nodeMap[node.id] === k);

            steps.push({
                message: `Using node ${kNode?.label} (ID: ${kNode?.id}) as intermediate`,
                dist: JSON.parse(JSON.stringify(dist)),
                nodeMap: {...nodeMap},
                intermediate: k,
                level: 1
            });

            for (let i = 0; i < n; i++) {
                for (let j = 0; j < n; j++) {
                    if (dist[i][k] !== Infinity && dist[k][j] !== Infinity) {
                        if (dist[i][k] + dist[k][j] < dist[i][j]) {
                            dist[i][j] = dist[i][k] + dist[k][j];

                            const iNode = nodes.find(node => nodeMap[node.id] === i);
                            const jNode = nodes.find(node => nodeMap[node.id] === j);

                            steps.push({
                                message: `Update shortest path from ${iNode?.label} to ${jNode?.label} via ${kNode?.label} to ${dist[i][j]}`,
                                dist: JSON.parse(JSON.stringify(dist)),
                                nodeMap: {...nodeMap},
                                intermediate: k,
                                updated: {from: i, to: j},
                                level: 2
                            });
                        }
                    }
                }
            }
        }

        // Convert matrix to node distances for visualization
        const distances = {};
        nodes.forEach(node => {
            distances[node.id] = {};
            nodes.forEach(target => {
                const i = nodeMap[node.id];
                const j = nodeMap[target.id];
                distances[node.id][target.id] = dist[i][j];
            });
        });

        steps.push({
            message: `Floyd-Warshall algorithm completed. All-pairs shortest paths calculated.`,
            dist: JSON.parse(JSON.stringify(dist)),
            nodeMap: {...nodeMap},
            distances: distances,
            level: 0
        });

        return steps;
    };

    // Run the currently selected algorithm
    const runAlgorithm = () => {
        if (runningAnimation) {
            stopAnimation();
            return;
        }

        let steps = [];

        switch (algorithm) {
            case 'dfs':
                if (!startNode) {
                    alert('Please select a start node');
                    return;
                }
                steps = runDFS(startNode);
                break;

            case 'bfs':
                if (!startNode) {
                    alert('Please select a start node');
                    return;
                }
                steps = runBFS(startNode);
                break;

            case 'topological':
                steps = runTopologicalSort();
                break;

            case 'dijkstra':
                if (!startNode) {
                    alert('Please select a start node');
                    return;
                }
                steps = runDijkstra(startNode, endNode);
                break;

            case 'bellmanFord':
                if (!startNode) {
                    alert('Please select a start node');
                    return;
                }
                steps = runBellmanFord(startNode);
                break;

            case 'floydWarshall':
                steps = runFloydWarshall();
                break;

            default:
                break;
        }

        setAlgorithmSteps(steps);
        setCurrentStep(0);
        setRunningAnimation(true);
        runAnimation(steps);
    };

    // Animation functions
    const runAnimation = (steps) => {
        let currentIdx = 0;

        const animate = () => {
            if (currentIdx >= steps.length) {
                setRunningAnimation(false);
                return;
            }

            setCurrentStep(currentIdx);
            updateVisualization(steps[currentIdx]);

            currentIdx++;
            animationRef.current = setTimeout(animate, 1500);
        };

        animate();
    };

    const stopAnimation = () => {
        if (animationRef.current) {
            clearTimeout(animationRef.current);
        }
        setRunningAnimation(false);
    };

    const updateVisualization = (step) => {
        if (!step) return;

        if (step.visited) setVisitedNodes(step.visited);
        if (step.path) setCurrentPath(step.path);

        if (step.distances) {
            setDistances(step.distances);
        } else if (step.dist && step.nodeMap) {
            // For Floyd-Warshall
            const distObj = {};
            nodes.forEach(node => {
                distObj[node.id] = step.dist[step.nodeMap[node.id]][step.nodeMap[parseInt(startNode)]];
            });
            setDistances(distObj);
        }
    };

    // Step through the algorithm manually
    const goToNextStep = () => {
        if (currentStep < algorithmSteps.length - 1) {
            setCurrentStep(currentStep + 1);
            updateVisualization(algorithmSteps[currentStep + 1]);
        }
    };

    const goToPrevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
            updateVisualization(algorithmSteps[currentStep - 1]);
        }
    };

    const resetVisualization = () => {
        setCurrentStep(0);
        setVisitedNodes([]);
        setCurrentPath([]);
        setDistances({});
        setAlgorithmSteps([]);
        stopAnimation();
    };

    // For node dragging
    const [draggedNode, setDraggedNode] = useState(null);

    const handleCanvasMouseDown = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Check if clicked on a node
        for (const node of nodes) {
            const dx = node.x - x;
            const dy = node.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= 20) {
                setDraggedNode(node);
                break;
            }
        }
    };

    const handleCanvasMouseMove = (e) => {
        if (draggedNode) {
            const canvas = canvasRef.current;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Update node position
            setNodes(nodes.map(node =>
                node.id === draggedNode.id
                    ? {...node, x, y}
                    : node
            ));
        }
    };

    const handleCanvasMouseUp = () => {
        setDraggedNode(null);
    };

    // Handle question submission
    const handleQuestionSubmit = (e) => {
        e.preventDefault();
        if (userQuestion.trim() === '') return;

        setQuestions([...questions, userQuestion]);
        setUserQuestion('');
    };

    return (
        <div className="recursion-container">
            {/* Background elements */}
            <div className="pixel-background">
                <div className="pixel-overlay"></div>
            </div>

            {/* Main Content */}
            <div className="pixel-content">
                <div className="pixel-window recursion-window" style={{ maxWidth: '1200px' }}>
                    <div className="pixel-window-header">
                        <div className="pixel-dots">
                            <span className="pixel-dot red"></span>
                            <span className="pixel-dot yellow"></span>
                            <span className="pixel-dot green"></span>
                        </div>
                        <div className="pixel-title">GRAPH.EXE</div>
                        <div className="pixel-nav">
                            <Link to="/" className="nav-link">HOME</Link>
                        </div>
                    </div>

                    <div className="pixel-window-body">
                        <h1 className="pixel-heading">GRAPH THEORY & ALGORITHMS</h1>

                        <div className="terminal-card">
                            <div className="terminal-header">WHAT IS GRAPH THEORY?</div>
                            <div className="terminal-content">
                                <p>Graph theory is the study of graphs, which are mathematical structures used to model pairwise relations between objects.</p>
                                <p>A graph consists of:</p>
                                <ul>
                                    <li>Vertices (nodes): Points that represent objects</li>
                                    <li>Edges: Lines that connect vertices, representing relationships</li>
                                </ul>
                                <p>Graphs can be directed (edges have direction) or undirected, and weighted (edges have values) or unweighted.</p>
                                <p className="pixel-quote">"The power of graph theory lies in its ability to model complex relationships and solve problems through traversal and path-finding algorithms."</p>
                            </div>
                        </div>

                        <div className="graph-section" style={{ display: 'flex', flexDirection: 'row', gap: '20px', flexWrap: 'wrap' }}>
                            <div style={{ flex: '2 1 600px', minWidth: '500px' }}>
                                <div className="terminal-header">GRAPH VISUALIZATION</div>
                                <div className="visualization-content" style={{ backgroundColor: '#1a1a1a', padding: '10px', borderRadius: '4px' }}>
                                    <canvas
                                        ref={canvasRef}
                                        width={canvasWidth}
                                        height={canvasHeight}
                                        style={{ backgroundColor: '#222', borderRadius: '4px', cursor: draggedNode ? 'grabbing' : 'grab' }}
                                        onMouseDown={handleCanvasMouseDown}
                                        onMouseMove={handleCanvasMouseMove}
                                        onMouseUp={handleCanvasMouseUp}
                                        onMouseLeave={handleCanvasMouseUp}
                                    />

                                    <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                                        <div>
                                            <span className="pixel-label">Example Graphs:</span>
                                            <div className="example-buttons" style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px' }}>
                                                {exampleGraphs.map((graph, index) => (
                                                    <button
                                                        key={index}
                                                        className="pixel-button small-button"
                                                        onClick={() => loadExampleGraph(index)}
                                                    >
                                                        {graph.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <button
                                            className="pixel-button small-button"
                                            onClick={handleClearGraph}
                                        >
                                            CLEAR GRAPH
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="graph-editor-column" style={{ flex: '1 1 320px', minWidth: '320px' }}>
                                <div className="terminal-header">GRAPH EDITOR</div>
                                <div className="controls-panel" style={{ backgroundColor: '#1a1a1a', padding: '15px', borderRadius: '4px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                                        <div className="node-controls">
                                            <h3 className="pixel-subheading">Add Node</h3>
                                            <div className="input-group">
                                                <label>Label:</label>
                                                <input
                                                    type="text"
                                                    value={nodeName}
                                                    onChange={(e) => setNodeName(e.target.value)}
                                                    className="pixel-input"
                                                    placeholder="Node label"
                                                />
                                            </div>
                                            <button
                                                className="pixel-button"
                                                onClick={handleAddNode}
                                                style={{ width: '100%' }}
                                            >
                                                ADD NODE
                                            </button>
                                        </div>

                                        <div className="edge-controls">
                                            <h3 className="pixel-subheading">Add Edge</h3>
                                            <div className="input-group">
                                                <label>From:</label>
                                                <select
                                                    value={sourceNode}
                                                    onChange={(e) => setSourceNode(e.target.value)}
                                                    className="pixel-input"
                                                    style={{ height: '36px' }}
                                                >
                                                    <option value="">Select source</option>
                                                    {nodes.map(node => (
                                                        <option key={node.id} value={node.id}>
                                                            {node.label} (ID: {node.id})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="input-group">
                                                <label>To:</label>
                                                <select
                                                    value={targetNode}
                                                    onChange={(e) => setTargetNode(e.target.value)}
                                                    className="pixel-input"
                                                    style={{ height: '36px' }}
                                                >
                                                    <option value="">Select target</option>
                                                    {nodes.map(node => (
                                                        <option key={node.id} value={node.id}>
                                                            {node.label} (ID: {node.id})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="input-group">
                                                <label>Weight:</label>
                                                <input
                                                    type="number"
                                                    value={edgeWeight}
                                                    onChange={(e) => setEdgeWeight(e.target.value)}
                                                    className="pixel-input"
                                                    min="1"
                                                    style={{ height: '36px' }}
                                                />
                                            </div>
                                            <div className="input-group checkbox" style={{ marginBottom: '15px' }}>
                                                <label style={{ display: 'flex', alignItems: 'center' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={isDirected}
                                                        onChange={(e) => setIsDirected(e.target.checked)}
                                                        style={{ marginRight: '8px' }}
                                                    />
                                                    Directed Graph
                                                </label>
                                            </div>
                                            <button
                                                className="pixel-button"
                                                onClick={handleAddEdge}
                                                style={{ width: '100%' }}
                                            >
                                                ADD EDGE
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="algorithms-section" style={{ marginTop: '20px' }}>
                            <div className="terminal-header">
                                <div className="header-content">
                                    <span>ALGORITHMS</span>
                                </div>
                            </div>

                            <div className="algorithms-content" style={{ backgroundColor: '#1a1a1a', padding: '15px', borderRadius: '4px' }}>
                                <div className="algorithm-controls" style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
                                    <div className="algorithm-selector" style={{ flex: '2 1 300px', minWidth: '250px' }}>
                                        <label>Algorithm:</label>
                                        <select
                                            value={algorithm}
                                            onChange={(e) => {
                                                setAlgorithm(e.target.value);
                                                resetVisualization();
                                            }}
                                            className="pixel-input"
                                            style={{ height: '36px' }}
                                        >
                                            <option value="dfs">Depth-First Search (DFS)</option>
                                            <option value="bfs">Breadth-First Search (BFS)</option>
                                            <option value="topological">Topological Sort</option>
                                            <option value="dijkstra">Dijkstra's Algorithm</option>
                                            <option value="bellmanFord">Bellman-Ford Algorithm</option>
                                            <option value="floydWarshall">Floyd-Warshall Algorithm</option>
                                        </select>
                                    </div>

                                    {(algorithm === 'dfs' || algorithm === 'bfs' ||
                                        algorithm === 'dijkstra' || algorithm === 'bellmanFord') && (
                                        <div className="node-selector" style={{ flex: '1 1 200px', minWidth: '200px' }}>
                                            <label>Start Node:</label>
                                            <select
                                                value={startNode}
                                                onChange={(e) => setStartNode(e.target.value)}
                                                className="pixel-input"
                                                style={{ height: '36px' }}
                                            >
                                                <option value="">Select start</option>
                                                {nodes.map(node => (
                                                    <option key={node.id} value={node.id}>
                                                        {node.label} (ID: {node.id})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {algorithm === 'dijkstra' && (
                                        <div className="node-selector" style={{ flex: '1 1 200px', minWidth: '200px' }}>
                                            <label>End Node:</label>
                                            <select
                                                value={endNode}
                                                onChange={(e) => setEndNode(e.target.value)}
                                                className="pixel-input"
                                                style={{ height: '36px' }}
                                            >
                                                <option value="">Optional end</option>
                                                {nodes.map(node => (
                                                    <option key={node.id} value={node.id}>
                                                        {node.label} (ID: {node.id})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>

                                <div className="algorithm-buttons" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
                                    <button
                                        className="pixel-button"
                                        onClick={runAlgorithm}
                                        style={{ minWidth: '140px', height: '36px' }}
                                    >
                                        {runningAnimation ? 'STOP' : 'RUN ALGORITHM'}
                                    </button>

                                    {algorithmSteps.length > 0 && !runningAnimation && (
                                        <>
                                            <button
                                                className="pixel-button"
                                                onClick={goToPrevStep}
                                                disabled={currentStep === 0}
                                                style={{ minWidth: '120px', height: '36px' }}
                                            >
                                                PREV STEP
                                            </button>
                                            <button
                                                className="pixel-button"
                                                onClick={goToNextStep}
                                                disabled={currentStep === algorithmSteps.length - 1}
                                                style={{ minWidth: '120px', height: '36px' }}
                                            >
                                                NEXT STEP
                                            </button>
                                            <button
                                                className="pixel-button"
                                                onClick={resetVisualization}
                                                style={{ minWidth: '100px', height: '36px' }}
                                            >
                                                RESET
                                            </button>
                                        </>
                                    )}
                                </div>

                                <div className="algorithm-steps" style={{ maxHeight: '200px', overflowY: 'auto', backgroundColor: '#111', padding: '10px', borderRadius: '4px' }}>
                                    {algorithmSteps.length > 0 ? (
                                        <div className="step-details">
                                            <div className="step-counter">
                                                Step {currentStep + 1} of {algorithmSteps.length}
                                            </div>
                                            <div className="step-message" style={{ marginLeft: `${algorithmSteps[currentStep]?.level * 20}px` }}>
                                                {algorithmSteps[currentStep]?.message || ''}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="no-steps">
                                            Choose an algorithm and click "Run Algorithm" to begin visualization.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="code-section" style={{ marginTop: '20px' }}>
                            <div className="terminal-header">
                                <div className="header-content">
                                    <span>CODE EXAMPLES</span>
                                    <button
                                        className="pixel-button small-button"
                                        onClick={() => setShowCode(!showCode)}
                                    >
                                        {showCode ? 'HIDE CODE' : 'SHOW CODE'}
                                    </button>
                                </div>
                            </div>

                            {showCode && (
                                <div className="code-content" style={{ backgroundColor: '#1a1a1a' }}>
                                    <div className="code-tabs" style={{ display: 'flex', overflow: 'auto' }}>
                                        {codeExamples.map((example, index) => (
                                            <button
                                                key={index}
                                                className={`code-tab ${selectedExample === index ? 'active' : ''}`}
                                                onClick={() => setSelectedExample(index)}
                                                style={{
                                                    padding: '5px 10px',
                                                    backgroundColor: selectedExample === index ? '#444' : '#222',
                                                    border: 'none',
                                                    color: '#fff',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {example.name}
                                            </button>
                                        ))}
                                    </div>
                                    <pre className="code-display" style={{
                                        backgroundColor: '#111',
                                        padding: '10px',
                                        overflow: 'auto',
                                        maxHeight: '300px',
                                        fontSize: '14px',
                                        lineHeight: '1.5',
                                        color: '#e0e0e0'
                                    }}>
                                        {codeExamples[selectedExample].code}
                                    </pre>
                                </div>
                            )}
                        </div>

                        {/* Questions/Comments Section */}
                        <div className="terminal-card" style={{ marginTop: '20px' }}>
                            <div className="terminal-header">QUESTIONS & COMMENTS</div>
                            <div className="terminal-content">
                                <form onSubmit={handleQuestionSubmit}>
                                    <div className="question-input-container" style={{ display: 'flex', gap: '10px' }}>
                                        <input
                                            type="text"
                                            value={userQuestion}
                                            onChange={(e) => setUserQuestion(e.target.value)}
                                            className="pixel-input"
                                            style={{ flex: 1 }}
                                            placeholder="Ask a question about graph theory..."
                                        />
                                        <button type="submit" className="pixel-button small-button">SUBMIT</button>
                                    </div>
                                </form>
                                <div className="questions-list" style={{ marginTop: '10px', maxHeight: '150px', overflowY: 'auto' }}>
                                    {questions.length > 0 ? (
                                        <ul style={{ paddingLeft: '20px' }}>
                                            {questions.map((q, i) => (
                                                <li key={i} className="question-item" style={{ marginBottom: '5px' }}>{q}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="no-questions">No questions yet. Feel free to ask!</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="terminal-card" style={{ marginTop: '20px' }}>
                            <div className="terminal-header">ALGORITHM APPLICATIONS</div>
                            <div className="terminal-content">
                                <ul>
                                    <li><strong>DFS:</strong> Maze generation, topological sorting, detecting cycles</li>
                                    <li><strong>BFS:</strong> Shortest path in unweighted graphs, finding connected components</li>
                                    <li><strong>Topological Sort:</strong> Task scheduling, dependency resolution</li>
                                    <li><strong>Dijkstra:</strong> GPS navigation, network routing protocols</li>
                                    <li><strong>Bellman-Ford:</strong> Distributed routing protocols, handling negative weights</li>
                                    <li><strong>Floyd-Warshall:</strong> All-pairs shortest paths, detecting negative cycles</li>
                                </ul>
                                <p className="caution-text">NOTE: Drag nodes to rearrange the graph visualization!</p>
                            </div>
                        </div>
                    </div>

                    <div className="pixel-window-footer">
                        <div className="pixel-status">RUNNING GRAPH THEORY MODULE</div>
                        <div className="pixel-memory">STACK SPACE: 640K</div>
                    </div>
                </div>

                <div className="pixel-decorations">
                    <div className="recursive-pixels">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className={`recursive-pixel p${i+1}`}></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GraphTheory;