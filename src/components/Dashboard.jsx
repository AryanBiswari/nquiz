// src/components/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { Navigate, Link } from 'react-router-dom';

export default function Dashboard() {
  const [user, loadingAuth] = useAuthState(auth);
  const [quizzes, setQuizzes] = useState([]);
  const [role, setRole]     = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  // 1) Load quizzes
  useEffect(() => {
    if (!user) return;
    (async () => {
      const snap = await getDocs(collection(db, 'quizzes'));
      setQuizzes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    })();
  }, [user]);

  // 2) Load user role from /users/{uid}
  useEffect(() => {
    if (!user) return;
    (async () => {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setRole(userDoc.data().role);
      }
      setLoadingData(false);
    })();
  }, [user]);

  if (loadingAuth || loadingData) return <p>Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
      <h1>Welcome, {user.email}</h1>
      <button onClick={() => auth.signOut()} style={{ marginBottom: 20 }}>
        Sign Out
      </button>

      {/* Only teachers see this */}
      {role === 'teacher' && (
        <div style={{ margin: '20px 0' }}>
          <Link
            to="/create-quiz"
            style={{
              padding: '8px 16px',
              background: '#007bff',
              color: 'white',
              borderRadius: 4,
              textDecoration: 'none',
              display: 'inline-block'
            }}
          >
            + Create Quiz
          </Link>
        </div>
      )}

      <h2>Available Quizzes</h2>
      <ul>
        {quizzes.length > 0 ? (
          quizzes.map(q => (
            <li key={q.id} style={{ margin: '8px 0' }}>
              <Link
                to={`/quiz/${q.id}`}
                style={{ textDecoration: 'none', color: '#333' }}
              >
                {/* Show topic or fallback */}
                {q.topic || `Quiz ${q.id}`}
              </Link>
            </li>
          ))
        ) : (
          <li>No quizzes available.</li>
        )}
      </ul>

      {role === 'student' && quizzes.length > 0 && (
        <p style={{ marginTop: 16, fontStyle: 'italic' }}>
          Click a quiz above to start!
        </p>
      )}
    </div>
  );
}
