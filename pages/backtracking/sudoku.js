const gridElement = document.getElementById('sudoku-grid');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const stepBtn = document.getElementById('step-btn'); // Step Mode Button

let board = Array.from({ length: 9 }, () => Array(9).fill(0));
let stopSolving = false;
let solvingSteps = [];
let isStepping = false;

function updateExplanation(message) {
    const explanationBox = document.getElementById('explanation-box');
    explanationBox.innerText = message;
    explanationBox.style.animation = 'none'; // Reset animation
    explanationBox.offsetHeight; // Force reflow
    explanationBox.style.animation = null; // Restart animation
}

function getSpeed() {
    const speedSlider = document.getElementById('speed-slider');
    return 210 - speedSlider.value; // Inverse: smaller value = faster
}

function logMove(text) {
    const moveStack = document.getElementById('move-stack');
    const moveText = document.createElement('div');
    moveText.innerText = text;
    moveStack.appendChild(moveText);
    moveStack.scrollTop = moveStack.scrollHeight;
}

function createGrid() {
    gridElement.innerHTML = '';
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.maxLength = 1;
            input.classList.add('cell');
            input.id = `cell-${row}-${col}`;

            input.addEventListener('input', (e) => {
                let value = parseInt(e.target.value);
                if (isNaN(value) || value < 1 || value > 9) {
                    input.value = '';
                    board[row][col] = 0;
                } else {
                    board[row][col] = value;
                }
            });

            gridElement.appendChild(input);
        }
    }
}

function isSafe(board, row, col, num) {
    for (let x = 0; x < 9; x++) {
        if (board[row][x] === num || board[x][col] === num ||
            board[3 * Math.floor(row / 3) + Math.floor(x / 3)][3 * Math.floor(col / 3) + x % 3] === num) {
            return false;
        }
    }
    return true;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function animateCell(row, col, num, status) {
    const cell = document.getElementById(`cell-${row}-${col}`);
    cell.value = num || '';
    cell.className = 'cell'; // reset class

    if (status === 'solved') {
        cell.classList.add('solved');
        gsap.fromTo(cell, { scale: 1.2, opacity: 0.5 }, { scale: 1, opacity: 1, duration: 0.3 });
    } else if (status === 'backtracking') {
        cell.classList.add('backtracking');
        gsap.fromTo(cell, { scale: 0.8, opacity: 0.5 }, { scale: 1, opacity: 1, duration: 0.3 });
    } else if (status === 'trying') {
        cell.classList.add('current-try');
        gsap.fromTo(cell, { scale: 1.2, opacity: 0.7 }, { scale: 1, opacity: 1, duration: 0.3 });
    }
}

async function solveSudoku(board) {
    if (stopSolving) return false;

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0) {
                for (let num = 1; num <= 9; num++) {
                    animateCell(row, col, num, 'trying');
                    updateExplanation(`Trying number ${num} at (${row}, ${col})...`);
                    await sleep(getSpeed());

                    if (isSafe(board, row, col, num)) {
                        board[row][col] = num;
                        animateCell(row, col, num, 'solved');
                        updateExplanation(`Placed ${num} at (${row}, ${col}) successfully!`);
                        await sleep(getSpeed());

                        if (await solveSudoku(board)) {
                            return true;
                        }

                        board[row][col] = 0;
                        animateCell(row, col, '', 'backtracking');
                        updateExplanation(`Dead end! Backtracking from (${row}, ${col})...`);
                        await sleep(getSpeed());
                    }

                    if (stopSolving) return false;
                }
                return false;
            }
        }
    }
    return true;
}

function resetBoard() {
    stopSolving = true;

    board = Array.from({ length: 9 }, () => Array(9).fill(0));

    const moveStack = document.getElementById('move-stack');
    if (moveStack) moveStack.innerHTML = '';

    solvingSteps = [];
    isStepping = false;

    stepBtn.innerText = "Next Step";
    stepBtn.disabled = false;

    createGrid();

    updateExplanation("🧹 Board reset. Ready to solve again!");
}

function buildSteps(board) {
    solvingSteps = [];

    function dfs(boardCopy) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (boardCopy[row][col] === 0) {
                    for (let num = 1; num <= 9; num++) {
                        if (isSafe(boardCopy, row, col, num)) {
                            solvingSteps.push({ row, col, num, backtrack: false });
                            boardCopy[row][col] = num;

                            if (dfs(boardCopy)) return true;

                            boardCopy[row][col] = 0;
                            solvingSteps.push({ row, col, num: '', backtrack: true });
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    const boardCopy = board.map(row => [...row]);
    dfs(boardCopy);
}

function doNextStep() {
    if (solvingSteps.length === 0) {
        stepBtn.disabled = true;
        alert("✅ Puzzle Solved (or no solution)");
        updateExplanation("✅ Puzzle Solved!");
        gsap.to(".cell", { backgroundColor: "#C8E6C9", duration: 0.5, stagger: 0.02 });
        return;
    }

    const step = solvingSteps.shift();
    board[step.row][step.col] = step.num || 0;
    animateCell(step.row, step.col, step.num, step.backtrack ? 'backtracking' : 'solved');

    logMove(step.backtrack
        ? `Backtracking from (${step.row}, ${step.col})`
        : `Trying ${step.num} at (${step.row}, ${step.col})`);

    updateExplanation(step.backtrack
        ? `Dead end! Backtracking from (${step.row}, ${step.col})...`
        : `Trying number ${step.num} at (${step.row}, ${step.col})...`);
}

createGrid();

startBtn.addEventListener('click', async () => {
    // Read input values
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = document.getElementById(`cell-${row}-${col}`);
            const val = parseInt(cell.value);
            board[row][col] = isNaN(val) ? 0 : val;
        }
    }

    stopSolving = false;
    startBtn.disabled = true;
    resetBtn.disabled = true;
    stepBtn.disabled = true;

    updateExplanation("Starting to solve...");

    updateExplanation("Starting to solve...");

    const solved = await solveSudoku(board);

    if (solved) {
        alert("✅ Puzzle Solved!");
        updateExplanation("✅ Puzzle Solved!");
    } else {
        alert("❌ No solution found.");
        updateExplanation("❌ No solution found.");
    }

    startBtn.disabled = false;
    resetBtn.disabled = false;
    stepBtn.disabled = false;

    if (!stopSolving && solved) {
        alert("✅ Puzzle Solved!");
        updateExplanation("✅ Puzzle Solved!");
    }

    startBtn.disabled = false;
    resetBtn.disabled = false;
    stepBtn.disabled = false;
});

resetBtn.addEventListener('click', () => {
    resetBoard();
});

stepBtn.addEventListener('click', () => {
    if (!isStepping) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = document.getElementById(`cell-${row}-${col}`);
                const val = parseInt(cell.value);
                board[row][col] = isNaN(val) ? 0 : val;
            }
        }
        buildSteps(board);
        isStepping = true;
        stepBtn.innerText = "Next Step";
    }
    doNextStep();
});
