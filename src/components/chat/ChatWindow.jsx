import ChatMessage from './ChatMessage';

export default function ChatWindow({ messages, loading }) {
  return (
    <section className="chat-window" aria-label="チャット履歴">
      {messages.length === 0 && (
        <div className="empty-state">
          <h2>今日はどんな感じ？</h2>
          <p>短くても大丈夫。思ったことから話してみてください。</p>
        </div>
      )}
      {messages.map((message) => (
        <ChatMessage key={message.id ?? `${message.role}-${message.created_at}-${message.content}`} role={message.role} content={message.content} createdAt={message.created_at} />
      ))}
      {loading && <ChatMessage role="assistant" content="返信を考え中..." />}
    </section>
  );
}
