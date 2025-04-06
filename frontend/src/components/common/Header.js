import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
                                <Link to="/" className="pixel-link">HOME</Link>
                            </li>
                            <li className="pixel-menu-item">
                                <Link to="/about" className="pixel-link">ABOUT</Link>
                            </li>
                            <li className="pixel-menu-item">
                                <Link to="/math" className="pixel-link">MATH</Link>
                            </li>
                            <li className="pixel-menu-item">
                                <Link to="/algorithms" className="pixel-link">ALGORITHMS</Link>
                            </li>
                            <li className="pixel-menu-item login-button">
                                <Link to="/login" className="pixel-button">LOGIN</Link>
                            </li>
                            <li className="pixel-menu-item login-button">
                                <Link to="/signup" className="pixel-button">SIGN UP</Link>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </header>
    );
}

export default UniversalHeader;