const stack = [];
const queue = [];

function pushStack() {
    const value = document.getElementById("stackInput").value;
    if (value === "") return;
    stack.push(value);
    renderStack();
}

function popStack() {
    if (stack.length === 0) return;

    const topElement = document.querySelector("#stack .stack-item:last-child");
    gsap.to(topElement, { opacity: 0, y: -20, duration: 0.3, onComplete: () => {
            stack.pop();
            renderStack();
        }});
}

function clearStack() {
    stack.length = 0;
    renderStack();
}

function renderStack() {
    const stackDiv = document.getElementById("stack");
    stackDiv.innerHTML = "";
    stack.forEach((item, index) => {
        const element = document.createElement("div");
        element.className = "stack-item";
        element.innerText = item;
        stackDiv.appendChild(element);
        gsap.fromTo(element, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.5 });
    });
}

function enqueueQueue() {
    const value = document.getElementById("queueInput").value;
    if (value === "") return;
    queue.push(value);
    renderQueue();
}

function dequeueQueue() {
    if (queue.length === 0) return;

    const frontElement = document.querySelector("#queue .queue-item:first-child");
    gsap.to(frontElement, { opacity: 0, x: -20, duration: 0.3, onComplete: () => {
            queue.shift();
            renderQueue();
        }});
}

function clearQueue() {
    queue.length = 0;
    renderQueue();
}

function renderQueue() {
    const queueDiv = document.getElementById("queue");
    queueDiv.innerHTML = "";
    queue.forEach((item, index) => {
        const element = document.createElement("div");
        element.className = "queue-item";
        element.innerText = item;
        queueDiv.appendChild(element);
        gsap.fromTo(element, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.5 });
    });
}
