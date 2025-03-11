// JavaScript File: signup.js
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

function handleSignup() {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    alert(`Welcome, ${name}! Your account has been created.`);
    window.location.href = "login.html"; // Redirect to login page after signup
}