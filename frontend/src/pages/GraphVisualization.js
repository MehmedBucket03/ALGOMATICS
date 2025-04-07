import React from 'react';
import FunctionVisualizer from '../components/graphs/FunctionVisualizer';

const GraphVisualization = () => {
    return (
        <div className="graph-visualization-page">
            <h1>Graph Visualizations</h1>
            <FunctionVisualizer />
            {/* Add more graph components as you develop them */}
        </div>
    );
};

export default GraphVisualization;