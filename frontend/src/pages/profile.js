import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import { signOut } from 'firebase/auth';

// Topic metadata - centralized for easy maintenance
const topicTitles = {
    'linked-list': 'Linked List',
    'sequences': 'Sequences and Series',
    'logarithms': 'Logarithms & Exponentials',
    'quadratic': 'Quadratic Equations',
    'polynomials': 'Polynomial Operations'
};

const topicRoutes = {
    'linked-list': '/linkedlist',
    'sequences': '/sequences-series',
    'logarithms': '/logarithms-exponential',
    'quadratic': '/quadratic',
    'polynomials': '/algorithms/polynomial-operations'
};

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [savedTopics, setSavedTopics] = useState([]);
    const navigate = useNavigate();

    // Handle auth state and fetch initial user data
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                await fetchUserTopics(currentUser.uid);
            } else {
                // Redirect to login if no user
                navigate('/login');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [navigate]);

    // Fetch saved topics from Firestore
    const fetchUserTopics = async (userId) => {
        try {
            const docRef = doc(db, 'users', userId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                const topicKeys = Object.keys(data).filter(key => key.startsWith('topics.'));

                if (topicKeys.length > 0) {
                    const entries = topicKeys.map(fullKey => {
                        const topicId = fullKey.split('.')[1];
                        return {
                            id: topicId,
                            ...data[fullKey]
                        };
                    });
                    setSavedTopics(entries);
                }
            }
        } catch (error) {
            console.error("Error fetching user topics:", error);
        }
    };

    // Format date for display
    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp);
        return date.toLocaleDateString();
    };

    // Handle logout
    const handleLogout = () => {
        signOut(auth).then(() => {
            navigate('/login');
        }).catch((error) => {
            console.error("Logout error:", error);
        });
    };

    if (loading) {
        return (
            <div className="profile-wrapper">
                <div className="loading-container">
                    <div className="pixel-loader"></div>
                    <p>Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-wrapper">
            <div className="profile-container">
                <div className="pixel-window pixel-header">
                    <div className="pixel-title">👤 PROFILE</div>
                </div>

                {user && (
                    <h1 className="pixel-main-title">
                        WELCOME, {user.displayName || user.email?.split('@')[0]?.toUpperCase() || 'PLAYER'}
                    </h1>
                )}

                <div className="pixel-section">
                    <h2 className="pixel-subtitle">📺 CONTINUE LEARNING</h2>

                    {savedTopics.length > 0 ? (
                        <div className="profile-topic-scroll">
                            {savedTopics
                                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                                .map((topic) => (
                                    <div key={topic.id} className="profile-topic-card">
                                        <h3>{topicTitles[topic.id] || topic.id}</h3>
                                        <p className="pixel-input-preview">{topic.input ? (topic.input.slice(0, 50) + (topic.input.length > 50 ? '...' : '')) : 'No input preview available'}</p>
                                        <button className="pixel-button" onClick={() => navigate(topicRoutes[topic.id] || '/')}>
                                            CONTINUE
                                        </button>
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p className="empty-message">NO SAVED TOPICS YET!</p>
                            <p className="empty-hint">Start learning to see your progress here</p>
                            <button className="pixel-button explore-button" onClick={() => navigate('/')}>
                                EXPLORE TOPICS
                            </button>
                        </div>
                    )}
                </div>

                <div className="pixel-section profile-stats-section">
                    <h2 className="pixel-subtitle">🏆 YOUR STATS</h2>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <span className="stat-label">TOPICS STARTED:</span>
                            <span className="stat-value">{savedTopics.length}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">LAST LOGIN:</span>
                            <span className="stat-value">{user?.metadata?.lastSignInTime ? formatDate(user.metadata.lastSignInTime) : 'N/A'}</span>
                        </div>
                    </div>
                </div>

                <div className="pixel-section logout-section">
                    <button className="pixel-button logout-button" onClick={handleLogout}>
                        LOG OUT
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;

