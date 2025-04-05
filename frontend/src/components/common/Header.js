import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
    const location = useLocation();

    useEffect(() => {
        // Add Silkscreen font if not already in your index.html
        const link = document.createElement('link');
        link.href = "https://fonts.googleapis.com/css2?family=Silkscreen:wght@400;700&display=swap";
        link.rel = "stylesheet";
        document.head.appendChild(link);

        return () => {
            document.head.removeChild(link);
        };
    }, []);

    return (
        <header className="py-4">
            <nav className="header-bg text-white py-2 px-6 rounded-full mx-4 flex justify-between items-center">
                <div className="flex space-x-4">
                    <Link
                        to="/"
                        className={`text-white nav-link ${location.pathname === '/' ? 'text-yellow-300' : ''}`}
                    >
                        HOME
                    </Link>
                    <Link
                        to="/about"
                        className={`text-white nav-link ${location.pathname === '/about' ? 'text-yellow-300' : ''}`}
                    >
                        ABOUT
                    </Link>
                    <Link
                        to="/graphs"
                        className={`text-white nav-link ${location.pathname === '/graphs' ? 'text-yellow-300' : ''}`}
                    >
                        MATH
                    </Link>
                    <Link
                        to="/sorting"
                        className={`text-white nav-link ${location.pathname === '/sorting' ? 'text-yellow-300' : ''}`}
                    >
                        ALGORITHMS
                    </Link>
                </div>
                <Link
                    to="/login"
                    className="bg-blue-200 text-black px-4 py-2 rounded-full"
                >
                    LOGIN / SIGN UP
                </Link>
            </nav>
        </header>
    );
};

export default Header;