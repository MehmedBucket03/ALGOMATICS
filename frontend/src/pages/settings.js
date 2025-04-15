import React, { useState } from 'react';
import { auth } from '../firebase/firebase';
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

    const user = auth.currentUser;

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
        if (!oldPassword || !newPassword || newPassword.length < 6) return setStatusMsg("Check your input.");
        const confirmed = await handleReauth();
        if (confirmed) {
            try {
                await updatePassword(user, newPassword);
                setStatusMsg("Password updated!");
            } catch (error) {
                setStatusMsg("Password update failed: " + error.message);
            }
        }
    };

    const handleEmailChange = async () => {
        if (!oldPassword || !newEmail) return setStatusMsg("Check your input.");
        const confirmed = await handleReauth();
        if (confirmed) {
            try {
                await updateEmail(user, newEmail);
                setStatusMsg("Email updated!");
            } catch (error) {
                setStatusMsg("Email update failed: " + error.message);
            }
        }
    };

    return (
        <div className="profile-wrapper text-white">
            <div className="pixel-window pixel-header">
                <div className="pixel-title">⚙️ SETTINGS</div>
            </div>

            <div className="pixel-section">
                <h2 className="pixel-subtitle">🔐 CHANGE PASSWORD</h2>
                <input type="password" placeholder="Old password" onChange={e => setOldPassword(e.target.value)} className="pixel-input-field" />
                <input type="password" placeholder="New password" onChange={e => setNewPassword(e.target.value)} className="pixel-input-field" />
                <button className="pixel-button" onClick={handlePasswordChange}>Update Password</button>
            </div>

            <div className="pixel-section">
                <h2 className="pixel-subtitle">✉️ CHANGE EMAIL</h2>
                <input type="email" placeholder="New email" onChange={e => setNewEmail(e.target.value)} className="pixel-input-field" />
                <button className="pixel-button" onClick={handleEmailChange}>Update Email</button>
            </div>

            {statusMsg && <p className="mt-4">{statusMsg}</p>}
        </div>
    );
};

export default Settings;
