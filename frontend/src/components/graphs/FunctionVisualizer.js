import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const FunctionVisualizer = () => {
    const svgRef = useRef();
    const [equation, setEquation] = useState('x * x');
    const [range, setRange] = useState([-10, 10]);

    useEffect(() => {
        if (!svgRef.current) return;

        // Clear previous visualization
        d3.select(svgRef.current).selectAll("*").remove();

        // Set up SVG dimensions
        const width = 600;
        const height = 400;
        const margin = { top: 20, right: 20, bottom: 30, left: 40 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        // Create SVG
        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height);

        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Set up scales
        const xScale = d3.scaleLinear()
            .domain(range)
            .range([0, innerWidth]);

        const yScale = d3.scaleLinear()
            .domain([-10, 10])  // Y-axis range
            .range([innerHeight, 0]);

        // Create axes
        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);

        g.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${innerHeight / 2})`)
            .call(xAxis);

        g.append("g")
            .attr("class", "y-axis")
            .attr("transform", `translate(${innerWidth / 2},0)`)
            .call(yAxis);

        // Generate data points
        const points = [];
        const step = (range[1] - range[0]) / 100;

        for (let x = range[0]; x <= range[1]; x += step) {
            try {
                // Safely evaluate the function
                const y = eval(equation.replace(/x/g, x));
                if (!isNaN(y) && isFinite(y)) {
                    points.push({ x, y });
                }
            } catch (e) {
                console.error("Error evaluating function:", e);
            }
        }

        // Create line generator
        const line = d3.line()
            .x(d => xScale(d.x))
            .y(d => yScale(d.y));

        // Draw the function
        g.append("path")
            .datum(points)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2)
            .attr("d", line);

    }, [equation, range]);

    return (
        <div className="function-visualizer">
            <h2>Function Visualizer</h2>
            <div className="controls">
                <div className="form-group">
                    <label htmlFor="equation">Equation (use 'x' as variable):</label>
                    <input
                        type="text"
                        id="equation"
                        value={equation}
                        onChange={(e) => setEquation(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>X Range:</label>
                    <input
                        type="number"
                        value={range[0]}
                        onChange={(e) => setRange([parseFloat(e.target.value), range[1]])}
                    />
                    <span> to </span>
                    <input
                        type="number"
                        value={range[1]}
                        onChange={(e) => setRange([range[0], parseFloat(e.target.value)])}
                    />
                </div>
            </div>
            <div className="visualization">
                <svg ref={svgRef}></svg>
            </div>
        </div>
    );
};

export default FunctionVisualizer;