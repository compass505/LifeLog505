import { Link } from 'react-router-dom';
import { formatDate } from '../../lib/date';

export default function DiaryCard({ diary }) {
  const tags = diary.diary_tags?.map((item) => item.tags?.name).filter(Boolean) ?? [];
  return (
    <Link className="diary-card" to={`/diaries/${diary.id}`}>
      <div className="diary-card-header">
        <time>{formatDate(diary.diary_date)}</time>
        {diary.mood && <span className="pill">{diary.mood}</span>}
      </div>
      <h2>{diary.title || '無題の日記'}</h2>
      <p>{diary.summary || diary.body || '本文はまだありません。'}</p>
      {tags.length > 0 && (
        <div className="tag-row">
          {tags.map((tag) => <span key={tag}>#{tag}</span>)}
        </div>
      )}
    </Link>
  );
}
