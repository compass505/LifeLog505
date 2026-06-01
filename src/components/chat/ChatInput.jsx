export default function ChatInput({ value, onChange, onSubmit, loading }) {
  return (
    <form className="chat-input" onSubmit={onSubmit}>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="今日あったことを話す"
        rows={3}
        disabled={loading}
      />
      <button type="submit" disabled={loading || !value.trim()}>{loading ? '送信中...' : '送信'}</button>
    </form>
  );
}
