// JavaScript File: login.js
document.addEventListener("DOMContentLoaded", function () {
    // Load Header and Footer
    fetch("../../pages/header/header.html")
        .then(response => response.text())
        .then(data => document.getElementById("header").innerHTML = data)
        .catch(error => console.error("Error loading header:", error));

    fetch("../../pages/footer/footer.html")
        .then(response => response.text())
        .then(data => document.getElementById("footer").innerHTML = data)
        .catch(error => console.error("Error loading footer:", error));

});
