// src/components/TakeQuiz.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { auth, db } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc, collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import '../styles/TakeQuiz.css';

export default function TakeQuiz() {
  const { id: quizId } = useParams();
  const [user, loadingAuth] = useAuthState(auth);
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);
  const [submittedScore, setSubmittedScore] = useState(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const quizSnap = await getDoc(doc(db, 'quizzes', quizId));
      const data = quizSnap.data();
      setQuiz(data);
      const qSnap = await getDocs(collection(db, `quizzes/${quizId}/questions`));
      setQuestions(qSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setTimeLeft(data.timeLimit || 0);
      setLoading(false);
    })();
  }, [user, quizId]);

  useEffect(() => {
    if (timeLeft > 0 && submittedScore === null) {
      timerRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [timeLeft, submittedScore]);

  if (loadingAuth || loading) return <p>Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;

  if (submittedScore !== null) {
    return (
      <div className="take-container">
        <h1>Quiz Complete!</h1>
        <p className="timer">You scored <strong>{submittedScore}</strong> out of <strong>{questions.length}</strong></p>
        <Link to="/student-quizzes">Back to Quizzes</Link>
      </div>
    );
  }

  const handleSelect = (qId, idx) => setAnswers(a => ({ ...a, [qId]: idx }));
  const finishQuiz = async () => {
    clearInterval(timerRef.current);
    let score = 0;
    questions.forEach(q => { if (answers[q.id] === q.correctOptionIndex) score++; });
    await addDoc(collection(db, 'attempts'), { quizId, userId: user.uid, answers, score, takenAt: serverTimestamp() });
    setSubmittedScore(score);
  };

  return (
    <div className="take-container">
      <h1>{quiz.topic}</h1>
      <p className="timer">Time Left: {timeLeft}s</p>
      {questions.map((q,i) => (
        <div key={q.id} className="question">
          <p><strong>Q{i+1}:</strong> {q.text}</p>
          {q.options.map((opt, idx) => (
            <div key={idx} className="option">
              <input type="radio" name={q.id} checked={answers[q.id]===idx} onChange={() => handleSelect(q.id, idx)} />
              <span>{opt}</span>
            </div>
          ))}
        </div>
      ))}
      <button className="submit-button" onClick={finishQuiz} disabled={timeLeft===0}>Submit Quiz</button>
      <p><Link to="/student-quizzes">Cancel</Link></p>
    </div>
  );
}