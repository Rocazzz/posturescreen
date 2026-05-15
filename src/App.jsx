import { useState, useEffect } from 'react';
import { onAuthStateChanged, getRedirectResult } from 'firebase/auth';
import { collection, addDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase';
import Login from './components/Login';
import Home from './components/Home';
import Capture from './components/Capture';
import Results from './components/Results';
import History from './components/History';
import TabBar from './components/TabBar';

// Normaliza cualquier evaluación vieja o nueva al formato actual
function normalizeEntry(data) {
  return {
    ...data,
    sta:  data.sta  ?? 0,
    tpa:  data.tpa  ?? 0,
    cobb: data.cobb ?? 0,
    classes: {
      hombros: data.classes?.hombros ?? 'verde',
      columna: data.classes?.columna ?? 'verde',
      pelvis:  data.classes?.pelvis  ?? 'verde',
    }
  };
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('home');
  const [history, setHistory] = useState([]);
  const [currentResult, setCurrentResult] = useState(null);

  useEffect(() => {
    getRedirectResult(auth)
      .then(result => { if (result?.user) { setUser(result.user); setLoading(false); } })
      .catch(console.error);

    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'evaluations'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, snap => {
      setHistory(snap.docs.map(d => normalizeEntry({ id: d.id, ...d.data() })));
    }, err => console.error(err));
    return unsub;
  }, [user]);

  async function handleResult(analysis) {
    const entry = {
      uid: user.uid,
      date: new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }),
      view: 'posterior',
      sta:     analysis.sta,
      tpa:     analysis.tpa,
      cobb:    analysis.cobb,
      classes: {
        hombros: analysis.classes.hombros,
        columna: analysis.classes.columna,
        pelvis:  analysis.classes.pelvis,
      },
      createdAt: Date.now()
    };
    try {
      await addDoc(collection(db, 'evaluations'), entry);
      setCurrentResult(entry);
      setTab('results');
    } catch (e) {
      console.error('Error guardando:', e);
      alert('Error al guardar la evaluación');
    }
  }

  function handleSelectHistory(entry) {
    setCurrentResult(normalizeEntry(entry));
    setTab('results');
  }

  function handleNavigate(t) {
    setTab(t);
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh', flexDirection: 'column', gap: '16px' }}>
      <p style={{ fontSize: '32px', fontWeight: '600', color: 'var(--accent)', letterSpacing: '-1px' }}>PostureScreen</p>
      <p style={{ fontSize: '13px', color: 'var(--text2)' }}>Cargando...</p>
    </div>
  );

  if (!user) return <Login />;

  const screens = {
    home:    <Home onNavigate={handleNavigate} lastResult={history[0] || null} user={user} />,
    capture: <Capture onResult={handleResult} />,
    results: <Results result={currentResult} onNavigate={handleNavigate} />,
    history: <History history={history} onSelect={handleSelectHistory} />
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', maxWidth: '480px', margin: '0 auto', background: 'var(--bg)' }}>
      {screens[tab]}
      <TabBar active={tab} onChange={handleNavigate} />
    </div>
  );
}