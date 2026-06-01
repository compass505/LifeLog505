import { Link } from 'react-router-dom';
import ErrorMessage from '../common/ErrorMessage';

export default function LoginForm({ onSubmit, error, loading }) {
  return (
    <form className="auth-form" onSubmit={onSubmit}>
      <h1>LifeLog505</h1>
      <p>今日のことを、気軽に話せる場所。</p>
      <label>
        メールアドレス
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <label>
        パスワード
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      <ErrorMessage message={error} />
      <button type="submit" disabled={loading}>{loading ? 'ログイン中...' : 'ログイン'}</button>
      <Link to="/signup">新規登録はこちら</Link>
    </form>
  );
}
