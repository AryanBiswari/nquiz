// src/components/Navbar.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc } from 'firebase/firestore';
import '../styles/Navbar.css';

export default function Navbar() {
  const [user] = useAuthState(auth);
  const [role, setRole] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      getDoc(doc(db, 'users', user.uid)).then(snapshot => {
        if (snapshot.exists()) setRole(snapshot.data().role);
      });
    }
  }, [user]);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-user">
        {user.email} ({role})
      </div>
      <button onClick={handleLogout} className="navbar-logout">
        Logout
      </button>
    </nav>
  );
}