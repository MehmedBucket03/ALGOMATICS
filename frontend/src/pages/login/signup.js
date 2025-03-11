// signup.js
console.log("Signup.js loaded");

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded");

    // Get references to DOM elements
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const signupButton = document.getElementById('signupButton');
    const authBox = document.querySelector('.auth-box');

    console.log("Name input:", nameInput);
    console.log("Email input:", emailInput);
    console.log("Password input:", passwordInput);
    console.log("Confirm password input:", confirmPasswordInput);
    console.log("Signup button:", signupButton);

    // Add event listener for signup button
    signupButton.addEventListener('click', function() {
        console.log("Signup button clicked");

        // Get input values
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        console.log("Name entered:", name);
        console.log("Email entered:", email);
        console.log("Password entered:", password.replace(/./g, '*'));
        console.log("Confirm password entered:", confirmPassword.replace(/./g, '*'));

        // Basic validation
        if (!name || !email || !password || !confirmPassword) {
            showError("Please fill in all fields");
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError("Please enter a valid email address");
            return;
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            showError("Passwords do not match");
            return;
        }

        // Password strength validation
        if (password.length < 6) {
            showError("Password should be at least 6 characters");
            return;
        }

        // Check if firebase is available
        if (typeof firebase === 'undefined') {
            console.error("Firebase is not defined!");
            showError("Authentication service unavailable. Please try again later.");
            return;
        }

        // Create user with Firebase
        console.log("Attempting to create user with Firebase...");
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Successful signup
                const user = userCredential.user;
                console.log("User created successfully:", user.email);

                // Add user profile information
                return user.updateProfile({
                    displayName: name
                }).then(() => {
                    // Store additional user data in Firestore
                    return firebase.firestore().collection('users').doc(user.uid).set({
                        name: name,
                        email: user.email,
                        createdAt: new Date()
                    });
                });
            })
            .then(() => {
                // Show success message
                showSuccess("Account created successfully! Redirecting...");

                // Redirect to dashboard page after a brief delay
                setTimeout(() => {
                    window.location.href = '../dashboard/dashboard.html';
                }, 1500);
            })
            .catch((error) => {
                // Handle signup errors
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error("Signup error:", errorCode, errorMessage);

                // Show appropriate error message
                switch(errorCode) {
                    case 'auth/email-already-in-use':
                        showError("This email is already in use");
                        break;
                    case 'auth/invalid-email':
                        showError("Invalid email format");
                        break;
                    case 'auth/weak-password':
                        showError("Password is too weak. Use at least 6 characters");
                        break;
                    default:
                        showError("Signup failed: " + errorMessage);
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
            authBox.appendChild(errorElement);
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
            authBox.appendChild(successElement);
        }

        successElement.textContent = message;
    }
});