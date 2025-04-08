import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../../firebase/firebase'; // Update this path as needed
import { onAuthStateChanged, signOut } from 'firebase/auth';
import './Header.css';

// Helper function to extract first name
const getFirstName = (user) => {
    // If user has a display name, try to extract first name
    if (user.displayName) {
        return user.displayName.split(' ')[0];
    }

    // If no display name but has email, use part before @
    if (user.email) {
        const emailName = user.email.split('@')[0];

        // Check if email has dots or underscores that might separate first/last names
        if (emailName.includes('.')) {
            return emailName.split('.')[0];
        }
        if (emailName.includes('_')) {
            return emailName.split('_')[0];
        }

        return emailName;
    }

    // Fallback
    return "User";
};

function UniversalHeader() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Listen to auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        // Clean up subscription
        return () => unsubscribe();
    }, []);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const handleSignOut = () => {
        signOut(auth).then(() => {
            // Sign-out successful
            console.log("User signed out successfully");
        }).catch((error) => {
            // An error happened
            console.error("Sign out error:", error);
        });
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

                            {user ? (
                                <li className="pixel-menu-item user-profile">
                                    <div className="user-dropdown" onClick={toggleDropdown}>
                                        <span className="user-name">
                                            {getFirstName(user)}
                                        </span>
                                        <span className="dropdown-arrow">▼</span>
                                    </div>
                                    {dropdownOpen && (
                                        <ul className="dropdown-menu">
                                            <li className="dropdown-item">
                                                <Link to="/profile" className="dropdown-link">PROFILE</Link>
                                            </li>
                                            <li className="dropdown-item">
                                                <Link to="/settings" className="dropdown-link">SETTINGS</Link>
                                            </li>
                                            <li className="dropdown-item">
                                                <button className="dropdown-button" onClick={handleSignOut}>
                                                    SIGN OUT
                                                </button>
                                            </li>
                                        </ul>
                                    )}
                                </li>
                            ) : (
                                <>
                                    <li className="pixel-menu-item login-button">
                                        <Link to="/login" className="pixel-button">LOGIN</Link>
                                    </li>
                                    <li className="pixel-menu-item login-button">
                                        <Link to="/signup" className="pixel-button">SIGN UP</Link>
                                    </li>
                                </>
                            )}
                        </ul>
                    </nav>
                </div>
            </div>
        </header>
    );
}

export default UniversalHeader;