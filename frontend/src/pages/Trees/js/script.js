// Core tree visualization logic
export const setupTree = (p5, treeType) => {
    // Initialize the tree visualization
    p5.background(0);
    p5.fill(255);
    p5.noStroke();
    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.textSize(14);
};

export const renderTree = (p5, treeData, treeType) => {
    const { nodes, edges } = treeData;

    // Theme colors matching ALGOMATICS
    const colors = {
        bst: {
            node: '#8A2BE2', // Purple
            text: '#FFFFFF',
            edge: '#6A5ACD'
        },
        avl: {
            node: '#00FFFF', // Cyan
            text: '#000000',
            edge: '#40E0D0'
        },
        rbt: {
            node: '#FF69B4', // Pink
            text: '#FFFFFF',
            edge: '#FF1493',
            red: '#FF0000',
            black: '#000000'
        }
    };

    // Draw title
    p5.fill(255);
    p5.textSize(20);
    let treeTitle = '';

    switch(treeType) {
        case 'avl':
            treeTitle = 'AVL Tree';
            break;
        case 'rbt':
            treeTitle = 'Red-Black Tree';
            break;
        default:
            treeTitle = 'Binary Search Tree';
    }

    p5.text(treeTitle, 400, 25);
    p5.textSize(14);

    // Draw edges first so they appear under nodes
    p5.strokeWeight(2);
    edges.forEach(edge => {
        const sourceNode = nodes.find(node => node.id === edge.source);
        const targetNode = nodes.find(node => node.id === edge.target);

        if (sourceNode && targetNode) {
            p5.stroke(colors[treeType].edge);
            p5.line(sourceNode.x, sourceNode.y, targetNode.x, targetNode.y);
        }
    });

    // Draw nodes
    nodes.forEach(node => {
        // Node circle
        p5.fill(colors[treeType].node);
        p5.noStroke();
        p5.ellipse(node.x, node.y, 40, 40);

        // Node value
        p5.fill(colors[treeType].text);
        p5.text(node.value.toString(), node.x, node.y);

        // For RBT, nodes have colors
        if (treeType === 'rbt' && node.color) {
            // Add a colored ring to indicate red/black
            p5.strokeWeight(3);
            p5.stroke(node.color === 'red' ? colors.rbt.red : colors.rbt.black);
            p5.noFill();
            p5.ellipse(node.x, node.y, 46, 46);
        }

        // For AVL, show balance factor
        if (treeType === 'avl' && node.balanceFactor !== undefined) {
            p5.fill(255);
            p5.textSize(10);
            p5.text(`BF: ${node.balanceFactor}`, node.x, node.y + 25);
            p5.textSize(14);
        }
    });

    // Show node count
    p5.fill(255);
    p5.textAlign(p5.LEFT, p5.BASELINE);
    p5.text(`Nodes: ${nodes.length}`, 20, 30);
    p5.textAlign(p5.CENTER, p5.CENTER);

    // Draw tree info
    if (nodes.length > 0) {
        // Calculate tree height (naive approach)
        const height = Math.ceil(Math.log2(nodes.length + 1));
        p5.textAlign(p5.LEFT, p5.BASELINE);
        p5.text(`Height: ~${height}`, 20, 55);
        p5.textAlign(p5.CENTER, p5.CENTER);
    }
};