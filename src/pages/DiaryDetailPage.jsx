import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ErrorMessage from '../components/common/ErrorMessage';
import Loading from '../components/common/Loading';
import DiaryDetail from '../components/diary/DiaryDetail';
import DiaryEditor from '../components/diary/DiaryEditor';
import { deleteDiary, getDiary, getDiaryLogs, updateDiary } from '../lib/diaries';

export default function DiaryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [diary, setDiary] = useState(null);
  const [meals, setMeals] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const nextDiary = await getDiary(id);
        setDiary(nextDiary);
        const logs = await getDiaryLogs(nextDiary.diary_date);
        setMeals(logs.meals);
        setExercises(logs.exercises);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleSave(changes) {
    try {
      const nextDiary = await updateDiary(id, changes);
      setDiary({ ...diary, ...nextDiary });
      setEditing(false);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete() {
    if (!window.confirm('この日記を削除しますか？')) return;
    try {
      await deleteDiary(id);
      navigate('/diaries', { replace: true });
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <Loading />;

  return (
    <div className="page">
      <div className="page-heading">
        <h1>日記詳細</h1>
        {diary && (
          <div className="button-row">
            <button className="secondary-button" onClick={() => setEditing(true)}>編集</button>
            <button className="danger-button" onClick={handleDelete}>削除</button>
          </div>
        )}
      </div>
      <ErrorMessage message={error} />
      {diary && (editing ? <DiaryEditor diary={diary} onSave={handleSave} onCancel={() => setEditing(false)} /> : <DiaryDetail diary={diary} meals={meals} exercises={exercises} />)}
    </div>
  );
}
