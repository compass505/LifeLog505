export default function GenerateDiaryButton({ onClick, loading }) {
  return (
    <button className="secondary-button" type="button" onClick={onClick} disabled={loading}>
      {loading ? '今日の日記を作成中...' : '今日の日記を作成する'}
    </button>
  );
}
