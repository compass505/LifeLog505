import { useState } from 'react';
import ErrorMessage from '../components/common/ErrorMessage';
import DiaryList from '../components/diary/DiaryList';
import SearchForm from '../components/search/SearchForm';
import { searchDiaries } from '../lib/diaries';

export default function SearchPage() {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      setResults(await searchDiaries(keyword));
      setSearched(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="page-heading"><h1>検索</h1></div>
      <SearchForm value={keyword} onChange={setKeyword} onSubmit={handleSubmit} loading={loading} />
      <ErrorMessage message={error} />
      {searched && <DiaryList diaries={results} />}
    </div>
  );
}
