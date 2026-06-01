import { Link } from 'react-router-dom';
import ErrorMessage from '../common/ErrorMessage';

export default function SignupForm({ onSubmit, error, loading }) {
  return (
    <form className="auth-form" onSubmit={onSubmit}>
      <h1>LifeLog505</h1>
      <p>まずはアカウントを作成しましょう。</p>
      <label>
        メールアドレス
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <label>
        パスワード
        <input name="password" type="password" autoComplete="new-password" minLength={8} required />
      </label>
      <label>
        パスワード確認
        <input name="passwordConfirm" type="password" autoComplete="new-password" minLength={8} required />
      </label>
      <ErrorMessage message={error} />
      <button type="submit" disabled={loading}>{loading ? '登録中...' : '新規登録'}</button>
      <Link to="/login">ログインへ戻る</Link>
    </form>
  );
}
