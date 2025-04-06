import React, { useState } from 'react';
import './Header.css';

function UniversalHeader() {
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <header className="universal-header">
            <div className="pixel-container">
                <div className="logo-container">
                    <div className="pixel-logo">
                        <span className="logo-text">ALGOMATICS</span>
                    </div>
                </div>

                <div className="nav-container">
                    <button className="menu-toggle" onClick={toggleMenu}>
                        <div className="pixel-burger">
                            <span className="burger-line"></span>
                            <span className="burger-line"></span>
                            <span className="burger-line"></span>
                        </div>
                    </button>

                    <nav className={`pixel-nav ${menuOpen ? 'open' : ''}`}>
                        <ul className="pixel-menu">
                            <li className="pixel-menu-item">
                                <a href="/home" className="pixel-link">HOME</a>
                            </li>
                            <li className="pixel-menu-item">
                                <a href="/about" className="pixel-link">ABOUT</a>
                            </li>
                            <li className="pixel-menu-item">
                                <a href="/math" className="pixel-link">MATH</a>
                            </li>
                            <li className="pixel-menu-item">
                                <a href="/algorithms" className="pixel-link">ALGORITHMS</a>
                            </li>
                            <li className="pixel-menu-item login-button">
                                <a href="/login" className="pixel-button">LOGIN / SIGN UP</a>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </header>
    );
}

export default UniversalHeader;