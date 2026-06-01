import DiaryCard from './DiaryCard';

export default function DiaryList({ diaries }) {
  if (diaries.length === 0) {
    return (
      <div className="empty-state">
        <h2>日記はまだありません</h2>
        <p>チャット画面から今日の日記を作成できます。</p>
      </div>
    );
  }
  return (
    <div className="diary-grid">
      {diaries.map((diary) => <DiaryCard key={diary.id} diary={diary} />)}
    </div>
  );
}
