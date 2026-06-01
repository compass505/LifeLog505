import { NavLink } from 'react-router-dom';

export default function Header() {
  return (
    <header className="site-header">
      <NavLink to="/chat" className="brand">LifeLog505</NavLink>
      <nav className="nav-links" aria-label="メインナビゲーション">
        <NavLink to="/chat">チャット</NavLink>
        <NavLink to="/diaries">日記一覧</NavLink>
        <NavLink to="/search">検索</NavLink>
        <NavLink to="/settings">設定</NavLink>
      </nav>
    </header>
  );
}
