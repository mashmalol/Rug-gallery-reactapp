import React, { StrictMode, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import DriftWall from './DriftWall';
import './styles.css';

const rugs = [
  { image: 'https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&fit=crop&w=900&q=85', title: 'Mina Khani', origin: 'Tabriz, Iran', type: 'Vintage', price: '$1,840', year: '1970s', color: 'Carmine' },
  { image: 'https://images.unsplash.com/photo-1575410229391-19b4da01cc94?auto=format&fit=crop&w=900&q=85', title: 'Herati Garden', origin: 'Herat, Afghanistan', type: 'Heritage', price: '$2,420', year: '1960s', color: 'Indigo' },
  { image: 'https://images.unsplash.com/photo-1601924928377-7b4d7fcb0d83?auto=format&fit=crop&w=900&q=85', title: 'Rose Medallion', origin: 'Kerman, Iran', type: 'Collector', price: '$3,180', year: '1950s', color: 'Saffron' },
  { image: 'https://images.unsplash.com/photo-1594040226829-7f251ab46d80?auto=format&fit=crop&w=900&q=85', title: 'Cypress Path', origin: 'Shiraz, Iran', type: 'Vintage', price: '$1,960', year: '1980s', color: 'Moss' },
  { image: 'https://images.unsplash.com/photo-1601055903647-ddf1ee9701b7?auto=format&fit=crop&w=900&q=85', title: 'Night Bazaar', origin: 'Isfahan, Iran', type: 'Heritage', price: '$2,760', year: '1940s', color: 'Carmine' },
  { image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=85', title: 'Pomegranate', origin: 'Mashhad, Iran', type: 'Collector', price: '$4,100', year: '1930s', color: 'Saffron' },
  { image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=900&q=85', title: 'Little Nomad', origin: 'Kurdistan', type: 'Vintage', price: '$980', year: '1990s', color: 'Moss' },
  { image: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&w=900&q=85', title: 'Blue Pazyryk', origin: 'Qazvin, Iran', type: 'Heritage', price: '$2,980', year: '1960s', color: 'Indigo' },
];

function App() {
  const [filter, setFilter] = useState('All rugs');
  const [query, setQuery] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [selected, setSelected] = useState(null);
  const filters = ['All rugs', 'Vintage', 'Heritage', 'Collector'];
  const visibleRugs = useMemo(() => rugs.filter((rug) => {
    const matchesFilter = filter === 'All rugs' || rug.type === filter;
    const matchesQuery = `${rug.title} ${rug.origin} ${rug.color}`.toLowerCase().includes(query.toLowerCase());
    return matchesFilter && matchesQuery;
  }), [filter, query]);

  const wallItems = visibleRugs.map((rug) => ({ ...rug, href: '#' }));

  function toggleFavorite(title) {
    setFavorites((current) => current.includes(title) ? current.filter((item) => item !== title) : [...current, title]);
  }

  return (
    <main>
      <nav className="nav shell">
        <a className="wordmark" href="#top"><span>W</span>OVEN<span className="dot">.</span></a>
        <div className="nav-links"><a className="active" href="#collection">Collection</a><a href="#story">The story</a><a href="#care">Care guide</a></div>
        <div className="nav-actions"><button className="search-button" onClick={() => document.querySelector('.search-input')?.focus()} aria-label="Search rugs">Search <span>/</span></button><button className="bag-button" aria-label="Open saved rugs">Saved <b>{favorites.length}</b></button></div>
      </nav>

      <section className="intro shell" id="top">
        <div><p className="eyebrow">A living archive / 04.26</p><h1>Rugs with a<br /><em>past life.</em></h1></div>
        <div className="intro-copy"><p>Hand-knotted Persian rugs, collected slowly from old homes, village markets, and the people who know their stories best.</p><a className="text-link" href="#collection">Explore the collection <span>↘</span></a></div>
      </section>

      <section className="wall-wrap" id="collection"><DriftWall items={wallItems} columns={8} tileWidth={180} tileHeight={120} gap={14} tilt={25} turn={10} perspective={950} depth={400} speed={10} direction="up" variance={0.65} parallax={0.8} lift={44} fade={0.4} dim={0.8} overlayColor="#060010" radius={18} pauseOnHover onSelect={setSelected} favorites={favorites} onFavorite={toggleFavorite} /></section>

      <section className="collection-bar shell"><div><span className="section-number">01</span><h2>Current collection</h2></div><div className="collection-tools"><div className="filters">{filters.map((item) => <button key={item} className={filter === item ? 'selected' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div><label className="search-field"><span>⌕</span><input className="search-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a rug" /></label></div></section>

      <section className="rug-grid shell">{visibleRugs.map((rug, index) => <article className="rug-card" key={rug.title} onClick={() => setSelected(rug)}><div className="card-image"><img src={rug.image} alt={rug.title} /><button className={`favorite ${favorites.includes(rug.title) ? 'is-favorite' : ''}`} onClick={(event) => { event.stopPropagation(); toggleFavorite(rug.title); }} aria-label={`Save ${rug.title}`}>{favorites.includes(rug.title) ? '♥' : '♡'}</button><span className="card-index">0{index + 1}</span></div><div className="card-meta"><div><h3>{rug.title}</h3><p>{rug.origin} / {rug.year}</p></div><strong>{rug.price}</strong></div></article>)}</section>
      {visibleRugs.length === 0 && <p className="empty shell">No rugs found in this corner of the archive.</p>}

      <footer className="footer shell" id="story"><div className="footer-mark">W<span>oven</span></div><p>Objects made by hand<br />deserve to be lived with.</p><span className="copyright">© 2026 Woven Archive</span></footer>
      {selected && <div className="modal-backdrop" onClick={() => setSelected(null)}><div className="modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setSelected(null)} aria-label="Close rug details">×</button><img src={selected.image} alt={selected.title} /><div className="modal-content"><p className="eyebrow">{selected.type} / {selected.year}</p><h2>{selected.title}</h2><p>{selected.origin}. A one-of-a-kind hand-knotted piece with a quiet patina and a palette that deepens with time.</p><strong>{selected.price}</strong><button className="inquire">Inquire about this rug <span>↗</span></button></div></div></div>}
    </main>
  );
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>);
