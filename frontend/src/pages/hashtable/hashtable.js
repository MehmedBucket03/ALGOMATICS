const tableSize = 10;
const hashTable = new Array(tableSize).fill(null).map(() => []);

function hashFunction(key) {
    return key % tableSize;
}

function insertValue() {
    const keyInput = document.getElementById('keyInput');
    const valueInput = document.getElementById('valueInput');
    const key = parseInt(keyInput.value);
    const value = valueInput.value.trim();

    if (isNaN(key) || value === "") return;

    const index = hashFunction(key);
    const collision = hashTable[index].length > 0;
    hashTable[index].push({ key, value });

    // Clear any existing collision message before rendering
    clearCollisionMessage();

    renderTable(index, collision);

    keyInput.value = "";
    valueInput.value = "";
}

function renderTable(lastInsertedIndex = null, collision = false) {
    const tableDiv = document.getElementById('hashTable');
    tableDiv.innerHTML = "";

    hashTable.forEach((bucket, index) => {
        const row = document.createElement('div');
        row.className = "row";
        row.id = `row-${index}`;

        const indexDiv = document.createElement('div');
        indexDiv.className = "index";
        indexDiv.innerText = index;

        const valuesDiv = document.createElement('div');
        valuesDiv.className = "values";

        bucket.forEach((entry, i) => {
            const box = document.createElement('div');
            box.className = "box";
            box.innerText = `${entry.key}:${entry.value}`;
            valuesDiv.appendChild(box);

            if (index === lastInsertedIndex && i === bucket.length - 1) {
                gsap.to(box, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
            } else {
                gsap.set(box, { opacity: 1, y: 0 });
            }

            // Apply collision animation on the inserted box
            if (collision && index === lastInsertedIndex && i === bucket.length - 1) {
                gsap.fromTo(box, { x: -10 }, { x: 10, repeat: 3, yoyo: true, duration: 0.2, ease: "power1.inOut" });
            }
        });

        row.appendChild(indexDiv);
        row.appendChild(valuesDiv);
        tableDiv.appendChild(row);
    });

    if (collision) {
        displayCollisionMessage(lastInsertedIndex); // Show the collision message
    }
}

function displayCollisionMessage(index) {
    const messageContainer = document.getElementById('collisionMessage');
    messageContainer.innerHTML = `
        <p><strong>Collision Detected!</strong></p>
        <p>A collision occurred at index <strong>${index}</strong> when trying to insert the key.</p>
        <p>To resolve this, we used <strong>chaining</strong>, where multiple values can be stored at the same index in a linked list.</p>
        <p>This ensures the table remains efficient, even when collisions happen.</p>
    `;
    messageContainer.style.opacity = 1; // Fade in the message
}

function clearCollisionMessage() {
    const messageContainer = document.getElementById('collisionMessage');
    messageContainer.style.opacity = 0; // Fade out the message
}

renderTable();
