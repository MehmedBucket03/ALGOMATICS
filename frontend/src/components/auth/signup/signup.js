import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleGoogleSignup = () => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider)
            .then((result) => {
                const user = result.user;
                console.log("Google Sign Up successful:", user.email);
                setSuccess("Signed up with Google! Redirecting...");
                setTimeout(() => navigate('/'), 1500);
            })
            .catch((error) => {
                console.error("Google Sign Up error:", error.code, error.message);
                setError("Google signup failed: " + error.message);
            });
    };

    const handleSignup = async () => {
        console.log("Signup button clicked");

        // Clear previous messages
        setError('');
        setSuccess('');
        setIsSubmitting(true);

        try {
            // Basic validation
            if (!name || !email || !password || !confirmPassword) {
                throw new Error("Please fill in all fields");
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new Error("Please enter a valid email address");
            }

            // Check if passwords match
            if (password !== confirmPassword) {
                throw new Error("Passwords do not match");
            }

            // Password strength validation
            if (password.length < 6) {
                throw new Error("Password should be at least 6 characters");
            }

            // Create user with Firebase
            console.log("Attempting to create user with Firebase...");
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            // Successful signup
            const user = userCredential.user;
            console.log("User created successfully:", user.email);

            // Add user profile information
            await updateProfile(user, {
                displayName: name
            });

            console.log("Profile updated successfully");

            // Try to store additional user data in Firestore with better error handling
            try {
                await setDoc(doc(db, 'users', user.uid), {
                    name: name,
                    email: user.email,
                    createdAt: new Date()
                });
                console.log("User document created in Firestore");
            } catch (firestoreError) {
                // If Firestore write fails, log it but don't prevent login
                console.error("Firestore document creation failed:", firestoreError);
                console.log("Proceeding with login despite Firestore error");
            }

            // Show success message
            setSuccess("Account created successfully! Redirecting...");

            // Redirect to dashboard page after a brief delay
            setTimeout(() => {
                navigate('/');
            }, 1500);

        } catch (error) {
            console.error("Signup error:", error);

            // Firebase auth errors
            if (error.code) {
                switch(error.code) {
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
                        setError(`Signup failed: ${error.message || error.code}`);
                }
            } else {
                // Custom validation errors or other errors
                setError(error.message || "An unknown error occurred");
            }
        } finally {
            setIsSubmitting(false);
        }
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
                            disabled={isSubmitting}
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
                            disabled={isSubmitting}
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
                            disabled={isSubmitting}
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
                            disabled={isSubmitting}
                        />
                    </div>

                    <div
                        className={`button ${isSubmitting ? 'disabled' : ''}`}
                        onClick={!isSubmitting ? handleSignup : undefined}
                    >
                        {isSubmitting ? 'PROCESSING...' : 'SIGN UP'}
                    </div>

                    <button className="google-button" onClick={handleGoogleSignup}>
                        <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google logo" className="google-logo" />
                        Sign up with Google
                    </button>

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


