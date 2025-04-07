const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");
const explanation = document.getElementById("explanation");
const matrixTable = document.getElementById("matrix");

// Graph Representation
const INF = Infinity;
let graph = [
    [0, 4, INF, 5, INF],
    [INF, 0, 1, INF, 6],
    [2, INF, 0, 3, INF],
    [INF, INF, 1, 0, 2],
    [1, INF, INF, 4, 0]
];

const nodes = [
    { id: 0, x: 100, y: 200 },
    { id: 1, x: 250, y: 100 },
    { id: 2, x: 250, y: 300 },
    { id: 3, x: 400, y: 200 },
    { id: 4, x: 550, y: 200 }
];

function drawGraph() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw edges
    for (let i = 0; i < graph.length; i++) {
        for (let j = 0; j < graph[i].length; j++) {
            if (graph[i][j] !== INF && i !== j) {
                let from = nodes[i];
                let to = nodes[j];
                ctx.beginPath();
                ctx.moveTo(from.x, from.y);
                ctx.lineTo(to.x, to.y);
                ctx.strokeStyle = "white";
                ctx.lineWidth = 2;
                ctx.stroke();

                let midX = (from.x + to.x) / 2;
                let midY = (from.y + to.y) / 2;
                ctx.fillStyle = "yellow";
                ctx.fillText(graph[i][j], midX, midY);
            }
        }
    }

    // Draw nodes
    nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 20, 0, Math.PI * 2);
        ctx.fillStyle = "lightblue";
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "black";
        ctx.fillText(node.id, node.x - 5, node.y + 5);
    });

    updateMatrix();
}

function updateMatrix() {
    matrixTable.innerHTML = "";
    for (let i = 0; i < graph.length; i++) {
        let row = document.createElement("tr");
        for (let j = 0; j < graph[i].length; j++) {
            let cell = document.createElement("td");
            cell.textContent = graph[i][j] === INF ? "∞" : graph[i][j];
            row.appendChild(cell);
        }
        matrixTable.appendChild(row);
    }
}

function highlightMatrix(i, j, k, value) {
    let rows = matrixTable.getElementsByTagName("tr");
    let cells = rows[i].getElementsByTagName("td");
    cells[j].classList.add("highlight");
    cells[j].textContent = value === INF ? "∞" : value;

    setTimeout(() => {
        cells[j].classList.remove("highlight");
    }, 1000);
}

async function runFloydWarshall() {
    explanation.innerHTML = "Running Floyd-Warshall Algorithm...";

    let dist = JSON.parse(JSON.stringify(graph)); // Clone graph to avoid modifying the original
    let V = graph.length;

    for (let k = 0; k < V; k++) {
        explanation.innerHTML += `<br>Using node ${k} as an intermediate.`;

        for (let i = 0; i < V; i++) {
            for (let j = 0; j < V; j++) {
                if (dist[i][k] !== INF && dist[k][j] !== INF && dist[i][j] > dist[i][k] + dist[k][j]) {
                    dist[i][j] = dist[i][k] + dist[k][j];

                    highlightMatrix(i, j, k, dist[i][j]);
                    explanation.innerHTML += `<br>Updating distance from ${i} → ${j} via ${k} to ${dist[i][j]}.`;

                    await new Promise(resolve => setTimeout(resolve, 500)); // Animation delay
                }
            }
        }
        graph = JSON.parse(JSON.stringify(dist));
        updateMatrix();
        drawGraph();
    }

    explanation.innerHTML += "<br>Algorithm completed!";
}

// Initial setup
drawGraph();
updateMatrix();
