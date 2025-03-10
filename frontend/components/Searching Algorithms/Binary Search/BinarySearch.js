// Global variables
let array = [];
let searchTree = [];

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

function drawTree(ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    console.log("Drawing tree with nodes:", searchTree);

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
        ctx.fillStyle = node.found ? "#99ff99" : "#ffffff";
        ctx.fill();
        ctx.strokeStyle = "#432add";
        ctx.stroke();
        ctx.fillStyle = "#000";
        ctx.textAlign = "center";
        ctx.font = "12px Silkscreen";
        ctx.fillText(node.value.toString(), node.x, node.y + 5);
    });
}

async function binarySearch(arr, target) {
    let left = 0;
    let right = arr.length - 1;
    let rows = document.querySelectorAll("#binary-table-body tr");
    const canvas = document.getElementById("tree-canvas");
    const ctx = canvas.getContext("2d");

    while (left <= right) {
        let mid = Math.floor((left + right) / 2);
        console.log(`Searching: mid=${mid}, value=${arr[mid]}, target=${target}`);

        rows.forEach(row => row.classList.remove("highlight"));
        if (rows[mid]) rows[mid].classList.add("highlight");

        if (!searchTree.some(node => node.index === mid)) {
            const depth = searchTree.length === 0 ? 0 : Math.floor(Math.log2(searchTree.length)) + 1;
            const parentIndex = searchTree.length === 0 ? -1 :
                searchTree.findIndex(n => (arr[mid] < n.value && !n.leftChild) || (arr[mid] > n.value && !n.rightChild));
            const xSpacing = 200 / (depth + 1);

            const newNode = {
                value: arr[mid],
                index: mid,
                x: parentIndex === -1 ? 250 :
                    (arr[mid] < searchTree[parentIndex].value ?
                        searchTree[parentIndex].x - xSpacing : searchTree[parentIndex].x + xSpacing),
                y: (depth + 1) * 60,
                leftChild: null,
                rightChild: null,
                found: arr[mid] === target
            };

            if (parentIndex !== -1) {
                if (arr[mid] < searchTree[parentIndex].value) {
                    searchTree[parentIndex].leftChild = searchTree.length;
                } else {
                    searchTree[parentIndex].rightChild = searchTree.length;
                }
            }

            searchTree.push(newNode);
            console.log("Added node:", newNode);
        } else if (arr[mid] === target) {
            const node = searchTree.find(n => n.index === mid);
            node.found = true;
        }

        drawTree(ctx);
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (arr[mid] === target) {
            rows.forEach(row => row.classList.remove("highlight")); // Clear highlight after found
            return mid;
        } else if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    const parentIndex = searchTree.length > 0 ? searchTree.length - 1 : -1;
    const xSpacing = 200 / (Math.floor(Math.log2(searchTree.length + 1)) + 1);
    const newNode = {
        value: "NF",
        index: -1,
        x: parentIndex === -1 ? 250 :
            (target < searchTree[parentIndex].value ?
                searchTree[parentIndex].x - xSpacing : searchTree[parentIndex].x + xSpacing),
        y: (Math.floor(Math.log2(searchTree.length + 1)) + 2) * 60,
        leftChild: null,
        rightChild: null,
        found: false
    };
    if (parentIndex !== -1) {
        if (target < searchTree[parentIndex].value) searchTree[parentIndex].leftChild = searchTree.length;
        else searchTree[parentIndex].rightChild = searchTree.length;
    }
    searchTree.push(newNode);
    drawTree(ctx);
    rows.forEach(row => row.classList.remove("highlight")); // Clear highlight after not found
    return -1;
}

function initializeBinarySearch() {
    const input = document.getElementById("list-input").value;
    if (!input) {
        alert("Please enter a list of numbers.");
        return;
    }
    array = input.split(",").map(num => parseInt(num.trim())).filter(n => !isNaN(n)).sort((a, b) => a - b);

    if (array.length === 0) {
        alert("Please enter valid numbers.");
        return;
    }

    populateBinarySearchTable(array);
    searchTree = [];
    const canvas = document.getElementById("tree-canvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    console.log("Initialized with array:", array);
}

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

    array = [...array, ...newNumbers].sort((a, b) => a - b);
    populateBinarySearchTable(array);
    document.getElementById("list-input").value = "";
    console.log("Added to list, new array:", array);
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