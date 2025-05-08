import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UniversalHeader from './components/common/Header';
import UniversalFooter from './components/common/Footer';
import Homepage from './pages/Homepage';
import Login from './components/auth/login/login';
import Signup from './components/auth/signup/signup';
import About from './pages/about';
import Settings from './pages/settings';
import Profile from './pages/profile';
import AudioPlayer from './components/common/AudioPlayer';

import './index.css';
import Chatbot from './components/Chatbot';

import AlgorithmsPage from './components/algorithm/algorithms';
import ArraysPage from './pages/arrays'; // Import new ArraysPage component
import StackQueuePage from './pages/stackqueue';
import Sudoku from './pages/sudoku';

import GraphVisualization from './pages/GraphVisualization';
import Trees from './pages/Trees';
import SortingAlgorithms from './pages/SortingAlgorithms';
import Hashtables from './pages/hashtables';
import LinkedList from './pages/linkedlist';
import GraphTheory from "./pages/nodeGraphs";


import MathPage from './components/math/MathPage';
import SystemEquations from './pages/mathTopics/System of Equations/SystemEquations';
import QuadraticSolver from './pages/quadraticsolver';
import LinearEquations from './pages/mathTopics/Linear Equations/linear';
import SequenceSeries from './pages/mathTopics/Sequence Series/sequenceseries';
import Logarithms from './pages/mathTopics/Logarithms/logarithms';
import Recursion from './pages/recursion';
import Polynomials from './pages/mathTopics/Polynomials/polynomials';
import Circles from './pages/mathTopics/Circles/circles';

const App = () => {
    return (
        <Router>
            <div className="app">
                <UniversalHeader />
                <main className="content">
                    <Routes>
                        <Route path="/" element={<Homepage />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/about" element={<About />} /> {/* Add the route for About page */}
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/graphs" element={<GraphVisualization />} />
                        <Route path="/trees" element={<Trees />} />
                        <Route path="/sorting" element={<SortingAlgorithms />} />
                        <Route path="/arrays" element={<ArraysPage />} /> {/* Add the route for Arrays page */}
                        <Route path="/math" element={<MathPage />} />
                        <Route path="/algorithms" element={<AlgorithmsPage />} />
                        <Route path="/algorithms/stack-queue" element={<StackQueuePage />} />
                        <Route path="/system-of-equations" element={<SystemEquations />} />
                        <Route path="/quadratic" element={<QuadraticSolver />} />
                        <Route path="/linear-equations" element={<LinearEquations />} />
                        <Route path="/sequences-series" element={<SequenceSeries />} />
                        <Route path="/logarithms-exponential" element={<Logarithms />} />
                        <Route path="/algorithms/hash-table" element={<Hashtables />} />
                        <Route path="/algorithms/linked-list" element={<LinkedList />} />
                        <Route path="/algorithms/recursion" element={<Recursion />} />
                        <Route path="/polynomial-operations" element={<Polynomials />} />
                        <Route path="/graph-theory" element={<GraphTheory />} />
                        <Route path="/circle-stuff" element={<Circles />} />
                        <Route path="/sudoku" element={<Sudoku />} />
                    </Routes>
                </main>
                <UniversalFooter />

                {/* Add the AI Chatbot component using Mistral-7B-Instruct-v0.3 */}
                <Chatbot
                    apiUrl = 'http://localhost:5000/api/chat'
                    position="bottom-right"
                    theme="light"
                    initialMessage="Hello! I'm powered by Mistral-7B-Instruct-v0.3."
                />
                <AudioPlayer />
            </div>
        </Router>
    );
};

export default App;