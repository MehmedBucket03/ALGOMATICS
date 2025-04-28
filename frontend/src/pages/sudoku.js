import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './sudoku.css';

const SudokuSolver = () => {
    const [board, setBoard] = useState(Array.from({ length: 9 }, () => Array(9).fill(0)));
    const [stopSolving, setStopSolving] = useState(false);
    const [solvingSteps, setSolvingSteps] = useState([]);
    const [isStepping, setIsStepping] = useState(false);
    const [explanation, setExplanation] = useState("Welcome! Press Start to begin solving.");
    const [moveLog, setMoveLog] = useState([]);
    const [speed, setSpeed] = useState(50);
    const [isDisabled, setIsDisabled] = useState({
        start: false,
        reset: false,
        step: false
    });

    const moveStackRef = useRef(null);

    useEffect(() => {
        // Scroll to bottom of move stack when new moves are added
        if (moveStackRef.current) {
            moveStackRef.current.scrollTop = moveStackRef.current.scrollHeight;
        }
    }, [moveLog]);

    const updateExplanation = (message) => {
        setExplanation(message);
        // Animation is handled by CSS
    };

    const getSpeedValue = () => {
        return 210 - speed; // Inverse: smaller value = faster
    };

    const logMove = (text) => {
        setMoveLog(prevMoves => [...prevMoves, text]);
    };

    const isSafe = (boardState, row, col, num) => {
        for (let x = 0; x < 9; x++) {
            if (boardState[row][x] === num ||
                boardState[x][col] === num ||
                boardState[3 * Math.floor(row / 3) + Math.floor(x / 3)][3 * Math.floor(col / 3) + x % 3] === num) {
                return false;
            }
        }
        return true;
    };

    const sleep = (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    };

    const animateCell = (row, col, num, status) => {
        const cell = document.getElementById(`cell-${row}-${col}`);
        if (!cell) return;

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
    };

    const solveSudoku = async (boardState) => {
        if (stopSolving) return false;

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (boardState[row][col] === 0) {
                    for (let num = 1; num <= 9; num++) {
                        animateCell(row, col, num, 'trying');
                        updateExplanation(`Trying number ${num} at (${row}, ${col})...`);
                        await sleep(getSpeedValue());

                        if (isSafe(boardState, row, col, num)) {
                            boardState[row][col] = num;
                            animateCell(row, col, num, 'solved');
                            updateExplanation(`Placed ${num} at (${row}, ${col}) successfully!`);
                            await sleep(getSpeedValue());

                            if (await solveSudoku([...boardState])) {
                                return true;
                            }

                            boardState[row][col] = 0;
                            animateCell(row, col, '', 'backtracking');
                            updateExplanation(`Dead end! Backtracking from (${row}, ${col})...`);
                            await sleep(getSpeedValue());
                        }

                        if (stopSolving) return false;
                    }
                    return false;
                }
            }
        }
        return true;
    };

    const resetBoard = () => {
        setStopSolving(true);
        setBoard(Array.from({ length: 9 }, () => Array(9).fill(0)));
        setMoveLog([]);
        setSolvingSteps([]);
        setIsStepping(false);
        setIsDisabled({
            start: false,
            reset: false,
            step: false
        });
        updateExplanation("🧹 Board reset. Ready to solve again!");

        // Clear all input fields
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = document.getElementById(`cell-${row}-${col}`);
                if (cell) {
                    cell.value = '';
                    cell.className = 'cell';
                }
            }
        }
    };

    const buildSteps = (boardState) => {
        const steps = [];

        function dfs(boardCopy) {
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (boardCopy[row][col] === 0) {
                        for (let num = 1; num <= 9; num++) {
                            if (isSafe(boardCopy, row, col, num)) {
                                steps.push({ row, col, num, backtrack: false });
                                boardCopy[row][col] = num;

                                if (dfs(boardCopy)) return true;

                                boardCopy[row][col] = 0;
                                steps.push({ row, col, num: '', backtrack: true });
                            }
                        }
                        return false;
                    }
                }
            }
            return true;
        }

        const boardCopy = JSON.parse(JSON.stringify(boardState));
        dfs(boardCopy);
        setSolvingSteps(steps);
    };

    const doNextStep = () => {
        if (solvingSteps.length === 0) {
            setIsDisabled(prev => ({ ...prev, step: true }));
            alert("✅ Puzzle Solved (or no solution)");
            updateExplanation("✅ Puzzle Solved!");
            gsap.to(".cell", { backgroundColor: "#C8E6C9", duration: 0.5, stagger: 0.02 });
            return;
        }

        const step = solvingSteps[0];
        setSolvingSteps(prevSteps => prevSteps.slice(1));

        // Update board state for the current step
        const newBoard = [...board];
        newBoard[step.row][step.col] = step.num || 0;
        setBoard(newBoard);

        animateCell(step.row, step.col, step.num, step.backtrack ? 'backtracking' : 'solved');

        logMove(step.backtrack
            ? `Backtracking from (${step.row}, ${step.col})`
            : `Trying ${step.num} at (${step.row}, ${step.col})`);

        updateExplanation(step.backtrack
            ? `Dead end! Backtracking from (${step.row}, ${step.col})...`
            : `Trying number ${step.num} at (${step.row}, ${step.col})...`);
    };

    const handleStartClick = async () => {
        // Read input values from the grid
        const newBoard = Array.from({ length: 9 }, () => Array(9).fill(0));
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = document.getElementById(`cell-${row}-${col}`);
                if (cell) {
                    const val = parseInt(cell.value);
                    newBoard[row][col] = isNaN(val) ? 0 : val;
                }
            }
        }

        setBoard(newBoard);
        setStopSolving(false);
        setIsDisabled({
            start: true,
            reset: true,
            step: true
        });
        updateExplanation("Starting to solve...");

        const solved = await solveSudoku([...newBoard]);

        if (solved) {
            alert("✅ Puzzle Solved!");
            updateExplanation("✅ Puzzle Solved!");
        } else if (!stopSolving) {
            alert("❌ No solution found.");
            updateExplanation("❌ No solution found.");
        }

        setIsDisabled({
            start: false,
            reset: false,
            step: false
        });
    };

    const handleStepClick = () => {
        if (!isStepping) {
            const newBoard = Array.from({ length: 9 }, () => Array(9).fill(0));
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    const cell = document.getElementById(`cell-${row}-${col}`);
                    if (cell) {
                        const val = parseInt(cell.value);
                        newBoard[row][col] = isNaN(val) ? 0 : val;
                    }
                }
            }
            setBoard(newBoard);
            buildSteps(newBoard);
            setIsStepping(true);
        }
        doNextStep();
    };

    const handleCellChange = (row, col, value) => {
        const newBoard = [...board];
        newBoard[row][col] = value;
        setBoard(newBoard);
    };

    const renderGrid = () => {
        const grid = [];
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                grid.push(
                    <input
                        key={`${row}-${col}`}
                        id={`cell-${row}-${col}`}
                        type="text"
                        maxLength="1"
                        className="cell"
                        onChange={(e) => {
                            let value = parseInt(e.target.value);
                            if (isNaN(value) || value < 1 || value > 9) {
                                e.target.value = '';
                                handleCellChange(row, col, 0);
                            } else {
                                handleCellChange(row, col, value);
                            }
                        }}
                    />
                );
            }
        }
        return grid;
    };

    return (
        <div className="sudoku-container">
            <h1>Sudoku Solver</h1>
            <div id="explanation-box">{explanation}</div>

            <div id="sudoku-grid">
                {renderGrid()}
            </div>

            <div id="education-section">
                <h2>What is Backtracking?</h2>
                <p>Backtracking is a way to solve problems by trying different options. If a choice leads to a mistake, you undo it and try another. It's like exploring a maze — if you hit a dead end, you turn around and try a new path!</p>

                <h2>Using Backtracking to Solve Sudoku</h2>
                <p>When solving Sudoku, the computer tries to fill a number. If it realizes later that no numbers work, it erases (backtracks) and tries the next option. This helps find the correct solution step-by-step!</p>
            </div>

            <div id="buttons">
                <button
                    id="start-btn"
                    onClick={handleStartClick}
                    disabled={isDisabled.start}
                >
                    Start
                </button>
                <button
                    id="reset-btn"
                    onClick={resetBoard}
                    disabled={isDisabled.reset}
                >
                    Reset
                </button>
                <button
                    id="step-btn"
                    onClick={handleStepClick}
                    disabled={isDisabled.step}
                >
                    Next Step
                </button>
            </div>

            <div id="speed-control">
                <label htmlFor="speed-slider">Speed:</label>
                <input
                    type="range"
                    id="speed-slider"
                    min="10"
                    max="200"
                    value={speed}
                    onChange={(e) => setSpeed(parseInt(e.target.value))}
                />
            </div>

            <div id="move-stack" ref={moveStackRef}>
                {moveLog.map((move, index) => (
                    <div key={index}>{move}</div>
                ))}
            </div>
        </div>
    );
};

export default SudokuSolver;