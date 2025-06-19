// src/components/CreateQuiz.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthState }      from 'react-firebase-hooks/auth';
import { auth, db }          from '../firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export default function CreateQuiz() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  const [topic, setTopic]         = useState('');
  const [quizTimer, setQuizTimer] = useState('');
  const [questions, setQuestions] = useState([
    { text: '', options: ['', '', '', ''], correctIndex: 0 }
  ]);

  const handleQuestionChange = (idx, field, value) => {
    const updated = [...questions];
    if (field === 'text' || field === 'correctIndex') {
      updated[idx][field] = value;
    } else {
      const optIdx = Number(field.split('-')[1]);
      updated[idx].options[optIdx] = value;
    }
    setQuestions(updated);
  };

  const addQuestion = () =>
    setQuestions([
      ...questions,
      { text: '', options: ['', '', '', ''], correctIndex: 0 }
    ]);

  const removeQuestion = idx =>
    setQuestions(questions.filter((_, i) => i !== idx));

  const handleSubmit = async e => {
    e.preventDefault();
    const quizRef = await addDoc(collection(db, 'quizzes'), {
      topic,
      timeLimit: quizTimer ? Number(quizTimer) : null,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
    });

    for (let q of questions) {
      if (!q.text.trim()) continue;
      await addDoc(
        collection(db, `quizzes/${quizRef.id}/questions`),
        {
          text: q.text,
          options: q.options,
          correctOptionIndex: Number(q.correctIndex),
          type: 'mcq',
          createdAt: serverTimestamp(),
        }
      );
    }
    navigate('/dashboard');
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: 'auto' }}>
      <h2>Create New Quiz</h2>

      <label>Topic</label>
      <input
        type="text"
        value={topic}
        onChange={e => setTopic(e.target.value)}
        required
        style={{ width: '100%', margin: '8px 0' }}
      />

      <label>Quiz Timer (secs)</label>
      <input
        type="number"
        value={quizTimer}
        onChange={e => setQuizTimer(e.target.value)}
        min={0}
        style={{ width: '100%', margin: '8px 0' }}
      />

      <h3>Questions</h3>
      {questions.map((q, idx) => (
        <div
          key={idx}
          style={{
            border: '1px solid #ccc',
            padding: 12,
            marginBottom: 12,
            borderRadius: 4,
          }}
        >
          <label>Question {idx + 1}</label>
          <textarea
            placeholder="Question text"
            value={q.text}
            onChange={e => handleQuestionChange(idx, 'text', e.target.value)}
            required
            style={{ width: '100%', margin: '8px 0' }}
          />

          {[0,1,2,3].map(optIdx => (
            <div
              key={optIdx}
              style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}
            >
              <input
                type="radio"
                name={`correct-${idx}`}
                checked={q.correctIndex === optIdx}
                onChange={() => handleQuestionChange(idx, 'correctIndex', optIdx)}
                style={{ marginRight: 8 }}
              />
              <input
                type="text"
                placeholder={`Option ${optIdx+1}`}
                value={q.options[optIdx]}
                onChange={e => handleQuestionChange(idx, `option-${optIdx}`, e.target.value)}
                required
                style={{ flex: 1 }}
              />
            </div>
          ))}

          {questions.length > 1 && (
            <button
              type="button"
              onClick={() => removeQuestion(idx)}
              style={{ marginTop: 8, color: 'red' }}
            >
              Remove Question
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addQuestion}
        style={{ marginBottom: 16 }}
      >
        + Add Another Question
      </button>

      <button type="submit" style={{ width: '100%', padding: 12 }}>
        Create Quiz
      </button>

      <p style={{ marginTop: 12 }}>
        <Link to="/dashboard">Cancel</Link>
      </p>
    </form>
  );
}
