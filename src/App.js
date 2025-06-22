import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Signup           from './components/Signup';
import Login            from './components/Login';
import Dashboard        from './components/Dashboard';
import CreateQuiz       from './components/CreateQuiz';
import QuizDetail       from './components/QuizDetail';
import StudentQuizzes   from './components/StudentQuizzes';
import TakeQuiz from './components/TakeQuiz';
import Navbar from './components/Navbar';
export default function App() {
  return (
    <BrowserRouter>
      <Navbar/>
      <Routes>
        {/* Initial root shows login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login"  element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Admin routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-quiz" element={<CreateQuiz />} />
        <Route path="/quiz/:id" element={<QuizDetail />} />

        {/* Student route */}
        <Route path="/student-quizzes" element={<StudentQuizzes />} />
        <Route path="/take-quiz/:id" element={<TakeQuiz />} />
        {/* catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}