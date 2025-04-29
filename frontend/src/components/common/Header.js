import React, { useState, useEffect, useRef } from 'react';
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
    const dropdownRef = useRef(null);

    // Listen to auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        // Clean up subscription
        return () => unsubscribe();
    }, []);

    // Handle clicks outside dropdown to close it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        // Add event listener when dropdown is open
        if (dropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        // Cleanup event listener
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownOpen]);

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
            setDropdownOpen(false); // Close dropdown after signing out
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
                                <li className="pixel-menu-item user-profile" ref={dropdownRef}>
                                    <div
                                        className={`user-dropdown ${dropdownOpen ? 'active' : ''}`}
                                        onClick={toggleDropdown}
                                    >
                                        <div className="user-avatar">
                                            {user.photoURL ? (
                                                <img src={user.photoURL} alt="User Avatar" className="avatar-image" />
                                            ) : (
                                                <div className="avatar-placeholder">
                                                    {getFirstName(user).charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <span className="user-name">
                                            {getFirstName(user)}
                                        </span>
                                        <span className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`}>▼</span>
                                    </div>

                                    {dropdownOpen && (
                                        <ul className="dropdown-menu">
                                            <li className="dropdown-header">
                                                <div className="user-info">
                                                    <span className="full-name">{user.displayName || user.email}</span>
                                                    <span className="user-email">{user.email}</span>
                                                </div>
                                            </li>
                                            <li className="dropdown-divider"></li>
                                            <li className="dropdown-item">
                                                <Link to="/profile" className="dropdown-link">
                                                    <i className="dropdown-icon profile-icon"></i>
                                                    PROFILE
                                                </Link>
                                            </li>
                                            <li className="dropdown-item">
                                                <Link to="/settings" className="dropdown-link">
                                                    <i className="dropdown-icon settings-icon"></i>
                                                    SETTINGS
                                                </Link>
                                            </li>
                                            <li className="dropdown-divider"></li>
                                            <li className="dropdown-item">
                                                <button className="dropdown-button" onClick={handleSignOut}>
                                                    <i className="dropdown-icon signout-icon"></i>
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