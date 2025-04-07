import React, { useState, useEffect, useRef } from 'react';
import backgroundGif from "../assets/images/run.gif";
import { Link } from 'react-router-dom';
import './Homepage.css';

const Homepage = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [typedText, setTypedText] = useState('');
    const fullText = "An interactive tool that visually demonstrates mathematical functions, equations, data structures, and algorithms.";
    const typingSpeed = 50; // milliseconds per character
    const dropdownRef = useRef(null);

    // Typing effect
    useEffect(() => {
        let i = 0;
        const typing = setInterval(() => {
            if (i < fullText.length) {
                setTypedText(fullText.substring(0, i + 1));
                i++;
            } else {
                clearInterval(typing);
            }
        }, typingSpeed);

        return () => clearInterval(typing);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const closeDropdown = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('click', closeDropdown);
        return () => document.removeEventListener('click', closeDropdown);
    }, []);

    const toggleDropdown = (e) => {
        e.stopPropagation();
        setDropdownOpen(!dropdownOpen);
    };

    return (
        <div className="homepage-container">
            {/* Background GIF */}
            <div className="pixel-background">
                <div
                    className="gif-container"
                    style={{
                        background: `url(${backgroundGif}) no-repeat center center`,
                        backgroundSize: 'cover',
                    }}
                ></div>
                <div className="pixel-overlay"></div>
            </div>

            {/* Main Content */}
            <div className="pixel-content">
                <div className="pixel-window">
                    <div className="pixel-window-header">
                        <div className="pixel-dots">
                            <span className="pixel-dot red"></span>
                            <span className="pixel-dot yellow"></span>
                            <span className="pixel-dot green"></span>
                        </div>
                        <div className="pixel-title">WELCOME.EXE</div>
                    </div>

                    <div className="pixel-window-body">
                        <h1 className="pixel-heading">ALGOMATICS</h1>
                        <div className="terminal-text">
                            <span className="prompt">$&gt;&nbsp;</span>
                            <span className="typing-text">{typedText}</span>
                            <span className="blinking-cursor">▋</span>
                        </div>

                        <div className="pixel-buttons">
                            <div className="dropdown-container" ref={dropdownRef}>
                                <button
                                    className="pixel-button"
                                    onClick={toggleDropdown}
                                >
                                    EXPLORE SUBJECTS
                                </button>

                                {dropdownOpen && (
                                    <div className="pixel-dropdown">
                                        <Link to="/math" className="pixel-option">MATH</Link>
                                        <Link to="/algorithms" className="pixel-option">ALGORITHMS</Link>
                                        <Link to="/arrays" className="pixel-option">ARRAYS</Link>
                                        <Link to="/graphs" className="pixel-option">GRAPHS</Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pixel-window-footer">
                        <div className="pixel-status">SYSTEM READY</div>
                        <div className="pixel-memory">MEM: 640K</div>
                    </div>
                </div>

                <div className="pixel-decorations">
                    <div className="pixel-character"></div>
                    <div className="floating-pixels">
                        <div className="floating-pixel p1"></div>
                        <div className="floating-pixel p2"></div>
                        <div className="floating-pixel p3"></div>
                        <div className="floating-pixel p4"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Homepage;