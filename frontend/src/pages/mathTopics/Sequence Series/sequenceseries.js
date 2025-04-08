import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './sequenceseries.css';

const SequencesSeries = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [sequenceType, setSequenceType] = useState('arithmetic');
    const [firstTerm, setFirstTerm] = useState(1);
    const [commonDifference, setCommonDifference] = useState(2);
    const [commonRatio, setCommonRatio] = useState(2);
    const [terms, setTerms] = useState(10);
    const [sequence, setSequence] = useState([]);
    const [sum, setSum] = useState(0);
    const [formula, setFormula] = useState('');
    const [generalTerm, setGeneralTerm] = useState('');

    // Simulate loading
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    // Generate sequence when parameters change
    useEffect(() => {
        generateSequence();
    }, [sequenceType, firstTerm, commonDifference, commonRatio, terms]);

    const generateSequence = () => {
        let newSequence = [];
        let newSum = 0;
        let newFormula = '';
        let newGeneralTerm = '';

        if (sequenceType === 'arithmetic') {
            // Arithmetic sequence: a, a+d, a+2d, a+3d, ...
            for (let i = 0; i < terms; i++) {
                const term = firstTerm + i * commonDifference;
                newSequence.push(term);
                newSum += term;
            }

            // Formula for sum of arithmetic sequence: S_n = n/2 * [2a + (n-1)d]
            const lastTerm = firstTerm + (terms - 1) * commonDifference;
            newFormula = `S_${terms} = ${terms}/2 * [2 * ${firstTerm} + (${terms}-1) * ${commonDifference}] = ${terms}/2 * [${2 * firstTerm} + ${(terms-1) * commonDifference}] = ${terms}/2 * ${2 * firstTerm + (terms-1) * commonDifference} = ${newSum}`;

            // General term formula: a_n = a + (n-1)d
            newGeneralTerm = `a_n = ${firstTerm} + (n-1) * ${commonDifference}`;

        } else if (sequenceType === 'geometric') {
            // Geometric sequence: a, ar, ar^2, ar^3, ...
            for (let i = 0; i < terms; i++) {
                const term = firstTerm * Math.pow(commonRatio, i);
                newSequence.push(term);
                newSum += term;
            }

            // Formula for sum of geometric sequence: S_n = a(1-r^n)/(1-r) for r≠1
            if (commonRatio !== 1) {
                const numerator = firstTerm * (1 - Math.pow(commonRatio, terms));
                const denominator = 1 - commonRatio;
                newFormula = `S_${terms} = ${firstTerm} * (1 - ${commonRatio}^${terms}) / (1 - ${commonRatio}) = ${firstTerm} * (1 - ${Math.pow(commonRatio, terms).toFixed(2)}) / ${denominator.toFixed(2)} = ${(numerator / denominator).toFixed(2)} ≈ ${Math.round(numerator / denominator)}`;
            } else {
                newFormula = `S_${terms} = ${firstTerm} * ${terms} = ${firstTerm * terms}`;
            }

            // General term formula: a_n = a * r^(n-1)
            newGeneralTerm = `a_n = ${firstTerm} * ${commonRatio}^(n-1)`;

        } else if (sequenceType === 'fibonacci') {
            // Fibonacci sequence: 0, 1, 1, 2, 3, 5, 8, ...
            if (terms >= 1) newSequence.push(0);
            if (terms >= 2) newSequence.push(1);

            for (let i = 2; i < terms; i++) {
                const term = newSequence[i-1] + newSequence[i-2];
                newSequence.push(term);
            }

            newSum = newSequence.reduce((acc, val) => acc + val, 0);
            newFormula = "Fibonacci sequence has no simple sum formula";
            newGeneralTerm = "a_n = a_(n-1) + a_(n-2), where a_1 = 0 and a_2 = 1";
        }

        setSequence(newSequence);
        setSum(newSum);
        setFormula(newFormula);
        setGeneralTerm(newGeneralTerm);
    };

    const handleSequenceTypeChange = (type) => {
        setSequenceType(type);
    };

    const handleIncrement = (setter, value) => {
        setter(value + 1);
    };

    const handleDecrement = (setter, value) => {
        setter(value - 1);
    };

    const handleTermIncrement = () => {
        if (terms < 20) setTerms(terms + 1);
    };

    const handleTermDecrement = () => {
        if (terms > 1) setTerms(terms - 1);
    };

    return (
        <div className="sequences-page">
            {/* Background */}
            <div className="pixel-background">
                <div className="gif-container"></div>
                <div className="pixel-overlay"></div>
            </div>

            {/* Navigation */}
            <div className="nav-bar">
                <Link to="/math" className="home-link">
                    <div className="pixel-home-btn">
                        <span className="home-icon">◄</span> BACK TO MATH
                    </div>
                </Link>
                <Link to="/" className="home-link">
                    <div className="pixel-home-btn">
                        <span className="home-icon">◄</span> HOME
                    </div>
                </Link>
            </div>

            <div className="pixel-content">
                {isLoading ? (
                    <div className="loading-screen">
                        <div className="pixel-loading">
                            <div className="pixel-loading-text">LOADING SEQUENCE GENERATOR</div>
                            <div className="pixel-loading-bar">
                                <div className="pixel-loading-progress"></div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="pixel-window sequences-window">
                        <div className="pixel-window-header">
                            <div className="pixel-dots">
                                <span className="pixel-dot red"></span>
                                <span className="pixel-dot yellow"></span>
                                <span className="pixel-dot green"></span>
                            </div>
                            <div className="pixel-title">SEQUENCES_AND_SERIES.EXE</div>
                        </div>

                        <div className="pixel-window-body">
                            <h1 className="pixel-heading">SEQUENCES & SERIES</h1>

                            <div className="sequence-type-selector">
                                <button
                                    className={`pixel-button type-btn ${sequenceType === 'arithmetic' ? 'active-type' : ''}`}
                                    onClick={() => handleSequenceTypeChange('arithmetic')}
                                >
                                    ARITHMETIC
                                </button>
                                <button
                                    className={`pixel-button type-btn ${sequenceType === 'geometric' ? 'active-type' : ''}`}
                                    onClick={() => handleSequenceTypeChange('geometric')}
                                >
                                    GEOMETRIC
                                </button>
                                <button
                                    className={`pixel-button type-btn ${sequenceType === 'fibonacci' ? 'active-type' : ''}`}
                                    onClick={() => handleSequenceTypeChange('fibonacci')}
                                >
                                    FIBONACCI
                                </button>
                            </div>

                            <div className="sequence-controls">
                                {sequenceType !== 'fibonacci' && (
                                    <div className="control-group">
                                        <div className="control-label">FIRST TERM (a)</div>
                                        <div className="control-buttons">
                                            <button
                                                className="pixel-button control-btn"
                                                onClick={() => handleDecrement(setFirstTerm, firstTerm)}
                                            >-</button>
                                            <div className="control-value">{firstTerm}</div>
                                            <button
                                                className="pixel-button control-btn"
                                                onClick={() => handleIncrement(setFirstTerm, firstTerm)}
                                            >+</button>
                                        </div>
                                    </div>
                                )}

                                {sequenceType === 'arithmetic' && (
                                    <div className="control-group">
                                        <div className="control-label">COMMON DIFFERENCE (d)</div>
                                        <div className="control-buttons">
                                            <button
                                                className="pixel-button control-btn"
                                                onClick={() => handleDecrement(setCommonDifference, commonDifference)}
                                            >-</button>
                                            <div className="control-value">{commonDifference}</div>
                                            <button
                                                className="pixel-button control-btn"
                                                onClick={() => handleIncrement(setCommonDifference, commonDifference)}
                                            >+</button>
                                        </div>
                                    </div>
                                )}

                                {sequenceType === 'geometric' && (
                                    <div className="control-group">
                                        <div className="control-label">COMMON RATIO (r)</div>
                                        <div className="control-buttons">
                                            <button
                                                className="pixel-button control-btn"
                                                onClick={() => handleDecrement(setCommonRatio, commonRatio)}
                                            >-</button>
                                            <div className="control-value">{commonRatio}</div>
                                            <button
                                                className="pixel-button control-btn"
                                                onClick={() => handleIncrement(setCommonRatio, commonRatio)}
                                            >+</button>
                                        </div>
                                    </div>
                                )}

                                <div className="control-group">
                                    <div className="control-label">NUMBER OF TERMS (n)</div>
                                    <div className="control-buttons">
                                        <button
                                            className="pixel-button control-btn"
                                            onClick={handleTermDecrement}
                                            disabled={terms <= 1}
                                        >-</button>
                                        <div className="control-value">{terms}</div>
                                        <button
                                            className="pixel-button control-btn"
                                            onClick={handleTermIncrement}
                                            disabled={terms >= 20}
                                        >+</button>
                                    </div>
                                </div>
                            </div>

                            <div className="sequence-display">
                                <h2 className="pixel-subheading">SEQUENCE TERMS</h2>
                                <div className="terminal-text sequence-terms">
                                    <span className="prompt">$&gt;&nbsp;</span>
                                    <span className="typing-text">
                                        [{sequence.join(', ')}]
                                    </span>
                                    <span className="blinking-cursor">▋</span>
                                </div>

                                <h2 className="pixel-subheading">GENERAL TERM (nth TERM)</h2>
                                <div className="terminal-text formula-display">
                                    <span className="prompt">$&gt;&nbsp;</span>
                                    <span className="typing-text">{generalTerm}</span>
                                </div>

                                <h2 className="pixel-subheading">SUM OF FIRST {terms} TERMS</h2>
                                <div className="terminal-text sum-display">
                                    <span className="prompt">$&gt;&nbsp;</span>
                                    <span className="typing-text">Sum = {sum}</span>
                                </div>

                                <h2 className="pixel-subheading">FORMULA USED</h2>
                                <div className="terminal-text formula-display">
                                    <span className="prompt">$&gt;&nbsp;</span>
                                    <span className="typing-text">{formula}</span>
                                </div>
                            </div>

                            <div className="sequence-info">
                                <h2 className="pixel-subheading">ABOUT {sequenceType.toUpperCase()} SEQUENCES</h2>

                                {sequenceType === 'arithmetic' && (
                                    <div className="info-content">
                                        <p>An arithmetic sequence is a sequence where each term differs from the previous by a constant value (the common difference).</p>
                                        <ul>
                                            <li><span className="highlight">General Term:</span> a_n = a + (n-1)d</li>
                                            <li><span className="highlight">Sum Formula:</span> S_n = n/2 * [2a + (n-1)d]</li>
                                            <li><span className="highlight">Example:</span> 2, 5, 8, 11, 14, ... (a=2, d=3)</li>
                                        </ul>
                                        <p>Arithmetic sequences are commonly used to model linear growth patterns.</p>
                                    </div>
                                )}

                                {sequenceType === 'geometric' && (
                                    <div className="info-content">
                                        <p>A geometric sequence is a sequence where each term is found by multiplying the previous term by a constant value (the common ratio).</p>
                                        <ul>
                                            <li><span className="highlight">General Term:</span> a_n = a * r^(n-1)</li>
                                            <li><span className="highlight">Sum Formula:</span> S_n = a(1-r^n)/(1-r) for r≠1</li>
                                            <li><span className="highlight">Example:</span> 3, 6, 12, 24, 48, ... (a=3, r=2)</li>
                                        </ul>
                                        <p>Geometric sequences are used to model exponential growth and decay.</p>
                                    </div>
                                )}

                                {sequenceType === 'fibonacci' && (
                                    <div className="info-content">
                                        <p>The Fibonacci sequence is a special sequence where each term is the sum of the two preceding ones, starting from 0 and 1.</p>
                                        <ul>
                                            <li><span className="highlight">Sequence:</span> 0, 1, 1, 2, 3, 5, 8, 13, 21, ...</li>
                                            <li><span className="highlight">Recurrence Relation:</span> F_n = F_(n-1) + F_(n-2)</li>
                                            <li><span className="highlight">Interesting Property:</span> The ratio of consecutive Fibonacci numbers approaches the Golden Ratio (≈1.618)</li>
                                        </ul>
                                        <p>The Fibonacci sequence appears frequently in nature, such as in the arrangement of leaves on a stem or the spiral pattern of shells.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pixel-window-footer">
                            <div className="pixel-status">SEQUENCE GENERATOR READY</div>
                            <div className="pixel-memory">MEM: 640K</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SequencesSeries;