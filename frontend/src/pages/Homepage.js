import React, { useState, useEffect } from 'react';
import backgroundGif from "../assets/images/run.gif";
import { Link } from 'react-router-dom';

const Homepage = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const toggleDropdown = (e) => {
        e.stopPropagation();
        setDropdownOpen(!dropdownOpen);
    };

    useEffect(() => {
        const closeDropdown = () => setDropdownOpen(false);
        document.addEventListener('click', closeDropdown);

        return () => {
            document.removeEventListener('click', closeDropdown);
        };
    }, []);

    return (
        <div style={{ position: 'relative', minHeight: '100vh' }}>
            {/* Background GIF with reduced opacity */}
            <div
                className="gif-container"
                style={{
                    background: `url(${backgroundGif}) no-repeat center center`,
                    backgroundSize: 'cover',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: -1,
                    opacity: 0.5, // Reduced opacity (0.5 = 50% opacity)
                    imageRendering: 'high-quality', // Improved image rendering
                }}
            ></div>

            {/* Dark overlay for better contrast with content if needed */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0,0,0,0.2)', // Slight dark overlay
                zIndex: -1,
            }}></div>

            {/* Main Content */}
            <div className="content" style={{
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '2rem',
                minHeight: '100vh'
            }}>
                <h1 className="text-5xl font-bold">ALGOMATICS</h1>
                <p className="text-lg mt-4">
                    An interactive tool that visually demonstrates mathematical functions,
                    equations, data structures, and algorithms.
                </p>

                {/* Explore Subjects Dropdown */}
                <div className="dropdown mt-6">
                    <button
                        className="bg-blue-200 text-black px-6 py-3 rounded-full font-bold"
                        onClick={toggleDropdown}
                    >
                        Explore Subjects
                    </button>
                    <div
                        className="dropdown-content"
                        style={{
                            display: dropdownOpen ? 'block' : 'none',
                            position: 'absolute',
                            backgroundColor: '#f9f9f9',
                            minWidth: '160px',
                            boxShadow: '0px 8px 16px 0px rgba(0,0,0,0.2)',
                            zIndex: 1
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Link to="/graphs" style={{color: 'black', padding: '12px 16px', textDecoration: 'none', display: 'block'}}>Math</Link>
                        <Link to="/sorting" style={{color: 'black', padding: '12px 16px', textDecoration: 'none', display: 'block'}}>Algorithms</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Homepage;