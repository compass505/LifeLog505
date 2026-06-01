import { formatDate } from '../../lib/date';
import ExerciseList from '../logs/ExerciseList';
import MealList from '../logs/MealList';

export default function DiaryDetail({ diary, meals, exercises }) {
  const tags = diary.diary_tags?.map((item) => item.tags?.name).filter(Boolean) ?? [];
  return (
    <article className="diary-detail">
      <time>{formatDate(diary.diary_date)}</time>
      <h1>{diary.title || '無題の日記'}</h1>
      {diary.mood && <span className="pill">{diary.mood}</span>}
      {diary.summary && <p className="summary">{diary.summary}</p>}
      <div className="diary-body">{diary.body || '本文はまだありません。'}</div>
      {tags.length > 0 && (
        <div className="tag-row">
          {tags.map((tag) => <span key={tag}>#{tag}</span>)}
        </div>
      )}
      <section>
        <h2>食事</h2>
        <MealList meals={meals} />
      </section>
      <section>
        <h2>運動</h2>
        <ExerciseList exercises={exercises} />
      </section>
    </article>
  );
}
