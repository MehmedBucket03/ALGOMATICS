import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../../../firebase/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import './Login.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleLogin = () => {
        console.log("Login button clicked");

        // Clear previous messages
        setError('');
        setSuccess('');

        // Basic validation
        if (!email || !password) {
            setError("Please enter both email and password");
            return;
        }

        // Sign in with Firebase
        console.log("Attempting Firebase auth...");
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Successful login
                const user = userCredential.user;
                console.log("Logged in successfully:", user.email);

                // Show success message
                setSuccess("Login successful! Redirecting...");

                // Redirect to dashboard or home page after a brief delay
                setTimeout(() => {
                    navigate('/');
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
                        setError("No account found with this email");
                        break;
                    case 'auth/wrong-password':
                        setError("Incorrect password");
                        break;
                    case 'auth/invalid-email':
                        setError("Invalid email format");
                        break;
                    case 'auth/too-many-requests':
                        setError("Too many failed attempts. Try again later");
                        break;
                    default:
                        setError("Login failed: " + errorMessage);
                }
            });
    };

    // Rest of your component remains the same...
    return React.createElement("div", { className: "auth-container" },
        // ... Your existing component structure
    );
}

export default Login;