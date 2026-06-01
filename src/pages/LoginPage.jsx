import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import { signIn } from '../lib/auth.jsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      await signIn({ email: form.get('email'), password: form.get('password') });
      navigate('/chat', { replace: true });
    } catch (err) {
      setError(err.message || 'ログインできませんでした。');
    } finally {
      setLoading(false);
    }
  }

  return <div className="auth-page"><LoginForm onSubmit={handleSubmit} error={error} loading={loading} /></div>;
}
