// src/components/QuizDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';

export default function QuizDetail() {
  const { id } = useParams();
  const [user, loadingAuth] = useAuthState(auth);
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    options: ['', '', '', ''],
    correctOptionIndex: 0,
    type: 'mcq'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const qSnap = await getDocs(collection(db, `quizzes/${id}/questions`));
      setQuestions(qSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    })();
  }, [user, id]);

  if (loadingAuth || loading) return <p>Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;

  const handleAddQuestion = async e => {
    e.preventDefault();
    await addDoc(collection(db, `quizzes/${id}/questions`), {
      ...newQuestion,
      correctOptionIndex: Number(newQuestion.correctOptionIndex),
      createdAt: serverTimestamp()
    });
    const qSnap = await getDocs(collection(db, `quizzes/${id}/questions`));
    setQuestions(qSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    setNewQuestion({ text: '', options: ['', '', '', ''], correctOptionIndex: 0, type: 'mcq' });
  };

  const handleDeleteQuestion = async qId => {
    await deleteDoc(doc(db, `quizzes/${id}/questions/${qId}`));
    setQuestions(prev => prev.filter(q => q.id !== qId));
  };

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
      <h1>Quiz: {id}</h1>
      <Link to="/dashboard">← Back to Dashboard</Link>

      <h2 style={{ marginTop: 20 }}>Questions</h2>
      <ul>
        {questions.length ? questions.map(q => (
          <li key={q.id} style={{ margin: '12px 0' }}>
            <strong>{q.text}</strong>
            <ul>
              {q.options.map((opt, i) => (
                <li key={i}>{opt}{i===q.correctOptionIndex && <em> (Correct)</em>}</li>
              ))}
            </ul>
            <button onClick={() => handleDeleteQuestion(q.id)}>Delete</button>
          </li>
        )) : <li>No questions yet.</li>}
      </ul>

      <h2 style={{ marginTop: 20 }}>Add New Question</h2>
      <form onSubmit={handleAddQuestion}>
        <textarea
          placeholder="Question text"
          value={newQuestion.text}
          onChange={e => setNewQuestion({ ...newQuestion, text: e.target.value })}
          required
          style={{ width: '100%', margin: '8px 0' }}
        />

        {newQuestion.options.map((opt, i) => (
          <input
            key={i}
            type="text"
            placeholder={`Option ${i+1}`}
            value={newQuestion.options[i]}
            onChange={e => {
              const opts = [...newQuestion.options];
              opts[i] = e.target.value;
              setNewQuestion({ ...newQuestion, options: opts });
            }}
            required
            style={{ width: '100%', margin: '4px 0' }}
          />
        ))}

        <label>Correct Option:</label>
        <select
          value={newQuestion.correctOptionIndex}
          onChange={e => setNewQuestion({ ...newQuestion, correctOptionIndex: e.target.value })}
          style={{ margin: '8px 0' }}
        >
          {[0,1,2,3].map(i => <option key={i} value={i}>{`Option ${i+1}`}</option>)}
        </select>

        <button type="submit" style={{ display: 'block', marginTop: 12 }}>
          Add Question
        </button>
      </form>
    </div>
  );
}
