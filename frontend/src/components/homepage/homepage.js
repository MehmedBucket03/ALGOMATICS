document.addEventListener("DOMContentLoaded", function () {
    // Load Header and Footer
    fetch("../components/header/header.html")
        .then(response => response.text())
        .then(data => document.getElementById("header").innerHTML = data);

    fetch("../components/footer/footer.html")
        .then(response => response.text())
        .then(data => document.getElementById("footer").innerHTML = data);

    // Dropdown functionality
    const exploreBtn = document.getElementById("explore-btn");
    const dropdownMenu = document.getElementById("dropdown-menu");

    exploreBtn.addEventListener("click", function () {
        dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", function (event) {
        if (!exploreBtn.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.style.display = "none";
        }
    });
});
