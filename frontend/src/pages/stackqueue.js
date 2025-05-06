import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './stackqueue.css';

const saveProgressToFirestore = async (inputString) => {
    const user = auth.currentUser;
    if (!user) return;

    const topicId = 'stack-queue';
    const docRef = doc(db, 'users', user.uid);
    await setDoc(docRef, {
        lastTopicVisited: topicId,
        [`topics.${topicId}`]: {
            input: inputString,
            timestamp: new Date().toISOString()
        }
    }, { merge: true });
};

const StackQueuePage = () => {
    const [stack, setStack] = useState([]);
    const [queue, setQueue] = useState([]);
    const [stackInput, setStackInput] = useState('');
    const [queueInput, setQueueInput] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('stack');
    const [animation, setAnimation] = useState(null);

    // References to container elements for animations
    const stackRef = useRef(null);
    const queueRef = useRef(null);

    // Simulating loading effect to match the Algorithms page style
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    // Stack Operations
    const pushStack = () => {
        if (stackInput === '') return;

        setStack([...stack, stackInput]);
        setStackInput('');
        setAnimation({ type: 'push', item: stackInput });

        // Reset animation state after a delay
        setTimeout(() => {
            setAnimation(null);
        }, 500);
    };

    const popStack = () => {
        if (stack.length === 0) return;

        const lastItem = stack[stack.length - 1];
        setAnimation({ type: 'pop', item: lastItem });

        // Remove the item after animation delay
        setTimeout(() => {
            setStack(stack.slice(0, -1));
            setAnimation(null);
        }, 300);
    };

    const clearStack = () => {
        setStack([]);
    };

    // Queue Operations
    const enqueueQueue = () => {
        if (queueInput === '') return;

        setQueue([...queue, queueInput]);
        setQueueInput('');
        setAnimation({ type: 'enqueue', item: queueInput });

        // Reset animation state after a delay
        setTimeout(() => {
            setAnimation(null);
        }, 500);
    };

    const dequeueQueue = () => {
        if (queue.length === 0) return;

        const firstItem = queue[0];
        setAnimation({ type: 'dequeue', item: firstItem });

        // Remove the item after animation delay
        setTimeout(() => {
            setQueue(queue.slice(1));
            setAnimation(null);
        }, 300);
    };

    const clearQueue = () => {
        setQueue([]);
    };

    return (
        <div className="stack-queue-container">
            {/* Pixel grid background */}
            <div className="pixel-grid-overlay"></div>

            <div className="main-content">
                {isLoading ? (
                    <div className="loading-screen">
                        <div className="pixel-loading">
                            <div className="pixel-loading-text">LOADING DATA STRUCTURES</div>
                            <div className="pixel-loading-bar">
                                <div className="pixel-loading-progress"></div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="navigation-controls">
                            <Link to="/algorithms" className="back-button">
                                <span className="back-arrow">←</span> BACK TO ALGORITHMS
                            </Link>
                        </div>

                        <div className="pixel-window main-window">
                            <div className="pixel-window-header">
                                <div className="pixel-dots">
                                    <span className="pixel-dot red"></span>
                                    <span className="pixel-dot yellow"></span>
                                    <span className="pixel-dot green"></span>
                                </div>
                                <div className="pixel-title">STACK-QUEUE.DAT</div>
                                <div className="pixel-status-indicator">PROCESSING...</div>
                            </div>

                            <div className="pixel-window-body">
                                <h1 className="pixel-heading">STACK & QUEUE</h1>
                                <div className="terminal-text mb-6">
                                    <span className="prompt">$&gt;&nbsp;</span>
                                    <span className="typing-text">
                                        <span className="highlight">Stacks</span> and <span className="highlight">Queues</span> are linear data structures with different access patterns. A Stack follows Last-In-First-Out (LIFO) principle, while a Queue follows First-In-First-Out (FIFO) principle.
                                    </span>
                                </div>

                                <div className="tabs">
                                    <button
                                        className={`tab-button ${activeTab === 'stack' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('stack')}
                                    >
                                        STACK (LIFO)
                                    </button>
                                    <button
                                        className={`tab-button ${activeTab === 'queue' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('queue')}
                                    >
                                        QUEUE (FIFO)
                                    </button>
                                </div>

                                {activeTab === 'stack' ? (
                                    <div className="structure-container">
                                        <div className="structure-description">
                                            <h2 className="pixel-subheading">STACK OPERATIONS</h2>
                                            <p className="operation-text">
                                                A Stack follows the Last-In-First-Out (LIFO) principle. New elements are added to the top of the stack and elements are removed from the top.
                                            </p>
                                            <ul className="operation-list">
                                                <li><span className="operation-name">Push:</span> Add an element to the top</li>
                                                <li><span className="operation-name">Pop:</span> Remove the top element</li>
                                                <li><span className="operation-name">Peek:</span> View the top element without removing it</li>
                                            </ul>
                                        </div>

                                        <div className="structure-visualization">
                                            <div className="input-group">
                                                <input
                                                    type="text"
                                                    className="pixel-input"
                                                    placeholder="Enter value"
                                                    value={stackInput}
                                                    onChange={(e) => setStackInput(e.target.value)}
                                                />
                                                <button
                                                    className="pixel-button primary-button"
                                                    onClick={pushStack}
                                                >
                                                    PUSH
                                                </button>
                                            </div>

                                            <div className="control-buttons">
                                                <button
                                                    className="pixel-button secondary-button"
                                                    onClick={popStack}
                                                    disabled={stack.length === 0}
                                                >
                                                    POP
                                                </button>
                                                <button
                                                    className="pixel-button tertiary-button"
                                                    onClick={clearStack}
                                                    disabled={stack.length === 0}
                                                >
                                                    CLEAR
                                                </button>
                                            </div>

                                            <div className="stack-container" ref={stackRef}>
                                                <div className="stack-label">BOTTOM</div>
                                                <div className="stack-items">
                                                    {stack.map((item, index) => (
                                                        <div
                                                            key={index}
                                                            className={`stack-item ${
                                                                animation &&
                                                                animation.type === 'pop' &&
                                                                index === stack.length - 1 ? 'pop-animation' :
                                                                    animation &&
                                                                    animation.type === 'push' &&
                                                                    index === stack.length - 1 ? 'push-animation' : ''
                                                            }`}
                                                        >
                                                            {item}
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="stack-label">TOP</div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="structure-container">
                                        <div className="structure-description">
                                            <h2 className="pixel-subheading">QUEUE OPERATIONS</h2>
                                            <p className="operation-text">
                                                A Queue follows the First-In-First-Out (FIFO) principle. New elements are added to the rear of the queue and elements are removed from the front.
                                            </p>
                                            <ul className="operation-list">
                                                <li><span className="operation-name">Enqueue:</span> Add an element to the end</li>
                                                <li><span className="operation-name">Dequeue:</span> Remove the front element</li>
                                                <li><span className="operation-name">Peek:</span> View the front element without removing it</li>
                                            </ul>
                                        </div>

                                        <div className="structure-visualization">
                                            <div className="input-group">
                                                <input
                                                    type="text"
                                                    className="pixel-input"
                                                    placeholder="Enter value"
                                                    value={queueInput}
                                                    onChange={(e) => setQueueInput(e.target.value)}
                                                />
                                                <button
                                                    className="pixel-button primary-button"
                                                    onClick={enqueueQueue}
                                                >
                                                    ENQUEUE
                                                </button>
                                            </div>

                                            <div className="control-buttons">
                                                <button
                                                    className="pixel-button secondary-button"
                                                    onClick={dequeueQueue}
                                                    disabled={queue.length === 0}
                                                >
                                                    DEQUEUE
                                                </button>
                                                <button
                                                    className="pixel-button tertiary-button"
                                                    onClick={clearQueue}
                                                    disabled={queue.length === 0}
                                                >
                                                    CLEAR
                                                </button>
                                            </div>

                                            <div className="queue-visualization" ref={queueRef}>
                                                <div className="queue-label">FRONT</div>
                                                <div className="queue-items">
                                                    {queue.map((item, index) => (
                                                        <div
                                                            key={index}
                                                            className={`queue-item ${
                                                                animation &&
                                                                animation.type === 'dequeue' &&
                                                                index === 0 ? 'dequeue-animation' :
                                                                    animation &&
                                                                    animation.type === 'enqueue' &&
                                                                    index === queue.length - 1 ? 'enqueue-animation' : ''
                                                            }`}
                                                        >
                                                            {item}
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="queue-label">REAR</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="complexity-section">
                                    <h3 className="complexity-heading">TIME COMPLEXITY</h3>
                                    <div className="complexity-grid">
                                        <div className="complexity-item">
                                            <div className="operation">
                                                {activeTab === 'stack' ? 'Push' : 'Enqueue'}
                                            </div>
                                            <div className="big-o">O(1)</div>
                                        </div>
                                        <div className="complexity-item">
                                            <div className="operation">
                                                {activeTab === 'stack' ? 'Pop' : 'Dequeue'}
                                            </div>
                                            <div className="big-o">O(1)</div>
                                        </div>
                                        <div className="complexity-item">
                                            <div className="operation">Peek</div>
                                            <div className="big-o">O(1)</div>
                                        </div>
                                        <div className="complexity-item">
                                            <div className="operation">Search</div>
                                            <div className="big-o">O(n)</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pixel-window-footer">
                                <div className="pixel-status">
                                    {activeTab === 'stack'
                                        ? `STACK SIZE: ${stack.length}`
                                        : `QUEUE SIZE: ${queue.length}`}
                                </div>
                                <div className="pixel-memory">
                                    MEM: {activeTab === 'stack'
                                    ? stack.length * 8
                                    : queue.length * 8} BYTES
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default StackQueuePage;