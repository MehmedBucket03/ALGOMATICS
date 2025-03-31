const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");
const explanationDiv = document.getElementById("explanation"); // Explanation area

const nodes = [
    { id: 0, x: 100, y: 100 },
    { id: 1, x: 200, y: 200 },
    { id: 2, x: 300, y: 100 },
    { id: 3, x: 400, y: 200 },
    { id: 4, x: 500, y: 100 }
];

const edges = [
    { from: 0, to: 1, weight: 4 },
    { from: 0, to: 2, weight: 1 },
    { from: 1, to: 3, weight: 2 },
    { from: 2, to: 3, weight: 5 },
    { from: 3, to: 4, weight: 3 }
];

function drawGraph() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    edges.forEach(edge => {
        let fromNode = nodes[edge.from];
        let toNode = nodes[edge.to];
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.stroke();

        let midX = (fromNode.x + toNode.x) / 2;
        let midY = (fromNode.y + toNode.y) / 2;
        ctx.fillText(edge.weight, midX, midY);
    });

    nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 20, 0, Math.PI * 2);
        ctx.fillStyle = "lightblue";
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "black";
        ctx.fillText(node.id, node.x - 5, node.y + 5);
    });

    explanationDiv.innerHTML = "Graph initialized. Click a button to start an algorithm.";
}

function updateExplanation(text) {
    explanationDiv.innerHTML += "<br>" + text;
}

function animateNode(nodeId, color, text) {
    setTimeout(() => {
        let node = nodes[nodeId];
        ctx.beginPath();
        ctx.arc(node.x, node.y, 20, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.stroke();

        if (text) {
            updateExplanation(text);
        }
    }, nodeId * 500);
}

// Dijkstra’s Algorithm Visualization
function runDijkstra() {
    toggleExplanation("dijkstra");
    updateExplanation("Starting Dijkstra's Algorithm...");

    let distances = {};
    let priorityQueue = [];
    let visited = new Set();
    let previous = {}; // Track paths
    let highlightedNode = null; // Track currently highlighted node

    // Initialize distances
    nodes.forEach(node => distances[node.id] = Infinity);
    distances[0] = 0;
    priorityQueue.push({ node: 0, cost: 0 });

    function processQueue() {
        if (priorityQueue.length === 0) {
            return setTimeout(() => highlightFinalPath(), 1000); // Highlight shortest path at the end
        }

        priorityQueue.sort((a, b) => a.cost - b.cost); // Mimic a min-heap
        let { node, cost } = priorityQueue.shift();

        if (visited.has(node)) return processQueue();
        visited.add(node);

        // Remove highlight from the previously selected node
        if (highlightedNode !== null) {
            animateNode(highlightedNode, "lightblue", ""); // Reset color
        }

        // Highlight the current node
        highlightedNode = node;
        animateNode(node, "yellow", `Visiting node ${node}, cost: ${cost}`);
        updateExplanation(`Node ${node} is selected because it has the lowest known cost (${cost}).`);

        setTimeout(() => {
            edges.forEach(edge => {
                if (edge.from === node && !visited.has(edge.to)) {
                    let newCost = distances[node] + edge.weight;

                    if (newCost < distances[edge.to]) {
                        distances[edge.to] = newCost;
                        previous[edge.to] = node; // Track the path
                        priorityQueue.push({ node: edge.to, cost: newCost });

                        // Explain the update
                        updateExplanation(`Exploring edge (${edge.from} → ${edge.to}) with weight ${edge.weight}.`);
                        updateExplanation(`A shorter path to node ${edge.to} is found! Updating cost to ${newCost}.`);
                    }
                }
            });
            processQueue(); // Continue processing
        }, 1000);
    }

    function highlightFinalPath() {
        updateExplanation("Final shortest path tree determined. Highlighting paths...");
        Object.keys(previous).forEach((nodeId, index) => {
            setTimeout(() => {
                let from = previous[nodeId];
                let to = parseInt(nodeId);

                animateNode(to, "green", `Node ${to} is reached via node ${from}.`);
                highlightEdge(from, to);
            }, index * 700);
        });
    }

    function highlightEdge(from, to) {
        ctx.beginPath();
        ctx.moveTo(nodes[from].x, nodes[from].y);
        ctx.lineTo(nodes[to].x, nodes[to].y);
        ctx.strokeStyle = "green";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.strokeStyle = "black"; // Reset stroke
        ctx.lineWidth = 1;
    }

    processQueue();
}




function runBellmanFord() {
    toggleExplanation("bellmanFord");
    updateExplanation("The Bellman-Ford Algorithm finds the shortest paths from a single source node to all other nodes, even with negative weights. It repeatedly relaxes edges to improve path estimates.");

    let V = nodes.length;
    let dist = new Array(V).fill(Infinity);
    let previous = {}; // Track the shortest path
    dist[0] = 0;

    console.log("Graph Nodes:", nodes);
    console.log("Graph Edges:", edges);

    setTimeout(() => {
        animateNode(0, "green", "Initializing distances at node 0");
        updateExplanation("Starting Bellman-Ford Algorithm...");
    }, 500);

    for (let i = 0; i < V - 1; i++) {
        setTimeout(() => updateExplanation(`Iteration ${i + 1}: Relaxing all edges`), i * 2000);

        edges.forEach((edge, index) => {
            setTimeout(() => {
                let { from: u, to: v, weight: wt } = edge;
                console.log(`Processing edge: (${u} → ${v}) with weight ${wt}`);

                if (dist[u] !== Infinity && dist[u] + wt < dist[v]) {
                    dist[v] = dist[u] + wt;
                    previous[v] = u; // Track the shortest path
                    animateNode(v, "yellow", `Updating distance of node ${v} to ${dist[v]}`);
                }
            }, i * 2000 + index * 500);
        });
    }

    // Check for negative weight cycle
    setTimeout(() => {
        let negativeCycle = false;
        edges.forEach(({ from: u, to: v, weight: wt }) => {
            if (dist[u] !== Infinity && dist[u] + wt < dist[v]) {
                negativeCycle = true;
            }
        });

        if (negativeCycle) {
            updateExplanation("Negative weight cycle detected! The shortest paths cannot be determined.");
        } else {
            updateExplanation("Algorithm completed. Final shortest path distances computed.");
            highlightShortestPaths(previous);
        }
    }, V * 2500);
}

// Function to highlight the final shortest path
function highlightShortestPaths(previous) {
    updateExplanation("Highlighting shortest paths...");
    Object.keys(previous).forEach((nodeId, index) => {
        setTimeout(() => {
            let from = previous[nodeId];
            let to = parseInt(nodeId);

            animateNode(to, "green", `Node ${to} is reached via node ${from}.`);
            highlightEdge(from, to);
        }, index * 700);
    });
}

// Function to highlight an edge in the graph
function highlightEdge(from, to) {
    ctx.beginPath();
    ctx.moveTo(nodes[from].x, nodes[from].y);
    ctx.lineTo(nodes[to].x, nodes[to].y);
    ctx.strokeStyle = "green";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.strokeStyle = "black"; // Reset stroke
    ctx.lineWidth = 1;
}

// Floyd-Warshall Algorithm Visualization
function runFloydWarshall() {
    toggleExplanation("floydWarshall");
    updateExplanation("Starting Floyd-Warshall Algorithm...");

    let V = nodes.length;
    let dist = Array.from({ length: V }, () => Array(V).fill(Infinity));
    let next = Array.from({ length: V }, () => Array(V).fill(null));

    // Initialize distance matrix using edge weights
    edges.forEach(({ from, to, weight }) => {
        dist[from][to] = weight;
        next[from][to] = to;
    });

    // Set diagonal to zero (distance from node to itself)
    for (let i = 0; i < V; i++) {
        dist[i][i] = 0;
    }

    // Floyd-Warshall Algorithm Iteration
    let delay = 500;
    for (let k = 0; k < V; k++) {
        setTimeout(() => {
            updateExplanation(`Considering node ${k} as an intermediate node...`);
            animateNode(k, "yellow", `Processing intermediate node ${k}`);
        }, k * delay);

        for (let i = 0; i < V; i++) {
            for (let j = 0; j < V; j++) {
                if (dist[i][k] !== Infinity && dist[k][j] !== Infinity) {
                    let newDist = dist[i][k] + dist[k][j];

                    if (newDist < dist[i][j]) {
                        dist[i][j] = newDist;
                        next[i][j] = next[i][k]; // Store path info

                        setTimeout(() => {
                            updateExplanation(`Updated shortest path: ${i} → ${j} via ${k}, new cost: ${newDist}`);
                            animateNode(i, "lightblue");
                            animateNode(j, "lightblue");
                            highlightEdge(i, j, "green");
                        }, k * delay + i * delay + j * 200);
                    }
                }
            }
        }
    }

    // Final visualization of the shortest path matrix
    setTimeout(() => {
        updateExplanation("Final shortest path matrix computed.");
        visualizeFinalPaths(dist);
    }, V * delay + 1000);
}

// Highlights the final shortest paths
function visualizeFinalPaths(dist) {
    for (let i = 0; i < dist.length; i++) {
        for (let j = 0; j < dist.length; j++) {
            if (dist[i][j] !== Infinity && i !== j) {
                highlightEdge(i, j, "blue");
                updateExplanation(`Shortest path from ${i} to ${j}: ${dist[i][j]}`);
            }
        }
    }
}

// Highlights a specific edge
function highlightEdge(from, to, color) {
    ctx.beginPath();
    ctx.moveTo(nodes[from].x, nodes[from].y);
    ctx.lineTo(nodes[to].x, nodes[to].y);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.strokeStyle = "black"; // Reset
    ctx.lineWidth = 1;
}


const explanations = {
    dijkstra: "Dijkstra's Algorithm finds the shortest path from a starting node to all other nodes in a weighted graph. It uses a priority queue to always expand the shortest known path first.",
    bellmanFord: "The Bellman-Ford Algorithm finds the shortest paths from a single source node to all other nodes, even with negative weights. It repeatedly relaxes edges to improve path estimates.",
    floydWarshall: "The Floyd-Warshall Algorithm finds the shortest paths between all pairs of nodes. It systematically updates the shortest known distances using a dynamic programming approach."
};

function toggleExplanation(algorithm) {
    const explanationPane = document.getElementById("explanation");
    if (explanationPane.style.display === "block" && explanationPane.getAttribute("data-algo") === algorithm) {
        explanationPane.style.opacity = "0";
        setTimeout(() => explanationPane.style.display = "none", 300);
    } else {
        explanationPane.innerHTML = `<p>${explanations[algorithm]}</p>`;
        explanationPane.style.display = "block";
        explanationPane.style.opacity = "1";
        explanationPane.setAttribute("data-algo", algorithm);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("runDijkstra").addEventListener("click", () => toggleExplanation("dijkstra"));
    document.getElementById("runBellmanFord").addEventListener("click", () => toggleExplanation("bellmanFord"));
    document.getElementById("runFloydWarshall").addEventListener("click", () => toggleExplanation("floydWarshall"));
});


function resetGraph() {
    drawGraph();
}

drawGraph();
