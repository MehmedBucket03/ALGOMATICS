document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded");

    // Load Header and Footer
    fetch("../../pages/header/header.html")
        .then(response => response.text())
        .then(data => document.getElementById("header").innerHTML = data)
        .catch(error => console.error("Error loading header:", error));

    fetch("../../pages/footer/footer.html")
        .then(response => response.text())
        .then(data => document.getElementById("footer").innerHTML = data)
        .catch(error => console.error("Error loading footer:", error));

    // Dropdown functionality
    const exploreBtn = document.getElementById("explore-btn");
    const dropdownMenu = document.getElementById("dropdown-menu");

    exploreBtn.addEventListener("click", function (event) {
        dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block";
        event.stopPropagation();
    });

    document.addEventListener("click", function (event) {
        if (!exploreBtn.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.style.display = "none";
        }
    });

    //  Ensure Math button navigates correctly
    document.getElementById("math-link").addEventListener("click", function (event) {
        event.preventDefault();
        console.log("Math link clicked, navigating...");
        window.location.href = "../math/math.html"; // Adjust path based on folder structure
    });

    //  Ensure Algorithms button navigates correctly
    document.getElementById("algorithms-link").addEventListener("click", function (event) {
        event.preventDefault();
        console.log("Algorithms link clicked, navigating...");
        window.location.href = "../algorithms/algorithms.html"; // Adjust path based on folder structure
    });
});
