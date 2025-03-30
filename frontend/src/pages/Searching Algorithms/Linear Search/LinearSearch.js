let numbers = []; // List starts empty

function displayArray() {
    const container = document.getElementById("arrayContainer");
    container.innerHTML = "";
    numbers.forEach(num => {
        const box = document.createElement("div");
        box.classList.add("box");
        box.textContent = num;
        container.appendChild(box);
    });
}

function addNumber() {
    const input = document.getElementById("addInput");
    const value = parseInt(input.value);

    if (!isNaN(value)) {
        numbers.push(value);
        input.value = ""; // Clear input after adding
        displayArray();
    } else {
        alert("Please enter a valid number!");
    }
}

async function linearSearch() {
    let target = document.getElementById("searchInput").value;
    let message = document.getElementById("resultMessage");
    message.textContent = "";

    if (target === "") {
        message.textContent = "Please enter a number!";
        return;
    }

    target = parseInt(target);
    const boxes = document.querySelectorAll(".box");

    for (let i = 0; i < numbers.length; i++) {
        boxes[i].classList.add("checking");
        await new Promise(resolve => setTimeout(resolve, 500)); // Delay to show the checking process

        if (numbers[i] === target) {
            boxes[i].classList.remove("checking");
            boxes[i].classList.add("found");
            message.textContent = `Number ${target} found at index ${i}!`;
            return;
        }

        boxes[i].classList.remove("checking");
    }

    message.textContent = `Number ${target} not found in the array.`;
}

displayArray(); // Initialize display
