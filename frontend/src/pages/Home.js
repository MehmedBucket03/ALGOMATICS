import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="home-page">
            <h1>Welcome to Algorithm Visualizer</h1>
            <p>Explore and learn computer science concepts through interactive visualizations</p>

            <div className="feature-grid">
                <div className="feature-card">
                    <h2>Graph Algorithms</h2>
                    <p>Visualize pathfinding, traversal, and minimum spanning tree algorithms</p>
                    <Link to="/graphs" className="feature-link">Explore Graphs</Link>
                </div>

                <div className="feature-card">
                    <h2>Tree Structures</h2>
                    <p>Learn about binary search trees, red-black trees, and heaps</p>
                    <Link to="/trees" className="feature-link">Explore Trees</Link>
                </div>

                <div className="feature-card">
                    <h2>Sorting Algorithms</h2>
                    <p>See sorting algorithms in action with step-by-step visualization</p>
                    <Link to="/sorting" className="feature-link">Explore Sorting</Link>
                </div>
            </div>
        </div>
    );
};

export default Home;