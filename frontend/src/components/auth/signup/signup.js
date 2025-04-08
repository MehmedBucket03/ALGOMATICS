import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../../firebase/firebase';
import './signup.css';

function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSignup = () => {
        console.log("Signup button clicked");

        // Clear previous messages
        setError('');
        setSuccess('');

        // Basic validation
        if (!name || !email || !password || !confirmPassword) {
            setError("Please fill in all fields");
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address");
            return;
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        // Password strength validation
        if (password.length < 6) {
            setError("Password should be at least 6 characters");
            return;
        }

        // Create user with Firebase
        console.log("Attempting to create user with Firebase...");
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Successful signup
                const user = userCredential.user;
                console.log("User created successfully:", user.email);

                // Add user profile information
                return updateProfile(user, {
                    displayName: name
                }).then(() => {
                    // Store additional user data in Firestore
                    return setDoc(doc(db, 'users', user.uid), {
                        name: name,
                        email: user.email,
                        createdAt: new Date()
                    });
                });
            })
            .then(() => {
                // Show success message
                setSuccess("Account created successfully! Redirecting...");

                // Redirect to dashboard page after a brief delay
                setTimeout(() => {
                    navigate('/');
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
                        setError("This email is already in use");
                        break;
                    case 'auth/invalid-email':
                        setError("Invalid email format");
                        break;
                    case 'auth/weak-password':
                        setError("Password is too weak. Use at least 6 characters");
                        break;
                    default:
                        setError("Signup failed: " + errorMessage);
                }
            });
    };

    return (
        <div className="signup-container">
            {/* Background video/gif */}
            <div className="gif-container">
                <video autoPlay muted loop className="background-video">
                    <source src="/assets/background.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>

            <div className="content">
                <div className="auth-box">
                    <h2>CREATE ACCOUNT</h2>

                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}

                    <div>
                        <label htmlFor="name">NAME</label>
                        <input
                            type="text"
                            id="name"
                            className="input-box"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                        />
                    </div>

                    <div>
                        <label htmlFor="email">EMAIL</label>
                        <input
                            type="email"
                            id="email"
                            className="input-box"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                        />
                    </div>

                    <div>
                        <label htmlFor="password">PASSWORD</label>
                        <input
                            type="password"
                            id="password"
                            className="input-box"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Create a password"
                        />
                    </div>

                    <div>
                        <label htmlFor="confirm-password">CONFIRM PASSWORD</label>
                        <input
                            type="password"
                            id="confirm-password"
                            className="input-box"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm your password"
                        />
                    </div>

                    <div className="button" onClick={handleSignup}>
                        SIGN UP
                    </div>

                    <Link to="/login" className="switch-button">
                        ALREADY HAVE AN ACCOUNT
                    </Link>

                    <Link to="/" className="switch-button">
                        BACK TO HOME
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Signup;