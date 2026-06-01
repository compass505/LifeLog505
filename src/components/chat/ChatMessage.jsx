export default function ChatMessage({ role, content, createdAt }) {
  if (role === 'system') return null;
  return (
    <article className={`chat-message ${role}`}>
      <div className="message-bubble">
        <p>{content}</p>
        {createdAt && <time>{new Date(createdAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</time>}
      </div>
    </article>
  );
}
