import React from 'react';
import UniversalHeader from './Header';
import UniversalFooter from './Footer';
import './Layout.css';

const Layout = ({ children }) => {
    return (
        <div className="app-container">
            <UniversalHeader />
            <main className="main-content">
                {children}
            </main>
            <UniversalFooter />
        </div>
    );
};

export default Layout;