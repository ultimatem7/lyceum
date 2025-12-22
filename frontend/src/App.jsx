import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Forum from './pages/Forum';
import Essays from './pages/Essays';
import Create from './pages/Create';
import PostDetail from './pages/PostDetail';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';  // ✅ NEW
import ResetPassword from './pages/ResetPassword';   // ✅ NEW

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-marble">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />     {/* ✅ NEW */}
            <Route path="/reset-password/:token" element={<ResetPassword />} /> {/* ✅ NEW */}
            <Route path="/forum" element={<Forum />} />
            <Route path="/essays" element={<Essays />} />
            <Route path="/create" element={<Create />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/essay/:id" element={<PostDetail />} />
            <Route path="/profile/:username" element={<Profile />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
