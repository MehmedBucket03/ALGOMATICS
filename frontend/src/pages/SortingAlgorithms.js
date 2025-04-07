import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './SortingAlgorithms.css';

const AlgorithmsExplorer = () => {
    const [array, setArray] = useState([]);
    const [currentAlgorithm, setCurrentAlgorithm] = useState(null);
    const [isSorting, setIsSorting] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const sortingIntervalRef = useRef(null);
    const sortingStepRef = useRef(0);
    const arraySize = 15;

    // Algorithm information object
    const algorithmDescriptions = {
        bubble: {
            name: "Bubble Sort",
            description: "Bubble Sort works by repeatedly stepping through the list, comparing adjacent elements and swapping them if they are in the wrong order. The process is repeated until the list is sorted. Time Complexity: O(n²) in worst and average cases.",
            code: `function bubbleSort(arr) {
  let len = arr.length;
  for (let i = 0; i < len; i++) {
    for (let j = 0; j < len - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        // Swap elements
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`
        },
        insertion: {
            name: "Insertion Sort",
            description: "Insertion Sort builds the final sorted array one item at a time. It takes each element from the unsorted part and inserts it into its correct position in the sorted part. Time Complexity: O(n²) in worst and average cases, but can be O(n) in best case.",
            code: `function insertionSort(arr) {
  let len = arr.length;
  for (let i = 1; i < len; i++) {
    let current = arr[i];
    let j = i - 1;
    
    while (j >= 0 && arr[j] > current) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = current;
  }
  return arr;
}`
        },
        selection: {
            name: "Selection Sort",
            description: "Selection Sort works by repeatedly finding the minimum element from the unsorted part of the array and putting it at the beginning of the unsorted part. Time Complexity: O(n²) in all cases.",
            code: `function selectionSort(arr) {
  let len = arr.length;
  for (let i = 0; i < len; i++) {
    let min = i;
    
    for (let j = i + 1; j < len; j++) {
      if (arr[j] < arr[min]) {
        min = j;
      }
    }
    
    if (min !== i) {
      [arr[i], arr[min]] = [arr[min], arr[i]];
    }
  }
  return arr;
}`
        },
        quick: {
            name: "Quick Sort",
            description: "Quick Sort is a divide-and-conquer algorithm that picks a 'pivot' element and partitions the array around it. All elements smaller than the pivot go to the left, and all greater elements go to the right. This process is then repeated on the sub-arrays. Time Complexity: O(n log n) on average, O(n²) in worst case.",
            code: `function quickSort(arr, left = 0, right = arr.length - 1) {
  if (left < right) {
    const pivotIndex = partition(arr, left, right);
    
    quickSort(arr, left, pivotIndex - 1);
    quickSort(arr, pivotIndex + 1, right);
  }
  return arr;
}

function partition(arr, left, right) {
  const pivot = arr[right];
  let i = left - 1;
  
  for (let j = left; j < right; j++) {
    if (arr[j] <= pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  
  [arr[i + 1], arr[right]] = [arr[right], arr[i + 1]];
  return i + 1;
}`
        }
    };

    // Initialize on component mount
    useEffect(() => {
        generateNewArray();
        return () => {
            if (sortingIntervalRef.current) {
                clearInterval(sortingIntervalRef.current);
            }
        };
    }, []);

    // Generate a new random array
    const generateNewArray = () => {
        const newArray = [];
        for (let i = 0; i < arraySize; i++) {
            newArray.push(Math.floor(Math.random() * 100) + 1);
        }
        setArray(newArray);
        resetSort();
    };

    // Show algorithm information
    const showAlgorithm = (algorithm) => {
        setCurrentAlgorithm(algorithm);
        resetSort();
    };

    // Start the sorting animation
    const startSort = () => {
        if (!currentAlgorithm || sortingIntervalRef.current) return;
        setIsSorting(true);
        setIsPaused(false);

        // Reset elements state
        const elements = document.querySelectorAll('.array-element');
        elements.forEach(el => {
            el.classList.remove('comparing', 'sorted');
        });

        // Animation based on current algorithm
        switch (currentAlgorithm) {
            case 'bubble':
                animateBubbleSort();
                break;
            case 'insertion':
                animateInsertionSort();
                break;
            case 'selection':
                animateSelectionSort();
                break;
            case 'quick':
                animateQuickSort();
                break;
            default:
                break;
        }
    };

    // Pause the sorting animation
    const pauseSort = () => {
        setIsPaused(true);
    };

    // Reset the sorting state
    const resetSort = () => {
        if (sortingIntervalRef.current) {
            clearInterval(sortingIntervalRef.current);
            sortingIntervalRef.current = null;
        }
        setIsSorting(false);
        setIsPaused(false);
        sortingStepRef.current = 0;

        // Reset any visual classes
        const elements = document.querySelectorAll('.array-element');
        if (elements.length) {
            elements.forEach(el => {
                el.classList.remove('comparing', 'sorted');
            });
        }
    };

    // Bubble Sort Animation
    const animateBubbleSort = () => {
        let i = 0;
        let j = 0;
        const arrCopy = [...array];
        const len = arrCopy.length;

        sortingIntervalRef.current = setInterval(() => {
            if (isPaused) return;

            const elements = document.querySelectorAll('.array-element');

            // Remove previous comparison highlighting
            elements.forEach(el => el.classList.remove('comparing'));

            if (i < len) {
                if (j < len - i - 1) {
                    // Highlight comparing elements
                    elements[j].classList.add('comparing');
                    elements[j + 1].classList.add('comparing');

                    if (arrCopy[j] > arrCopy[j + 1]) {
                        // Swap if needed
                        [arrCopy[j], arrCopy[j + 1]] = [arrCopy[j + 1], arrCopy[j]];
                        setArray([...arrCopy]);
                    }

                    j++;
                } else {
                    // Mark current largest element as sorted
                    elements[len - i - 1].classList.add('sorted');
                    j = 0;
                    i++;
                }
            } else {
                // Sorting complete
                clearInterval(sortingIntervalRef.current);
                sortingIntervalRef.current = null;
                setIsSorting(false);

                // Mark all as sorted
                elements.forEach(el => el.classList.add('sorted'));
            }
        }, 100);
    };

    // Insertion Sort Animation
    const animateInsertionSort = () => {
        let i = 1;
        let j;
        let current;
        const arrCopy = [...array];
        const len = arrCopy.length;
        let state = 'init'; // States: 'init', 'comparing', 'shifting'

        sortingIntervalRef.current = setInterval(() => {
            if (isPaused) return;

            const elements = document.querySelectorAll('.array-element');

            if (i < len) {
                if (state === 'init') {
                    // Initialize for this step
                    j = i - 1;
                    current = arrCopy[i];
                    state = 'comparing';

                    // Remove previous highlighting
                    elements.forEach(el => el.classList.remove('comparing'));
                    elements[i].classList.add('comparing');
                } else if (state === 'comparing') {
                    if (j >= 0 && arrCopy[j] > current) {
                        // Highlight comparing elements
                        elements.forEach(el => el.classList.remove('comparing'));
                        elements[j].classList.add('comparing');
                        elements[j + 1].classList.add('comparing');

                        // Shift element
                        arrCopy[j + 1] = arrCopy[j];

                        setArray([...arrCopy]);
                        j--;
                    } else {
                        // Found correct position
                        arrCopy[j + 1] = current;
                        setArray([...arrCopy]);

                        // Mark sorted elements
                        for (let k = 0; k <= i; k++) {
                            elements[k].classList.add('sorted');
                        }

                        // Move to next element
                        i++;
                        state = 'init';
                    }
                }
            } else {
                // Sorting complete
                clearInterval(sortingIntervalRef.current);
                sortingIntervalRef.current = null;
                setIsSorting(false);

                // Mark all as sorted
                elements.forEach(el => el.classList.add('sorted'));
            }
        }, 100);
    };

    // Selection Sort Animation
    const animateSelectionSort = () => {
        let i = 0;
        let j = i + 1;
        let min = i;
        const arrCopy = [...array];
        const len = arrCopy.length;

        sortingIntervalRef.current = setInterval(() => {
            if (isPaused) return;

            const elements = document.querySelectorAll('.array-element');

            if (i < len - 1) {
                // Remove previous comparison highlighting
                elements.forEach(el => el.classList.remove('comparing'));
                elements[min].classList.add('comparing'); // Current min

                if (j < len) {
                    elements[j].classList.add('comparing');

                    if (arrCopy[j] < arrCopy[min]) {
                        // Update min
                        elements[min].classList.remove('comparing');
                        min = j;
                        elements[min].classList.add('comparing');
                    }

                    j++;
                } else {
                    // Swap if needed
                    if (min !== i) {
                        [arrCopy[i], arrCopy[min]] = [arrCopy[min], arrCopy[i]];
                        setArray([...arrCopy]);
                    }

                    // Mark current element as sorted
                    elements[i].classList.add('sorted');
                    elements[i].classList.remove('comparing');

                    // Move to next element
                    i++;
                    j = i + 1;
                    min = i;
                }
            } else {
                // Mark last element as sorted
                elements[len - 1].classList.add('sorted');

                // Sorting complete
                clearInterval(sortingIntervalRef.current);
                sortingIntervalRef.current = null;
                setIsSorting(false);
            }
        }, 100);
    };

    // Quick Sort Animation (simplified version)
    const animateQuickSort = () => {
        // Create steps for visualization
        const arrCopy = [...array];
        const steps = [];

        // Helper functions to track steps
        function quickSortWithSteps(arr, left = 0, right = arr.length - 1) {
            if (left < right) {
                const pivotIndex = partitionWithSteps(arr, left, right, steps);
                quickSortWithSteps(arr, left, pivotIndex - 1);
                quickSortWithSteps(arr, pivotIndex + 1, right);
            }
            return arr;
        }

        function partitionWithSteps(arr, left, right, steps) {
            const pivot = arr[right];
            let i = left - 1;

            for (let j = left; j < right; j++) {
                steps.push({
                    comparing: [j, right],
                    array: [...arr]
                });

                if (arr[j] <= pivot) {
                    i++;
                    [arr[i], arr[j]] = [arr[j], arr[i]];
                    if (i !== j) {
                        steps.push({
                            swapped: [i, j],
                            array: [...arr]
                        });
                    }
                }
            }

            [arr[i + 1], arr[right]] = [arr[right], arr[i + 1]];
            steps.push({
                swapped: [i + 1, right],
                array: [...arr],
                pivotPlaced: i + 1
            });

            return i + 1;
        }

        // Generate steps
        quickSortWithSteps(arrCopy);

        // Animate the steps
        sortingStepRef.current = 0;

        sortingIntervalRef.current = setInterval(() => {
            if (isPaused) return;

            if (sortingStepRef.current < steps.length) {
                const step = steps[sortingStepRef.current];
                const elements = document.querySelectorAll('.array-element');

                // Remove previous highlighting
                elements.forEach(el => el.classList.remove('comparing', 'sorted'));

                // Update array
                setArray([...step.array]);

                // Highlight comparing elements
                if (step.comparing) {
                    step.comparing.forEach(index => {
                        elements[index].classList.add('comparing');
                    });
                }

                // Highlight swapped elements
                if (step.swapped) {
                    step.swapped.forEach(index => {
                        elements[index].classList.add('comparing');
                    });
                }

                // Mark pivot as placed
                if (step.pivotPlaced !== undefined) {
                    elements[step.pivotPlaced].classList.add('sorted');
                }

                sortingStepRef.current++;
            } else {
                // Sorting complete
                clearInterval(sortingIntervalRef.current);
                sortingIntervalRef.current = null;
                setIsSorting(false);

                // Mark all as sorted
                const elements = document.querySelectorAll('.array-element');
                elements.forEach(el => el.classList.add('sorted'));
            }
        }, 100);
    };

    return (
        <div className="explorer-container">
            <div className="floating-pixels">
                <div className="floating-pixel p1"></div>
                <div className="floating-pixel p2"></div>
                <div className="floating-pixel p3"></div>
                <div className="floating-pixel p4"></div>
            </div>

            <header className="header-bg">
                <nav>
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/math" className="nav-link">Math</Link>
                    <Link to="/algorithms" className="nav-link">Algorithms</Link>
                    <Link to="/about" className="nav-link">About</Link>
                </nav>
            </header>

            <div className="container">
                <div className="pixel-window">
                    <div className="pixel-window-header">
                        <div className="pixel-dots">
                            <span className="pixel-dot red"></span>
                            <span className="pixel-dot yellow"></span>
                            <span className="pixel-dot green"></span>
                        </div>
                        <div className="pixel-title">ALGORITHMS.EXE</div>
                    </div>

                    <div className="pixel-window-body">
                        <h1>ALGORITHMS EXPLORER</h1>

                        <div className="menu" id="mainMenu">
                            <button
                                onClick={() => showAlgorithm('bubble')}
                                className={currentAlgorithm === 'bubble' ? 'active' : ''}
                            >
                                BUBBLE SORT
                            </button>
                            <button
                                onClick={() => showAlgorithm('insertion')}
                                className={currentAlgorithm === 'insertion' ? 'active' : ''}
                            >
                                INSERTION SORT
                            </button>
                            <button
                                onClick={() => showAlgorithm('selection')}
                                className={currentAlgorithm === 'selection' ? 'active' : ''}
                            >
                                SELECTION SORT
                            </button>
                            <button
                                onClick={() => showAlgorithm('quick')}
                                className={currentAlgorithm === 'quick' ? 'active' : ''}
                            >
                                QUICK SORT
                            </button>
                        </div>

                        <div className="algorithm-container">
                            <div className="array-display">
                                {array.map((value, idx) => (
                                    <div
                                        className="array-element"
                                        key={idx}
                                        style={{ height: `${value * 1.5 + 20}px` }}
                                    >
                                        <div className="array-value">{value}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="controls">
                                <button onClick={generateNewArray} disabled={isSorting && !isPaused}>NEW ARRAY</button>
                                <button onClick={startSort} disabled={isSorting || !currentAlgorithm}>START</button>
                                <button onClick={pauseSort} disabled={!isSorting || isPaused}>PAUSE</button>
                                <button onClick={resetSort} disabled={!isSorting && !isPaused}>RESET</button>
                            </div>

                            <div className="algorithm-info">
                                {currentAlgorithm ? (
                                    <>
                                        <h3>{algorithmDescriptions[currentAlgorithm].name}</h3>
                                        <p>{algorithmDescriptions[currentAlgorithm].description}</p>
                                    </>
                                ) : (
                                    <p>Select an algorithm from the menu above to see it in action.</p>
                                )}
                            </div>

                            <div className="code-display">
                                {currentAlgorithm && algorithmDescriptions[currentAlgorithm].code}
                            </div>
                        </div>
                    </div>

                    <div className="pixel-window-footer">
                        <div className="pixel-status">SYSTEM READY</div>
                        <div className="pixel-memory">MEM: 640K</div>
                    </div>
                </div>
            </div>

            <footer className="footer-bg">
                <p>© 2025 ALGOMATICS • ALL RIGHTS RESERVED</p>
            </footer>
        </div>
    );
};

export default AlgorithmsExplorer;