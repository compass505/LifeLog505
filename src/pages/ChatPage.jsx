import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorMessage from '../components/common/ErrorMessage';
import ChatInput from '../components/chat/ChatInput';
import ChatWindow from '../components/chat/ChatWindow';
import GenerateDiaryButton from '../components/chat/GenerateDiaryButton';
import { generateDiary, getRecentMessages, sendChatMessage } from '../lib/chat';
import { todayString } from '../lib/date';

export default function ChatPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [diaryLoading, setDiaryLoading] = useState(false);

  useEffect(() => {
    getRecentMessages().then(setMessages).catch((err) => setError(err.message));
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    const content = input.trim();
    if (!content) return;
    setError('');
    setInput('');
    setLoading(true);
    const optimistic = { role: 'user', content, created_at: new Date().toISOString() };
    setMessages((current) => [...current, optimistic]);
    try {
      const result = await sendChatMessage({ message: content, clientDate: todayString() });
      setMessages((current) => [...current, { role: 'assistant', content: result.reply, created_at: new Date().toISOString() }]);
      getRecentMessages().then(setMessages).catch(() => {});
    } catch (err) {
      setError('ごめん、今ちょっと返事がうまくできなかった。もう一回送ってみて。');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateDiary() {
    setError('');
    setDiaryLoading(true);
    try {
      const result = await generateDiary(todayString());
      navigate(`/diaries/${result.diary.id}`);
    } catch (err) {
      setError(err.message || '日記を作成できませんでした。');
    } finally {
      setDiaryLoading(false);
    }
  }

  return (
    <div className="page chat-page">
      <div className="page-heading">
        <h1>チャット</h1>
        <GenerateDiaryButton onClick={handleGenerateDiary} loading={diaryLoading} />
      </div>
      <ErrorMessage message={error} />
      <ChatWindow messages={messages} loading={loading} />
      <ChatInput value={input} onChange={setInput} onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
