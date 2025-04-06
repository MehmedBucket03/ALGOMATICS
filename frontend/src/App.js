import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UniversalHeader from './components/common/Header';
import UniversalFooter from './components/common/Footer';
import Homepage from './pages/Homepage';
import GraphVisualization from './pages/GraphVisualization';
import TreeVisualization from './pages/TreeVisualization';
import SortingAlgorithms from './pages/SortingAlgorithms';
import MathPage from './components/math/MathPage';

const App = () => {
    return (
        <Router>
            <div className="app">
                <UniversalHeader />
                <main className="content">
                    <Routes>
                        <Route path="/" element={<Homepage />} />
                        <Route path="/graphs" element={<GraphVisualization />} />
                        <Route path="/trees" element={<TreeVisualization />} />
                        <Route path="/sorting" element={<SortingAlgorithms />} />
                        <Route path="/math" element={<MathPage />} />
                    </Routes>
                </main>
                <UniversalFooter />
            </div>
        </Router>
    );
};

export default App;