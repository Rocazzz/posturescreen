export default function TabBar({ active, onChange }) {
  const tabs = [
    {
      id: 'home', label: 'Inicio',
      icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>
    },
    {
      id: 'capture', label: 'Captura',
      icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M20.94 11A9 9 0 1 1 11 3.06"/><path d="M22 2L11 13"/></svg>
    },
    {
      id: 'results', label: 'Análisis',
      icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
    },
    {
      id: 'history', label: 'Historial',
      icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>
    }
  ];

  return (
    <div style={{
      background: 'var(--surface)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      height: 'var(--tab-h)',
      flexShrink: 0,
      paddingBottom: 'env(safe-area-inset-bottom)'
    }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '8px 4px'
        }}>
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8"
            style={{ width: '22px', height: '22px', stroke: active === t.id ? 'var(--accent)' : 'var(--text3)' }}>
            {t.icon.props.children}
          </svg>
          <span style={{
            fontSize: '10px',
            color: active === t.id ? 'var(--accent)' : 'var(--text3)',
            fontFamily: 'DM Sans'
          }}>
            {t.label}
          </span>
        </button>
      ))}
    </div>
  );
}