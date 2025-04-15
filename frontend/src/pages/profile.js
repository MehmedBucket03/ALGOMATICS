import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import { signOut } from 'firebase/auth';
//changes


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
    const [topics, setTopics] = useState({});
    const navigate = useNavigate();
    const [savedTopics, setSavedTopics] = useState([]);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const docSnap = await getDoc(doc(db, 'users', currentUser.uid));
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setTopics(data.topics || {});
                    console.log("Fetched topics from Firebase:", data.topics);
                }
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchSavedTopics = async () => {
            const user = auth.currentUser;
            if (!user) return;

            const docRef = doc(db, 'users', user.uid);
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
        };

        fetchSavedTopics();
    }, []);


    return (
        <div className="profile-wrapper text-white">
            <div className="pixel-window pixel-header">
                <div className="pixel-title">👤 PROFILE</div>
            </div>

            {user && (
                <h1 className="pixel-main-title" style={{ textAlign: 'center', marginTop: '1rem' }}>
                    WELCOME, {user.displayName || user.email?.split('@')[0]?.toUpperCase() || 'User'}
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
                                    <p className="pixel-input-preview">{topic.input.slice(0, 50)}...</p>
                                    <p className="pixel-input-preview">{new Date(topic.timestamp).toLocaleString()}</p>
                                    <button className="pixel-button" onClick={() => navigate(topicRoutes[topic.id] || '/')}>
                                        CONTINUE
                                    </button>
                                </div>
                            ))}
                    </div>
                ) : (
                    <p>NO SAVED TOPICS YET!</p>
                )}
            </div>

            <div className="pixel-section">
                <button className="pixel-button" onClick={() => signOut(auth)}>
                    LOG OUT
                </button>
            </div>
        </div>
    );
};

export default Profile;
