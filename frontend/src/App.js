import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Homepage from './pages/Homepage';
import GraphVisualization from './pages/GraphVisualization';
import TreeVisualization from './pages/TreeVisualization';
import SortingAlgorithms from './pages/SortingAlgorithms';

const App = () => {
    return (
        <Router>
            <div className="app">
                <Header />
                <main className="content">
                    <Routes>
                        <Route path="/" element={<Homepage />} />
                        <Route path="/graphs" element={<GraphVisualization />} />
                        <Route path="/trees" element={<TreeVisualization />} />
                        <Route path="/sorting" element={<SortingAlgorithms />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    );
};

export default App;