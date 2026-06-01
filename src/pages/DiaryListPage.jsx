import { useEffect, useState } from 'react';
import ErrorMessage from '../components/common/ErrorMessage';
import Loading from '../components/common/Loading';
import DiaryList from '../components/diary/DiaryList';
import { listDiaries } from '../lib/diaries';

export default function DiaryListPage() {
  const [diaries, setDiaries] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listDiaries()
      .then(setDiaries)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <div className="page-heading"><h1>日記一覧</h1></div>
      <ErrorMessage message={error} />
      {loading ? <Loading /> : <DiaryList diaries={diaries} />}
    </div>
  );
}
