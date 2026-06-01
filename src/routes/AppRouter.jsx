import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Header from '../components/common/Header';
import Loading from '../components/common/Loading';
import { useAuth } from '../lib/auth.jsx';
import ChatPage from '../pages/ChatPage';
import DiaryDetailPage from '../pages/DiaryDetailPage';
import DiaryListPage from '../pages/DiaryListPage';
import LoginPage from '../pages/LoginPage';
import SearchPage from '../pages/SearchPage';
import SettingsPage from '../pages/SettingsPage';
import SignupPage from '../pages/SignupPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loading label="読み込み中..." />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return (
    <>
      <Header />
      <main className="app-main">{children}</main>
    </>
  );
}

function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loading label="読み込み中..." />;
  if (user) return <Navigate to="/chat" replace />;
  return children;
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/chat" replace />} />
      <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
      <Route path="/signup" element={<PublicOnlyRoute><SignupPage /></PublicOnlyRoute>} />
      <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
      <Route path="/diaries" element={<ProtectedRoute><DiaryListPage /></ProtectedRoute>} />
      <Route path="/diaries/:id" element={<ProtectedRoute><DiaryDetailPage /></ProtectedRoute>} />
      <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/chat" replace />} />
    </Routes>
  );
}
