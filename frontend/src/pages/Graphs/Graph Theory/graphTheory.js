const graph = [
    { id: 0, label: 'A', neighbors: [1, 2] },
    { id: 1, label: 'B', neighbors: [0, 3, 4] },
    { id: 2, label: 'C', neighbors: [0, 5] },
    { id: 3, label: 'D', neighbors: [1] },
    { id: 4, label: 'E', neighbors: [1] },
    { id: 5, label: 'F', neighbors: [2] },
];

const svg = document.getElementById('graph');
const explanationBox = document.querySelector('.explanation-box p');
let visited = [];
let graphElements = [];

function createGraph() {
    // Clear any existing elements
    svg.innerHTML = '';
    graphElements = [];

    // Create new graph elements
    graph.forEach((node, index) => {
        const nodeElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        nodeElement.setAttribute('cx', 100 + 100 * index);
        nodeElement.setAttribute('cy', 100);
        nodeElement.setAttribute('r', 20);
        nodeElement.setAttribute('fill', 'white');
        nodeElement.setAttribute('stroke', 'black');
        nodeElement.setAttribute('data-id', node.id);
        nodeElement.setAttribute('data-label', node.label);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', 100 + 100 * index - 7);
        text.setAttribute('y', 105);
        text.setAttribute('fill', 'black');
        text.textContent = node.label;

        svg.appendChild(nodeElement);
        svg.appendChild(text);

        graphElements.push(nodeElement);

        // Draw edges
        node.neighbors.forEach(neighbor => {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', 100 + 100 * index);
            line.setAttribute('y1', 100);
            line.setAttribute('x2', 100 + 100 * neighbor);
            line.setAttribute('y2', 100);
            line.setAttribute('stroke', 'black');
            svg.appendChild(line);
        });
    });
}

function dfs(nodeId) {
    const node = graph.find(n => n.id === nodeId);
    if (visited.includes(nodeId)) return;
    visited.push(nodeId);

    // Highlight the current node
    gsap.to(`circle[data-id="${nodeId}"]`, { fill: '#ffeb3b', duration: 0.5 });

    // Update the explanation box
    explanationBox.textContent = `Visiting node ${node.label}...`;

    node.neighbors.forEach((neighbor) => {
        if (!visited.includes(neighbor)) {
            gsap.to(`line[x1="${100 + 100 * nodeId}"][y1="100"][x2="${100 + 100 * neighbor}"][y2="100"]`, {
                stroke: '#ff5722', duration: 0.5, onComplete: () => dfs(neighbor)
            });
        }
    });
}

function startDFS() {
    visited = [];
    explanationBox.textContent = "Starting DFS traversal...";
    createGraph();
    setTimeout(() => {
        dfs(0); // Start DFS from node 'A'
    }, 1000);
}

function resetGraph() {
    // Reset visited nodes and any animations
    visited = [];
    explanationBox.textContent = "Graph has been reset. Click 'Start DFS' to begin.";

    // Reset the node colors
    graphElements.forEach(node => {
        gsap.to(node, { fill: 'white', duration: 0.5 });
    });

    // Clear all edges' colors
    const edges = svg.querySelectorAll('line');
    edges.forEach(edge => {
        gsap.to(edge, { stroke: 'black', duration: 0.5 });
    });
}
