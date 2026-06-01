import { useEffect, useState } from 'react';
import ErrorMessage from '../components/common/ErrorMessage';
import Loading from '../components/common/Loading';
import { signOut, useAuth } from '../lib/auth.jsx';
import { getMyProfile, upsertMyProfile } from '../lib/profiles';

export default function SettingsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ display_name: '', ai_tone: 'friendly', important_profile: '', recent_interests: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyProfile(user.id)
      .then((data) => {
        if (data) setProfile(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user.id]);

  function updateField(field, value) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setError('');
    try {
      await upsertMyProfile({ ...profile, user_id: user.id });
      setMessage('設定を保存しました。');
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <Loading />;

  return (
    <div className="page settings-page">
      <div className="page-heading"><h1>設定</h1></div>
      <form className="settings-form" onSubmit={handleSubmit}>
        <label>
          表示名
          <input value={profile.display_name || ''} onChange={(event) => updateField('display_name', event.target.value)} />
        </label>
        <label>
          AIの口調設定
          <select value={profile.ai_tone || 'friendly'} onChange={(event) => updateField('ai_tone', event.target.value)}>
            <option value="friendly">友達寄り</option>
            <option value="calm">落ち着いた感じ</option>
            <option value="cheerful">明るめ</option>
          </select>
        </label>
        <label>
          重要プロフィール
          <textarea rows={5} value={profile.important_profile || ''} onChange={(event) => updateField('important_profile', event.target.value)} />
        </label>
        <label>
          最近の関心ごと
          <textarea rows={5} value={profile.recent_interests || ''} onChange={(event) => updateField('recent_interests', event.target.value)} />
        </label>
        <ErrorMessage message={error} />
        {message && <div className="success-message">{message}</div>}
        <div className="button-row">
          <button type="submit">保存</button>
          <button type="button" className="ghost-button" onClick={signOut}>ログアウト</button>
        </div>
      </form>
    </div>
  );
}
