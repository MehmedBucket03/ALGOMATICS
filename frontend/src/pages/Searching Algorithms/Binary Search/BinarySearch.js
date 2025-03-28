// Global variables
let array = [];
let searchTree = [];

// const canvasWrapper = document.querySelector(".canvas-wrapper");

const canvas = document.getElementById("tree-canvas");
const ctx = canvas.getContext("2d");

//makes nodes appear
let scale = 1; // Zoom Level

const minZoom = 0.5; // Minimum zoom level
const maxZoom = 3; // Maximum zoom level



function populateBinarySearchTable(arr) {
    let tableBody = document.getElementById("binary-table-body");
    tableBody.innerHTML = "";
    arr.forEach((value, index) => {
        let row = document.createElement("tr");
        row.innerHTML = `<td>${index}</td><td>${value}</td>`;
        tableBody.appendChild(row);
    });
    console.log("Table populated with:", arr);
}

// const treeContainer = document.querySelector('.tree-container');

//moving the container with the mouse
// Variables for dragging

// const treeCanvas = document.getElementById("tree-canvas");

// Mouse Down Event (Start Dragging)
// Variables for dragging
let isDragging = false;
let startX, startY;
let panX = 0, panY = 0; // Internal offsets for panning
let lastPanX = 0, lastPanY = 0; // Store last pan position

// Mouse Down Event (Start Dragging)
canvas.addEventListener("mousedown", (event) => {
    isDragging = true;
    startX = event.clientX - lastPanX;
    startY = event.clientY - lastPanY;
    canvas.style.cursor = "grabbing"; // Change cursor
});

// Mouse Move Event (Dragging)
document.addEventListener("mousemove", (event) => {
    if (!isDragging) return;

    // Calculate new pan values
    panX = event.clientX - startX;
    panY = event.clientY - startY;

    // Redraw the tree with updated pan values
    drawTree(ctx);
});

// Mouse Up Event (Stop Dragging)
document.addEventListener("mouseup", () => {
    isDragging = false;
    lastPanX = panX; // Save last position
    lastPanY = panY;
    canvas.style.cursor = "grab"; // Reset cursor
});

// Set Initial Cursor Style
canvas.style.cursor = "grab";



// Zoom Function (Mouse Wheel) - Apply to Canvas Instead of Container
canvas.addEventListener("wheel", (event) => {
    event.preventDefault();

    const mouseX = event.offsetX;
    const mouseY = event.offsetY;

    // Calculate zoom scale
    const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9;
    const newScale = scale * zoomFactor;

    // Limit zoom range
    if (newScale < minZoom || newScale > maxZoom) return;

    // Adjust pan to keep zoom centered at cursor position
    panX = mouseX - (mouseX - panX) * (newScale / scale);
    panY = mouseY - (mouseY - panY) * (newScale / scale);

    // Apply new scale
    scale = newScale;

    // Redraw tree with updated scale
    drawTree(ctx);
});


// Modify drawTree to Adjust for Zoom and Pan

function drawTree(ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    ctx.translate(panX, panY);
    ctx.scale(scale, scale);

    searchTree.forEach(node => {
        if (node.leftChild !== null) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y + 20);
            ctx.lineTo(searchTree[node.leftChild].x, searchTree[node.leftChild].y - 20);
            ctx.strokeStyle = "#432add";
            ctx.stroke();
        }
        if (node.rightChild !== null) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y + 20);
            ctx.lineTo(searchTree[node.rightChild].x, searchTree[node.rightChild].y - 20);
            ctx.strokeStyle = "#432add";
            ctx.stroke();
        }
    });

    searchTree.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 20, 0, 2 * Math.PI);

        // Change color if node is highlighted
        ctx.fillStyle = node.highlight ? "#ffcc00" : "#ffffff";
        ctx.fill();

        ctx.strokeStyle = "#432add";
        ctx.stroke();
        ctx.fillStyle = "#000";
        ctx.textAlign = "center";
        ctx.font = "12px Silkscreen";
        ctx.fillText(node.value.toString(), node.x, node.y + 5);
    });

    ctx.restore();
}



async function binarySearch(arr, target) {
    let left = 0;
    let right = arr.length - 1;
    let rows = document.querySelectorAll("#binary-table-body tr");

    while (left <= right) {
        let mid = Math.floor((left + right) / 2);
        console.log(`Searching: mid=${mid}, value=${arr[mid]}, target=${target}`);

        // Remove previous highlights from table
        rows.forEach(row => row.classList.remove("highlight"));
        if (rows[mid]) rows[mid].classList.add("highlight");

        // Find the corresponding node in the tree and highlight it
        let node = searchTree.find(n => n.value === arr[mid]);
        if (node) node.highlight = true; // Mark node as highlighted

        drawTree(ctx); // Redraw with highlighted node
        await new Promise(resolve => setTimeout(resolve, 1000)); // Pause for visibility

        if (arr[mid] === target) {
            return mid; // Found, exit search
        } else {
            node.highlight = false; // Remove highlight if not found
            drawTree(ctx);
            if (arr[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
    }

    return -1; // Not found
}


//clears the table and the tree
function clearlist() {
    // Clear input field
    const inputField = document.getElementById("list-input");
    inputField.value = "";

    // Reset array and searchTree
    array = [];
    searchTree = [];

    // Clear table body but preserve structure
    const tableBody = document.getElementById("binary-table-body"); // Match your existing ID
    if (tableBody) {
        tableBody.innerHTML = ""; // Clear rows only
    }

    // Reset canvas
    panX = 0;
    panY = 0;
    scale = 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    console.log("List cleared. Waiting for new input...");
    // No need for event listener here; rely on existing button
}


//adds to the table
function addToList() {
    const input = document.getElementById("list-input").value;
    if (!input) {
        alert("Please enter numbers to add.");
        return;
    }

    const newNumbers = input.split(",").map(num => parseInt(num.trim())).filter(n => !isNaN(n));

    if (newNumbers.length === 0) {
        alert("Please enter valid numbers to add.");
        return;
    }

    // Check for duplicates and show a message if a number already exists
    newNumbers.forEach(num => {
        if (array.includes(num)) {
            alert(`Number ${num} already exists in the list. Please add another number.`);
        }
    });

    // Merge new numbers, remove duplicates, sort them, and rebuild the tree
    array = [...new Set([...array, ...newNumbers])].sort((a, b) => a - b);
    populateBinarySearchTable(array);

    // Rebuild the tree from the sorted array
    searchTree = [];
    buildBalancedTree(array, 0, array.length - 1, null, canvas.width / 2, 50, 0);

    document.getElementById("list-input").value = "";
    console.log("Updated tree with new numbers:", array);
}

//balances the trees and gives spacing
function buildBalancedTree(arr, start, end, parentIndex, x, y, depth) {
    if (start > end) return null;

    const mid = Math.floor((start + end) / 2);
    const newNodeIndex = searchTree.length;

    // Dynamically adjust spacing based on tree depth
    const xSpacing = canvas.width / Math.pow(2, depth + 1); // Space nodes evenly

    const newNode = {
        value: arr[mid],
        index: newNodeIndex,
        x: x,
        y: y,
        leftChild: null,
        rightChild: null
    };

    if (parentIndex !== null) {
        if (arr[mid] < searchTree[parentIndex].value) {
            searchTree[parentIndex].leftChild = newNodeIndex;
        } else {
            searchTree[parentIndex].rightChild = newNodeIndex;
        }
    }

    searchTree.push(newNode);

    // Recursively create left and right children
    buildBalancedTree(arr, start, mid - 1, newNodeIndex, x - xSpacing, y + 60, depth + 1);
    buildBalancedTree(arr, mid + 1, end, newNodeIndex, x + xSpacing, y + 60, depth + 1);

    drawTree(ctx);
}


async function startBinarySearch() {
    const input = document.getElementById("list-input").value;
    const target = parseInt(document.getElementById("search-target").value);

    if (isNaN(target)) {
        alert("Please enter a valid target.");
        return;
    }

    if (array.length === 0 && input) {
        array = input.split(",").map(num => parseInt(num.trim())).filter(n => !isNaN(n)).sort((a, b) => a - b);
        if (array.length === 0) {
            alert("Please enter valid numbers in the list.");
            return;
        }
        populateBinarySearchTable(array);
        searchTree = [];
        const canvas = document.getElementById("tree-canvas");
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        console.log("Auto-initialized with array:", array);
    } else if (array.length === 0) {
        alert("Please initialize or add numbers to the list first.");
        return;
    }

    console.log("Starting search for target:", target);
    const result = await binarySearch(array, target);
    setTimeout(() => {
        if (result !== -1) {
            alert(`Target found at index ${result}`);
        } else {
            alert("Target not found.");
        }
    }, 1000);
}