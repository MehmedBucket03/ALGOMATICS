import React, { useState } from 'react';
import { useEffect } from 'react';
import { auth } from '../firebase/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import {
    updatePassword,
    updateEmail,
    reauthenticateWithCredential,
    EmailAuthProvider,
} from 'firebase/auth';
import './Profile.css';
//changes

const Settings = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [statusMsg, setStatusMsg] = useState('');
    const [resetEmail, setResetEmail] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [userEmail, setUserEmail] = useState('');

    const user = auth.currentUser;

    useEffect(() => {
        if (user) {
            setDisplayName(user.displayName || "No name set");
            setUserEmail(user.email || "No email available");
        }
    }, [user]);

    const handleReauth = async () => {
        const credential = EmailAuthProvider.credential(user.email, oldPassword);
        try {
            await reauthenticateWithCredential(user, credential);
            return true;
        } catch (error) {
            setStatusMsg("Reauthentication failed:  " + error.message);
            return false;
        }
    };

    const handlePasswordChange = async () => {
        if (!oldPassword) return setStatusMsg("Enter your current password.");
        if (!newPassword || newPassword.length < 6) return setStatusMsg("New password must be at least 6 characters.");

        const confirmed = await handleReauth();
        if (confirmed) {
            try {
                await updatePassword(user, newPassword);
                setStatusMsg("Password updated!");
                setOldPassword('');
                setNewPassword('');
            } catch (error) {
                setStatusMsg("Password update failed: " + error.message);
            }
        }
    };


    const handleEmailChange = async () => {
        if (!oldPassword) return setStatusMsg("Enter your current password.");
        if (!newEmail) return setStatusMsg("Enter a new email.");
        if (!newEmail.includes("@") || !newEmail.includes(".")) {
            return setStatusMsg("Invalid email format.");
        }
        if (newEmail === user.email) {
            return setStatusMsg("New email is the same as current email.");
        }

        const confirmed = await handleReauth();
        if (confirmed) {
            try {
                await updateEmail(user, newEmail);
                await user.reload();
                await auth.currentUser.sendEmailVerification(); // 🔥 force email verification
                setUserEmail(auth.currentUser.email);
                setStatusMsg(`Email updated!\n Verify ${newEmail} via the link sent to your inbox.`);
                setNewEmail('');
                setOldPassword('');
            } catch (error) {
                setStatusMsg("Email update failed: " + error.message);
            }
        }
    };





    const handleForgotPassword = async () => {
        if (!resetEmail) return setStatusMsg("Please enter your email.");
        try {
            await sendPasswordResetEmail(auth, resetEmail);
            setStatusMsg(`Reset email sent to ${resetEmail}`);
        } catch (error) {
            setStatusMsg("Error: " + error.message);
        }
    };


    return (
        <div className="profile-wrapper text-white">
            <div className="pixel-window pixel-header">
                <div className="pixel-title">⚙️ SETTINGS</div>
            </div>

            <div className="pixel-section account-info-section">
                <h2 className="pixel-subtitle"> ACCOUNT INFO</h2>
                <p className="pixel-label">Name: <span className="pixel-value">{displayName}</span></p>
                <p className="pixel-label">Email: <span className="pixel-value">{userEmail}</span></p>
            </div>

            <div className="pixel-section">
                <h2 className="pixel-subtitle"> CHANGE PASSWORD</h2>
                <input type="password" placeholder="Old password" onChange={e => setOldPassword(e.target.value)} className="pixel-input-field" />
                <input type="password" placeholder="New password" onChange={e => setNewPassword(e.target.value)} className="pixel-input-field" />
                <button className="pixel-button" onClick={handlePasswordChange}>Update Password</button>
            </div>

            <div className="pixel-section">
                <h2 className="pixel-subtitle">CHANGE EMAIL</h2>
                <input type="email" placeholder="New email" onChange={e => setNewEmail(e.target.value)} className="pixel-input-field" />
                <input
                    type="password"
                    placeholder="Enter current password"
                    onChange={e => {
                        setOldPassword(e.target.value);
                        setStatusMsg('');
                    }}
                    className="pixel-input-field"
                />
                <button className="pixel-button" onClick={handleEmailChange}>Update Email</button>
            </div>



            <div className="pixel-section">
                <h2 className="pixel-subtitle">FORGOT PASSWORD</h2>
                <input
                    type="email"
                    placeholder="Enter your email"
                    onChange={e => setResetEmail(e.target.value)}
                    className="pixel-input-field"
                />
                <button className="pixel-button" onClick={handleForgotPassword}>Send Reset Email</button>
            </div>


            {statusMsg && <p className="mt-4">{statusMsg}</p>}
        </div>
    );
};

export default Settings;
