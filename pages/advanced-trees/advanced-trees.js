const canvas = document.getElementById("treeCanvas");
const trieWords = new Set(); // To avoid duplicates
const ctx = canvas.getContext("2d");
canvas.width = 1000;
canvas.height = 500;

let animationSpeed = 1;
const speedSlider = document.getElementById("speedSlider");
if (speedSlider) {
    speedSlider.addEventListener("input", () => {
        animationSpeed = parseFloat(speedSlider.value);
        gsap.globalTimeline.timeScale(animationSpeed);
    });
}

class TreeNode {
    constructor(value, x, y) {
        this.value = value;
        this.x = x;
        this.y = y;
        this.left = null;
        this.right = null;
    }
}

class BST {
    constructor() {
        this.root = null;
    }

    insert(value) {
        if (isNaN(value)) return;
        document.getElementById("treeDescription").innerText = `Inserting ${value}...`;

        const path = [];
        this._tracePath(this.root, value, path);

        this._animatePath(path, () => {
            this.root = this._insertRecursive(this.root, value, canvas.width / 2, 50, 120);
            this.draw();
            document.getElementById("treeDescription").innerText = `Inserted ${value} into the BST.`;
        });
    }

// Helper to trace path before insertion
    _tracePath(node, value, path) {
        if (!node) return;
        path.push(node);
        if (value < node.value) {
            this._tracePath(node.left, value, path);
        } else {
            this._tracePath(node.right, value, path);
        }
    }

// Step-by-step node glow animation
    _animatePath(path, onComplete) {
        let i = 0;
        const highlightNext = () => {
            if (i >= path.length) {
                onComplete();
                return;
            }

            const node = path[i];
            const originalColor = ctx.fillStyle;

            // Glow node by drawing outer ring
            gsap.to(node, {
                duration: 0.3,
                onUpdate: () => {
                    this.draw();
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, 26, 0, Math.PI * 2);
                    ctx.strokeStyle = "#ffff00"; // Yellow glow
                    ctx.lineWidth = 3;
                    ctx.stroke();
                },
                onComplete: () => {
                    i++;
                    setTimeout(highlightNext, 400);
                }
            });
        };
        highlightNext();
    }


    _insertRecursive(node, value, x, y, offset) {
        if (node === null) {
            return new TreeNode(value, x, y);
        }

        if (value < node.value) {
            node.left = this._insertRecursive(node.left, value, x - offset, y + 60, offset / 1.5);
        } else {
            node.right = this._insertRecursive(node.right, value, x + offset, y + 60, offset / 1.5);
        }

        return node;
    }

    draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this._drawTree(this.root);
    }

    _drawTree(node) {
        if (!node) return;

        ctx.fillStyle = "#d4a4ff";
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;

        if (node.left) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(node.left.x, node.left.y);
            ctx.stroke();
            this._drawTree(node.left);
        }

        if (node.right) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(node.right.x, node.right.y);
            ctx.stroke();
            this._drawTree(node.right);
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#000";
        ctx.font = "16px Arial";
        ctx.fillText(node.value, node.x - 8, node.y + 5);
    }

    search(value) {
        if (isNaN(value)) return;
        document.getElementById("treeDescription").innerText = `Searching for ${value}...`;
        this._searchRecursive(this.root, value);
    }

    _searchRecursive(node, value) {
        if (!node) {
            document.getElementById("treeDescription").innerText = `Value ${value} not found in BST.`;
            return;
        }

        gsap.to(node, {
            onUpdate: () => {
                this.draw();
                ctx.beginPath();
                ctx.arc(node.x, node.y, 26, 0, Math.PI * 2);
                ctx.strokeStyle = "#ffff00";
                ctx.lineWidth = 3;
                ctx.stroke();
            },
            duration: 0.4,
            onComplete: () => {
                if (value === node.value) {
                    document.getElementById("treeDescription").innerText = `Value ${value} found!`;
                } else if (value < node.value) {
                    setTimeout(() => this._searchRecursive(node.left, value), 500);
                } else {
                    setTimeout(() => this._searchRecursive(node.right, value), 500);
                }
            }
        });
    }
    remove(value) {
        const path = [];
        this._tracePath(this.root, value, path);
        this._animatePath(path, () => {
            this.root = this._removeRecursive(this.root, value);
            this.draw();
            document.getElementById("treeDescription").innerText = `Removed ${value} from the BST.`;
        });
    }
    _removeRecursive(node, value) {
        if (!node) return null;

        if (value < node.value) {
            node.left = this._removeRecursive(node.left, value);
        } else if (value > node.value) {
            node.right = this._removeRecursive(node.right, value);
        } else {
            if (!node.left) return node.right;
            if (!node.right) return node.left;

            const minLargerNode = this._getMin(node.right);
            node.value = minLargerNode.value;
            node.right = this._removeRecursive(node.right, minLargerNode.value);
        }

        return node;
    }

    _getMin(node) {
        while (node.left) node = node.left;
        return node;
    }
}

// AVL Tree
class AVLNode extends TreeNode {
    constructor(value, x, y) {
        super(value, x, y);
        this.height = 1;
    }
}

class AVLTree {
    constructor() {
        this.root = null;

        // 🎨 Define colors for node circle and label text
        this.nodeColor = "#a4f7ff"; // Light blue for AVL
        this.textColor = "#000";    // Black text
        this.lineColor = "#ffffff"; // Connection line color
    }

    insert(value) {
        if (isNaN(value)) return;
        document.getElementById("treeDescription").innerText = `Inserting ${value}...`;

        const path = [];
        this._tracePath(this.root, value, path);

        this._animatePath(path, () => {
            this.root = this._insert(this.root, value, canvas.width / 2, 50, 120);
            this.draw();
            document.getElementById("treeDescription").innerText = `Inserted ${value} into the AVL Tree.`;
        });
    }

    _tracePath(node, value, path) {
        if (!node) return;
        path.push(node);
        if (value < node.value) {
            this._tracePath(node.left, value, path);
        } else {
            this._tracePath(node.right, value, path);
        }
    }

    _animatePath(path, onComplete) {
        let i = 0;
        const highlightNext = () => {
            if (i >= path.length) {
                onComplete();
                return;
            }
            const node = path[i];
            gsap.to(node, {
                duration: 0.3,
                onUpdate: () => {
                    this.draw();
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, 26, 0, Math.PI * 2);
                    ctx.strokeStyle = "#ffff00";
                    ctx.lineWidth = 3;
                    ctx.stroke();
                },
                onComplete: () => {
                    i++;
                    setTimeout(highlightNext, 400);
                }
            });
        };
        highlightNext();
    }

    _insert(node, value, x, y, offset) {
        if (!node) return new AVLNode(value, x, y);

        if (value < node.value) {
            node.left = this._insert(node.left, value, x - offset, y + 60, offset / 1.5);
        } else {
            node.right = this._insert(node.right, value, x + offset, y + 60, offset / 1.5);
        }

        node.height = 1 + Math.max(this._getHeight(node.left), this._getHeight(node.right));
        const balance = this._getBalance(node);

        if (balance > 1 && value < node.left.value) return this._rotateRight(node);
        if (balance < -1 && value > node.right.value) return this._rotateLeft(node);
        if (balance > 1 && value > node.left.value) {
            node.left = this._rotateLeft(node.left);
            return this._rotateRight(node);
        }
        if (balance < -1 && value < node.right.value) {
            node.right = this._rotateRight(node.right);
            return this._rotateLeft(node);
        }

        return node;
    }

    _rotateLeft(z) {
        const y = z.right;
        const T2 = y.left;

        y.left = z;
        z.right = T2;

        gsap.to(z, { x: z.x - 40, duration: 0.5 });
        gsap.to(y, { x: y.x + 40, duration: 0.5 });

        return this._updateHeightsAndReturn(y, z);
    }

    _rotateRight(z) {
        const y = z.left;
        const T3 = y.right;

        y.right = z;
        z.left = T3;

        gsap.to(z, { x: z.x + 40, duration: 0.5 });
        gsap.to(y, { x: y.x - 40, duration: 0.5 });

        return this._updateHeightsAndReturn(y, z);
    }

    _updateHeightsAndReturn(newRoot, oldRoot) {
        oldRoot.height = 1 + Math.max(this._getHeight(oldRoot.left), this._getHeight(oldRoot.right));
        newRoot.height = 1 + Math.max(this._getHeight(newRoot.left), this._getHeight(newRoot.right));
        return newRoot;
    }

    _getHeight(node) {
        return node ? node.height : 0;
    }

    _getBalance(node) {
        return node ? this._getHeight(node.left) - this._getHeight(node.right) : 0;
    }

    draw() {
        this.updateCoordinates();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this._drawTree(this.root);
    }

    _drawTree(node) {
        if (!node) return;

        // 👇 Draw connecting lines
        ctx.strokeStyle = this.lineColor;
        ctx.lineWidth = 2;

        if (node.left) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(node.left.x, node.left.y);
            ctx.stroke();
            this._drawTree(node.left);
        }

        if (node.right) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(node.right.x, node.right.y);
            ctx.stroke();
            this._drawTree(node.right);
        }

        // 👇 Draw node circle
        ctx.fillStyle = this.nodeColor;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 👇 Draw node value
        ctx.fillStyle = this.textColor;
        ctx.font = "16px Arial";
        ctx.fillText(node.value, node.x - 8, node.y + 5);
    }

    updateCoordinates() {
        let index = 0;
        const levels = {};
        const assign = (node, depth = 0) => {
            if (!node) return;
            if (!levels[depth]) levels[depth] = [];
            assign(node.left, depth + 1);
            levels[depth].push(node);
            assign(node.right, depth + 1);
        };
        assign(this.root);

        const xSpacing = 60;
        const ySpacing = 70;
        const center = canvas.width / 2;

        Object.keys(levels).forEach(depth => {
            const nodes = levels[depth];
            const totalWidth = (nodes.length - 1) * xSpacing;
            nodes.forEach((node, i) => {
                node.x = center - totalWidth / 2 + i * xSpacing;
                node.y = 50 + depth * ySpacing;
            });
        });
    }

    search(value) {
        if (isNaN(value)) return;
        document.getElementById("treeDescription").innerText = `Searching for ${value} in AVL Tree...`;
        this._searchRecursive(this.root, value);
    }

    _searchRecursive(node, value) {
        if (!node) {
            document.getElementById("treeDescription").innerText = `Value ${value} not found in AVL Tree.`;
            return;
        }

        gsap.to(node, {
            duration: 0.4,
            onUpdate: () => {
                this.draw();
                ctx.beginPath();
                ctx.arc(node.x, node.y, 26, 0, Math.PI * 2);
                ctx.strokeStyle = "#ffff00";
                ctx.lineWidth = 3;
                ctx.stroke();
            },
            onComplete: () => {
                if (value === node.value) {
                    document.getElementById("treeDescription").innerText = `Value ${value} found!`;
                } else if (value < node.value) {
                    setTimeout(() => this._searchRecursive(node.left, value), 500);
                } else {
                    setTimeout(() => this._searchRecursive(node.right, value), 500);
                }
            }
        });
    }

    remove(value) {
        const path = [];
        this._tracePath(this.root, value, path);

        this._animatePath(path, () => {
            this.root = this._remove(this.root, value);
            this.draw();
            document.getElementById("treeDescription").innerText = `Removed ${value} from the AVL Tree.`;
        });
    }

    _remove(node, value) {
        if (!node) return null;

        if (value < node.value) {
            node.left = this._remove(node.left, value);
        } else if (value > node.value) {
            node.right = this._remove(node.right, value);
        } else {
            if (!node.left) return node.right;
            if (!node.right) return node.left;

            const minLargerNode = this._getMin(node.right);
            node.value = minLargerNode.value;
            node.right = this._remove(node.right, minLargerNode.value);
        }

        node.height = 1 + Math.max(this._getHeight(node.left), this._getHeight(node.right));
        const balance = this._getBalance(node);

        if (balance > 1 && this._getBalance(node.left) >= 0) return this._rotateRight(node);
        if (balance > 1 && this._getBalance(node.left) < 0) {
            node.left = this._rotateLeft(node.left);
            return this._rotateRight(node);
        }
        if (balance < -1 && this._getBalance(node.right) <= 0) return this._rotateLeft(node);
        if (balance < -1 && this._getBalance(node.right) > 0) {
            node.right = this._rotateRight(node.right);
            return this._rotateLeft(node);
        }

        return node;
    }

    _getMin(node) {
        while (node.left) node = node.left;
        return node;
    }
}

let currentTreeType = "avl";
const bst = new BST();
const avl = new AVLTree();

function selectTree(type) {
    currentTreeType = type;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById("treeDescription").innerText = `Selected ${type.toUpperCase()} Tree.`;

    if (type === "bst") bst.draw();
    else if (type === "avl") avl.draw();
}

function insertNode() {
    const value = parseInt(document.getElementById("nodeValue").value);
    if (isNaN(value)) return;

    if (currentTreeType === "bst") bst.insert(value);
    else if (currentTreeType === "avl") avl.insert(value);
}

function searchNode() {
    const value = parseInt(document.getElementById("nodeValue").value);
    if (isNaN(value)) return;

    if (currentTreeType === "bst") bst.search(value);
    else if (currentTreeType === "avl") avl.search(value);
}
// Red-Black Tree
class RBTNode extends TreeNode {
    constructor(value, x, y, color = 'red') {
        super(value, x, y);
        this.color = color;
    }
}

class RBT {
    constructor() {
        this.root = null;
    }

    insert(value) {
        if (isNaN(value)) return;
        document.getElementById("treeDescription").innerText = `Inserting ${value}...`;

        const path = [];
        this._tracePath(this.root, value, path);

        this._animatePath(path, () => {
            this.root = this._insertRecursive(this.root, value, canvas.width / 2, 50, 120);
            if (this.root) this.root.color = 'black';
            this.draw();
            document.getElementById("treeDescription").innerText = `Inserted ${value} into the Red-Black Tree.`;
        });
    }

    _tracePath(node, value, path) {
        if (!node) return;
        path.push(node);
        if (value < node.value) {
            this._tracePath(node.left, value, path);
        } else {
            this._tracePath(node.right, value, path);
        }
    }

    _animatePath(path, onComplete) {
        let i = 0;
        const highlightNext = () => {
            if (i >= path.length) {
                onComplete();
                return;
            }

            const node = path[i];
            gsap.to(node, {
                duration: 0.3,
                onUpdate: () => {
                    this.draw();
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, 26, 0, Math.PI * 2);
                    ctx.strokeStyle = "#ffff00";
                    ctx.lineWidth = 3;
                    ctx.stroke();
                },
                onComplete: () => {
                    i++;
                    setTimeout(highlightNext, 400);
                }
            });
        };
        highlightNext();
    }

    _insertRecursive(node, value, x, y, offset) {
        if (!node) return new RBTNode(value, x, y, 'red'); // Always insert red

        // Regular BST logic
        if (value < node.value) {
            node.left = this._insertRecursive(node.left, value, x - offset, y + 60, offset / 1.5);
        } else {
            node.right = this._insertRecursive(node.right, value, x + offset, y + 60, offset / 1.5);
        }

        // ✅ Fix Red-Black Tree violations (but not too early!)

        // Case 1: Right child is red, left is black → Rotate left
        if (this._isRed(node.right) && !this._isRed(node.left)) {
            node = this._rotateLeft(node);
        }

        // Case 2: Left child is red and its left child is red → Rotate right
        if (this._isRed(node.left) && this._isRed(node.left.left)) {
            node = this._rotateRight(node);
        }

        // ✅ Case 3: Both children are red → flip only when child just inserted causes red-red
        if (this._isRed(node.left) && this._isRed(node.right)) {
            if (this._justInsertedCausedRedRed(node)) {
                this._flipColors(node);
            }
        }

        return node;
    }
    _justInsertedCausedRedRed(node) {
        // Look one level deeper to detect red-red situation
        return (this._isRed(node.left) && (
                this._isRed(node.left.left) || this._isRed(node.left.right)
            )) ||
            (this._isRed(node.right) && (
                this._isRed(node.right.left) || this._isRed(node.right.right)
            ));
    }

    _isRed(node) {
        return node && node.color === 'red';
    }

    _rotateLeft(h) {
        let x = h.right;
        h.right = x.left;
        x.left = h;

        gsap.to(h, { x: h.x - 30, duration: 0.3 });
        gsap.to(x, { x: x.x + 30, duration: 0.3 });

        x.color = h.color;
        h.color = 'red';
        return x;
    }

    _rotateRight(h) {
        let x = h.left;
        h.left = x.right;
        x.right = h;

        gsap.to(h, { x: h.x + 30, duration: 0.3 });
        gsap.to(x, { x: x.x - 30, duration: 0.3 });

        x.color = h.color;
        h.color = 'red';
        return x;
    }

    _flipColors(h) {
        h.color = 'red';
        if (h.left) h.left.color = 'black';
        if (h.right) h.right.color = 'black';
    }

    draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this._drawTree(this.root);
    }

    _drawTree(node) {
        if (!node) return;

        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;

        if (node.left) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(node.left.x, node.left.y);
            ctx.stroke();
            this._drawTree(node.left);
        }

        if (node.right) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(node.right.x, node.right.y);
            ctx.stroke();
            this._drawTree(node.right);
        }

        ctx.beginPath();
        ctx.fillStyle = node.color === 'red' ? "#ff5e78" : "#000000";
        ctx.arc(node.x, node.y, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#fff";
        ctx.font = "16px Arial";
        ctx.fillText(node.value, node.x - 8, node.y + 5);
    }

    search(value) {
        if (isNaN(value)) return;
        document.getElementById("treeDescription").innerText = `Searching for ${value} in Red-Black Tree...`;
        this._searchRecursive(this.root, value);
    }

    _searchRecursive(node, value) {
        if (!node) {
            document.getElementById("treeDescription").innerText = `Value ${value} not found.`;
            return;
        }

        gsap.to(node, {
            duration: 0.4,
            onUpdate: () => {
                this.draw();
                ctx.beginPath();
                ctx.arc(node.x, node.y, 26, 0, Math.PI * 2);
                ctx.strokeStyle = "#ffff00";
                ctx.lineWidth = 3;
                ctx.stroke();
            },
            onComplete: () => {
                if (value === node.value) {
                    document.getElementById("treeDescription").innerText = `Value ${value} found!`;
                } else if (value < node.value) {
                    setTimeout(() => this._searchRecursive(node.left, value), 500);
                } else {
                    setTimeout(() => this._searchRecursive(node.right, value), 500);
                }
            }
        });
    }

    remove(value) {
        const path = [];
        this._tracePath(this.root, value, path);

        this._animatePath(path, () => {
            this.root = this._removeRecursive(this.root, value);
            if (this.root) this.root.color = 'black';
            this.draw();
            document.getElementById("treeDescription").innerText = `Removed ${value} from the Red-Black Tree.`;
        });
    }

    _removeRecursive(node, value) {
        if (!node) return null;

        if (value < node.value) {
            node.left = this._removeRecursive(node.left, value);
        } else if (value > node.value) {
            node.right = this._removeRecursive(node.right, value);
        } else {
            if (!node.left) return node.right;
            if (!node.right) return node.left;

            const minLargerNode = this._getMin(node.right);
            node.value = minLargerNode.value;
            node.right = this._removeRecursive(node.right, minLargerNode.value);
        }

        return node;
    }

    _getMin(node) {
        while (node.left) node = node.left;
        return node;
    }
}
class TrieNode {
    constructor(char = '') {
        this.char = char;
        this.children = {};
        this.isEnd = false;
        this.x = 0;
        this.y = 0;
    }
}

class Trie {
    constructor() {
        this.root = new TrieNode("Root");
        this.root.x = canvas.width / 2;
        this.root.y = 50;
    }

    insert(word) {
        let current = this.root;
        for (let char of word) {
            if (!current.children[char]) {
                current.children[char] = new TrieNode(char);
            }
            current = current.children[char];
        }
        current.isEnd = true;

        trieWords.add(word); // Add to global word list
        this.updateWordBox(); // ⬅️ Add this line to refresh box

        this.assignCoordinates();
        this.draw();
        document.getElementById("treeDescription").innerText = `Inserted "${word}" into the Trie.`;
    }
    updateWordBox() {
        const listElement = document.getElementById("trieWordsList");
        listElement.innerHTML = ""; // Clear the table body

        const sortedWords = Array.from(trieWords).sort(); // Optional: alphabetize

        sortedWords.forEach((word, index) => {
            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.innerText = word;
            cell.style.padding = "6px";
            cell.style.borderBottom = "1px dashed #555";
            cell.style.color = "#f1f1f1";
            cell.style.fontSize = "13px";

            row.appendChild(cell);
            listElement.appendChild(row);
        });
    }


    assignCoordinates() {
        const levelMap = {};
        const spacingX = 70;
        const spacingY = 80;

        // Now assign children positions relative to root
        const assign = (node, depth = 1) => {
            if (!levelMap[depth]) levelMap[depth] = 0;

            const numSiblings = Object.keys(node.children).length;
            let index = 0;
            for (let char in node.children) {
                const child = node.children[char];
                // Spread child nodes horizontally around the root
                child.x = node.x - ((numSiblings - 1) * spacingX) / 2 + index * spacingX;
                child.y = node.y + spacingY;
                index++;

                assign(child, depth + 1);
            }
        };

        assign(this.root);
    }

    draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this._drawNode(this.root);
    }

    _drawNode(node) {
        for (let char in node.children) {
            const child = node.children[char];

            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(child.x, child.y);
            ctx.strokeStyle = "#ccc";
            ctx.stroke();

            this._drawNode(child);
        }

        ctx.beginPath();
        ctx.fillStyle = "#fff";
        ctx.arc(node.x, node.y, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#7c4dff";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "#000";
        ctx.font = node.char === "Root" ? "12px Arial" : "14px Arial";

        const textOffset = node.char.length === 1 ? 6 : 10;
        ctx.fillText(node.char, node.x - textOffset, node.y + 5);

        if (node.isEnd) {
            ctx.beginPath();
            ctx.arc(node.x + 15, node.y - 15, 5, 0, Math.PI * 2);
            ctx.fillStyle = "#ff69b4";
            ctx.fill();
        }
    }

    search(word) {
        const path = [];
        let current = this.root;
        for (let char of word) {
            if (!current.children[char]) {
                document.getElementById("treeDescription").innerText = `"${word}" not found in Trie.`;
                return;
            }
            current = current.children[char];
            path.push(current);
        }

        this._animatePath(path, () => {
            document.getElementById("treeDescription").innerText = `"${word}" found in Trie!`;
        });
    }

    _animatePath(path, onComplete) {
        let i = 0;
        const highlightNext = () => {
            if (i >= path.length) {
                onComplete();
                return;
            }

            const node = path[i];
            gsap.to(node, {
                duration: 0.3,
                onUpdate: () => {
                    this.draw();
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, 26, 0, Math.PI * 2);
                    ctx.strokeStyle = "#ffff00";
                    ctx.lineWidth = 3;
                    ctx.stroke();
                },
                onComplete: () => {
                    i++;
                    setTimeout(highlightNext, 400);
                }
            });
        };
        highlightNext();
    }

    remove(word) {
        const removed = this._removeHelper(this.root, word, 0);
        this.assignCoordinates();
        this.draw();
        document.getElementById("treeDescription").innerText = removed
            ? `"${word}" removed from Trie.`
            : `"${word}" not found in Trie."`;
    }

    _removeHelper(node, word, index) {
        if (!node) return false;
        if (index === word.length) {
            if (!node.isEnd) return false;
            node.isEnd = false;
            return Object.keys(node.children).length === 0;
        }

        const char = word[index];
        const shouldDelete = this._removeHelper(node.children[char], word, index + 1);

        if (shouldDelete) {
            delete node.children[char];
            return Object.keys(node.children).length === 0 && !node.isEnd;
        }

        return false;
    }
}
const rbt = new RBT();
const trie = new Trie();

function selectTree(type) {
    currentTreeType = type;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const descriptions = {
        avl: "AVL Tree: A self-balancing BST. Keeps height difference ≤ 1 for all nodes.",
        rbt: "Red-Black Tree: A self-balancing BST using red/black coloring rules.",
        trie: "Trie: A prefix tree for storing words or characters like a dictionary."
    };

    document.getElementById("treeDescription").innerText = descriptions[type];
    document.getElementById("trieWordsBox").style.display = (type === "trie") ? "block" : "none";

    const inputField = document.getElementById("nodeValue");

    if (type === "trie") {
        inputField.type = "text";
        inputField.placeholder = "Enter a word";
    } else {
        inputField.type = "number";
        inputField.placeholder = "Enter a number";
    }

    if (type === "bst") bst.draw();
    else if (type === "avl") avl.draw();
    else if (type === "rbt") rbt.draw();
    else if (type === "trie") trie.draw();
}

function insertNode() {
    const value = document.getElementById("nodeValue").value;
    if (!value) return;

    if (currentTreeType === "bst") bst.insert(parseInt(value));
    else if (currentTreeType === "avl") avl.insert(parseInt(value));
    else if (currentTreeType === "rbt") rbt.insert(parseInt(value));
    else if (currentTreeType === "trie") trie.insert(value);
}

function searchNode() {
    const value = document.getElementById("nodeValue").value;
    if (!value) return;

    if (currentTreeType === "bst") bst.search(parseInt(value));
    else if (currentTreeType === "avl") avl.search(parseInt(value));
    else if (currentTreeType === "rbt") rbt.search(parseInt(value));
    else if (currentTreeType === "trie") trie.search(value);
}
function removeNode() {
    const value = document.getElementById("nodeValue").value;
    if (!value) return;

    if (currentTreeType === "bst") bst.remove(parseInt(value));
    else if (currentTreeType === "avl") avl.remove(parseInt(value));
    else if (currentTreeType === "rbt") rbt.remove(parseInt(value));
    else if (currentTreeType === "trie") trie.remove(value);
}
