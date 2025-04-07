import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './About.css'; // We'll create this file next

const About = () => {
    const [typedText, setTypedText] = useState('');
    const fullText = "Exploring the intersection of mathematics, computer science, and interactive visualization.";
    const typingSpeed = 50; // milliseconds per character

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

    return (
        <div className="about-container">
            {/* Background with pixel overlay */}
            <div className="pixel-background">
                <div className="gif-container"></div>
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
                        <div className="pixel-title">ABOUT.EXE</div>
                    </div>

                    <div className="pixel-window-body">
                        <h1 className="pixel-heading">ABOUT US</h1>

                        <div className="terminal-text">
                            <span className="prompt">$&gt;&nbsp;</span>
                            <span className="typing-text">{typedText}</span>
                            <span className="blinking-cursor">▋</span>
                        </div>

                        <div className="about-sections">
                            <div className="about-section">
                                <h2 className="section-title">MISSION</h2>
                                <div className="section-content">
                                    <p>ALGOMATICS aims to make complex mathematical concepts and algorithms accessible through interactive visualizations. We believe in learning through exploration and visual understanding.</p>
                                </div>
                            </div>

                            <div className="about-section">
                                <h2 className="section-title">WHAT WE OFFER</h2>
                                <div className="section-content">
                                    <div className="features-grid">
                                        <div className="feature-item">
                                            <div className="feature-icon math-icon"></div>
                                            <div className="feature-text">Interactive Math Visualizations</div>
                                        </div>
                                        <div className="feature-item">
                                            <div className="feature-icon algo-icon"></div>
                                            <div className="feature-text">Algorithm Animations</div>
                                        </div>
                                        <div className="feature-item">
                                            <div className="feature-icon data-icon"></div>
                                            <div className="feature-text">Data Structure Explorers</div>
                                        </div>
                                        <div className="feature-item">
                                            <div className="feature-icon code-icon"></div>
                                            <div className="feature-text">Code Implementation</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="about-section">
                                <h2 className="section-title">TEAM</h2>
                                <div className="section-content">
                                    <p>We are a group of developers, mathematicians, and educators passionate about making abstract concepts tangible through interactive digital experiences.</p>
                                </div>
                            </div>
                        </div>

                        <div className="pixel-buttons">
                            <Link to="/" className="pixel-button">BACK TO HOME</Link>
                            <Link to="/contact" className="pixel-button">CONTACT US</Link>
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

export default About;