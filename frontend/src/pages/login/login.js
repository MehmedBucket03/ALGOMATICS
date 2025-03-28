// login.js
console.log("Login.js loaded");

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded");

    // Get references to DOM elements
    const emailInput = document.querySelector('input[type="email"]');
    const passwordInput = document.querySelector('input[type="password"]');
    const loginButton = document.querySelector('.button');
    const loginBox = document.querySelector('.login-box');

    console.log("Email input:", emailInput);
    console.log("Password input:", passwordInput);
    console.log("Login button:", loginButton);

    // Add event listener for login button
    loginButton.addEventListener('click', function() {
        console.log("Login button clicked");

        // Simple alert to confirm click is working
        alert("Login attempt starting...");

        // Get email and password values
        const email = emailInput.value;
        const password = passwordInput.value;

        console.log("Email entered:", email);
        console.log("Password entered:", password.replace(/./g, '*'));

        // Basic validation
        if (!email || !password) {
            showError("Please enter both email and password");
            return;
        }

        // Check if firebase is available
        if (typeof firebase === 'undefined') {
            console.error("Firebase is not defined!");
            showError("Authentication service unavailable. Please try again later.");
            return;
        }

        // Sign in with Firebase
        console.log("Attempting Firebase auth...");
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Successful login
                const user = userCredential.user;
                console.log("Logged in successfully:", user.email);

                // Show success message
                showSuccess("Login successful! Redirecting...");

                // Redirect to dashboard or home page after a brief delay
                setTimeout(() => {
                    window.location.href = '../homepage/homepage.html';
                }, 1500);
            })
            .catch((error) => {
                // Handle login errors
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error("Login error:", errorCode, errorMessage);

                // Show appropriate error message
                switch(errorCode) {
                    case 'auth/user-not-found':
                        showError("No account found with this email");
                        break;
                    case 'auth/wrong-password':
                        showError("Incorrect password");
                        break;
                    case 'auth/invalid-email':
                        showError("Invalid email format");
                        break;
                    case 'auth/too-many-requests':
                        showError("Too many failed attempts. Try again later");
                        break;
                    default:
                        showError("Login failed: " + errorMessage);
                }
            });
    });

    // Helper function to show error message
    function showError(message) {
        console.log("Showing error:", message);

        // Check if error message element already exists
        let errorElement = document.querySelector('.error-message');

        if (!errorElement) {
            // Create error message element if it doesn't exist
            errorElement = document.createElement('p');
            errorElement.className = 'error-message text-red-500 mt-2';
            loginBox.appendChild(errorElement);
        }

        errorElement.textContent = message;
    }

    // Helper function to show success message
    function showSuccess(message) {
        console.log("Showing success:", message);

        // Check if success message element already exists
        let successElement = document.querySelector('.success-message');

        if (!successElement) {
            // Create success message element if it doesn't exist
            successElement = document.createElement('p');
            successElement.className = 'success-message text-green-500 mt-2';
            loginBox.appendChild(successElement);
        }

        successElement.textContent = message;


    }
});