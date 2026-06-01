export default function SearchForm({ value, onChange, onSubmit, loading }) {
  return (
    <form className="search-form" onSubmit={onSubmit}>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder="研修、疲れた、筋トレ..." />
      <button type="submit" disabled={loading || !value.trim()}>{loading ? '検索中...' : '検索'}</button>
    </form>
  );
}
