import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../../firebase/firebase';
import './Signup.css';

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

    // Using JSX syntax
    return (
        <div className="auth-container">
            <div className="auth-content">
                <div className="pixel-auth-box">
                    <h1 className="pixel-title">SIGN UP</h1>

                    <div className="pixel-form-group">
                        <label htmlFor="name" className="pixel-label">NAME</label>
                        <input
                            type="text"
                            id="name"
                            placeholder="Enter your name"
                            className="pixel-input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="pixel-form-group">
                        <label htmlFor="email" className="pixel-label">EMAIL</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="Enter your email"
                            className="pixel-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="pixel-form-group">
                        <label htmlFor="password" className="pixel-label">PASSWORD</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="Enter your password"
                            className="pixel-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="pixel-form-group">
                        <label htmlFor="confirm-password" className="pixel-label">CONFIRM PASSWORD</label>
                        <input
                            type="password"
                            id="confirm-password"
                            placeholder="Confirm your password"
                            className="pixel-input"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="pixel-button" onClick={handleSignup}>SIGN UP</div>

                    {error && <p className="pixel-error">{error}</p>}
                    {success && <p className="pixel-success">{success}</p>}

                    <div className="pixel-divider"></div>

                    <p className="pixel-text">ALREADY HAVE AN ACCOUNT?</p>
                    <Link to="/login" className="pixel-link-button">LOGIN</Link>
                </div>
            </div>
        </div>
    );
}

export default Signup;