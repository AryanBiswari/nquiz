// src/components/StudentQuizzes.jsx
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import '../styles/Student.css';

export default function StudentQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const snapshot = await getDocs(collection(db, 'quizzes'));
      setQuizzes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    })();
  }, []);

  if (loading) return <p>Loading quizzes...</p>;
  return (
    <div className="student-container">
      <div className="quiz-list">
        <h1>Available Quizzes</h1>
        {quizzes.map(q => (
          <div key={q.id} className="quiz-item">
            <h3>{q.topic || `Quiz ${q.id}`}</h3>
            <Link to={`/take-quiz/${q.id}`}>
              <button className="start-button">Start Quiz</button>
            </Link>
          </div>
        ))}
        {quizzes.length === 0 && <p>No quizzes available.</p>}
      </div>
    </div>
  );
}