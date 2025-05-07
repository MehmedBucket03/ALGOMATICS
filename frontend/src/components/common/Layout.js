import React from 'react';
import UniversalHeader from './Header';
import UniversalFooter from './Footer';
import AudioPlayer from './AudioPlayer'; // Import the AudioPlayer component
import './Layout.css';

const Layout = ({ children }) => {
    return (
        <div className="app-container">
            <UniversalHeader />
            <main className="main-content">
                {children}
            </main>
            <AudioPlayer audioSrc="/assets/music/Lofi.mp3" /> {/* Add AudioPlayer component here */}
            <UniversalFooter />
        </div>
    );
};

export default Layout;