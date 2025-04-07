import React from 'react';
import './Footer.css';

function UniversalFooter() {
    return (
        <footer className="universal-footer">
            <div className="pixel-container">
                <div className="footer-top">
                    <div className="pixel-blocks">
                        <div className="pixel-block block-1"></div>
                        <div className="pixel-block block-2"></div>
                        <div className="pixel-block block-3"></div>
                        <div className="pixel-block block-4"></div>
                    </div>
                </div>

                <div className="footer-content">
                    <div className="footer-nav">
                        <div className="nav-column">
                            <h3 className="footer-heading">Navigation</h3>
                            <ul className="footer-links">
                                <li><a href="/home" className="footer-link">Home</a></li>
                                <li><a href="/about" className="footer-link">About</a></li>
                                <li><a href="/math" className="footer-link">Math</a></li>
                                <li><a href="/algorithms" className="footer-link">Algorithms</a></li>
                            </ul>
                        </div>

                        <div className="nav-column">
                            <h3 className="footer-heading">Resources</h3>
                            <ul className="footer-links">
                                <li><a href="/tutorials" className="footer-link">Tutorials</a></li>
                                <li><a href="/challenges" className="footer-link">Challenges</a></li>
                                <li><a href="/examples" className="footer-link">Examples</a></li>
                            </ul>
                        </div>

                        <div className="nav-column">
                            <h3 className="footer-heading">Legal</h3>
                            <ul className="footer-links">
                                <li><a href="/terms" className="footer-link">Terms & Conditions</a></li>
                                <li><a href="/privacy" className="footer-link">Privacy Policy</a></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <div className="pixel-divider"></div>
                    <p className="copyright">© 2025 by ALGOMATICS. All rights reserved.</p>
                    <div className="social-icons">
                        <a href="https://github.com" className="social-icon github" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                            <div className="pixel-icon"></div>
                        </a>
                        <a href="https://twitter.com" className="social-icon twitter" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                            <div className="pixel-icon"></div>
                        </a>
                        <a href="https://discord.com" className="social-icon discord" target="_blank" rel="noopener noreferrer" aria-label="Discord">
                            <div className="pixel-icon"></div>
                        </a>
                    </div>
                </div>

                <div className="footer-easter-egg">
                    <div className="retro-character"></div>
                </div>
            </div>
        </footer>
    );
}

export default UniversalFooter;