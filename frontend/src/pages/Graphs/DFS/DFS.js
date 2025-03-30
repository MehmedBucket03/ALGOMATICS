const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");

// Graph Data (Updated to match the given information)
let graph = {
    1: [2, 3],
    2: [4, 5],
    3: [6],
    4: [],
    5: [6],
    6: []
};

// Node Positions
let positions = {
    1: { x: 300, y: 50 },
    2: { x: 200, y: 150 },
    3: { x: 400, y: 150 },
    4: { x: 150, y: 250 },
    5: { x: 250, y: 250 },
    6: { x: 350, y: 250 }
};

// Variables for DFS traversal
let visited = new Set();
let stack = [];
let logSteps = [];
let speed = 500;  // Speed of traversal
let traversalOrder = 'preorder'; // Default DFS Traversal Order
let path = [];

// Draw the graph on the canvas
function drawGraph(activeNode = null) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw edges first
    for (let node in graph) {
        graph[node].forEach(neighbor => {
            ctx.beginPath();
            ctx.moveTo(positions[node].x, positions[node].y);
            ctx.lineTo(positions[neighbor].x, positions[neighbor].y);
            ctx.strokeStyle = visited.has(parseInt(neighbor)) ? "gray" : "black"; // Gray for backtracking
            ctx.lineWidth = 2;
            ctx.stroke();
        });
    }

    // Draw nodes with color change animation
    for (let node in positions) {
        ctx.beginPath();
        ctx.arc(positions[node].x, positions[node].y, 25, 0, 2 * Math.PI);

        if (activeNode == node) {
            ctx.fillStyle = "orange";  // Active node color
        } else if (visited.has(parseInt(node))) {
            ctx.fillStyle = "blue";  // Visited nodes
        } else {
            ctx.fillStyle = "white"; // Unvisited nodes
        }

        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "black";
        ctx.fillText(node, positions[node].x - 5, positions[node].y + 5);
    }
}


function drawArrow(from, to, color = "green") {
    ctx.beginPath();
    ctx.moveTo(positions[from].x, positions[from].y);
    ctx.lineTo(positions[to].x, positions[to].y);
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.stroke();

    // Draw arrowhead
    let angle = Math.atan2(
        positions[to].y - positions[from].y,
        positions[to].x - positions[from].x
    );
    ctx.lineTo(positions[to].x - 10 * Math.cos(angle - Math.PI / 6), positions[to].y - 10 * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(positions[to].x - 10 * Math.cos(angle + Math.PI / 6), positions[to].y - 10 * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
}

async function dfs(node) {
    if (visited.has(node)) return;

    stack.push(node);
    updateStack();
    logSteps.push(`Visiting Node ${node}`);
    updateLog();

    visited.add(node);
    drawGraph(node);
    await delay(speed);

    for (let neighbor of graph[node]) {
        if (!visited.has(neighbor)) {
            drawArrow(node, neighbor);
            await dfs(neighbor);
        }
    }

    // Backtrack (showing a faded arrow to indicate reversal)
    stack.pop();
    updateStack();
    logSteps.push(`Backtracking from Node ${node}`);
    updateLog();
    drawGraph();
}


// Delay function for controlling speed
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// DFS Traversal Algorithm
// DFS Traversal Algorithm with different orders
// async function dfs(node, parent = null) {
//     if (visited.has(node)) return;
//
//     // Handle Preorder
//     if (traversalOrder === 'preorder') {
//         stack.push(node);
//         updateStack();
//         logSteps.push(`Entering Node ${node}`);
//         updateLog();
//         visited.add(node);
//         drawGraph();
//         await delay(speed);
//     }
//
//     // Traverse Neighbors
//     for (let neighbor of graph[node]) {
//         logSteps.push(`Traversing edge (${node} → ${neighbor})`);
//         updateLog();
//         if (!visited.has(neighbor)) {
//             path.push(neighbor);  // Path Highlighting
//             await dfs(neighbor, node);
//             path.pop();  // Remove from path after backtracking
//         }
//     }
//
//     // Handle Postorder (After visiting all neighbors)
//     if (traversalOrder === 'postorder') {
//         stack.push(node);
//         updateStack();
//         logSteps.push(`Backtracking from Node ${node}`);
//         updateLog();
//         visited.add(node);
//         drawGraph();
//         await delay(speed);
//     }
//
//     // Handle Inorder (Visit the node after left and right subtrees)
//     if (traversalOrder === 'inorder' && parent !== null) {
//         // Logic for Inorder traversal, assuming binary tree for simplicity
//         if (graph[parent].indexOf(node) === 0) {
//             stack.push(node);
//             updateStack();
//             logSteps.push(`Entering Node ${node}`);
//             updateLog();
//             visited.add(node);
//             drawGraph();
//             await delay(speed);
//         }
//     }
//
//     // Complete the DFS for this node (Postorder or after finishing all neighbors)
//     if (traversalOrder === 'preorder' || traversalOrder === 'inorder') {
//         stack.pop();
//         updateStack();
//         logSteps.push(`Backtracking from Node ${node}`);
//         updateLog();
//     }
// }


// Start DFS
async function startDFS() {
    visited.clear();
    stack = [];
    logSteps = [];
    path = [];
    updateStack();
    updateLog();
    const startNode = 1; // Change this to select a different start node
    await dfs(startNode);
}

// Reset the graph
function resetGraph() {
    visited.clear();
    stack = [];
    logSteps = [];
    path = [];
    drawGraph();
    updateStack();
    updateLog();
}

// Update Stack Visualization
function updateStack() {
    const stackDiv = document.getElementById("stack");
    stackDiv.innerHTML = stack
        .map(n => `<div class="stack-box">${n}</div>`)
        .reverse()  // Reverse to show the top of stack at the top
        .join("");
}


// Update Step-by-Step Log
function updateLog() {
    document.getElementById("log").innerHTML = logSteps.join("<br>");
}

// Speed Control
document.getElementById("speed").addEventListener("change", (event) => {
    speed = parseInt(event.target.value);
});

// Change Traversal Order
document.getElementById("order").addEventListener("change", (event) => {
    traversalOrder = event.target.value;
    resetGraph();
});

drawGraph();
