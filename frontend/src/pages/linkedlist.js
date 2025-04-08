import React, { useState, useEffect } from 'react';
import './linkedlist.css';

const LinkedList = () => {
    // State for linked list operations
    const [nodes, setNodes] = useState([]);
    const [newValue, setNewValue] = useState('');
    const [indexToInsert, setIndexToInsert] = useState(0);
    const [indexToDelete, setIndexToDelete] = useState(0);
    const [activeTab, setActiveTab] = useState('operations');
    const [selectedOperation, setSelectedOperation] = useState(null);
    const [operationSteps, setOperationSteps] = useState([]);
    const [currentAnimation, setCurrentAnimation] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');

    // Initialize with example linked list
    useEffect(() => {
        resetList();
    }, []);

    // Reset list to default example
    const resetList = () => {
        setNodes([
            { value: 10, next: 1 },
            { value: 20, next: 2 },
            { value: 30, next: 3 },
            { value: 40, next: null }
        ]);
        setNewValue('');
        setIndexToInsert(0);
        setIndexToDelete(0);
        setCurrentAnimation(null);
        setErrorMessage('');
    };

    // Add a node to the end of the list
    const handleAppend = () => {
        if (!newValue.trim()) {
            setErrorMessage('Please enter a value');
            return;
        }

        setErrorMessage('');
        const value = parseInt(newValue) || 0;

        // Animation steps for append
        const steps = [
            { type: 'message', content: `Step 1: Create a new node with value ${value}` },
            { type: 'message', content: 'Step 2: Find the last node in the list' },
            { type: 'message', content: `Step 3: Set the last node's "next" pointer to the new node` },
            { type: 'message', content: 'Complete: New node added to the end of the list' }
        ];

        setOperationSteps(steps);
        setCurrentStep(0);
        setSelectedOperation('append');
        setCurrentAnimation('append');
        setActiveTab('steps');

        // Simulating animation steps with timeouts
        setTimeout(() => {
            setCurrentStep(1);
            setTimeout(() => {
                setCurrentStep(2);
                setTimeout(() => {
                    // Actually perform the operation after showing steps
                    setNodes(prevNodes => {
                        const newNodeList = [...prevNodes];
                        const newNodeIndex = newNodeList.length;

                        // If list is not empty, update the last node's next pointer
                        if (newNodeList.length > 0) {
                            const lastIndex = newNodeList.length - 1;
                            newNodeList[lastIndex] = {
                                ...newNodeList[lastIndex],
                                next: newNodeIndex
                            };
                        }

                        // Add the new node
                        newNodeList.push({
                            value: value,
                            next: null
                        });

                        return newNodeList;
                    });
                    setNewValue('');
                    setCurrentStep(3);
                    setTimeout(() => {
                        setCurrentAnimation(null);
                    }, 1000);
                }, 1000);
            }, 1000);
        }, 1000);
    };

    // Insert a node at a specific position
    const handleInsert = () => {
        if (!newValue.trim()) {
            setErrorMessage('Please enter a value');
            return;
        }

        if (indexToInsert < 0 || indexToInsert > nodes.length) {
            setErrorMessage(`Invalid index. Must be between 0 and ${nodes.length}`);
            return;
        }

        setErrorMessage('');
        const value = parseInt(newValue) || 0;

        // Animation steps for insert
        const steps = [
            { type: 'message', content: `Step 1: Create a new node with value ${value}` },
            { type: 'message', content: `Step 2: Find the node at position ${indexToInsert > 0 ? indexToInsert - 1 : 'HEAD'}` },
            { type: 'message', content: `Step 3: Set the new node's "next" pointer to ${indexToInsert < nodes.length ? `node at index ${indexToInsert}` : 'null'}` },
            { type: 'message', content: `Step 4: Update the previous node's "next" pointer to the new node` },
            { type: 'message', content: 'Complete: New node inserted at the specified position' }
        ];

        setOperationSteps(steps);
        setCurrentStep(0);
        setSelectedOperation('insert');
        setCurrentAnimation('insert');
        setActiveTab('steps');

        // Simulating animation steps with timeouts
        let stepTimer = 1000;
        setTimeout(() => {
            setCurrentStep(1);
            setTimeout(() => {
                setCurrentStep(2);
                setTimeout(() => {
                    setCurrentStep(3);
                    setTimeout(() => {
                        // Actually perform the operation after showing steps
                        setNodes(prevNodes => {
                            const newNodeList = [...prevNodes];
                            const newNodeIndex = newNodeList.length;

                            // Special case for inserting at the beginning
                            if (indexToInsert === 0) {
                                newNodeList.push({
                                    value: value,
                                    next: newNodeList.length > 0 ? 0 : null
                                });

                                // Update all existing nodes' indices
                                for (let i = 0; i < newNodeList.length - 1; i++) {
                                    if (newNodeList[i].next !== null) {
                                        newNodeList[i] = {
                                            ...newNodeList[i],
                                            next: newNodeList[i].next + 1
                                        };
                                    }
                                }

                                // Swap the new node to the beginning
                                const temp = newNodeList[newNodeList.length - 1];
                                for (let i = newNodeList.length - 1; i > 0; i--) {
                                    newNodeList[i] = newNodeList[i - 1];
                                }
                                newNodeList[0] = temp;
                            }
                            // Inserting in the middle or end
                            else {
                                // Add new node to the end temporarily
                                newNodeList.push({
                                    value: value,
                                    next: indexToInsert < newNodeList.length ? indexToInsert : null
                                });

                                // Update the previous node's next pointer
                                if (indexToInsert > 0 && indexToInsert <= newNodeList.length - 1) {
                                    newNodeList[indexToInsert - 1] = {
                                        ...newNodeList[indexToInsert - 1],
                                        next: newNodeIndex
                                    };
                                }

                                // If inserting in the middle, need to rearrange nodes
                                if (indexToInsert < newNodeList.length - 1) {
                                    // This is a simplified version - in a real implementation
                                    // you'd need to update all the next pointers properly
                                    const temp = newNodeList[newNodeList.length - 1];
                                    for (let i = newNodeList.length - 1; i > indexToInsert; i--) {
                                        newNodeList[i] = newNodeList[i - 1];
                                    }
                                    newNodeList[indexToInsert] = temp;

                                    // Fix next pointers after shuffle
                                    for (let i = 0; i < newNodeList.length; i++) {
                                        if (newNodeList[i].next !== null && newNodeList[i].next >= indexToInsert) {
                                            newNodeList[i] = {
                                                ...newNodeList[i],
                                                next: newNodeList[i].next + 1
                                            };
                                        }
                                    }
                                }
                            }

                            return newNodeList;
                        });

                        setNewValue('');
                        setCurrentStep(4);
                        setTimeout(() => {
                            setCurrentAnimation(null);
                        }, 1000);
                    }, stepTimer);
                }, stepTimer);
            }, stepTimer);
        }, stepTimer);
    };

    // Delete a node at a specific position
    const handleDelete = () => {
        if (nodes.length === 0) {
            setErrorMessage('The list is empty');
            return;
        }

        if (indexToDelete < 0 || indexToDelete >= nodes.length) {
            setErrorMessage(`Invalid index. Must be between 0 and ${nodes.length - 1}`);
            return;
        }

        setErrorMessage('');

        // Animation steps for delete
        const steps = [
            { type: 'message', content: `Step 1: Find the node at position ${indexToDelete > 0 ? indexToDelete - 1 : 'HEAD'}` },
            { type: 'message', content: `Step 2: Store reference to the node to be deleted (at index ${indexToDelete})` },
            { type: 'message', content: `Step 3: Update the previous node's "next" pointer to skip the deleted node` },
            { type: 'message', content: 'Step 4: Remove the node from memory' },
            { type: 'message', content: 'Complete: Node deleted from the list' }
        ];

        setOperationSteps(steps);
        setCurrentStep(0);
        setSelectedOperation('delete');
        setCurrentAnimation('delete');
        setActiveTab('steps');

        // Simulating animation steps with timeouts
        let stepTimer = 1000;
        setTimeout(() => {
            setCurrentStep(1);
            setTimeout(() => {
                setCurrentStep(2);
                setTimeout(() => {
                    setCurrentStep(3);
                    setTimeout(() => {
                        // Actually perform the deletion
                        setNodes(prevNodes => {
                            const newNodeList = [...prevNodes];

                            // Special case for deleting the first node
                            if (indexToDelete === 0) {
                                // If there's only one node, just clear the list
                                if (newNodeList.length === 1) {
                                    return [];
                                }

                                // Otherwise, remove the first node and update all next pointers
                                const newList = newNodeList.slice(1);
                                for (let i = 0; i < newList.length; i++) {
                                    if (newList[i].next !== null) {
                                        newList[i] = {
                                            ...newList[i],
                                            next: newList[i].next > 0 ? newList[i].next - 1 : null
                                        };
                                    }
                                }
                                return newList;
                            }
                            // Deleting from the middle or end
                            else {
                                // Update the previous node's next pointer
                                if (indexToDelete > 0) {
                                    newNodeList[indexToDelete - 1] = {
                                        ...newNodeList[indexToDelete - 1],
                                        next: newNodeList[indexToDelete].next
                                    };
                                }

                                // Remove the node
                                newNodeList.splice(indexToDelete, 1);

                                // Update all next pointers after the deleted node
                                for (let i = 0; i < newNodeList.length; i++) {
                                    if (newNodeList[i].next !== null && newNodeList[i].next > indexToDelete) {
                                        newNodeList[i] = {
                                            ...newNodeList[i],
                                            next: newNodeList[i].next - 1
                                        };
                                    } else if (newNodeList[i].next === indexToDelete) {
                                        newNodeList[i] = {
                                            ...newNodeList[i],
                                            next: null
                                        };
                                    }
                                }

                                return newNodeList;
                            }
                        });

                        setCurrentStep(4);
                        setTimeout(() => {
                            setCurrentAnimation(null);
                        }, 1000);
                    }, stepTimer);
                }, stepTimer);
            }, stepTimer);
        }, stepTimer);
    };

    // Search for a specific value
    const handleSearch = () => {
        if (!newValue.trim()) {
            setErrorMessage('Please enter a value to search');
            return;
        }

        setErrorMessage('');
        const value = parseInt(newValue) || 0;

        // Animation steps for search
        const steps = [
            { type: 'message', content: `Step 1: Start at the head of the list` },
            { type: 'message', content: `Step 2: Check each node for value ${value}` },
            { type: 'message', content: `Step 3: Continue until value is found or end of list is reached` }
        ];

        setOperationSteps(steps);
        setCurrentStep(0);
        setSelectedOperation('search');
        setCurrentAnimation('search');
        setActiveTab('steps');

        // Find the value
        let foundIndex = -1;
        nodes.forEach((node, index) => {
            if (node.value === value && foundIndex === -1) {
                foundIndex = index;
            }
        });

        // Simulating animation steps with timeouts
        setTimeout(() => {
            setCurrentStep(1);
            setTimeout(() => {
                setCurrentStep(2);
                setTimeout(() => {
                    // Add result to steps
                    if (foundIndex !== -1) {
                        setOperationSteps([...steps, {
                            type: 'message',
                            content: `Complete: Value ${value} found at index ${foundIndex}`
                        }]);
                    } else {
                        setOperationSteps([...steps, {
                            type: 'message',
                            content: `Complete: Value ${value} not found in the list`
                        }]);
                    }
                    setCurrentStep(3);
                    setTimeout(() => {
                        setCurrentAnimation(null);
                    }, 1000);
                }, 1000);
            }, 1000);
        }, 1000);
    };

    // Generate explanation for a specific operation
    const getOperationExplanation = (operation) => {
        switch(operation) {
            case 'append':
                return {
                    title: 'Append Operation',
                    description: 'Adds a new node to the end of the linked list.',
                    timeComplexity: 'O(n) - must traverse to the end of the list',
                    spaceComplexity: 'O(1) - only creates one new node',
                    steps: [
                        'Create a new node with the given value',
                        'If the list is empty, set the head to the new node',
                        'Otherwise, traverse to the end of the list',
                        'Set the last node\'s "next" pointer to the new node'
                    ]
                };
            case 'insert':
                return {
                    title: 'Insert Operation',
                    description: 'Inserts a new node at a specific position in the linked list.',
                    timeComplexity: 'O(n) - may need to traverse to find the insertion point',
                    spaceComplexity: 'O(1) - only creates one new node',
                    steps: [
                        'Create a new node with the given value',
                        'If inserting at the beginning, set the new node\'s "next" to the current head and update head',
                        'Otherwise, traverse to the node before the insertion point',
                        'Set the new node\'s "next" to the current node\'s "next"',
                        'Set the current node\'s "next" to the new node'
                    ]
                };
            case 'delete':
                return {
                    title: 'Delete Operation',
                    description: 'Removes a node at a specific position from the linked list.',
                    timeComplexity: 'O(n) - may need to traverse to find the node to delete',
                    spaceComplexity: 'O(1) - no additional space required',
                    steps: [
                        'If deleting the head, set head to head.next',
                        'Otherwise, traverse to the node before the deletion point',
                        'Set the previous node\'s "next" to the deleted node\'s "next"',
                        'Remove the node (garbage collection handles memory cleanup)'
                    ]
                };
            case 'search':
                return {
                    title: 'Search Operation',
                    description: 'Finds a node with a specific value in the linked list.',
                    timeComplexity: 'O(n) - may need to check every node in the worst case',
                    spaceComplexity: 'O(1) - no additional space required',
                    steps: [
                        'Start at the head of the list',
                        'For each node, check if its value matches the search value',
                        'If a match is found, return the node/index',
                        'If the end of the list is reached without finding a match, return not found'
                    ]
                };
            default:
                return {
                    title: 'Linked List Operations',
                    description: 'Select an operation to see its details.'
                };
        }
    };

    // Render the nodes of the linked list
    const renderNodes = () => {
        if (nodes.length === 0) {
            return (
                <div className="pixel-empty-list">
                    List is empty
                </div>
            );
        }

        return (
            <div className="pixel-list-container">
                {nodes.map((node, index) => (
                    <div key={index} className={`pixel-node ${currentAnimation === 'search' && parseInt(newValue) === node.value ? 'pixel-node-highlight' : ''} ${currentAnimation === 'delete' && index === indexToDelete ? 'pixel-node-delete' : ''} ${currentAnimation === 'insert' && index === indexToInsert ? 'pixel-node-insert' : ''}`}>
                        <div className="pixel-node-index">[{index}]</div>
                        <div className="pixel-node-value">{node.value}</div>
                        <div className="pixel-node-next">
                            {node.next !== null ? (
                                <>
                                    <span className="pixel-arrow">→</span>
                                    <span className="pixel-next-index">{node.next}</span>
                                </>
                            ) : (
                                <span className="pixel-null">NULL</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="math-container">
            <div className="pixel-content">
                {/* Header */}
                <div className="pixel-window pixel-header">
                    <div className="pixel-window-header">
                        <div className="pixel-dots">
                            <div className="pixel-dot red"></div>
                            <div className="pixel-dot yellow"></div>
                            <div className="pixel-dot green"></div>
                        </div>
                        <div className="pixel-title">LINKED-LIST.EXE</div>
                        <div className="pixel-version">v1.0.1</div>
                    </div>
                    <div className="pixel-window-body">
                        <h1 className="pixel-main-title">LINKED LIST VISUALIZER</h1>
                        <p className="pixel-description">
                            <span className="pixel-prompt">&gt;</span> Visualize and understand linked list operations with this interactive tool
                        </p>
                    </div>
                </div>

                <div className="pixel-content-grid">
                    {/* Control Panel */}
                    <div className="pixel-sidebar">
                        <div className="pixel-window pixel-input-box">
                            <div className="pixel-window-header">
                                <div className="pixel-title">
                                    <span className="pixel-icon">⌨️</span> OPERATIONS
                                </div>
                            </div>
                            <div className="pixel-window-body">
                                <div className="pixel-form-group">
                                    <label className="pixel-label">NODE VALUE:</label>
                                    <input
                                        type="number"
                                        value={newValue}
                                        onChange={(e) => setNewValue(e.target.value)}
                                        className="pixel-input"
                                        placeholder="ENTER A NUMBER"
                                    />
                                </div>

                                <div className="pixel-button-grid">
                                    <button onClick={handleAppend} className="pixel-button">APPEND</button>
                                    <button onClick={handleSearch} className="pixel-button">SEARCH</button>
                                </div>

                                <div className="pixel-form-group-row">
                                    <div className="pixel-form-group">
                                        <label className="pixel-label">POSITION:</label>
                                        <input
                                            type="number"
                                            value={indexToInsert}
                                            onChange={(e) => setIndexToInsert(parseInt(e.target.value) || 0)}
                                            className="pixel-input pixel-input-small"
                                            min="0"
                                        />
                                    </div>
                                    <button onClick={handleInsert} className="pixel-button">INSERT</button>
                                </div>

                                <div className="pixel-form-group-row">
                                    <div className="pixel-form-group">
                                        <label className="pixel-label">POSITION:</label>
                                        <input
                                            type="number"
                                            value={indexToDelete}
                                            onChange={(e) => setIndexToDelete(parseInt(e.target.value) || 0)}
                                            className="pixel-input pixel-input-small"
                                            min="0"
                                        />
                                    </div>
                                    <button onClick={handleDelete} className="pixel-button">DELETE</button>
                                </div>

                                <button onClick={resetList} className="pixel-button pixel-reset-button">RESET</button>

                                {errorMessage && (
                                    <div className="pixel-error-message">
                                        {errorMessage}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Operations Info */}
                        <div className="pixel-window pixel-info-box">
                            <div className="pixel-window-header">
                                <div className="pixel-title">
                                    <span className="pixel-icon">ℹ️</span> OPERATIONS INFO
                                </div>
                            </div>
                            <div className="pixel-window-body">
                                <div className="pixel-button-grid">
                                    <button
                                        onClick={() => {
                                            setSelectedOperation('append');
                                            setActiveTab('explanation');
                                        }}
                                        className={`pixel-tab-btn ${selectedOperation === 'append' && activeTab === 'explanation' ? 'active' : ''}`}
                                    >
                                        APPEND
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedOperation('insert');
                                            setActiveTab('explanation');
                                        }}
                                        className={`pixel-tab-btn ${selectedOperation === 'insert' && activeTab === 'explanation' ? 'active' : ''}`}
                                    >
                                        INSERT
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedOperation('delete');
                                            setActiveTab('explanation');
                                        }}
                                        className={`pixel-tab-btn ${selectedOperation === 'delete' && activeTab === 'explanation' ? 'active' : ''}`}
                                    >
                                        DELETE
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedOperation('search');
                                            setActiveTab('explanation');
                                        }}
                                        className={`pixel-tab-btn ${selectedOperation === 'search' && activeTab === 'explanation' ? 'active' : ''}`}
                                    >
                                        SEARCH
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Display Area */}
                    <div className="pixel-main-area">
                        {/* Visualization */}
                        <div className="pixel-window pixel-display-box">
                            <div className="pixel-window-header">
                                <div className="pixel-title">
                                    <span className="pixel-icon">🔗</span> LINKED LIST VISUALIZATION
                                </div>
                            </div>
                            <div className="pixel-window-body">
                                {renderNodes()}
                            </div>
                        </div>

                        {/* Tabs for different content */}
                        <div className="pixel-window pixel-content-box">
                            <div className="pixel-window-header">
                                <div className="pixel-tabs">
                                    <button
                                        onClick={() => setActiveTab('operations')}
                                        className={`pixel-tab ${activeTab === 'operations' ? 'active' : ''}`}
                                    >
                                        OVERVIEW
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('explanation')}
                                        className={`pixel-tab ${activeTab === 'explanation' ? 'active' : ''}`}
                                    >
                                        EXPLANATION
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('steps')}
                                        className={`pixel-tab ${activeTab === 'steps' ? 'active' : ''}`}
                                    >
                                        STEPS
                                    </button>
                                </div>
                            </div>

                            <div className="pixel-window-body">
                                {activeTab === 'operations' && (
                                    <div className="pixel-operations-overview">
                                        <h3 className="pixel-section-title">Linked List Operations</h3>
                                        <p>A linked list is a linear data structure where elements are not stored at contiguous memory locations.</p>
                                        <p>Each element (node) contains two items: the data and a reference to the next node.</p>

                                        <div className="pixel-operations-grid">
                                            <div className="pixel-operation-card">
                                                <h4 className="pixel-operation-title">Append</h4>
                                                <p>Add a new node to the end of the list</p>
                                            </div>
                                            <div className="pixel-operation-card">
                                                <h4 className="pixel-operation-title">Insert</h4>
                                                <p>Add a new node at a specific position</p>
                                            </div>
                                            <div className="pixel-operation-card">
                                                <h4 className="pixel-operation-title">Delete</h4>
                                                <p>Remove a node from the list</p>
                                            </div>
                                            <div className="pixel-operation-card">
                                                <h4 className="pixel-operation-title">Search</h4>
                                                <p>Find a node with a specific value</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'explanation' && (
                                    <div className="pixel-explanation">
                                        {selectedOperation ? (
                                            <div className="pixel-explanation-content">
                                                <h3 className="pixel-section-title">{getOperationExplanation(selectedOperation).title}</h3>
                                                <p>{getOperationExplanation(selectedOperation).description}</p>

                                                {getOperationExplanation(selectedOperation).timeComplexity && (
                                                    <div className="pixel-complexity">
                                                        <div className="pixel-complexity-item">
                                                            <span className="pixel-complexity-label">Time Complexity:</span>
                                                            <span className="pixel-complexity-value">{getOperationExplanation(selectedOperation).timeComplexity}</span>
                                                        </div>
                                                        <div className="pixel-complexity-item">
                                                            <span className="pixel-complexity-label">Space Complexity:</span>
                                                            <span className="pixel-complexity-value">{getOperationExplanation(selectedOperation).spaceComplexity}</span>
                                                        </div>
                                                    </div>
                                                )}

                                                {getOperationExplanation(selectedOperation).steps && (
                                                    <div className="pixel-steps-list">
                                                        <h4 className="pixel-steps-title">Algorithm Steps:</h4>
                                                        <ol className="pixel-step-list">
                                                            {getOperationExplanation(selectedOperation).steps.map((step, index) => (
                                                                <li key={index} className="pixel-step-item">{step}</li>
                                                            ))}
                                                        </ol>
                                                    </div>
                                                )}

                                            </div>
                                        ) : (
                                            <div className="pixel-explanation-empty">
                                                <p>Select an operation from the left panel to see its explanation</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'steps' && (
                                    <div className="pixel-steps-view">
                                        {operationSteps.length > 0 ? (
                                            <div className="pixel-steps-content">
                                                <h3 className="pixel-section-title">
                                                    {selectedOperation === 'append' ? 'Append Operation' :
                                                        selectedOperation === 'insert' ? 'Insert Operation' :
                                                            selectedOperation === 'delete' ? 'Delete Operation' :
                                                                'Search Operation'}
                                                </h3>

                                                <div className="pixel-animation-steps">
                                                    {operationSteps.map((step, index) => (
                                                        <div
                                                            key={index}
                                                            className={`pixel-animation-step ${index === currentStep ? 'pixel-current-step' : ''} ${index < currentStep ? 'pixel-completed-step' : ''}`}
                                                        >
                                                            {step.content}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="pixel-steps-empty">
                                                <p>Perform an operation to see its steps</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Code Example */}
                        <div className="pixel-window pixel-code-box">
                            <div className="pixel-window-header">
                                <div className="pixel-title">
                                    <span className="pixel-icon">📝</span> CODE EXAMPLE
                                </div>
                            </div>
                            <div className="pixel-window-body">
                                <div className="pixel-code">
                  <pre>
                    <code>
{`class Node {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
    this.size = 0;
  }
  
  // Add a node to the end
  append(value) {
    const newNode = new Node(value);
    
    // If list is empty
    if (!this.head) {
      this.head = newNode;
      return;
    }
    
    // Find the last node
    let current = this.head;
    while (current.next) {
      current = current.next;
    }
    
    // Add the new node
    current.next = newNode;
    this.size++;
  }
}`}
                    </code>
                  </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="pixel-footer">
                    <p>PixelMath Data Structures v1.0.1 • Made with &lt;/&gt; and 💜</p>
                </div>
            </div>
        </div>
    );
};

export default LinkedList;