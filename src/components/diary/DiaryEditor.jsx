import { useState } from 'react';

export default function DiaryEditor({ diary, onSave, onCancel }) {
  const [title, setTitle] = useState(diary.title || '');
  const [body, setBody] = useState(diary.body || '');

  return (
    <form className="editor" onSubmit={(event) => {
      event.preventDefault();
      onSave({ title, body });
    }}>
      <label>
        タイトル
        <input value={title} onChange={(event) => setTitle(event.target.value)} />
      </label>
      <label>
        本文
        <textarea value={body} onChange={(event) => setBody(event.target.value)} rows={12} />
      </label>
      <div className="button-row">
        <button type="submit">保存</button>
        <button type="button" className="ghost-button" onClick={onCancel}>キャンセル</button>
      </div>
    </form>
  );
}
