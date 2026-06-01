import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SignupForm from '../components/auth/SignupForm';
import { signUp } from '../lib/auth.jsx';

export default function SignupPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    const form = new FormData(event.currentTarget);
    const password = form.get('password');
    if (password !== form.get('passwordConfirm')) {
      setError('パスワード確認が一致していません。');
      return;
    }
    setLoading(true);
    try {
      await signUp({ email: form.get('email'), password });
      navigate('/chat', { replace: true });
    } catch (err) {
      setError(err.message || '新規登録できませんでした。');
    } finally {
      setLoading(false);
    }
  }

  return <div className="auth-page"><SignupForm onSubmit={handleSubmit} error={error} loading={loading} /></div>;
}
